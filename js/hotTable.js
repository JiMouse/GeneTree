document.addEventListener("DOMContentLoaded", function() {

    var updatePartnersAndChildren_dialog;
    var updateHotDialog_title;

    var setter = false;

    // ---- family helpers ----
    function isZero(id) { return id === undefined || id === null || id === '' || String(id) === '0'; }
    function rowOf(rows, id) {
        if (isZero(id)) return -1;
        for (let j = 0; j < rows.length; j++) if (String(rows[j].IndivID) === String(id)) return j;
        return -1;
    }
    function childrenOf(rows, id) {
        let out = [];
        if (isZero(id)) return out;
        rows.forEach(function (r, j) { if (String(r.FathID) === String(id) || String(r.MothID) === String(id)) out.push(j); });
        return out;
    }
    // rows of the index case (proband, else the first row) and of all his/her ancestors
    function indexLine(rows) {
        let keep = {}, start = rows.findIndex(function (r) { return r.proband === true || r.proband === 'true'; });
        let stack = [start < 0 ? 0 : start];
        while (stack.length) {
            let j = stack.pop();
            if (j < 0 || j >= rows.length || keep[j]) continue;
            keep[j] = true;
            stack.push(rowOf(rows, rows[j].FathID), rowOf(rows, rows[j].MothID));
        }
        return keep;
    }
    function personLabel(r) { return (r.Name && String(r.Name).trim() !== '' ? r.Name : 'Id. ' + r.IndivID); }
    function fill(text, values) {
        Object.keys(values).forEach(function (k) { text = String(text).split('{' + k + '}').join(values[k]); });
        return text;
    }
    // rows created by pasting from Excel get what rows created by the tool have
    function fillPastedRows(changes) {
        let rows = hot.getSourceData(), famID = (rows[0] && !isZero(rows[0].FamID)) ? rows[0].FamID : '1', batch = [], seen = {};
        changes.forEach(function (c) {
            let r = c[0];
            if (seen[r] || !rows[r]) return;
            seen[r] = true;
            let x = rows[r];
            if ((x.FamID === null || x.FamID === undefined || x.FamID === '') && (!isZero(x.IndivID) || (x.Name && x.Name !== ''))) {
                batch.push([r, 'FamID', famID]);
                if (x.Affected === null || x.Affected === undefined || x.Affected === '') batch.push([r, 'Affected', '1']);
                if (x.Deceased === null || x.Deceased === undefined || x.Deceased === '') batch.push([r, 'Deceased', '0']);
            }
        });
        if (batch.length) hot.setDataAtRowProp(batch, 'GeneTree.defaults');
    }

    hot.addHook('afterChange',  //update age and yob if alive
        function(changes, source) {
            if (changes != null && source === 'CopyPaste.paste') fillPastedRows(changes);
            if(changes != null) {
                col = changes[0][1];
                var deceasedIndex = 5;
                row = changes[0][0];
                dead = this.getSourceDataAtCell(row, deceasedIndex);
                if((source == 'edit') && (changes.length == 1)) {
                    if ((col == 'Age' || col == 'Yob') && (dead != 1)) {
                        newValue = changes[0][3];
                        if(newValue=="" || newValue==null) {return;}
                        var today = new Date();
                        var y = today.getFullYear();
                        if (!setter) {
                                setter = true;
                            if(col == 'Age'){
                                let value = y-newValue
                                this.setDataAtRowProp(row, 'Yob', value)

                            }else {
                                let value = y-newValue
                                this.setDataAtRowProp(row, 'Age', value)
                            }
                        } else {
                            setter = false;
                        }
                    }
                    if (col == "Age1" || col == "Age2" || col == "Age3" || ((col == 'Age') && (dead == 1))) {
                        // calculate age from year for disease or if dead
                        //add Setter
                        let c=(col == "Age1" ? 10 : (col == "Age2" ? 12 : 14))
                        newValue = changes[0][3];
                        let y = this.getDataAtRowProp(row, 'Yob');
                        if (parseInt(newValue) > 150) {
                            if(y!="") {
                                let value = String(newValue-y);
                                this.setDataAtRowProp(row, col, value);
                                hot.setCellMeta(row, c, 'className', 'htCenter htMiddle helvetica white');
                                hot.render()
                            } else {
                                // alert(lang.alert_noAge);
                                hot.setCellMeta(row, c, 'className', 'htCenter htMiddle helvetica red');
                                hot.render()
                            }
                        } else {
                            hot.setCellMeta(row, c, 'className', 'htCenter htMiddle helvetica white');
                            hot.render()
                        }                    
                    }
                    if (col == "Sex") { // partners get the other sex; children: Father = the man, Mother = the woman
                        let rows = JSON.parse(JSON.stringify(hot.getSourceData())),
                            me = rows[row], sex = me.Sex, oldSex = changes[0][2], touched = [];
                        if ((sex !== 'M' && sex !== 'F') || sex === oldSex) return;
                        let kids = childrenOf(rows, me.IndivID);
                        kids.forEach(function (k) {
                            let otherId = String(rows[k].FathID) === String(me.IndivID) ? rows[k].MothID : rows[k].FathID,
                                p = rowOf(rows, otherId);
                            if (p >= 0 && rows[p].Sex === sex) {
                                rows[p].Sex = (sex === 'M' ? 'F' : 'M');
                                if (touched.indexOf(personLabel(rows[p])) < 0) touched.push(personLabel(rows[p]));
                            }
                        });
                        kids.forEach(function (k) {
                            let f = rowOf(rows, rows[k].FathID), m = rowOf(rows, rows[k].MothID);
                            if ((f >= 0 && rows[f].Sex === 'F') || (m >= 0 && rows[m].Sex === 'M')) {
                                let t = rows[k].FathID; rows[k].FathID = rows[k].MothID; rows[k].MothID = t;
                                touched.push(personLabel(rows[k]));
                            }
                        });
                        if (!touched.length) return;
                        confirmTableUpdate(lang.updatePartnersAndChildren_title,
                            fill(lang.sexChange_dialog, {name: personLabel(me), list: touched.join(', ')}),
                            function () { hot.loadData(rows); },
                            function () { hot.setDataAtRowProp(row, 'Sex', oldSex, 'GeneTree.cancel'); });
                    }
                }
            }
        }
    );
    hot.addHook('beforeRemoveRow', // a person with children: their descendants (and partners left alone) go too, after confirmation
        function(index, amount, physicalRows, source) {
            let rows = JSON.parse(JSON.stringify(hot.getSourceData())),
                line = indexLine(rows),
                selected = (physicalRows && physicalRows.length ? physicalRows : [index]).slice();

            // the index case and his/her ancestors cannot be deleted: the pedigree could no longer be drawn
            let blocked = selected.filter(function (j) { return line[j]; });
            if (blocked.length) {
                alert(fill(lang.removeIndexLine_alert, {name: blocked.map(function (j) { return personLabel(rows[j]); }).join(', ')}));
                return false;
            }

            // descendants of the deleted person(s)
            let remove = {};
            selected.forEach(function (j) { remove[j] = true; });
            let queue = selected.slice();
            while (queue.length) {
                let j = queue.shift();
                childrenOf(rows, rows[j].IndivID).forEach(function (k) {
                    if (!remove[k] && !line[k]) { remove[k] = true; queue.push(k); }
                });
            }
            // partners with no parents in the table, all of whose children are deleted
            let more = true;
            while (more) {
                more = false;
                rows.forEach(function (r, p) {
                    if (remove[p] || line[p]) return;
                    let kids = childrenOf(rows, r.IndivID);
                    if (kids.length && isZero(r.FathID) && isZero(r.MothID) && kids.every(function (k) { return remove[k]; })) {
                        remove[p] = true; more = true;
                    }
                });
            }
            let extra = Object.keys(remove).map(Number).filter(function (j) { return selected.indexOf(j) < 0; });
            if (!extra.length) return; // nobody else concerned: deleted as usual

            // nothing is deleted until "Continue"
            let kept = rows.filter(function (r, j) { return !remove[j]; });
            confirmTableUpdate(lang.removePartnersAndChildren_title,
                fill(lang.removeBranch_dialog, {
                    name: selected.map(function (j) { return personLabel(rows[j]); }).join(', '),
                    list: extra.map(function (j) { return personLabel(rows[j]); }).join(', ')}),
                function () { hot.loadData(kept); },
                function () {});
            return false;
        }
    )

    // keep the copy of the table saved in the session up to date after deleting or adding rows
    function saveSession() { sessionStorage.setItem('hotData', JSON.stringify(hot.getSourceData())); }
    hot.addHook('afterRemoveRow', saveSession);
    hot.addHook('afterCreateRow', saveSession);

    // dialog: Continue / Cancel
    function confirmTableUpdate(title, message, onContinue, onCancel) {
        let d = $('<div class="msgDialog" style="white-space: pre-line"></div>').text(message);
        d.dialog($.extend({}, updatePartnersAndChildren_dialog_param, {
            autoOpen: true, title: title,
            buttons: [
                {text: lang.continue, click: function () { $(this).dialog('close'); onContinue(); }},
                {text: lang.cancel, click: function () { $(this).dialog('close'); onCancel(); }}
            ],
            close: function () { $(this).dialog('destroy').remove(); }
        }));
        $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');
    }

    //create reset_dialog
    var updatePartnersAndChildren_dialog_param;
    updatePartnersAndChildren_dialog_param = {
        autoOpen: false,
        title: updateHotDialog_title,
        resizable: false,
        height: "auto",
        width: 420,
        modal: true,
        classes: {
            "ui-dialog": "custom-background",
            "ui-dialog-titlebar": "custom-theme",
            "ui-dialog-title": "custom-theme text-center",
            // "ui-dialog-titlebar-close":"custom-btn",
            "ui-dialog-content": "custom-background",
            "ui-dialog-buttonpane": "custom-background"
        },
        buttons: [{
            text: lang.continue,
            click: function () {
                hot.loadData(obj);
                // loadFromHot();
                $(this).dialog( "close" );
            },
        }, {
            text: lang.cancel,
            click: function () {
                $(this).dialog( "close" );
                return;
            },
        }],
    }
    $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');

    //add hook before row manual moving to let index in the first row
    hot.addHook('beforeRowMove',  //update dataset
        function(movedRows, finalIndex, dropIndex, movePossible, orderChanged, source) {
            if(dropIndex !== undefined && finalIndex=='0'){									
                alert('Le cas index doit être dans la première ligne.')
                return false;
            }
        }
    );

    //add hook after row manual moving
    hot.addHook('afterRowMove',  //update dataset
        function(movedRows, finalIndex, dropIndex, movePossible, orderChanged, source) {
            if(dropIndex !== undefined){									
                // load data
                let myDeepClone = JSON.stringify(hot.getSourceData());
                arr = JSON.parse(myDeepClone)
                
                for (let j = 0; j < movedRows.length; j++) {
                    array_move(arr, movedRows[j], finalIndex+j);
                }

                //load data back
                hot.loadData(arr)
            }
        }
    );

    //Debug to add rendering on load
    hot.updateSettings({
        cells: function (row, col, prop) {
            isDiseaseProp = function(val) {return prop == val};
            if (colsDiseases.some(isDiseaseProp)) {
                var cellProperties = {};
                cellProperties.renderer = autRenderer;
                return cellProperties;
            }
            if(prop=="Option") {
                var cellProperties = {};
                cellProperties.source = optionList();
                return cellProperties;
            }
        },
        columns: colsOnco,
        colHeaders: cols_headerOnco
    });

});

