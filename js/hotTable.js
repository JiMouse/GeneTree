document.addEventListener("DOMContentLoaded", function() {

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

    var updatePartnersAndChildren_dialog;
    var updateHotDialog_title;

    var setter = false;
    hot.addHook('afterChange',  //update age and yob if alive
        function(changes, source) {
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
                    if (col == "Sex") {//check after change that partner has opposite sex if not update partner sex and children's parents 
                        // load data
                        let myDeepClone = JSON.stringify(hot.getSourceData());
                        obj = JSON.parse(myDeepClone)

                        //update partner(s)
                        let partnersID = getPartnersFromHot(obj, row);
                        if (partnersID == [] || partnersID == '' || partnersID == undefined) return
                        for(let i = 0; i < partnersID.length; i++) {
                            let partnerRow = getRow(obj, partnersID[i]);
                            if (obj[partnerRow].Sex != obj[row].Sex) return
                            obj[partnerRow].Sex = (obj[row].Sex == "M" ? "F" : "M") // change partner sex
                        }
                        
                        // get all children and change children parents
                        for (let k = 0; k < obj.length; k++) {
                            if (obj[k]['FathID'] == obj[row]['IndivID'] || obj[k]['MothID'] == obj[row]['IndivID']) {
                                let MothID = obj[k]['MothID'];
                                obj[k]['MothID'] = obj[k]['FathID'];
                                obj[k]['FathID'] = MothID;
                            };
                        };

                        //load data back
                        updatePartnersAndChildren_dialog = $('<div id="msgDialog">'+ lang.updatePartnersAndChildren_dialog +'</div>').dialog(updatePartnersAndChildren_dialog_param);
                        updatePartnersAndChildren_dialog.dialog({
                            title: lang.updatePartnersAndChildren_title,
                        })                        
                        updatePartnersAndChildren_dialog.dialog( "open" );
                    }
                }
            }
        }
    );
    hot.addHook('beforeRemoveRow',  //Fonction debug si une personne est supprimée : vérifier si enfants +/- conjoint avec warning si vrai avant délétion
        function(index, amount, physicalRows, source) {
            // load data
            let myDeepClone = JSON.stringify(hot.getSourceData());
            obj = JSON.parse(myDeepClone);

            // get all children
            let rowToSplice = []
            for (let i = 0; i < physicalRows.length; i++) {
                let row = physicalRows[i];
                for (let k = 0; k < obj.length; k++) {
                    if (obj[k]['FathID'] == obj[row]['IndivID'] || obj[k]['MothID'] == obj[row]['IndivID']) {
                        //delete row
                        rowToSplice.push(k)

                        //delete partner if exist 
                        let partnersID = getPartnersFromHot(obj, row);
                        if (partnersID == [] || partnersID == '' || partnersID == undefined) return
                        let partnerRow = getRow(obj, partnersID[i]);
                        rowToSplice.push(partnerRow)
                    };
                };
            }
            if(rowToSplice == [] || rowToSplice == "") return            
            rowToSplice=rowToSplice.concat(physicalRows); //add selected rows
            rowToSplice.sort(function(a,b){ return b - a; }); //sort arr

            for (var j = 0; j<rowToSplice.length; j++)
                obj.splice(rowToSplice[j],1);

            //load data back
            updatePartnersAndChildren_dialog = $('<div id="msgDialog">'+ lang.removePartnersAndChildren_dialog +'</div>').dialog(updatePartnersAndChildren_dialog_param);
            updatePartnersAndChildren_dialog.dialog({
                title: lang.removePartnersAndChildren_title
            })    
            updatePartnersAndChildren_dialog.dialog( "open" );
        }
    )

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
