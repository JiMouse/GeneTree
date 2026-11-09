/*
 * PersonTable — a dependency-free replacement for the Handsontable grids of the
 * patient page. Each row is shown as a card of form fields (one card per relative),
 * which works on phones and keeps the page free of third-party licences.
 *
 * It implements only the part of the Handsontable API that the patient page uses,
 * with the same data semantics, so user-interface.js and createPed() run unchanged:
 *   loadData, getSourceData, getSourceDataAtCell, getDataAtRowProp,
 *   setDataAtRowProp, addHook('afterChange' | 'afterSelectionEndByProp'), render
 *
 * Data semantics copied from Handsontable 16 (checked against the old page):
 *  - getSourceData() returns a deep copy of the rows, including properties that are
 *    not displayed (FamID, IndivID, Disease2...).
 *  - 'numeric' columns store numeric-looking text as numbers ("60" -> 60);
 *    a cleared numeric field stores null; other text is kept as typed.
 *  - 'checkbox' columns store checkedTemplate / uncheckedTemplate ('1' / '0').
 *  - minSpareRows keeps that many empty rows at the end ({prop: null, ...}).
 *  - every edit fires afterChange([[row, prop, oldValue, newValue]], 'edit'),
 *    synchronously, including edits made by hooks themselves.
 */