function array_move(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

$(document).ready(function(){
        //add popup div to select cancer type
    // define variable
    var selectedRow;
    var selectedColumn;
    var dialogCancerList;
    var hotSelectedTable;

    // define cancerList dialog form
    dialogCancerList = $( "#cancerList" ).dialog({
        autoOpen: false,        
        closeOnEscape: true,
        classes: {
            "ui-dialog": "custom-background",
            "ui-dialog-titlebar": "custom-theme",
            "ui-dialog-title": "custom-theme text-center",
            "ui-dialog-content": "custom-background",
            "ui-dialog-buttonpane": "custom-background"
        },
        width: ($(window).width() > 400 ? 250 : $(window).width()- 30),
        maxHeight: 700
    })

    $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');
    
    // on radio click
    $(document).on("click","input[name='cancerListradio']", function(){     
        let cancerType = $('input[name="cancerListradio"]:checked').val();        
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //on 'OK' click, add other value
    $(document).on("click","#validOtherCancer", function() {
        cancerType = $('#other_cancer').val();
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //if press enter on other input field
    $(document).on("keydown", "input[id='other_cancer']", function search(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
           $("#validOtherCancer").click();
        }
    });

    //HPO list click
    $(document).on("click","a[name='cancerListradio']", function() {
        cancerType = $(this).data('val'); 
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //HPO search
    $(document).on("keyup", "input[id='HPOInput']", function search(e) {
        searchInList(HPOArr);
        if(e.keyCode == 13) {
            e.preventDefault();
        }
    });


    function updateDiseasecol(hotSelectedTable, row, column, cancerType) {
        if(cancerType != undefined) {
            hotSelectedTable.setDataAtRowProp(row, column, cancerType);
            $('input[name="cancerListradio"]:checked').prop('checked', false);
            hotSelectedTable.selectCell(row, column);
        }
    }
    function searchInList(HPOArr) {
        // Declare variables
        var input, filter, ul, li, a, i, txtValue, itemsFull;
        input = document.getElementById('HPOInput');
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName('li');

        //To improve efficiency : load full list after search of minimum two letters
        if(filter.length<2) {
            itemsFull = HPOArr.slice(1,20);
            return;
        } else {
            itemsFull = HPOArr//.concat(OrphaArr); //concatenate HPO and OrphaData
        }

        var filteredList = [];
        for (let i = 0; i < itemsFull.length; i++) {
            txtValue=capitaliseFirstLetter(itemsFull[i]);
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                filteredList.push("<li><a name='cancerListradio' data-val='" + txtValue+"'>"+ txtValue+"</li></a>");
            }
        }
        var newList = filteredList.join("");
        ul.innerHTML = newList;

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            txtValue = a.textContent || a.innerText;
            
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            } else {
            li[i].style.display = "none";
            }
        }
    }
    
    hot.addHook('afterSelectionEndByProp',
        function(row, column, preventScrolling) {
            let checkBoxHPO = document.getElementById("myCheckHPO");
            let checkBoxOnco = document.getElementById("myCheckOnco");
            let dialogCancerListTitle;
            selectedRow = row;
            selectedColumn = column
            if(selectedColumn == "Disease1" || selectedColumn == "Disease2" || selectedColumn == "Disease3") {
                hotSelectedTable =  this;
                if (checkBoxHPO.checked == true) { //if HPO mode
                    // alert(HPOArr);

                    var html_cancerListDialog = 
                    "<form>"
                        +"<fieldset>"
                            +'<input type="text" id="HPOInput" autocomplete="off" placeholder="Taper au moins deux lettres">'
                            + '<ul id="myUL" style="height: 500px; overflow-y: auto">'
                    
                    var items = HPOArr.slice(0,100);
                    for (let i = 0; i < items.length; i++) {
                        items[i] = "<li><a name='cancerListradio' data-val='" + items[i]+"'>"+ items[i]+"</li></a>";
                    }
                    var list = items.join("");

                    html_cancerListDialog += list;
                    html_cancerListDialog += 
                            '</ul>'
                        + "</fieldset>"
                    + "</form>"
                    dialogCancerListTitle = 'Termes HPO et Orphanet'; 
                    dialogWidth = '400';
                } else { // if Cancer mode
                    var html_cancerListDialog =
                    "<form>"
                    +    "<fieldset>"

                    $.each(diseases, function(k) {
                        disease_name = capitaliseFirstLetter(cleanDiseaseText(diseases[k]));

                        html_cancerListDialog += 
                                "<div class='form-check'>"
                        +            "<label class='form-check-label font-normal'>"
                        +                "<input type='radio' class='form-check-input' name='cancerListradio'"
                        +                    "value='" + diseases[k] + "'" + "> " + disease_name
                        +            "</label>"
                        +        "</div>"
                    });

                    html_cancerListDialog += "<br>"
                    + "<div class='row'>"
                    +       "<div class='form-check col-md-8'>"
                    +            "<label class='form-check-label font-normal'>"
                    +               "<input type='text' id='other_cancer' autocomplete='off' class='form-control'"  
                    +						"aria-invalid='false' placeholder='Autre'>"
                    +            "</label>"
                    +        "</div>"
                    +        "<div col-md-4>"
                    +           "<label class='btn btn-primary'>"
                    +               "<input id='validOtherCancer' type='button' style='display: none;'/>OK"
                    +           "</label>"
                    +       "</div>"
                    + "</div>"
                    +  "</fieldset>"
                    + "</form>"
                    dialogCancerListTitle = 'Localisation du cancer';
                    dialogWidth = '260';
                }
                if(checkBoxOnco.checked != true) dialogCancerListTitle = 'Pathologie';
                dialogCancerList.dialog( "option", "title", dialogCancerListTitle);
                dialogCancerList.dialog( "option", "width", dialogWidth);
                dialogCancerList.dialog("option", "close", function() {
                    dialogCancerList.dialog('close');
                }
                );
        
                dialogCancerList.html(html_cancerListDialog);
                dialogCancerList.dialog('open');
            }
            preventScrolling.value = true;
        }
    );
})
