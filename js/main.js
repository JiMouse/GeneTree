//Build Handsontable

document.addEventListener("DOMContentLoaded", function() {
    //Defaut datasets
    var myData = [
        {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
        {"FamID": "1","Name": "Père","IndivID": "2","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
    ]
    var myDataSafe = JSON.stringify(myData) //save 
    
    var myDataExtended1 = [
        {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
        {"FamID": "1","Name": "Père","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Père pat","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Mère pat","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Père mat","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Mère mat","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
    ]
    var myDataExtended1Safe = JSON.stringify(myDataExtended1) //save

    var myDataExtended2 = [
        {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
        {"FamID": "1","Name": "Père","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Père pat","IndivID": "4","FathID": "8","MothID": "9","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Mère pat","IndivID": "5","FathID": "10","MothID": "11","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Père mat","IndivID": "6","FathID": "12","MothID": "13","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "Grand-Mère mat","IndivID": "7","FathID": "14","MothID": "15","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "8","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "9","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "10","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "11","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "12","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "13","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "14","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
        {"FamID": "1","Name": "","IndivID": "15","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
    ]
    var myDataExtended2Safe = JSON.stringify(myDataExtended2) //save
   
    // define column to display
    var cols = [{
        data: 'FamID'
        }, {
        data: 'Name'
        }, {
        data: 'IndivID'
        }, {
        data: 'FathID'
        }, {
        data: 'MothID'
        }, {
        data: 'Sex'//,
        //type: 'dropdown',
        //source: ['M','F','NA']
        }, {
        data: 'Affected',
        type: 'checkbox',
        checkedTemplate: '2',
        uncheckedTemplate: '1'
        }, {
        data: 'Deceased',
        type: 'checkbox',
        checkedTemplate: '1',
        uncheckedTemplate: '0'
        }, {
        data: 'Age',
        type: 'numeric'
        }, {
        data: 'Yob',
        type: 'numeric'
        }, {
        data: 'Option',
        type: 'dropdown',
        source: ['FCS', 'IMG', 'Grossesse','JumMZ', 'JumDZ', 'Adopté']
        }, {
        data: 'Disease1',
        type: 'autocomplete',
        source: [],
        strict: false,
        filter: false,
        renderer: autRenderer
        }, {
        data: 'Age1',
        type: 'numeric'
        }, {
        data: 'Disease2',
        type: 'autocomplete',
        source: [],
        strict: false,
        filter: false,
        renderer: autRenderer
        }, {
        data: 'Age2',
        type: 'numeric'
        }, {
        data: 'Disease3',
        type: 'autocomplete',
        source: [],
        strict: false,
        filter: false,
        renderer: autRenderer
        }, {
        data: 'Age3',
        type: 'numeric'
        }];

    //var diseasesDefaut = ['cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_pancréas','cancer_prostate']
    //var diseases = diseasesDefaut

    /*function addOnco() {
        var checkBox = document.getElementById("myCheck");

        if (checkBox.checked == true){
           // diseases = diseasesDefaut;
           alert('test')
        } else {
            //diseases = [];
        }
    }*/

    function autRenderer(instance, td, row, col, prop, value, cellProperties) {
        var val = value
        if(typeof val != 'undefined' & val != '' & !diseases.includes(val)) {
            diseases.push(val);
        }
        cellProperties.source = diseases
        Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
    };
    
    // define column header
    cols_header = ['Fam.', 'Nom', 'Indiv.', 'Père', 'Mère', 'Genre', 'Atteint', 'Décés', 'Âge', 'Ddn', 'Option', 'Maladie1', 'Âge1', 'Maladie2', 'Âge2', 'Maladie3', 'Âge3']
    
    // create handsonetable
    var container = document.getElementById('dataTable');
    var hot = new Handsontable(container, {
        data: myData,
        rowHeaders: false, //true,
        colHeaders: cols_header, 
        columns: cols,
        filters: true,
        dropdownMenu: true,
        className: "htCenter",
        contextMenu: true,
        outsideClickDeselects: false,
        undo: true,
        hiddenColumns: {
            columns: [0,6], //hide famID and affected
            indicators: false
        },
        licenseKey: 'non-commercial-and-evaluation',
        });

    var setter = false;
    hot.addHook('afterChange', 
    //[
        function(changes, source) {
            if(changes != null) {
                col = changes[0][1];
                var deceasedIndex = 7
                row = changes[0][0];
                dead = this.getSourceDataAtCell(row, deceasedIndex)
                if((source == 'edit') && (changes.length == 1) && (col == 'Age' || col == 'Yob') && (dead != 1)) {
                    newValue = changes[0][3];
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
            }
        }
    );

});

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

function FormatToPedigreeJS(JSONData) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData
    
    // Update key and format JSON for pedigreeJS
    var new_key = ['famid','display_name','name','father','mother','sex', 'affected', 'status','yob','age']
    var old_key  = ['FamID','Name','IndivID','FathID','MothID','Sex', 'Affected', 'Deceased','Yob', 'Age']

    function UpdateFields(o) {
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

            // remove proband if null
            if (o[i][ 'proband' ] == null) {
                delete o[i][ 'proband' ];
            };

            //Update diseases
            UpdateDiseases(o,i)

            //Update options
            UpdateOptions(o,i)
        }
    }

    for (var i = 0; i < new_key.length ; i++) { UpdateKey(obj, old_key[i], new_key[i]) };
    UpdateFields(obj)    

    return obj
}

function UpdateDiseases(o,i){
    var colDiseases = ["Disease1","Disease2", "Disease3"]
    var colAges = ["Age1","Age2", "Age3"]

    for (var j = 0; j < colDiseases.length; j++) {
        col = colDiseases[j]
        age = colAges[j]
        var content = o[i][ col ]
        
        if (content != "" && content != null){
            var new_col = o[i][ col ]
            o[i][new_col+"_diagnosis_age"] = o[i][ age ];
            delete o[i][ col ];
            delete o[i][ age ];
        }
        // delete column disease and age either way
        if(o[i].hasOwnProperty(col)) delete o[i][ col ];
        if(o[i].hasOwnProperty(age)) delete o[i][ age ];
    };
}

function UpdateOptions(o,i) {
    var content = o[i][ "Option" ]
    var options1 = ['FCS', 'IMG', 'Adopté']
    var output1 = ['miscarriage', 'termination', 'adopted_in']

    if (content != "" && content != null){
        for (var j = 0; j < options1.length; j++) {
            if (o[i][ "Option" ] == options1[j  ]) {
                o[i][output1[j]] = true;
                if (o[i][ "Option" ]=='IMG') o[i][ "status" ]= "1"
                delete o[i][ "Option" ];
            }
        if (o[i][ "Option" ]=='JumMZ') {o[i][ "mztwin" ]= "1" ; delete o[i][ "Option" ] }
        else if (o[i][ "Option" ]=='JumDZ') {o[i][ "dztwin" ]= "1" ; delete o[i][ "Option" ] }
        else if (o[i][ "Option" ]=='Grossesse') {o[i][ "sex" ]= "U" ; delete o[i][ "Option" ] }
        };
    }
}

function ExportJSON(JSONData) {
    //Format to PedigreeJS format
    var obj = FormatToPedigreeJS(JSONData)
        
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

function UpdateKey(o, old_key, new_key) {
    // JSON object
    for (var i = 0; i < o.length; i++) {
        o[i][ new_key ] = o[i][ old_key ]; //change key
        delete o[i][ old_key ];
    };
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
    var childfull = GetChild(o,i)
    if (typeof childfull === 'undefined') {
        return result
    }else{
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
};
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
    var indexArr = hot.getSelectedLast(), //get selected row's index
        indivID = NewName(),
        rawData = {
                "FamID": "1",
                "Name": "",
                "IndivID": indivID,
                "FathID": fathID,
                "MothID": mothID,
                "Sex": sex,
                "Affected":"1",
                "Deceased":"0"
                };

    //convert json data to array
    var result = [];
    for(var i in rawData)
        result.push(rawData [i]);

    // insert and populate row
    hot.alter('insert_row', indexArr[0]+1, 1); // insert row below
    hot.populateFromArray(indexArr[0]+1, 0,[result]);

    //update index
    //define col index
    var fathIDindex = 3,
        mothIDindex = 4;
    
    if(newParentID == true) {
        var parentIndex = (sex == 'M' ? fathIDindex : mothIDindex);
        hot.setDataAtCell(indexArr[0], parentIndex, indivID);
    };

    //add names
    var nameInd = getName(indexArr[0]+1, hot.getSourceData());
    hot.setDataAtCell(indexArr[0]+1, 1, nameInd);
}

function NewName(){
    var IdIndex = 2 // define IndivID index column
    var col = hot.getDataAtCol(IdIndex)
    var max = Math.max.apply(null, col)+1
    return max
}

function createParents() {
    // only if parents don't already exists
    var indexArr = hot.getSelectedLast(); //get selected row's index
    var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data

    if (indexData.FathID == '0' && indexData.MothID == '0') {
        createNewInd('0', '0', 'M', true)
        createNewInd('0', '0', 'F', true)
    }
}

function createBrother() {
    var indexArr = hot.getSelectedLast(); //get selected row's index
    var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    if(indexData.FathID != 0 && indexData.MothID != 0) {
        createNewInd(indexData.FathID, indexData.MothID, 'M')
    }else{alert('Parents non créés')}
}

function createSister() {
    var indexArr = hot.getSelectedLast(); //get selected row's index
    var indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    if(indexData.FathID != 0 && indexData.MothID != 0) {
        createNewInd(indexData.FathID, indexData.MothID, 'F')
    }else{alert('Parents non créés')}
}

function createChild(sex) {
    let myDeepClone = JSON.stringify(hot.getSourceData()) //save hot
    var obj = FormatToPedigreeJS(JSON.parse(myDeepClone)) // import table
    var indexArr = hot.getSelectedLast()[0]; //get selected row's index
    let indexData = obj[indexArr]
    let partner = GetPartner(obj,indexArr)
    var pre = (sex == 'M' ? 'Fils' : 'Fille')

    // if partner exists, use it as mother/father
    if (typeof partner != 'undefined') {
        var partnerIndex = partner[0].index
        var partnerName = obj[partnerIndex]["name"]
    }else{
        // if not, create it
        let partnerSex = (indexData["sex"]=='M' ? 'F' : 'M' );
        var partnerName = NewName()
        createNewInd('0', '0', partnerSex)
    }

    if (indexData["sex"]=='M') {
        FathID = indexData["name"];
        MothID = partnerName;
    } else {
        FathID = partnerName;
        MothID = indexData["name"];
    }

    createNewInd(FathID, MothID, sex);

    //add name if empty  
    if (hot.getDataAtCell(indexArr+1, 1)=="") {
        //check if already exist
        colnames = []
        for (var j = 0; j < obj.length; j++) {
            if (obj[j].hasOwnProperty('father') && obj[j].hasOwnProperty('mother')) {
                if (obj[j].father == FathID && obj[j].mother == MothID) colnames += ","+ obj[j].display_name;
            }
        } 
        
        if (colnames != "") {
            var re = new RegExp(pre, 'g');
            var count = (colnames.match(re) || []).length;
            pre = (count==0 ? pre : pre+parseFloat(count+1))
        }

        // update result accordingly
        hot.setDataAtCell(indexArr+1, 1, pre+"-"+indexData.display_name); //add name
    }
}

function ExportBOADICEv4(JSONData) {
    var 
        arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        CSV = '',   
        row = "BOADICEA import pedigree file format 4.0",
        mainHeader = ["FamID","Name","Target","IndivID","FathID","MothID","Sex","MZTwin","Dead","Age","Yob","1stBrCa","2ndBrCa","OvCa","ProCa","PanCa"].join('\t')
        otherHeader = ["Ashkn","BRCA1t","BRCA1r","BRCA2t","BRCA2r","PALB2t","PALB2r","ATMt","ATMr","CHEK2t","CHEK2r","ER","PR","HER2","CK14","CK56"].join('\t')
        fileName = 'Boadicea_'+ getFormattedTime() +'.txt';

    // Put the header
    header = mainHeader + ' \t' + otherHeader
    row += '\r\n' + header
    CSV += row + '\r\n';

    // Adding each rows of the table
    for (var i = 0; i < arrData.length; i++) {
        var std = '0'+ '\t'

        function KeyStatus(i,key,output) {
            let result = (arrData[i].hasOwnProperty(key) ? (arrData[i][ key ] != '0' ? output : '0') : '0');
            return result
        }
        let father = (arrData[i].hasOwnProperty('father') ? arrData[i][ 'father' ] : '0');
        let mother = (arrData[i].hasOwnProperty('mother') ? arrData[i][ 'mother' ] : '0');
        let age = (arrData[i]['age'] !="" ? arrData[i]['age'] : '0');
        let yob = (arrData[i]['yob'] !="" ? arrData[i]['yob'] : '0');

        let name

        // shorter long name : get uppercase + last word if exists
        
        if(arrData[i]['display_name'] != '') {
            name = arrData[i]['display_name']
            if (name.length >8) {
                var result = name.match(/[A-Z]|[0-9]/g).join(''),
                suf = name.split(' ')[1]
                if(name.split(' ').length > 1) result += suf
                name = result
            };
        }else{ name = arrData[i]['name']};

        var row = [
            '1', //arrData[i]['famid'],
            name,
            KeyStatus(i,'proband','1'),
            arrData[i]['name'],
            father,
            mother,
            arrData[i]['sex'],
            KeyStatus(i,'mztwin','1'),
            KeyStatus(i,'status','1'),
            age,
            yob,
            KeyStatus(i,'cancer_sein_diagnosis_age',arrData[i][ 'cancer_sein_diagnosis_age' ]),
            KeyStatus(i,'cancer_sein2_diagnosis_age',arrData[i][ 'cancer_sein2_diagnosis_age' ]),
            KeyStatus(i,'cancer_ovaire_diagnosis_age',arrData[i][ 'cancer_ovaire_diagnosis_age' ]),
            KeyStatus(i,'cancer_pancréas_diagnosis_age',arrData[i][ 'cancer_pancréas_diagnosis_age' ]),
            KeyStatus(i,'cancer_prostate_diagnosis_age',arrData[i][ 'cancer_prostate_diagnosis_age' ])
        ].join('\t')

        row += '\t' + std.repeat(16) //otherHeader
        row = row.slice(0, -1);
        CSV += row + '\r\n';
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

function getName(i, JSONData) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var indexID = 1,
        father = obj[getRow(indexID)].FathID,
        mother = obj[getRow(indexID)].MothID;
    
    function getRow(id) {
        let j
        for (j = 0; j < obj.length; j++) {
            if (obj[j].IndivID == id) {
                return j;
                break;
            };
        }
    }

    function isFather(i, index) {
        return(obj[i].IndivID == obj[getRow(index)].FathID);
    }
    
    function isMother(i, index) {
        return(obj[i].IndivID == obj[getRow(index)].MothID);
    }
    
    function isBrother(i, index) {
        return(
            obj[i].FathID != '0' 
            && obj[i].MothID != '0'
            && obj[i].MothID == obj[getRow(index)].MothID
            && obj[i].FathID == obj[getRow(index)].FathID
            && obj[i].Sex == 'M'
    );
    }
    
    function isSister(i, index) {
        return(
            obj[i].FathID != '0' 
            && obj[i].MothID != '0'
            && obj[i].MothID == obj[getRow(index)].MothID
            && obj[i].FathID == obj[getRow(index)].FathID
            && obj[i].Sex == 'F'
    );
    }
    
    if(i == getRow(indexID)) result='Index';

    else if (isBrother(i, indexID)){result = 'Frère'}
    else if (isSister(i, indexID)){result = 'Soeur'}

    else if(isFather(i, indexID)){result = 'Père'}
    else if (isMother(i, indexID)){result = 'Mère'}

    else if (isBrother(i, father)){result = 'Oncle pat'}
    else if (isSister(i, father)){result = 'Tante pat'}
    else if (isBrother(i, mother)){result = 'Oncle mat'}
    else if (isSister(i, mother)){result = 'Tante mat'}
    
    else if(isFather(i, father)){result = 'Grand-Père pat'}
    else if(isMother(i, father)){result = 'Grand-Mère pat'}
    else if(isFather(i, mother)){result = 'Grand-Père mat'}
    else if(isMother(i, mother)){result = 'Grand-Mère mat'}
    
    else result =""

    if (result != "") {
        // check if already exist
        colnames = []
        for (var j = 0; j < obj.length; j++) {
            colnames += ","+ obj[j].Name
        } 
        var re = new RegExp(result, 'g');
        var count = (colnames.match(re) || []).length;

        // update result accordingly
        result = (count==0 ? result : result+parseFloat(count+1))
    }

    return result
}


function displayName(JSONData) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        names = [];
    for (var i = 0; i < obj.length; i++) {
        result = getName(i, obj)
        names.push([result])
    }
    hot.populateFromArray(0, 1, names)
}