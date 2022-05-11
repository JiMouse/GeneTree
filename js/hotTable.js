document.addEventListener("DOMContentLoaded", function() {
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
                    if (col == "Age1" || col == "Age2" || col == "Age3") {
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
