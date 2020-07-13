const { sortedIndex } = require("lodash");

function ArrToJSON(d) {
    // generate random colour
    const setBg = () => {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        return "#" + randomColor.toUpperCase();
    }

    //get all values of obj
    let values = [],
        obj = (document.getElementById("myCheckOnco").checked ? [
            {'type': 'cancer_sein', 'colour': '#FFC0CB'},
            {'type': 'cancer_sein2', 'colour': '#f00c93'},
            {'type': 'cancer_ovaire', 'colour': '#4DAA4D'},
            {'type': 'cancer_pancréas', 'colour': '#D5494A'},
            {'type': 'cancer_prostate', 'colour': '#4289BA'}
       ] : []);

    for (var j = 0; j < obj.length; j++) {
        values[j] = obj[j].type;
    }

    // add new elements
    for (var i = 0; i < d.length; i++) {
        if (!values.includes(d[i])) { // change onco to list of value of type
            var pos = obj.length;
            if(d[i] != null) obj[pos] = {'type': d[i], 'colour': setBg()};
        }   
    }
    
    return obj;
}

function JSONToPEDConvertor(JSONData, toKeep) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
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

function getTablePatho(obj) {
    let patho = [],
        d = ['Disease1', 'Disease2', 'Disease3'];
    
    for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < d.length; j++) {
            let val = obj[i][d[j]]
            if(!patho.includes(val) && val != '') patho.push(val)
        }
    }
    return patho
}

function FormatToTable(JSONData) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData

    for (var i = 0; i < obj.length; i++) {

        //Options
        const options = () => {
            var opt = ''
            if(obj[i].hasOwnProperty('miscarriage')) opt = 'FCS'
            if(obj[i].hasOwnProperty('termination')) opt =  'IMG'
            if(obj[i].hasOwnProperty('adopted_in')) opt =  'Adopté'
            if(obj[i].hasOwnProperty('mztwin')) opt =  'JumMZ'
            if(obj[i].hasOwnProperty('dztwin')) opt =  'JumDZ'
            if(obj[i].sex == 'U') opt =  'Grossesse'
            return opt
        }

        //diseases & age
        var patho = []
        var age = []
        var keys = Object.keys(obj[i])
        
        for (var j = 0; j < keys.length; j++) {
            if (keys[j].indexOf("_diagnosis_age") !== -1) {
                var out = keys[j].substring(0, keys[j].length - 14)
                patho.push(out);
                age.push(obj[i][keys[j]]);
            }
        }

        obj[i] = {
            "FamID": obj[i].famid,
            "Name": obj[i].display_name,
            "IndivID": obj[i].name,
            "FathID": obj[i].hasOwnProperty('father') ? (obj[i].hasOwnProperty('noparents') ? '0' : obj[i].father) : '0',
            "MothID": obj[i].hasOwnProperty('mother') ? (obj[i].hasOwnProperty('noparents') ? '0' : obj[i].mother) : '0',
            "Sex": obj[i].sex,
            "Affected": obj[i].hasOwnProperty('affected') ? obj[i].affected : '1',
            "Deceased": obj[i].hasOwnProperty('status') ? obj[i].status : '0',
            "Age": obj[i].age,
            "Yob": obj[i].yob,
            "Option" : options(),
            "Disease1":patho[0],
            "Age1":age[0],
            "Disease2":patho[1],
            "Age2":age[1],
            "Disease3":patho[2],
            "Age3":age[2],
            "proband": obj[i].proband
        }
    }

    return obj
}

function Formatboadicea(boadicea_lines) {
    var lines = boadicea_lines.trim().split('\n');
    var ped = [];
    var onco = ['cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_pancréas','cancer_prostate']

    // assumes two line header
    for(var i = 2;i < lines.length;i++){
        var attr = $.map(lines[i].trim().split(/\s+/), function(val, i){return val.trim();});
            if(attr.length > 1) {
                var indi = {
                    'FamID': attr[0],
                    'Name': attr[1], // bug special caractere
                    'IndivID':	attr[3],
                    'FathID': attr[4],
                    'MothID': attr[5],
                    'Sex': attr[6],
                    'Affected': '1',
                    'Deceased': attr[8]
                };
                
                if(attr[9] !== "0") indi.Age = attr[9];
                if(attr[10] !== "0") indi.Yob = attr[10];
                
                // add diseases
                var patho = []
                var age = []               

                var idx = 11;
                for (var o = 0; o < onco.length; o++) {
					// Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
					if(attr[idx] !== "0") {
                        patho.push(onco[o]);
                        var out = attr[idx] != 'AU' ? attr[idx] : '';
                        age.push(out);
					}
					idx++;
                };
                
                indi.Disease1 = patho[0];
                indi.Age1 = age[0];
                indi.Disease2 = patho[1];
                indi.Age2 = age[1];
                indi.Disease3 = patho[2];
                indi.Age3 = age[2];
                
                // bug encodage UTF-8 / ISO : replace �
                indi.Name = indi.Name.replace("�","è")
                indi.Name = indi.Name.replace("%uFFFD","è")

                if(attr[2] == 1) indi.proband = true;

                ped.push(indi);  
            }
        }

        return ped
}


