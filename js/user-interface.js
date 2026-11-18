// Patient interface (docs/patient.html): the questionnaire.
//
// Every relative is a card (js/person-table.js). The patient gives the number of
// children, brothers and sisters, uncles and aunts; the cards appear at once, named
// "Enfant 1", "Enfant 2"... (renamed "Fils 1" / "Fille 1" when the sex is chosen, as
// long as the patient has not typed a name). Each card asks whether the person has had
// cancer; on a yes, the site and the "age or year of diagnosis" appear, then "another
// cancer?". Values that look wrong are flagged under the field, never refused.
//
// Columns stored in the cards but not sent to the pedigree: K1 / K2 (yes / no to the
// cancer questions), Dx1 / Dx2 (age or year of diagnosis as typed), NameAuto (the name
// is still the default one). relativeForPedigree() turns them into Disease1, Age1,
// Year1, Disease2, Age2, the fields the tool reads.
$(document).ready(function(){

    var uiPages = ["/GeneTree/docs/patient.html", "/docs/patient.html"];
    if (uiPages.indexOf(window.location.pathname) < 0) return

    // navbar language setter
    $( "#LangSetterFr" ).click(function() {
        $(".se-pre-con").show();
        updateLangage("eng", "fr");
        $(".se-pre-con").fadeOut("slow");
    });

    $( "#LangSetterEng" ).click(function() {
        $(".se-pre-con").show();
        updateLangage("fr", "eng");
        $(".se-pre-con").fadeOut("slow");
    });

    /* ---------- helpers ---------- */

    function L(key) { return (typeof lang !== 'undefined' && lang[key] != null) ? lang[key] : key; }
    function thisYear() { return new Date().getFullYear(); }
    function msg(key) { return L(key).replace('%Y', thisYear()); }
    function isEmpty(v) { return v === null || v === undefined || v === ''; }

    // number typed in a field: null when empty, NaN when it is text ("environ 50")
    function num(v) {
        if (isEmpty(v)) return null;
        if (typeof v === 'number') return v;
        var s = String(v).trim().replace(',', '.');
        return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
    }
    function validYear(y) { return y !== null && !isNaN(y) && y >= 1900 && y <= thisYear(); }

    // "Age or year of diagnosis": a value above 200 is a year
    window.diagnosisFrom = function (value, yob) {
        var v = num(value), y = num(yob);
        if (v === null) return {};
        if (isNaN(v)) return {age: value};                 // text: kept as typed
        var hasYob = y !== null && !isNaN(y);
        if (v <= 200) return hasYob ? {age: v, year: y + v} : {age: v};
        return hasYob ? {age: v - y, year: v} : {year: v};
    };

    // year of birth of the patient, from the date of birth (dd/mm/yyyy)
    function indexYob() {
        var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec($('#dbirth').val() || '');
        if (!m) return null;
        var y = Number(m[3]), mo = Number(m[2]), d = Number(m[1]);
        var date = new Date(y, mo - 1, d);
        if (date.getMonth() !== mo - 1 || date.getDate() !== d || !validYear(y)) return null;
        return y;
    }

    function sexOf(r) { return r && (r.Sex === 'M' || r.Sex === 'F') ? r.Sex : 'U'; }

    // Name of a relative in the patient's language: "Fille", "Oncle maternel"... or neutral when the sex is unknown
    function relativeLabel(group, sex) {
        if (sex && sex !== 'U' && lang['ui_rel_' + group + '_' + sex]) return lang['ui_rel_' + group + '_' + sex];
        return lang['ui_rel_' + group] || group;
    }

    /* ---------- validation (messages under the fields) ---------- */

    function vAge(v, r) {
        var n = num(v);
        if (n === null) return null;
        if (isNaN(n)) return msg('ui_v_number');
        if (n < 0 || n > 120) return msg('ui_v_age');
        return null;
    }

    function parentYob(group) {
        if (typeof hotParents === 'undefined') return null;
        var y = num(hotParents.getDataAtRowProp(group === 'gpp' ? 0 : 1, 'Yob'));
        return validYear(y) ? y : null;
    }

    function vYob(group) {
        return function (v, r) {
            var n = num(v);
            if (n === null) return null;
            if (isNaN(n)) return msg('ui_v_number');
            if (!validYear(n)) return msg('ui_v_year');
            var iy = indexYob();
            if (group === 'children' && iy !== null && n < iy + 12) return msg('ui_v_child');
            if (group === 'parents' && iy !== null && n > iy - 12) return msg('ui_v_parent');
            if (group === 'gpp' || group === 'gpm') {
                var p = parentYob(group), ref = p !== null ? p : (iy !== null ? iy - 12 : null);
                if (ref !== null && n > ref - 12) return msg('ui_v_grandparent');
            }
            return null;
        };
    }

    // age or year of diagnosis, checked against the year of birth and the age of the person
    function checkDiagnosis(v, yob, age) {
        var n = num(v);
        if (n === null) return null;
        if (isNaN(n)) return msg('ui_v_number');
        var y = num(yob), a = num(age);
        if (n <= 200) {
            if (n < 0 || n > 120) return msg('ui_v_age');
            if (a !== null && !isNaN(a) && n > a) return msg('ui_v_dx_age');
            if (validYear(y) && y + n > thisYear()) return msg('ui_v_dx_future');
        } else {
            if (n > thisYear()) return msg('ui_v_dx_future');
            if (n < 1900) return msg('ui_v_year');
            if (validYear(y) && n < y) return msg('ui_v_dx_birth');
        }
        return null;
    }
    function vDx(v, r) { return checkDiagnosis(v, r.Yob, r.Age); }
    function vDxIndex(v) { var iy = indexYob(); return checkDiagnosis(v, iy, iy !== null ? thisYear() - iy : null); }

    /* ---------- tables ---------- */

    var yesNo = [{value: '1', label: function () { return L('yes'); }}, {value: '0', label: function () { return L('no'); }}];
    var sexes = [{value: 'M', label: function () { return L('ui_man'); }}, {value: 'F', label: function () { return L('ui_woman'); }}];

    function relativeColumns(group, fixedSex) {
        var cancer1 = function (r) { return r.K1 === '1'; };
        var cancer2 = function (r) { return r.K1 === '1' && r.K2 === '1'; };
        return [
            {data: 'Name', label: function () { return L('ui_f_name'); }},
            {data: 'Sex', type: 'radio', options: sexes, label: function () { return L('ui_f_sex'); },
                visible: function () { return !fixedSex; }},
            {data: 'Deceased', type: 'checkbox', checkedTemplate: '1', uncheckedTemplate: '0', label: function () { return L('ui_f_deceased'); }},
            {data: 'Age', type: 'numeric', validate: vAge,
                label: function (r) { return L(r.Deceased == '1' ? 'ui_f_age_death' : 'ui_f_age'); }},
            {data: 'Yob', type: 'numeric', validate: vYob(group), label: function () { return L('ui_f_yob'); }},
            {data: 'K1', type: 'radio', options: yesNo, wide: true,
                label: function (r) { return L('ui_q_cancer_' + group + '_' + sexOf(r)); }},
            {data: 'Disease1', visible: cancer1, label: function () { return L('ui_f_loc'); }},
            {data: 'Dx1', type: 'numeric', visible: cancer1, validate: vDx, label: function () { return L('ui_f_dx'); }},
            {data: 'K2', type: 'radio', options: yesNo, wide: true, visible: cancer1,
                label: function (r) { return L('ui_q_another_' + sexOf(r)); }},
            {data: 'Disease2', visible: cancer2, label: function () { return L('ui_f_loc2'); }},
            {data: 'Dx2', type: 'numeric', visible: cancer2, validate: vDx, label: function () { return L('ui_f_dx'); }},
            {data: 'comment', type: 'text', label: function () { return L('ui_f_comment'); }}
        ];
    }

    function newRelative(group, k) {
        return {FamID: '1', Name: relativeLabel(group) + ' ' + k, NameAuto: true, Sex: null, Deceased: '0', Age: null, Yob: null,
            K1: '0', Disease1: null, Dx1: null, K2: '0', Disease2: null, Dx2: null, comment: null};
    }
    function withQuestions(rows) {
        return rows.map(function (r) { return $.extend({K1: '0', K2: '0'}, r); });
    }

    function makeTable(id, group, data, fixedSex) {
        return new PersonTable(document.getElementById(id), {
            diseaseProps: ['Disease1', 'Disease2'],
            data: data,
            columns: relativeColumns(group, fixedSex)
        });
    }

    // the patient's own cancers: one block, then "Have you had another cancer?"
    window.hotCancer = new PersonTable(document.getElementById('hotCancer'), {
        layout: 'rows', diseaseProps: ['Cancer'],
        data: [{Cancer: null, Dx: null, More: '0'}],
        columns: [
            {data: 'Cancer', label: function () { return L('ui_f_loc'); }},
            {data: 'Dx', type: 'numeric', validate: vDxIndex, label: function () { return L('ui_f_dx'); }},
            {data: 'More', type: 'radio', options: yesNo, wide: true, label: function () { return L('ui_another_cancer'); }}
        ]
    });

    var groups = {
        children:       {table: 'hotChildren',       data: []},
        siblings:       {table: 'hotSiblings',       data: []},
        fatherSiblings: {table: 'hotFatherSiblings', data: []},
        motherSiblings: {table: 'hotMotherSiblings', data: []}
    };
    Object.keys(groups).forEach(function (g) { window[groups[g].table] = makeTable(groups[g].table, g, []); });

    window.hotParents = makeTable('hotParents', 'parents', withQuestions([
        {"FamID": "1","Name": lang.ui_name_father,"IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0"},
        {"FamID": "1","Name": lang.ui_name_mother,"IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0"}
    ]), true);
    window.hotGpp = makeTable('hotGpp', 'gpp', withQuestions(myDataGpp), true);
    window.hotGpm = makeTable('hotGpm', 'gpm', withQuestions(myDataGpm), true);

    var allRelatives = function () {
        return [hotChildren, hotSiblings, hotParents, hotGpp, hotFatherSiblings, hotGpm, hotMotherSiblings];
    };
    function refreshAll() { hotCancer.refresh(); allRelatives().forEach(function (t) { t.refresh(); }); }

    /* ---------- age <-> year of birth, default names ---------- */

    function addRelativeHooks(table, group) {
        table.addHook('afterChange', function (changes, source) {
            if (!changes || source !== 'edit') return;
            var row = changes[0][0], prop = changes[0][1], value = changes[0][3], r = table.data[row];
            if (!r) return;
            // Age <-> year of birth (not for a deceased person: the age is the age at death)
            if ((prop === 'Age' || prop === 'Yob') && r.Deceased != '1') {
                var n = num(value), Y = thisYear();
                if (prop === 'Age' && n !== null && !isNaN(n) && n >= 0 && n <= 120) table.setDataAtRowProp(row, 'Yob', Y - n, 'sync');
                if (prop === 'Yob' && validYear(n)) table.setDataAtRowProp(row, 'Age', Y - n, 'sync');
            }
            // a name typed by the patient is kept; a default name follows the sex
            if (prop === 'Name') table.setDataAtRowProp(row, 'NameAuto', false, 'sync');
            if (prop === 'Sex' && r.NameAuto && groups[group]) table.setDataAtRowProp(row, 'Name', relativeLabel(group, r.Sex) + ' ' + (row + 1), 'sync');
            // the parents' years of birth are checked against the grandparents'
            if (group === 'parents' && (prop === 'Yob' || prop === 'Age')) { hotGpp.refresh(); hotGpm.refresh(); }
        });
    }
    Object.keys(groups).forEach(function (g) { addRelativeHooks(window[groups[g].table], g); });
    addRelativeHooks(hotParents, 'parents');
    addRelativeHooks(hotGpp, 'gpp');
    addRelativeHooks(hotGpm, 'gpm');

    // "Have you had another cancer?": yes adds a block, no removes the next ones
    hotCancer.addHook('afterChange', function (changes, source) {
        if (!changes || source !== 'edit' || changes[0][1] !== 'More') return;
        var row = changes[0][0], data = hotCancer.getSourceData();
        if (changes[0][3] === '1') {
            if (row === data.length - 1) {
                data.push({Cancer: null, Dx: null, More: '0'});
                hotCancer.loadData(data);
            }
        } else {
            var removed = data.slice(row + 1);
            if (!removed.length) return;
            var filled = removed.some(function (r) { return !isEmpty(r.Cancer) || !isEmpty(r.Dx); });
            if (filled && !confirm(L('ui_confirm_remove'))) { hotCancer.setDataAtRowProp(row, 'More', '1', 'sync'); return; }
            hotCancer.loadData(data.slice(0, row + 1));
        }
    });

    /* ---------- number of relatives ---------- */

    function isFilled(r) {
        return r.NameAuto === false || r.Deceased == '1' || r.K1 === '1' ||
            ['Sex', 'Age', 'Yob', 'Disease1', 'Dx1', 'Disease2', 'Dx2', 'comment'].some(function (k) { return !isEmpty(r[k]); });
    }

    function setCount(group, n) {
        var table = window[groups[group].table], data = table.getSourceData();
        if (n > data.length) {
            for (var k = data.length + 1; k <= n; k++) data.push(newRelative(group, k));
        } else if (n < data.length) {
            if (data.slice(n).some(isFilled) && !confirm(L('ui_confirm_remove'))) {
                $('#' + group + '_input').val(data.length);
                return;
            }
            data = data.slice(0, n);
        } else return;
        table.loadData(data);
    }

    function groupInit(group) {
        var div = $('#' + group + '_div'), tableDiv = $('#' + group + '_table_div');
        div.hide(); tableDiv.hide();
        $('input[type=radio][name=' + group + '_radio]').on('change', function () {
            var yes = $(this).val() === group + '_Yes';
            div.toggle(yes);
            tableDiv.toggle(yes && window[groups[group].table].countRows() > 0);
        });
        $('#' + group + '_input').on('change', function () {
            var n = Math.round(Number($(this).val()));
            if ($(this).val() === '' || isNaN(n)) return;
            n = Math.max(0, Math.min(20, n));
            $(this).val(n);
            setCount(group, n);
            tableDiv.toggle(window[groups[group].table].countRows() > 0);
        });
    }
    Object.keys(groups).forEach(groupInit);

    // relatives of a group, as the tool expects them; none when the patient answered "no"
    window.patientRelatives = function (group) {
        var radio = $('input[name=' + group + '_radio]');
        if (radio.length && radio.filter(':checked').val() !== group + '_Yes') return [];
        var table = groups[group] ? window[groups[group].table] : {parents: hotParents, gpp: hotGpp, gpm: hotGpm}[group];
        return table.getSourceData().map(relativeForPedigree);
    };

    function relativeForPedigree(r) {
        if (r.K1 === '1') {
            var d1 = diagnosisFrom(r.Dx1, r.Yob);
            if (d1.age !== undefined) r.Age1 = d1.age;
            if (d1.year !== undefined) r.Year1 = d1.year;
        } else { delete r.Disease1; }
        if (r.K1 === '1' && r.K2 === '1') {
            var d2 = diagnosisFrom(r.Dx2, r.Yob);
            if (d2.age !== undefined) r.Age2 = d2.age;
        } else { delete r.Disease2; }
        if (r.Sex !== 'M' && r.Sex !== 'F') r.Sex = 'U';
        ['K1', 'K2', 'Dx1', 'Dx2', 'NameAuto'].forEach(function (k) { delete r[k]; });
        return r;
    }

    // the patient's own cancers, as Disease1 / Age1, Disease2 / Age2...
    window.patientCancers = function () {
        if ($('input[name=cancer_radio]:checked').val() !== 'cancer_Yes') return {};
        var out = {}, k = 0, iy = indexYob();
        hotCancer.getSourceData().forEach(function (r) {
            if (isEmpty(r.Cancer)) return;
            k++;
            var d = diagnosisFrom(r.Dx, iy);
            out['Disease' + k] = r.Cancer;
            out['Age' + k] = d.age !== undefined ? d.age : null;
        });
        return out;
    };

    /* ---------- patient's own section ---------- */

    $("#dbirth").inputmask({
        alias: "datetime", inputFormat: "dd/mm/yyyy", placeholder: "jj/mm/aaaa"
    });
    $('#dbirth').on('change blur', function () {
        var v = $(this).val(), bad = v !== '' && /\d/.test(v) && indexYob() === null;
        $('#dbirth_msg').text(bad ? msg('ui_v_dbirth') : '').toggle(bad);
        $(this).toggleClass('pt-invalid', bad);
        refreshAll();
    });

    $("#cancer_table_div").hide();
    $('input[type=radio][name=cancer_radio]').on('change', function () {
        $("#cancer_table_div").toggle($(this).val() === 'cancer_Yes');
    });

    /* ---------- cancer list ---------- */

    var selectedRow, selectedColumn, hotSelectedTable;

    var dialogCancerList = $( "#cancerList2" ).dialog({
        autoOpen: false,
        classes: {
            "ui-dialog": "custom-background",
            "ui-dialog-titlebar": "custom-theme",
            "ui-dialog-title": "custom-theme text-center",
            "ui-dialog-content": "custom-background",
            "ui-dialog-buttonpane": "custom-background"
        },
        width: ($(window).width() > 400 ? 260 : $(window).width()- 30),
        maxHeight: 700,
        title: L('ui_cancer_list'),
    });

    var html = "<form><fieldset>";
    diseases = onco_full();
    $.each(diseases, function (k) {
        html += "<div class='form-check'><label class='form-check-label font-normal'>"
            + "<input type='radio' class='form-check-input' name='cancerListradio' value='" + diseases[k] + "'> "
            + capitaliseFirstLetter(cleanDiseaseText(diseases[k])) + "</label></div>";
    });
    html += "<div class='form-check'><label class='form-check-label font-normal'>"
        + "<input type='radio' class='form-check-input' name='cancerListradio' value='Autre'> " + L('ui_other').trim() // value stays "Autre"
        + "</label></div></fieldset></form>";
    dialogCancerList.html(html);

    window.openDialogCancerList = function (SelectedSex) {
        var ovary = onco_full()[2], prostate = onco_full()[3], uterus = onco_full()[8];
        $('input[name=cancerListradio][value=' + ovary + ']').attr("disabled", SelectedSex == 'M');
        $('input[name=cancerListradio][value=' + uterus + ']').attr("disabled", SelectedSex == 'M');
        $('input[name=cancerListradio][value=' + prostate + ']').attr("disabled", SelectedSex == 'F');
        dialogCancerList.dialog( "open" );
    };

    $('input[name="cancerListradio"]').on("click", function () {
        var cancerType = $('input[name="cancerListradio"]:checked').val();
        if (cancerType != undefined && hotSelectedTable) {
            hotSelectedTable.setDataAtRowProp(selectedRow, selectedColumn, cancerType);
            $('input[name="cancerListradio"]:checked').prop('checked', false);
        }
        dialogCancerList.dialog( "close" );
    });

    [hotCancer].concat(allRelatives()).forEach(function (t) {
        t.addHook('afterSelectionEndByProp', function (row, column) {
            selectedRow = row; selectedColumn = column; hotSelectedTable = t;
            var sex = t === hotCancer ? $('input[name="index_sex"]:checked').val() : t.getDataAtRowProp(row, 'Sex');
            openDialogCancerList(sex);
        });
    });

    /* ---------- live pedigree ---------- */

    // The drawing is a preview of the answers: it cannot be edited (a person added on
    // the drawing would vanish at the next change of the questionnaire).
    opts.edit = false;
    opts.preview = true;
    var drawTimer = null;
    function schedulePedigree() {
        clearTimeout(drawTimer);
        drawTimer = setTimeout(function () { if (window.drawPatientPedigree) drawPatientPedigree(); }, 300);
    }
    [hotCancer].concat(allRelatives()).forEach(function (t) { t.addHook('afterChange', schedulePedigree); });
    $('#questionnaire_col').on('change input', 'input, textarea, select', schedulePedigree);
    $(window).on('resize', schedulePedigree);
    $(window).on('load', schedulePedigree);
    schedulePedigree();

    $('#show_pedigree').on('click', function () {
        document.getElementById('live_pedigree').scrollIntoView({behavior: 'smooth', block: 'start'});
    });
    // the button is not needed (and would hide the download buttons) once the pedigree is in view
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            $('#show_pedigree').toggleClass('pedigree-in-view', entries[0].isIntersecting);
        }).observe(document.getElementById('live_pedigree'));
    }

    /* ---------- language switch ---------- */

    // After a language switch: field labels of the cards, and default names nobody has changed
    var defaultNames = null;
    function currentDefaultNames() {
        return {
            hotParents: [lang.ui_name_father, lang.ui_name_mother],
            hotGpp: myDataGpp.map(function (r) { return r.Name; }),
            hotGpm: myDataGpm.map(function (r) { return r.Name; })
        };
    }
    window.onLanguageChanged = function () {
        hotCancer.updateHeaders([]);
        allRelatives().forEach(function (t) { t.updateHeaders([]); });
        Object.keys(groups).forEach(function (g) {
            var t = window[groups[g].table];
            t.getSourceData().forEach(function (r, i) {
                if (r.NameAuto) t.setDataAtRowProp(i, 'Name', relativeLabel(g, r.Sex) + ' ' + (i + 1), 'language');
            });
        });
        var fresh = currentDefaultNames(), tables = {hotParents: hotParents, hotGpp: hotGpp, hotGpm: hotGpm};
        Object.keys(tables).forEach(function (k) {
            fresh[k].forEach(function (name, i) {
                if (defaultNames && tables[k].getDataAtRowProp(i, 'Name') === defaultNames[k][i])
                    tables[k].setDataAtRowProp(i, 'Name', name, 'language');
            });
        });
        defaultNames = fresh;
        dialogCancerList.dialog('option', 'title', L('ui_cancer_list'));
        schedulePedigree();
    };
    defaultNames = currentDefaultNames();
});