(function (global) {
  'use strict';

  var uid = 0;

  function plainLabel(html) {
    return String(html == null ? '' : html).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  function isNumericLike(v) {
    return typeof v === 'string' && /^\s*-?\d+(?:[.,]\d+)?\s*$/.test(v);
  }

  function isEmptyValue(v) {
    return v === null || v === undefined || v === '';
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'className') node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function PersonTable(container, settings) {
    this.container = container;
    this.columns = settings.columns;
    this.colHeaders = settings.colHeaders || [];
    this.minSpareRows = settings.minSpareRows || 0;
    this.layout = settings.layout || 'cards';          // 'cards' (relatives) or 'rows' (patient's own cancers)
    this.diseaseProps = settings.diseaseProps || [];   // fields that open the cancer list instead of the keyboard
    this.addLabel = settings.addLabel || '';
    this.hooks = {};
    this.data = settings.data || [];
    this.id = 'pt' + (++uid);

    // Handsontable methods are passed around unbound (e.g. hotChildren.loadData as a callback)
    ['loadData', 'getSourceData', 'getSourceDataAtCell', 'getDataAtRowProp', 'setDataAtRowProp', 'addHook', 'render', 'updateHeaders']
      .forEach(function (m) { this[m] = this[m].bind(this); }, this);

    this.container.classList.add('person-table', 'person-table-' + this.layout);
    this._ensureSpareRows();
    this._renderAll();
  }

  PersonTable.prototype.addHook = function (name, fn) {
    (this.hooks[name] = this.hooks[name] || []).push(fn);
  };

  PersonTable.prototype._runHooks = function (name) {
    var args = Array.prototype.slice.call(arguments, 1), self = this;
    (this.hooks[name] || []).forEach(function (fn) { fn.apply(self, args); });
  };

  PersonTable.prototype.loadData = function (data) {
    this.data = data;
    this._ensureSpareRows();
    this._renderAll();
    this._runHooks('afterChange', null, 'loadData');
  };

  PersonTable.prototype.getSourceData = function () {
    return JSON.parse(JSON.stringify(this.data));
  };

  PersonTable.prototype.getSourceDataAtCell = function (row, col) {
    var column = this.columns[col];
    if (!column || !this.data[row]) return null;
    return this.data[row][column.data];
  };

  PersonTable.prototype.getDataAtRowProp = function (row, prop) {
    return this.data[row] ? this.data[row][prop] : null;
  };

  PersonTable.prototype._column = function (prop) {
    for (var i = 0; i < this.columns.length; i++) if (this.columns[i].data === prop) return this.columns[i];
    return null;
  };

  PersonTable.prototype._coerce = function (column, value) {
    if (column && column.type === 'numeric') {
      if (value === '' || value === undefined) return null;
      if (isNumericLike(value)) return parseFloat(value.replace(',', '.'));
    }
    return value;
  };

  PersonTable.prototype._emptyRow = function () {
    var row = {};
    this.columns.forEach(function (c) { row[c.data] = null; });
    return row;
  };

  PersonTable.prototype._isEmptyRow = function (row) {
    return this.columns.every(function (c) { return isEmptyValue(row[c.data]); });
  };

  PersonTable.prototype._ensureSpareRows = function () {
    if (!this.minSpareRows) return false;
    var trailing = 0;
    for (var i = this.data.length - 1; i >= 0 && this._isEmptyRow(this.data[i]); i--) trailing++;
    var added = false;
    while (trailing < this.minSpareRows) { this.data.push(this._emptyRow()); trailing++; added = true; }
    return added;
  };

  PersonTable.prototype.setDataAtRowProp = function (row, prop, value, source) {
    // Like Handsontable, a change made from inside a hook (e.g. age -> year of birth)
    // is processed only once the current change and all its hooks have finished.
    // user-interface.js relies on this: syncAgeYob() keeps its state in globals.
    if (this._busy) { this._queue.push([row, prop, value, source]); return; }
    this._busy = true;
    this._queue = [];
    try {
      this._applyChange(row, prop, value, source);
      while (this._queue.length) this._applyChange.apply(this, this._queue.shift());
    } finally {
      this._busy = false;
    }
  };

  PersonTable.prototype._applyChange = function (row, prop, value, source) {
    source = source || 'edit';
    var column = this._column(prop);
    value = this._coerce(column, value);
    var shown = this.data.length;
    while (this.data.length <= row) this.data.push(this._emptyRow());
    var oldValue = this.data[row][prop];
    this.data[row][prop] = value;
    this._ensureSpareRows();
    // new spare rows are appended, never redrawn, so the field the patient is moving to stays in place
    for (var r = shown; r < this.data.length; r++) this._appendRow(r);
    this._renderValue(row, prop);
    this._runHooks('afterChange', [[row, prop, oldValue, value]], source);
  };

  PersonTable.prototype.render = function () { /* always up to date */ };

  PersonTable.prototype.updateHeaders = function (headers) {
    this.colHeaders = headers;
    this._renderAll();
  };

  /* ---------- rendering ---------- */

  PersonTable.prototype._label = function (prop) {
    for (var i = 0; i < this.columns.length; i++) if (this.columns[i].data === prop) return plainLabel(this.colHeaders[i]);
    return prop;
  };

  PersonTable.prototype._fieldId = function (row, prop) {
    return this.id + '-r' + row + '-' + prop;
  };

  PersonTable.prototype._displayValue = function (v) {
    return (v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? '' : String(v);
  };

  PersonTable.prototype._renderValue = function (row, prop) {
    var input = document.getElementById(this._fieldId(row, prop));
    if (!input) return;
    var column = this._column(prop), v = this.data[row] ? this.data[row][prop] : null;
    if (column && column.type === 'checkbox') input.checked = String(v) === String(column.checkedTemplate);
    else if (this.diseaseProps.indexOf(prop) >= 0) input.value = this._diseaseLabel(v);
    else input.value = this._displayValue(v);
    this._markValidity(input, column, v);
  };

  // numeric field holding text (e.g. "environ 50"): kept as typed, shown in red like Handsontable did
  PersonTable.prototype._markValidity = function (input, column, v) {
    var invalid = !!column && column.type === 'numeric' && !isEmptyValue(v) && typeof v !== 'number';
    input.classList.toggle('pt-invalid', invalid);
    if (invalid) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  };

  // Disease fields store the internal key (e.g. 'cancer_sein') but show the label of
  // the cancer list ('Cancer du sein'). Display only: the stored value is unchanged.
  PersonTable.prototype._diseaseLabel = function (v) {
    var text = this._displayValue(v);
    if (!text || typeof global.cleanDiseaseText !== 'function' || typeof global.capitaliseFirstLetter !== 'function') return text;
    try { return global.capitaliseFirstLetter(global.cleanDiseaseText(text)); } catch (e) { return text; }
  };

  PersonTable.prototype._renderField = function (row, column) {
    var self = this, prop = column.data, id = this._fieldId(row, prop), value = this.data[row][prop], input;
    var isDisease = this.diseaseProps.indexOf(prop) >= 0;
    var label = el('label', { 'for': id, text: this._label(prop) });

    if (column.type === 'checkbox') {
      input = el('input', { type: 'checkbox', id: id });
      input.checked = String(value) === String(column.checkedTemplate);
      input.addEventListener('change', function () {
        self.setDataAtRowProp(row, prop, input.checked ? column.checkedTemplate : column.uncheckedTemplate, 'edit');
      });
      return el('div', { className: 'pt-field pt-check' }, [input, label]);
    }

    if (column.type === 'dropdown') {
      input = el('select', { id: id, className: 'form-control' }, [el('option', { value: '', text: '—' })]
        .concat((column.source || []).map(function (opt) { return el('option', { value: opt, text: opt }); })));
      input.value = this._displayValue(value);
      if (input.value !== this._displayValue(value)) { // a value that is not in the list: keep it visible
        input.appendChild(el('option', { value: this._displayValue(value), text: this._displayValue(value) }));
        input.value = this._displayValue(value);
      }
      input.addEventListener('change', function () { self.setDataAtRowProp(row, prop, input.value === '' ? null : input.value, 'edit'); });
      return el('div', { className: 'pt-field' }, [label, input]);
    }

    input = el('input', { type: 'text', id: id, className: 'form-control', autocomplete: 'off' });
    if (column.type === 'numeric') input.setAttribute('inputmode', 'numeric');
    if (prop === 'comment' || prop === 'Name') input.setAttribute('maxlength', '200');
    input.value = isDisease ? this._diseaseLabel(value) : this._displayValue(value);
    this._markValidity(input, column, value);

    if (isDisease) {
      // chosen from the cancer list, like clicking the disease cell of the old grid
      input.readOnly = true;
      input.classList.add('pt-disease');
      input.setAttribute('role', 'button');
      input.setAttribute('aria-haspopup', 'dialog');
      var open = function (e) {
        if (e) e.preventDefault();
        self._runHooks('afterSelectionEndByProp', row, prop, { value: false });
      };
      input.addEventListener('click', open);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') open(e); });
    } else {
      input.addEventListener('change', function () { self.setDataAtRowProp(row, prop, input.value, 'edit'); });
    }
    return el('div', { className: 'pt-field' + (prop === 'comment' ? ' pt-wide' : '') + (isDisease ? ' pt-disease-field' : '') }, [label, input]);
  };

  PersonTable.prototype._renderAll = function () {
    var self = this;
    this.container.innerHTML = '';
    var list = el('div', { className: 'pt-list' });
    this.container.appendChild(list);
    this.data.forEach(function (rowData, row) { self._appendRow(row); });
  };

  PersonTable.prototype._appendRow = function (row) {
    var self = this, list = this.container.querySelector('.pt-list'), card;
    var fields = this.columns
      .filter(function (c) { return !(self.layout === 'cards' && c.data === 'Name'); })
      .map(function (c) { return self._renderField(row, c); });
    if (this.layout === 'cards') {
      var nameCol = this._column('Name');
      var head = nameCol ? this._renderField(row, nameCol) : null;
      if (head) head.className += ' pt-name';
      card = el('div', { className: 'pt-card', 'data-row': row }, [head, el('div', { className: 'pt-grid' }, fields)]);
    } else {
      card = el('div', { className: 'pt-row', 'data-row': row }, [el('div', { className: 'pt-grid' }, fields)]);
    }
    list.appendChild(card);
  };

  global.PersonTable = PersonTable;
})(window);