function ExportJSON(obj) {
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
        result=[
            hot.getDataAtCell(indexArr[0], 0),
            '',
            indivID,
            fathID,
            mothID,
            sex,
            '1',
            '0'
        ];

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
    let indexArr = hot.getSelectedLast(),
        indexData = hot.getSourceDataAtRow(indexArr[0]);
    if (indexData.FathID == '0' && indexData.MothID == '0') {
        createNewInd('0', '0', 'M', true)
        createNewInd('0', '0', 'F', true)
    }
}

function createBrother() {
    let indexArr = hot.getSelectedLast(),
        indexData = hot.getSourceDataAtRow(indexArr[0]);
    if(indexData.FathID == 0 && indexData.MothID == 0) {
        createParents();
    }
    createNewInd(indexData.FathID, indexData.MothID, 'M');
}

function createSister() {
    let indexArr = hot.getSelectedLast(), //get selected row's index
        indexData = hot.getSourceDataAtRow(indexArr[0]); //get selected row's data
    if(indexData.FathID == 0 && indexData.MothID == 0) {
        createParents()
    }
    createNewInd(indexData.FathID, indexData.MothID, 'F')
}

function createChild(sex, New) {
    let myDeepClone = JSON.stringify(hot.getSourceData()) //save hot
    var obj = FormatToPedigreeJS(JSON.parse(myDeepClone)) // import table
    var indexArr = hot.getSelectedLast()[0]; //get selected row's index
    let indexData = obj[indexArr]
    let partner = GetPartner(obj,indexArr)
    var pre = (sex == 'M' ? 'Fils' : 'Fille')

    // if partner exists, use it as mother/father
    if (typeof partner == 'undefined' || New) {
        let partnerSex = (indexData["sex"]=='M' ? 'F' : 'M' );
        var partnerName = NewName()
        createNewInd('0', '0', partnerSex)
    } else {
        var partnerIndex = partner[0].index
        var partnerName = obj[partnerIndex]["name"]
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

        let name;

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
            arrData[i]['famid'],
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
            KeyStatus(i,'cancer_sein_diagnosis_age',arrData[i][ 'cancer_sein_diagnosis_age' ]!=0 ? arrData[i][ 'cancer_sein_diagnosis_age' ] : 'AU'),
            KeyStatus(i,'cancer_sein2_diagnosis_age',arrData[i][ 'cancer_sein2_diagnosis_age' ]!=0 ? arrData[i][ 'cancer_sein2_diagnosis_age' ] : 'AU'),
            KeyStatus(i,'cancer_ovaire_diagnosis_age',arrData[i][ 'cancer_ovaire_diagnosis_age' ]!=0 ? arrData[i][ 'cancer_ovaire_diagnosis_age' ] : 'AU'),
            KeyStatus(i,'cancer_pancréas_diagnosis_age',arrData[i][ 'cancer_pancréas_diagnosis_age' ]!=0 ? arrData[i][ 'cancer_pancréas_diagnosis_age' ] : 'AU'),
            KeyStatus(i,'cancer_prostate_diagnosis_age',arrData[i][ 'cancer_prostate_diagnosis_age' ]!=0 ? arrData[i][ 'cancer_prostate_diagnosis_age' ] : 'AU'),
            KeyStatus(i,'Ashkn',arrData[i]['Ashkn']), 
            KeyStatus(i,'BRCA1t',arrData[i]['BRCA1t']),
            KeyStatus(i,'BRCA1r',arrData[i]['BRCA1r']),
            KeyStatus(i,'BRCA2t',arrData[i]['BRCA2t']),
            KeyStatus(i,'BRCA2r',arrData[i]['BRCA2r']),
            KeyStatus(i,'PALB2t',arrData[i]['PALB2t']),
            KeyStatus(i,'PALB2r',arrData[i]['PALB2r']),
            KeyStatus(i,'ATMt',arrData[i]['ATMt']),
            KeyStatus(i,'ATMr',arrData[i]['ATMr']),
            KeyStatus(i,'CHEK2t',arrData[i]['CHEK2t']),
            KeyStatus(i,'CHEK2r',arrData[i]['CHEK2r']),
            KeyStatus(i,'ER',arrData[i]['ER']),
            KeyStatus(i,'PR',arrData[i]['PR']),
            KeyStatus(i,'HER2',arrData[i]['HER2']),
            KeyStatus(i,'CK14',arrData[i]['CK14']),
            KeyStatus(i,'CK56',arrData[i]['CK56'])
        ].join('\t')

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

function getRow(obj, id) {
    for (var j = 0; j < obj.length; j++) {
        if (obj[j].IndivID == id) {
            return j;
        };
    };
}

function isFather(rowData, obj, index) {
    return(rowData.IndivID == obj[getRow(obj, index)].FathID);
}

function isMother(rowData, obj, index) {
    return(rowData.IndivID == obj[getRow(obj, index)].MothID);
}

function getName(i, tableData, rowData) { //JSONData, table format
    var obj = typeof tableData != 'object' ? JSON.parse(tableData) : tableData;
    var indexID = 1,
        father = obj[getRow(obj, indexID)].FathID,
        mother = obj[getRow(obj, indexID)].MothID;

    // if row in table
    if(typeof(rowData)=='undefined') {var rowData=obj[i]}

    function isBrother(index) {
        return(
            rowData.FathID != '0' 
            && rowData.MothID != '0'
            && rowData.MothID == obj[getRow(obj, index)].MothID
            && rowData.FathID == obj[getRow(obj, index)].FathID
            && rowData.Sex == 'M'
    );
    }
    
    function isSister(index) {
        return(
            rowData.FathID != '0' 
            && rowData.MothID != '0'
            && rowData.MothID == obj[getRow(obj, index)].MothID
            && rowData.FathID == obj[getRow(obj, index)].FathID
            && rowData.Sex == 'F'
    );
    }
    
    if(rowData.IndivID==indexID) result='Index';

    else if (isBrother(indexID)){result = 'Frère'}
    else if (isSister(indexID)){result = 'Soeur'}

    else if(isFather(rowData, obj, indexID)){result = 'Père'}
    else if (isMother(rowData, obj, indexID)){result = 'Mère'}

    else if (isBrother(father)){result = 'Oncle pat'}
    else if (isSister(father)){result = 'Tante pat'}
    else if (isBrother(mother)){result = 'Oncle mat'}
    else if (isSister(mother)){result = 'Tante mat'}
    
    else if(isFather(rowData, obj, father)){result = 'Grand-Père pat'}
    else if(isMother(rowData, obj, father)){result = 'Grand-Mère pat'}
    else if(isFather(rowData, obj, mother)){result = 'Grand-Père mat'}
    else if(isMother(rowData, obj, mother)){result = 'Grand-Mère mat'}
    
    else result ="";

    // check if already exist
    let colnames=''
    if (result != "") {
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

  function copyToClipboard(element) {
    var text = $('#'+element).clone().find('br').prepend('\r\n').end().text()
    element = $('<textarea>').appendTo('body').val(text).select()
    document.execCommand('copy')
    element.remove()
  }

function createFamily(famObj, hot){
    //famObj as JS object
    /*
    famObj = {
        son:2,
        brother:1
    };
    */

    var obj = JSON.parse(myDataSafe),
        index=0, //index' row
        father=getRow(obj, obj[index].FathID),
        mother=getRow(obj, obj[index].MothID);
    
    function newName(obj){
        let col=[];
        for (let i = 0; i < obj.length; i++) {
            col.push(obj[i].IndivID)
        }
        let max = Math.max.apply(null, col)+1
        return max
    }

   function NewInd(fathID, mothID, sex, obj, ind,  replace=false,pre){
       let row = {
                "FamID":obj[0].FamID,
                "Name": "",
                "IndivID": newName(obj),
                "FathID": fathID,
                "MothID": mothID,
                "Sex": sex,
                "Affected": '1',
                "Deceased": '0'
            };  
       row.Name = (getName(i, obj, row) == '' & typeof(pre) != 'undefined' ? pre : getName(i, obj, row)); //i not used
       if(replace == true && typeof(ind)!='undefined' && ind != '') (sex =='M' ? obj[ind].FathID = row.IndivID : obj[ind].MothID = row.IndivID);
       return row
    };

    function addNewInd(fathID, mothID, sex, obj, ind, replace=false, pre){
        if (typeof(ind)!='undefined') {
            obj.splice(ind+1, 0, NewInd(fathID, mothID, sex, obj, ind, replace,pre));
        } else {
            obj.push(NewInd(fathID, mothID, sex, obj, ind, replace, pre));
        }
    }

    function hasParents(row){//obj[i]
        return (row.FathID != '0' || row.MothID != '0');
    }

    function newParents(obj,i){ //row index
        if(hasParents(obj[i])) return
        //create parent and replace index row content
        addNewInd(0, 0, 'M', obj, i, true);
        addNewInd(0, 0, 'F', obj, i, true);
    }

    function partner(obj,i) {
        for (var j = 0; j < obj.length; j++) {
            if (obj[i].IndivID==obj[j].FathID) return obj[j].MothID;
            if (obj[i].IndivID==obj[j].MothID) return obj[j].FathID;  
        };
        return undefined
    }

    function prefixeChild(obj,father, mother, pre) {
        let colnames='';
        for (var j = 0; j < obj.length; j++) {
            if (obj[j].FathID == father && obj[j].MothID == mother) colnames += ","+ obj[j].Name;
        }        
        if (colnames != "") {
            let re = new RegExp(pre, 'g'),
                count = (colnames.match(re) || []).length;
            pre = (count==0 ? pre : pre+parseFloat(count+1));
        }
        return pre;
    }

    function newChild(obj,i,sex, n=famObj[keys[j]]){
        for (let step = 0; step < n; step++) {        
            let spouse = partner(obj,i),
                spouseSex = (obj[i].Sex=='M' ? 'F' : 'M' );
            var pre = (sex == 'M' ? 'Fils' : 'Fille');
            
            // if partner doesn't exist : create it
            if (typeof(spouse) == 'undefined') {
                spouse = newName(obj);
                addNewInd(0, 0, spouseSex,obj,i);
            }
            
            //define father and mother
            let fathID = (obj[i].Sex=='M' ? obj[i].IndivID : spouse),
                mothID = (obj[i].Sex=='M' ? spouse : obj[i].IndivID);
            
            //update pre if other child
            pre = prefixeChild(obj,fathID, mothID, pre) +'-' + obj[i].Name

            //create child
            addNewInd(fathID, mothID, sex, obj, i, false, pre);            
        };
    };

    function newSiblings(obj, i, sex, n=famObj[keys[j]]){
        for (let step = 0; step < n; step++) {
            newParents(obj,i);
            addNewInd(obj[i].FathID, obj[i].MothID, sex,obj,i);
        }
    }

   //create array of individual to be inserted
   var keys = Object.keys(famObj);

   for (var j = 0; j < keys.length; j++) {
       switch(keys[j]){ 
           case 'brother':
               newSiblings(obj, index, 'M', famObj[keys[j]]);
               break;
            case 'sister':
                newSiblings(obj, index, 'F', famObj[keys[j]]);
                break;
            case 'son':
                newChild(obj,index,'M', famObj[keys[j]]);
                break;
            case 'daughter':
                newChild(obj,index,'F', famObj[keys[j]]);
               break;
            case 'uncleP':
                father=getRow(obj, obj[index].FathID);
                newSiblings(obj, father, 'M', famObj[keys[j]]);
                break;
            case 'auntP':
                father=getRow(obj, obj[index].FathID);
                newSiblings(obj, father, 'F', famObj[keys[j]]);
                break;
            case 'uncleM':
                mother=getRow(obj, obj[index].MothID);
                newSiblings(obj, mother, 'M', famObj[keys[j]]);
                break;
            case 'auntM':
                mother=getRow(obj, obj[index].MothID);
                newSiblings(obj, mother, 'F', famObj[keys[j]]);
                break;
            default:
                break;
        }
    }

    //load new data
    hot.loadData(obj)
  }