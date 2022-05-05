document.addEventListener("DOMContentLoaded", function() {
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
                }
            }
        }
    );

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
