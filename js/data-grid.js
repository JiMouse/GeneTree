/*
 * DataGrid — a dependency-free spreadsheet for the GeneTree tool (index.html),
 * replacing Handsontable. No third-party code, no licence key.
 *
 * Spreadsheet features: keyboard editing (arrows, Enter, Tab, Escape, F2, typing
 * straight into a cell), range selection (mouse drag, Shift+click, Shift+arrows),
 * copy / cut / paste with Excel (tab-separated text, quoted multi-line cells),
 * undo / redo (Ctrl+Z, Ctrl+Y or Ctrl+Shift+Z), dragging rows by their handle,
 * and a delete button on each row.
 *
 * It implements the part of the Handsontable API that GeneTree uses, with the same
 * data semantics (checked against Handsontable 16 on tool-handsontable.html), so main.js,
 * main_front.js, hotTable.js and indexWidgets.js run unchanged:
 *   loadData, getSourceData, getSourceDataAtCell, getDataAtRowProp, setDataAtRowProp
 *   (single and batch), populateFromArray, updateSettings, render, setCellMeta,
 *   getCellMeta, selectCell, getSelectedLast, getSelected, getCell, countRows,
 *   countCols, scrollViewportTo, getPlugin('exportFile').downloadFile, addHook.
 * Hooks: afterChange, afterSelectionEndByProp, beforeRemoveRow, afterRemoveRow,
 *   beforeRowMove, afterRowMove (and afterChange given in the settings).
 *
 * Semantics kept from Handsontable:
 *  - getSourceData() returns a deep copy of the rows (with columns not displayed).
 *  - 'numeric' columns store numeric-looking text as numbers ("60" -> 60).
 *  - 'checkbox' columns store checkedTemplate / uncheckedTemplate.
 *  - a change made from inside a hook is processed after the current change and its
 *    hooks have finished (GeneTree's hooks keep their state in global variables).
 *  - one afterChange per action: an edit, the Delete key on a range, a paste.
 *  - rows created by a paste have every property of the first row, set to null.
 *  - loadData() fires afterChange(null, 'loadData') and clears the undo history.
 *  - moving a row only fires beforeRowMove / afterRowMove: GeneTree's afterRowMove
 *    reorders the data itself (as Handsontable only reorders the display).
 */
