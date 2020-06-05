function JSONToCSVConvertor(JSONData, colHeaders) {
    var 
        arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        CSV = '',   
        row = "",
        fileName = "handsontable.csv";

    // Put the header (based on the colHeaders of my table in my example)
    for (var index in colHeaders) {
        row += colHeaders[index] + ';';
    }
    row = row.slice(0, -1);
    CSV += row + '\r\n';

    // Adding each rows of the table
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            row += arrData[i][index] + ';';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }        

    // Downloading the new generated csv.
    // For IE >= 9
    if(window.navigator.msSaveOrOpenBlob) {
        var fileData = [CSV];
        blobObject = new Blob(fileData);
        window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    } else { 
    // For Chome/Firefox/Opera
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        var link = document.createElement("a");    
        link.href = uri;

        link.style = "visibility:hidden";
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
    }
    
}

function JSONToPEDConvertor(JSONData, toKeep) {
    var 
        arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        CSV = '',   
        row = "",
        fileName = 'GeneTree_ped_'+ getFormattedTime() +'.txt';
    
    var subsets = _.map(arrData, function(elm) { return _.pick(elm, toKeep); });
    var arrData = subsets

    // Adding each rows of the table and convert in column 'Sex' M to 1 and F to 2
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            if (index == 'Sex') {
                var sex = (arrData[i]['Sex'] == 'M' ? '1' : (arrData[i]['Sex'] == 'F' ? '2' : 'U'));
                arrData[i]['Sex'] = sex;
            }; //replace sex
            row += arrData[i][index] + '\t';
        }
        row = row.slice(0, -1);
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }        

    // Downloading the new generated csv.
    // For IE >= 9
    if(window.navigator.msSaveOrOpenBlob) {
        var fileData = [CSV];
        blobObject = new Blob(fileData);
        window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    } else { 
    // For Chome/Firefox/Opera
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        var link = document.createElement("a");    
        link.href = uri;

        link.style = "visibility:hidden";
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
    }
    
}

function FormatToPedigreeJS(JSONData, new_key, old_key) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData
    
    // Update key and format JSON for pedigreeJS
    function UpdateKey(o, old_key, new_key) {
        // JSON object
        for (var i = 0; i < o.length; i++) {
            o[i][ new_key ] = o[i][ old_key ]; //change key
            delete o[i][ old_key ];
        };
    }

    function UpdateParents(o) {
        for (var i = 0; i < o.length; i++) {
            // remove father/mother keys if empty, then add top_level : 'true'
            if (o[i][ 'father' ] == '0') {
                o[i][ 'top_level' ] = 'true' ;
                delete o[i][ 'father' ];
            };
            if (o[i][ 'mother' ] == '0') {
                if (o[i][ 'top_level' ] != 'true')  {
                    o[i][ 'top_level' ] = 'true' ;
                }
                delete o[i][ 'mother' ];
            };

            // remove affected if not affected
            if (o[i][ 'affected' ] == '1') {
                delete o[i][ 'affected' ];
            };

            // remove status if alive : not "status": 1,
            if (o[i][ 'status' ] != '1') {
                delete o[i][ 'status' ];
            };

            // manage levels
            if(o[i].hasOwnProperty('top_level')) {
                //remove top_level if mother id or father id != 0
                if (o[i].hasOwnProperty('father') && o[i][ 'father' ] != '0' | o[i].hasOwnProperty('mother') && o[i][ 'mother' ] != '0') {
                    delete o[i][ 'top_level' ];
                } else {
                    //check if partner has parents
                    var Partner = GetPartner(o,i)[0].index
                    if (o[Partner].hasOwnProperty('father') && o[Partner][ 'father' ] != '0' | o[Partner].hasOwnProperty('mother') && o[Partner][ 'mother' ] != '0') { // if has parents
                        o[i][ 'father' ] = o[Partner]['father'];
                        o[i][ 'mother' ] = o[Partner]['mother'];
                        o[i][ 'noparents' ] = 'true';
                        delete o[i][ 'top_level' ];
                    }                    
                }
            };
        }
    }

    function GetChild(o,i) {
        var j
        for (var j = 0; j < o.length; j++) {
            if (o[j]['father']==o[i]['name'] | o[j]['mother']==o[i]['name']) {
                var result = [{'index':j,
                                'name':o[j]['name']
                            }]
                return result;
                break;
            };
        };
    }

    function GetPartner(o,i) {
        var child = GetChild(o,i)[0].index
        var parent = (o[child]['father']==o[i]['name'] ? 'mother' : 'father' );
        var j
        for (var j = 0; j < o.length; j++) {
            if (o[j]['name']==o[child][parent]) {
                var result = [{'index':j,
                                'name':o[child][parent]
                            }]
                return result;
            };
        };
    }

    for (var i = 0; i < new_key.length ; i++) { UpdateKey(obj, old_key[i], new_key[i]) }
    UpdateParents(obj)

    return obj
}

function ExportJSON(JSONData, new_key, old_key) {
    //Format to PedigreeJS format
    var obj = FormatToPedigreeJS(JSONData, new_key, old_key)
        
    // Downloading.
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
    var a = document.createElement("a");    
    a.href = 'data:' + data;

    a.style = "visibility:hidden";
    a.download = 'GeneTree_data_'+ getFormattedTime() +'.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    // JavaScript months are 0-based.
    var m = today.getMonth() + 1;
    var d = today.getDate();
    var h = today.getHours();
    var mi = today.getMinutes();
    var s = today.getSeconds();
    return y + "-" + m + "-" + d; //+ "-" + h + "-" + mi + "-" + s;
}

function createNewInd(fathID, mothID, sex, newParentID){
    var indexArr = hot.getSelectedLast(); //get selected row's index
    //var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    var indivID = NewName()
    var rawData = {
                "FamID": "1",
                "Name": "",
                "IndivID": indivID,
                "FathID": fathID,
                "MothID": mothID,
                "Sex": sex,
                "Affected":"1",
                "Deceased":"0"
                }

    //convert json data to array
    var result = [];
    for(var i in rawData)
        result.push(rawData [i]);

    // insert and populate row
    hot.alter('insert_row', indexArr[0]+1, 1); // insert row below
    hot.populateFromArray(indexArr[0]+1, 0,[result]);

    //update index
    //define col index
    var fathIDindex = 3
    var mothIDindex = 4
    
    if(newParentID==true) {
        var parentIndex = (sex == 'M' ? fathIDindex : mothIDindex);
        hot.setDataAtCell(indexArr[0], parentIndex, indivID);
    }
}

function NewName(){
    var IdIndex = 2 // define IndivID index
    var col = hot.getDataAtCol(IdIndex)
    var max = Math.max.apply(null, col)+1
    return max.toString()
}

function createParents() {
    createNewInd('0', '0', 'M', true)
    createNewInd('0', '0', 'F', true)
}

function createBrother() {
    var indexArr = hot.getSelectedLast(); //get selected row's index
    var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    createNewInd(indexData.FathID, indexData.MothID, 'M')
}

function createSister() {
    var indexArr = hot.getSelectedLast(); //get selected row's index
    var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    createNewInd(indexData.FathID, indexData.MothID, 'F')
}