(function (global) {
  'use strict';

  function isNumericLike(v) { return typeof v === 'string' && /^\s*-?\d+(?:[.,]\d+)?\s*$/.test(v); }
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function text(v) { return (v === null || v === undefined || (typeof v === 'number' && isNaN(v))) ? '' : String(v); }
  function stripTags(html) { var d = document.createElement('div'); d.innerHTML = String(html == null ? '' : html); return d.textContent; }

  // Excel / Google Sheets clipboard text -> 2D array (quoted cells may hold tabs, quotes and new lines)
  function parseTSV(str) {
    var rows = [], row = [], cell = '', i = 0, quoted = false, atStart = true;
    str = String(str).replace(/\r\n?/g, '\n');
    while (i < str.length) {
      var ch = str[i];
      if (quoted) {
        if (ch === '"' && str[i + 1] === '"') { cell += '"'; i += 2; continue; }
        if (ch === '"') { quoted = false; i++; continue; }
        cell += ch; i++; continue;
      }
      if (ch === '"' && atStart) { quoted = true; atStart = false; i++; continue; }
      if (ch === '\t') { row.push(cell); cell = ''; atStart = true; i++; continue; }
      if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; atStart = true; i++; continue; }
      cell += ch; atStart = false; i++;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function toTSV(rows) {
    return rows.map(function (r) {
      return r.map(function (v) { v = text(v); return /[\t\n\r"]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join('\t');
    }).join('\n');
  }

  function DataGrid(container, settings) {
    var self = this;
    this.rootElement = container;
    this.settings = {};
    this.hooks = {};
    this.meta = {};
    this.undoStack = [];
    this.redoStack = [];
    this.sel = null;          // {r1, c1, r2, c2}: anchor (r1, c1), active end (r2, c2)
    this.editor = null;
    this._busy = false;
    this._queue = [];
    this._group = null;

    ['loadData', 'getSourceData', 'getSourceDataAtCell', 'getDataAtRowProp', 'setDataAtRowProp', 'populateFromArray',
     'updateSettings', 'render', 'setCellMeta', 'getCellMeta', 'selectCell', 'getSelectedLast', 'getSelected', 'getCell',
     'countRows', 'countCols', 'scrollViewportTo', 'getPlugin', 'addHook', 'getSettings', 'undo', 'redo', 'removeRow', 'moveRow']
      .forEach(function (m) { self[m] = self[m].bind(self); });

    this._build();
    this.updateSettings(settings, true);
    if (settings.afterChange) this.addHook('afterChange', settings.afterChange);
    this._setData(settings.data || []);
    this.render();
  }

  /* ---------- settings, hooks ---------- */

  DataGrid.prototype.getSettings = function () { return this.settings; };

  DataGrid.prototype.updateSettings = function (s, init) {
    var self = this;
    Object.keys(s || {}).forEach(function (k) {
      if (k === 'data' || k === 'afterChange') return;
      self.settings[k] = s[k];
    });
    if (s && s.height) this.scroller.style.maxHeight = typeof s.height === 'number' ? s.height + 'px' : s.height;
    if (!init) this.render();
  };

  DataGrid.prototype.addHook = function (name, fn) { (this.hooks[name] = this.hooks[name] || []).push(fn); };

  DataGrid.prototype._run = function (name) {
    var args = Array.prototype.slice.call(arguments, 1), self = this, result;
    (this.hooks[name] || []).forEach(function (fn) { var r = fn.apply(self, args); if (r === false) result = false; });
    return result;
  };

  /* ---------- data ---------- */

  DataGrid.prototype._setData = function (data) {
    this.data = data;
    // like Handsontable's "duck schema": rows created later get the first row's properties
    this.schema = data && data[0] ? Object.keys(data[0]) : this._columns().map(function (c) { return c.data; });
  };

  DataGrid.prototype._newRow = function () {
    var row = {};
    this.schema.forEach(function (k) { row[k] = null; });
    return row;
  };

  DataGrid.prototype.loadData = function (data) {
    this._closeEditor(false);
    this._setData(data);
    this.meta = {};
    this.undoStack = []; this.redoStack = [];
    this.render();
    this._run('afterChange', null, 'loadData');
  };

  DataGrid.prototype.getSourceData = function () { return clone(this.data); };
  DataGrid.prototype.countRows = function () { return this.data.length; };
  DataGrid.prototype.countCols = function () { return this._columns().length; };
  DataGrid.prototype._columns = function () { return this.settings.columns || []; };
  DataGrid.prototype._prop = function (col) { var c = this._columns()[col]; return c ? c.data : col; };
  DataGrid.prototype._colIndex = function (prop) {
    if (typeof prop === 'number') return prop;
    var cols = this._columns();
    for (var i = 0; i < cols.length; i++) if (cols[i].data === prop) return i;
    return -1;
  };
  DataGrid.prototype.getSourceDataAtCell = function (row, col) {
    return this.data[row] ? this.data[row][this._prop(col)] : null;
  };
  DataGrid.prototype.getDataAtRowProp = function (row, prop) { return this.data[row] ? this.data[row][prop] : null; };

  DataGrid.prototype._coerce = function (col, value) {
    var c = this._cellProps(0, col);
    if (c.type === 'numeric' && isNumericLike(value)) return parseFloat(value.replace(',', '.'));
    return value;
  };

  // changes: [[row, prop, value], ...]. Applied as ONE action: one afterChange, one undo step.
  DataGrid.prototype._change = function (changes, source) {
    if (this._busy) { this._queue.push([changes, source]); return; }
    this._busy = true;
    var top = !this._group && !/^UndoRedo/.test(source);
    if (top) this._group = { changes: [], addedRows: 0 };
    try {
      this._apply(changes, source);
      while (this._queue.length) { var q = this._queue.shift(); this._apply(q[0], q[1]); }
    } finally {
      this._busy = false;
      if (top) {
        if (this._group.changes.length || this._group.addedRows) { this.undoStack.push(this._group); this.redoStack = []; }
        this._group = null;
      }
    }
  };

  DataGrid.prototype._apply = function (changes, source) {
    var self = this, done = [], rowsTouched = {};
    changes.forEach(function (ch) {
      var row = ch[0], col = self._colIndex(ch[1]), prop = typeof ch[1] === 'number' ? self._prop(ch[1]) : ch[1];
      while (self.data.length <= row) { self.data.push(self._newRow()); if (self._group) self._group.addedRows++; }
      var value = col >= 0 ? self._coerce(col, ch[2]) : ch[2];
      var old = self.data[row][prop];
      self.data[row][prop] = value;
      done.push([row, prop, old, value]);
      rowsTouched[row] = true;
    });
    if (this._group) Array.prototype.push.apply(this._group.changes, done);
    if (this.tbody.rows.length !== this.data.length) this.render();
    else Object.keys(rowsTouched).forEach(function (r) { self._renderRow(+r); });
    if (done.length) this._run('afterChange', done, source || 'edit');
  };

  DataGrid.prototype.setDataAtRowProp = function (row, prop, value, source) {
    if (Array.isArray(row)) this._change(row.map(function (c) { return [c[0], c[1], c[2]]; }), prop || 'edit');
    else this._change([[row, prop, value]], source || 'edit');
  };

  DataGrid.prototype.populateFromArray = function (row, col, input, endRow, endCol, source) {
    var changes = [], ncols = this.countCols();
    for (var i = 0; i < input.length; i++)
      for (var j = 0; j < input[i].length; j++)
        if (col + j < ncols) changes.push([row + i, this._prop(col + j), input[i][j]]);
    this._change(changes, source || 'populateFromArray');
  };

  /* ---------- undo / redo ---------- */

  DataGrid.prototype.undo = function () {
    var a = this.undoStack.pop(); if (!a) return;
    this._closeEditor(false);
    if (a.type === 'remove') {
      Array.prototype.splice.apply(this.data, [a.index, 0].concat(clone(a.rows)));
      this.render();
      this._run('afterChange', null, 'UndoRedo.undo');
    } else {
      // a cell that had no value gets null back, as with Handsontable
      var rev = a.changes.slice().reverse().map(function (c) { return [c[0], c[1], c[2] === undefined ? null : c[2]]; });
      this._change(rev, 'UndoRedo.undo');
      if (a.addedRows) { this.data.splice(this.data.length - a.addedRows, a.addedRows); this.render(); }
    }
    this.redoStack.push(a);
  };

  DataGrid.prototype.redo = function () {
    var a = this.redoStack.pop(); if (!a) return;
    this._closeEditor(false);
    if (a.type === 'remove') {
      this.data.splice(a.index, a.rows.length);
      this.render();
      this._run('afterChange', null, 'UndoRedo.redo');
    } else {
      this._change(a.changes.map(function (c) { return [c[0], c[1], c[3]]; }), 'UndoRedo.redo');
    }
    this.undoStack.push(a);
  };

  /* ---------- rows: remove, move ---------- */

  DataGrid.prototype.removeRow = function (index) {
    if (this._run('beforeRemoveRow', index, 1, [index], 'DataGrid.removeRow') === false) return;
    this._closeEditor(false);
    var removed = this.data.splice(index, 1);
    var meta = {}, self = this;
    Object.keys(this.meta).forEach(function (k) {
      var p = k.split(','), r = +p[0];
      if (r < index) meta[k] = self.meta[k]; else if (r > index) meta[(r - 1) + ',' + p[1]] = self.meta[k];
    });
    this.meta = meta;
    this.undoStack.push({ type: 'remove', index: index, rows: clone(removed) }); this.redoStack = [];
    if (this.sel && this.sel.r2 >= this.data.length) this.sel = null;
    this.render();
    this._run('afterRemoveRow', index, 1, [index], 'DataGrid.removeRow');
  };

  // dropIndex: the row position (0..countRows) before which the dragged row is dropped
  DataGrid.prototype.moveRow = function (from, dropIndex) {
    if (dropIndex === from || dropIndex === from + 1) return;
    var finalIndex = dropIndex > from ? dropIndex - 1 : dropIndex;
    if (this._run('beforeRowMove', [from], finalIndex, dropIndex, true) === false) return;
    if (!(this.hooks.afterRowMove || []).length) { // nobody reorders the data: do it here
      var el = this.data.splice(from, 1)[0]; this.data.splice(finalIndex, 0, el); this.render();
    }
    this._run('afterRowMove', [from], finalIndex, dropIndex, true, true);
  };

  /* ---------- cell properties, meta ---------- */

  DataGrid.prototype.setCellMeta = function (row, col, key, value) {
    var k = row + ',' + col; (this.meta[k] = this.meta[k] || {})[key] = value;
  };

  DataGrid.prototype._cellProps = function (row, col) {
    var column = this._columns()[col] || {}, props = {};
    Object.keys(column).forEach(function (k) { props[k] = column[k]; });
    if (typeof this.settings.cells === 'function') {
      var extra = this.settings.cells.call(this, row, col, column.data) || {};
      Object.keys(extra).forEach(function (k) { props[k] = extra[k]; });
    }
    var m = this.meta[row + ',' + col] || {};
    Object.keys(m).forEach(function (k) { props[k] = m[k]; });
    props.row = row; props.col = col; props.prop = column.data; props.instance = this;
    return props;
  };
  DataGrid.prototype.getCellMeta = function (row, col) { return this._cellProps(row, col); };

  /* ---------- selection ---------- */

  DataGrid.prototype.getSelectedLast = function () {
    return this.sel ? [this.sel.r1, this.sel.c1, this.sel.r2, this.sel.c2] : undefined;
  };
  DataGrid.prototype.getSelected = function () { var s = this.getSelectedLast(); return s ? [s] : undefined; };

  DataGrid.prototype.selectCell = function (row, col, row2, col2) {
    var c1 = this._colIndex(col), c2 = col2 === undefined ? c1 : this._colIndex(col2);
    this._select(row, c1, row2 === undefined ? row : row2, c2, true);
    return true;
  };

  DataGrid.prototype._select = function (r1, c1, r2, c2, fire) {
    var nr = this.data.length - 1, nc = this.countCols() - 1;
    var clamp = function (v, max) { return Math.max(0, Math.min(v, max)); };
    this.sel = { r1: clamp(r1, nr), c1: clamp(c1, nc), r2: clamp(r2, nr), c2: clamp(c2, nc) };
    this._paintSelection();
    var td = this.getCell(this.sel.r2, this.sel.c2);
    if (td) this.scrollViewportTo(this.sel.r2, this.sel.c2);
    if (fire) this._fireSelectionEnd();
  };

  DataGrid.prototype._fireSelectionEnd = function () {
    var s = this.sel; if (!s) return;
    this._run('afterSelectionEndByProp', s.r1, this._prop(s.c1), s.r2, this._prop(s.c2), 0);
  };

  DataGrid.prototype._paintSelection = function () {
    var root = this.tbody, s = this.sel;
    Array.prototype.forEach.call(root.querySelectorAll('td.dg-sel, td.dg-active'), function (td) { td.classList.remove('dg-sel', 'dg-active'); });
    if (!s) return;
    for (var r = Math.min(s.r1, s.r2); r <= Math.max(s.r1, s.r2); r++)
      for (var c = Math.min(s.c1, s.c2); c <= Math.max(s.c1, s.c2); c++) {
        var td = this.getCell(r, c); if (td) td.classList.add('dg-sel');
      }
    var a = this.getCell(s.r1, s.c1); if (a) a.classList.add('dg-active'); // active cell = start of the selection, as in Excel
  };

  DataGrid.prototype._range = function () {
    var s = this.sel;
    return { r1: Math.min(s.r1, s.r2), r2: Math.max(s.r1, s.r2), c1: Math.min(s.c1, s.c2), c2: Math.max(s.c1, s.c2) };
  };

  DataGrid.prototype.getCell = function (row, col) {
    var tr = this.tbody.rows[row]; return tr ? tr.cells[col + 1] || null : null;
  };

  DataGrid.prototype.scrollViewportTo = function (row, col) {
    if (row && typeof row === 'object') { col = row.col; row = row.row; } // Handsontable 16 form: {row, col}
    var td = this.getCell(row, col || 0); if (!td) return;
    var sc = this.scroller, head = this.thead.offsetHeight, left = this.thead.rows[0].cells[0].offsetWidth;
    if (td.offsetTop - head < sc.scrollTop) sc.scrollTop = td.offsetTop - head;
    else if (td.offsetTop + td.offsetHeight > sc.scrollTop + sc.clientHeight) sc.scrollTop = td.offsetTop + td.offsetHeight - sc.clientHeight;
    if (td.offsetLeft - left < sc.scrollLeft) sc.scrollLeft = td.offsetLeft - left;
    else if (td.offsetLeft + td.offsetWidth > sc.scrollLeft + sc.clientWidth) sc.scrollLeft = td.offsetLeft + td.offsetWidth - sc.clientWidth;
  };

  /* ---------- rendering ---------- */

  DataGrid.prototype._build = function () {
    var root = this.rootElement;
    root.classList.add('dg');
    root.innerHTML = '';
    this.scroller = document.createElement('div');
    this.scroller.className = 'dg-scroll';
    this.table = document.createElement('table');
    this.table.className = 'dg-table';
    this.thead = this.table.createTHead();
    this.tbody = this.table.createTBody();
    this.scroller.appendChild(this.table);
    // receives the keyboard and the clipboard while a cell is selected (like Handsontable's hidden textarea)
    this.focusCatcher = document.createElement('textarea');
    this.focusCatcher.className = 'dg-focus';
    this.focusCatcher.setAttribute('aria-hidden', 'true');
    this.focusCatcher.tabIndex = -1;
    root.appendChild(this.focusCatcher);
    root.appendChild(this.scroller);
    this.dropLine = document.createElement('div');
    this.dropLine.className = 'dg-dropline';
    this.scroller.appendChild(this.dropLine);
    this._bindEvents();
  };

  DataGrid.prototype.render = function () {
    var self = this, cols = this._columns(), headers = this.settings.colHeaders || [];
    this.thead.innerHTML = '';
    var htr = this.thead.insertRow();
    var corner = document.createElement('th'); corner.className = 'dg-corner'; htr.appendChild(corner);
    cols.forEach(function (c, i) {
      var th = document.createElement('th');
      th.innerHTML = Array.isArray(headers) ? (headers[i] == null ? '' : headers[i]) : '';
      htr.appendChild(th);
    });
    this.tbody.innerHTML = '';
    for (var r = 0; r < this.data.length; r++) {
      var tr = this.tbody.insertRow();
      var th = document.createElement('th');
      th.className = 'dg-rowhead';
      th.innerHTML = '<span class="dg-handle" title="Déplacer / Move" aria-label="Move row">⋮⋮</span>' +
        '<span class="dg-num">' + (r + 1) + '</span>' +
        '<button type="button" class="dg-del" title="Supprimer la ligne / Remove row" aria-label="Remove row">×</button>';
      tr.appendChild(th);
      for (var c = 0; c < cols.length; c++) tr.appendChild(document.createElement('td'));
      this._renderRow(r);
    }
    this._paintSelection();
  };

  DataGrid.prototype._renderRow = function (r) {
    var tr = this.tbody.rows[r]; if (!tr) return;
    for (var c = 0; c < this._columns().length; c++) this._renderCell(r, c, tr.cells[c + 1]);
    var s = this.sel;
    if (s && r >= Math.min(s.r1, s.r2) && r <= Math.max(s.r1, s.r2)) this._paintSelection();
  };

  DataGrid.prototype._renderCell = function (r, c, td) {
    if (this.editor && this.editor.row === r && this.editor.col === c) return;
    var p = this._cellProps(r, c), value = this.data[r] ? this.data[r][p.prop] : null;
    td.className = (p.className || this.settings.className || '') + (p.type === 'numeric' ? ' htNumeric' : '');
    td.innerHTML = '';
    if (typeof p.renderer === 'function') p.renderer.call(this, this, td, r, c, p.prop, value, p);
    else if (p.type === 'checkbox') {
      var box = document.createElement('input');
      box.type = 'checkbox'; box.tabIndex = -1;
      box.checked = String(value) === String(p.checkedTemplate);
      td.appendChild(box);
    } else DataGrid.renderText(this, td, r, c, p.prop, value, p);
    if (p.type === 'dropdown' || p.type === 'autocomplete') td.classList.add('dg-list');
  };

  // equivalent of Handsontable.renderers.TextRenderer, used by GeneTree's disease renderers
  DataGrid.renderText = function (instance, td, row, col, prop, value) {
    td.textContent = text(value);
  };

  /* ---------- editing ---------- */

  // opts.selectAll: select the current text, so typing replaces it (single click on a list cell)
  DataGrid.prototype._openEditor = function (initial, fast, opts) {
    var s = this.sel; if (!s) return;
    var r = s.r1, c = s.c1, p = this._cellProps(r, c), td = this.getCell(r, c), self = this;
    if (!td || p.readOnly) return;
    if (p.type === 'checkbox') { this._toggle(r, c); return; }
    var input = document.createElement('input');
    input.type = 'text'; input.className = 'dg-editor'; input.autocomplete = 'off';
    input.value = initial !== undefined ? initial : text(this.data[r][p.prop]);
    var isList = p.type === 'dropdown' || p.type === 'autocomplete';
    this.editor = { row: r, col: c, input: input, fast: !!fast, source: isList ? (p.source || []) : null, items: [], active: -1, list: null };
    td.innerHTML = ''; td.classList.remove('dg-list'); td.appendChild(input);
    input.focus();
    if (opts && opts.selectAll) input.select();
    else input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener('keydown', function (e) { self._editorKey(e); });
    input.addEventListener('blur', function () { if (self.editor && self.editor.input === input) self._closeEditor(true); });
    if (isList) {
      input.addEventListener('input', function () { if (self.editor && self.editor.input === input) self._showList(true); });
      this._showList(initial !== undefined); // typed: filter on it; opened: whole list, current value highlighted
    }
  };

  /* dropdown list under the cell (Sexe, Option...): click a value, or arrows + Enter */
  DataGrid.prototype._showList = function (filter) {
    var ed = this.editor, self = this; if (!ed || !ed.source) return;
    var q = ed.input.value.trim().toLowerCase();
    var items = (filter && q) ? ed.source.filter(function (o) { return String(o).toLowerCase().indexOf(q) >= 0; }) : ed.source.slice();
    ed.items = items.slice(0, 200);
    ed.active = filter ? (ed.items.length ? 0 : -1) : ed.items.map(String).indexOf(ed.input.value);
    if (!ed.list) {
      ed.list = document.createElement('div');
      ed.list.className = 'dg-dropdown';
      ed.list.setAttribute('role', 'listbox');
      ed.list.addEventListener('mousedown', function (e) {
        e.preventDefault(); // keep the focus in the editor
        var opt = e.target.closest('.dg-option'); if (!opt || !self.editor) return;
        self.editor.input.value = self.editor.items[+opt.getAttribute('data-i')];
        self._closeEditor(true); self._focus();
      });
      document.body.appendChild(ed.list);
    }
    ed.list.innerHTML = '';
    ed.items.forEach(function (o, i) {
      var d = document.createElement('div');
      d.className = 'dg-option' + (i === ed.active ? ' dg-option-active' : '');
      d.setAttribute('role', 'option'); d.setAttribute('data-i', i);
      d.textContent = o === '' ? '\u00a0' : o;
      ed.list.appendChild(d);
    });
    ed.list.style.display = ed.items.length ? 'block' : 'none';
    this._placeList();
  };

  DataGrid.prototype._placeList = function () {
    var ed = this.editor; if (!ed || !ed.list) return;
    var td = this.getCell(ed.row, ed.col); if (!td) return;
    var b = td.getBoundingClientRect(), l = ed.list;
    l.style.minWidth = Math.max(b.width, 80) + 'px';
    l.style.left = b.left + 'px';
    var h = Math.min(l.scrollHeight, 220);
    l.style.top = (b.bottom + h > window.innerHeight && b.top > h ? b.top - h : b.bottom) + 'px';
    var act = l.querySelector('.dg-option-active'); if (act) act.scrollIntoView({ block: 'nearest' });
  };

  DataGrid.prototype._moveListHighlight = function (d) {
    var ed = this.editor; if (!ed || !ed.items.length) return;
    ed.active = Math.max(0, Math.min(ed.items.length - 1, ed.active + d));
    Array.prototype.forEach.call(ed.list.children, function (el, i) { el.classList.toggle('dg-option-active', i === ed.active); });
    this._placeList();
  };

  DataGrid.prototype._closeEditor = function (save) {
    var ed = this.editor; if (!ed) return;
    this.editor = null;
    if (ed.list) ed.list.remove();
    if (save) this._change([[ed.row, this._prop(ed.col), ed.input.value]], 'edit');
    this._renderRow(ed.row);
  };

  DataGrid.prototype._editorKey = function (e) {
    var ed = this.editor; if (!ed) return;
    var listOpen = ed.list && ed.list.style.display !== 'none' && ed.items.length;
    if (listOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); this._moveListHighlight(e.key === 'ArrowDown' ? 1 : -1); return; }
    if (listOpen && (e.key === 'Enter' || e.key === 'Tab') && ed.active >= 0) ed.input.value = ed.items[ed.active];
    var move = null;
    if (e.key === 'Enter') move = [e.shiftKey ? -1 : 1, 0];
    else if (e.key === 'Tab') move = [0, e.shiftKey ? -1 : 1];
    else if (e.key === 'Escape') { e.preventDefault(); this._closeEditor(false); this._focus(); return; }
    else if (ed.fast && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) move = [e.key === 'ArrowUp' ? -1 : 1, 0];
    else if (ed.fast && !ed.source && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) move = [0, e.key === 'ArrowLeft' ? -1 : 1];
    if (!move) return;
    e.preventDefault();
    this._closeEditor(true);
    this._focus();
    this._moveBy(move[0], move[1], false);
  };

  DataGrid.prototype._toggle = function (r, c) {
    var p = this._cellProps(r, c), v = this.data[r][p.prop];
    var checked = String(v) === String(p.checkedTemplate);
    this._change([[r, p.prop, checked ? p.uncheckedTemplate : p.checkedTemplate]], 'edit');
  };

  DataGrid.prototype._moveBy = function (dr, dc, extend) {
    var s = this.sel; if (!s) return;
    if (extend) this._select(s.r1, s.c1, s.r2 + dr, s.c2 + dc, true);
    else this._select(s.r1 + dr, s.c1 + dc, s.r1 + dr, s.c1 + dc, true);
  };

  DataGrid.prototype._focus = function () {
    try { this.focusCatcher.focus({ preventScroll: true }); } catch (e) { this.focusCatcher.focus(); }
  };

  /* ---------- events ---------- */

  DataGrid.prototype._cellFromEvent = function (e) {
    var td = e.target.closest ? e.target.closest('td') : null;
    if (!td || !this.tbody.contains(td)) return null;
    return { r: td.parentNode.sectionRowIndex, c: td.cellIndex - 1, td: td };
  };

  DataGrid.prototype._bindEvents = function () {
    var self = this, sc = this.scroller;

    sc.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      var head = e.target.closest('th.dg-rowhead');
      if (head) {
        var row = head.parentNode.sectionRowIndex;
        if (e.target.classList.contains('dg-handle')) { e.preventDefault(); self._startRowDrag(row, e); }
        return;
      }
      var cell = self._cellFromEvent(e); if (!cell) return;
      if (self.editor && self.editor.row === cell.r && self.editor.col === cell.c) return; // clicking inside the editor
      e.preventDefault();
      self._closeEditor(true);
      if (e.shiftKey && self.sel) self._select(self.sel.r1, self.sel.c1, cell.r, cell.c, false);
      else self._select(cell.r, cell.c, cell.r, cell.c, false);
      self._focus();
      self._dragSel = true;
      self._clickOpens = !e.shiftKey && e.target.type !== 'checkbox';
      if (e.target.type === 'checkbox') { self._dragSel = false; self._toggle(cell.r, cell.c); self._fireSelectionEnd(); }
    });
    sc.addEventListener('mouseover', function (e) {
      if (!self._dragSel || !self.sel) return;
      var cell = self._cellFromEvent(e); if (!cell) return;
      if (cell.r !== self.sel.r2 || cell.c !== self.sel.c2) self._select(self.sel.r1, self.sel.c1, cell.r, cell.c, false);
    });
    document.addEventListener('mouseup', function () {
      if (!self._dragSel) return;
      self._dragSel = false;
      self._fireSelectionEnd();
      // a single click on a list cell (Sexe, Option) opens its list
      var s = self.sel;
      if (self._clickOpens && s && s.r1 === s.r2 && s.c1 === s.c2 && !self.editor &&
          self._cellProps(s.r1, s.c1).type === 'dropdown')
        self._openEditor(undefined, false, { selectAll: true });
    });
    sc.addEventListener('scroll', function () { self._placeList(); });
    window.addEventListener('resize', function () { self._placeList(); });
    sc.addEventListener('click', function (e) {
      if (e.target.type === 'checkbox') e.preventDefault(); // the value is set on mousedown; the redraw shows it
      if (e.target.classList.contains('dg-del')) {
        self.removeRow(e.target.closest('tr').sectionRowIndex);
      }
    });
    sc.addEventListener('dblclick', function (e) {
      var cell = self._cellFromEvent(e); if (!cell || self.editor) return;
      self._select(cell.r, cell.c, cell.r, cell.c, false);
      self._openEditor(undefined, false);
    });

    this.focusCatcher.addEventListener('keydown', function (e) { self._gridKey(e); });
    this.focusCatcher.addEventListener('copy', function (e) { self._copy(e, false); });
    this.focusCatcher.addEventListener('cut', function (e) { self._copy(e, true); });
    this.focusCatcher.addEventListener('paste', function (e) { self._paste(e); });
  };

  DataGrid.prototype._gridKey = function (e) {
    if (!this.sel || this.editor) return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && !e.altKey) {
      var k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); return; }
      if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); this.redo(); return; }
      if (k === 'a') { e.preventDefault(); this._select(0, 0, this.data.length - 1, this.countCols() - 1, true); return; }
      if (k === 'c' || k === 'x') { // give the native copy something to copy; _copy() sets the real content
        var g0 = this._range(), rows0 = [];
        for (var r0 = g0.r1; r0 <= g0.r2; r0++) { var row0 = []; for (var c0 = g0.c1; c0 <= g0.c2; c0++) row0.push(this.data[r0][this._prop(c0)]); rows0.push(row0); }
        this.focusCatcher.value = toTSV(rows0) || ' ';
        this.focusCatcher.select();
      }
      return; // copy / cut / paste: native events on the focus catcher
    }
    var arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (arrows[e.key]) { e.preventDefault(); this._moveBy(arrows[e.key][0], arrows[e.key][1], e.shiftKey); return; }
    if (e.key === 'Tab') { e.preventDefault(); this._moveBy(0, e.shiftKey ? -1 : 1, false); return; }
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      var p = this._cellProps(this.sel.r1, this.sel.c1);
      if (p.type === 'checkbox') this._toggle(this.sel.r1, this.sel.c1); else this._openEditor(undefined, false);
      return;
    }
    if (e.key === ' ' && this._cellProps(this.sel.r1, this.sel.c1).type === 'checkbox') { e.preventDefault(); this._toggle(this.sel.r1, this.sel.c1); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      var g = this._range(), changes = [];
      for (var r = g.r1; r <= g.r2; r++) for (var c = g.c1; c <= g.c2; c++) changes.push([r, this._prop(c), null]);
      this._change(changes, 'edit');
      return;
    }
    if (e.key.length === 1 && !e.altKey) { // typing starts editing, replacing the content
      e.preventDefault();
      if (this._cellProps(this.sel.r1, this.sel.c1).type !== 'checkbox') this._openEditor(e.key, true);
    }
  };

  DataGrid.prototype._copy = function (e, cut) {
    if (!this.sel || this.editor) return;
    e.preventDefault();
    var g = this._range(), rows = [];
    for (var r = g.r1; r <= g.r2; r++) {
      var row = [];
      for (var c = g.c1; c <= g.c2; c++) row.push(this.data[r][this._prop(c)]);
      rows.push(row);
    }
    e.clipboardData.setData('text/plain', toTSV(rows));
    if (cut) {
      var changes = [];
      for (r = g.r1; r <= g.r2; r++) for (c = g.c1; c <= g.c2; c++) changes.push([r, this._prop(c), '']);
      this._change(changes, 'CopyPaste.cut');
    }
  };

  DataGrid.prototype._paste = function (e) {
    if (!this.sel || this.editor) return;
    e.preventDefault();
    var rows = parseTSV(e.clipboardData.getData('text/plain'));
    if (!rows.length) return;
    // like Handsontable: the first line sets the width of the pasted block; a shorter line
    // clears the rest of its cells (undefined), cells beyond that width are ignored
    var g = this._range(), changes = [], ncols = this.countCols(), width = rows[0].length;
    for (var i = 0; i < rows.length; i++)
      for (var j = 0; j < width; j++)
        if (g.c1 + j < ncols) changes.push([g.r1 + i, this._prop(g.c1 + j), rows[i][j]]);
    this._change(changes, 'CopyPaste.paste');
    this._select(g.r1, g.c1, g.r1 + rows.length - 1, Math.min(g.c1 + width - 1, ncols - 1), true);
  };

  /* ---------- row drag ---------- */

  DataGrid.prototype._startRowDrag = function (row, e) {
    var self = this, tbody = this.tbody, line = this.dropLine, drop = row;
    var tr = tbody.rows[row]; tr.classList.add('dg-dragging');
    function dropIndexAt(y) {
      for (var i = 0; i < tbody.rows.length; i++) {
        var b = tbody.rows[i].getBoundingClientRect();
        if (y < b.top + b.height / 2) return i;
      }
      return tbody.rows.length;
    }
    function move(ev) {
      drop = dropIndexAt(ev.clientY);
      var ref = tbody.rows[Math.min(drop, tbody.rows.length - 1)];
      var top = drop < tbody.rows.length ? ref.offsetTop : ref.offsetTop + ref.offsetHeight;
      line.style.top = (top - 1) + 'px'; line.style.display = 'block';
    }
    function up() {
      document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
      line.style.display = 'none'; tr.classList.remove('dg-dragging');
      self.moveRow(row, drop);
    }
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  };

  /* ---------- export ---------- */

  DataGrid.prototype.getPlugin = function (name) {
    var self = this;
    if (name !== 'exportFile') return { isEnabled: function () { return false; } };
    function build(o) {
      o = o || {};
      var d = o.columnDelimiter || ',', nl = o.rowDelimiter || '\r\n', cols = self._columns(), lines = [];
      function esc(v, force) {
        v = text(v);
        if (v !== '' && (force || v.indexOf('\r') >= 0 || v.indexOf('\n') >= 0 || v.indexOf('"') >= 0 || v.indexOf(d) >= 0)) v = '"' + v.replace(/"/g, '""') + '"';
        return v;
      }
      if (o.columnHeaders) {
        var heads = self.settings.colHeaders || [];
        lines.push(cols.map(function (c, i) { return esc(stripTags(heads[i]), true); }).join(d));
      }
      self.data.forEach(function (row) { lines.push(cols.map(function (c) { return esc(row[c.data]); }).join(d)); });
      return lines.join(nl);
    }
    return {
      exportAsString: function (format, o) { return build(o); },
      downloadFile: function (format, o) {
        o = o || {};
        var now = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
        var name = (o.filename || 'Export').replace('[YYYY]', now.getFullYear()).replace('[MM]', pad(now.getMonth() + 1)).replace('[DD]', pad(now.getDate()));
        var blob = new Blob([(o.bom ? '﻿' : '') + build(o)], { type: (o.mimeType || 'text/csv') + ';charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name + '.' + (o.fileExtension || 'csv');
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }
    };
  };

  DataGrid.parseTSV = parseTSV;
  DataGrid.toTSV = toTSV;
  global.DataGrid = DataGrid;
})(window);
