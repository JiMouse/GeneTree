// const { sortedIndex } = require("lodash");

//set global variables
var i,
    HPOArr = [];
var OrphaArr;

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

function FormatToPedigreeJS(JSONData, UpdateLevel=true) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData

    // Update key and format JSON for pedigreeJS
    var new_key = ['famid','display_name','name','father','mother','sex', 'affected', 'status','yob','age'],
        old_key  = ['FamID','Name','IndivID','FathID','MothID','Sex', 'Affected', 'Deceased','Yob', 'Age'];

    for (var i = 0; i < obj.length; i++) {
        UpdateKeys(obj, i, old_key, new_key);
        UpdateFields(obj, i);
    };

    if (UpdateLevel) {
        UpdateLevels(obj);

        // adjust position of mother and father to avoid crossing branches
        //get index of mother and father of index
        let indexID = 1, 
            fatherID = obj[getRowPedigreeJS(obj, indexID)].father,
            motherID = obj[getRowPedigreeJS(obj, indexID)].mother,
            fatherIndex = getRowPedigreeJS(obj, fatherID),
            motherIndex = getRowPedigreeJS(obj, motherID);
        
        //move rows with the lower index
        if(Math.abs(fatherIndex-motherIndex)>1) {
            if(fatherIndex > motherIndex) {
                var movedRow=motherIndex,
                    finalRow=fatherIndex;
            }else{
                var movedRow=fatherIndex,
                    finalRow=motherIndex;
            }
            array_move(obj, movedRow, finalRow);
        }
    }
    return obj;
}

function UpdateKeys(o, i, old_key, new_key) {
    // JSON object
    for (let j = 0; j < new_key.length ; j++) {
        o[i][ new_key[j] ] = o[i][ old_key[j] ];
        delete o[i][ old_key[j] ];
    };
}

function UpdateFields(o, i) {
        // remove father/mother keys if empty, then add top_level : 'true'
        if (o[i][ 'father' ] == '0') delete o[i][ 'father' ];
        if (o[i][ 'mother' ] == '0') delete o[i][ 'mother' ];

        // remove affected if not affected
        if (o[i][ 'affected' ] == '1') {
            delete o[i][ 'affected' ];
        };

        // remove status if alive : not "status": 1,
        if (o[i][ 'status' ] != '1') {
            delete o[i][ 'status' ];
        };

        // remove proband if null
        if (o[i][ 'proband' ] == null) {
            delete o[i][ 'proband' ];
        };
        
        //Update fields if null (by manual editing of the table)
        UpdateNullKey(o,i);  

        //Update diseases
        UpdateDiseases(o,i)

        //Update options
        UpdateOptions(o,i)
}

function UpdateNullKey(o,i) {
    // To correct manually added rows
    var keys = Object.keys(o[i]);
    let famid;
    for (var j = 0; j < keys.length; j++) {
        if (o[i][keys[j]] == null) {
            if (keys[j] == 'famid') {
                famid=(o[0][ 'famid' ] == null?o[0][ 'famid' ]:o[1][ 'famid' ])
                o[i][ 'famid' ] = famid
            } else if (keys[j] == 'yob'|keys[j] == 'age') {
                o[i][keys[j]] = ''
            } else {
                delete o[i][keys[j]];
            }
        };
    };
    if(!o[i].hasOwnProperty('Option')) o[i]['Option'] = ''; //useful ?

}

function hasParentsPedigreeJS(row){//obj[i]
    return (row.hasOwnProperty('father')
    && row.father != '0'
    || row.hasOwnProperty('mother')
    && row.mother != '0');
}

//Update parents levels (adapted from io.js of pedigreejs)
function UpdateLevels(obj) {
    // for a given individual assign levels to a parents ancestors
    function getLevel(obj, name) {
        var idx = getRowPedigreeJS(obj, name);
        var level = (obj[idx].level ? obj[idx].level : 0);
        update_parents_level(idx, level, obj);
    }

    // recursively update parents levels
    function update_parents_level(idx, level, obj) {
        var parents = ['mother', 'father'];
        level++;
        for(var i=0; i<parents.length; i++) {
            var pidx = getRowPedigreeJS(obj, obj[idx][parents[i]]);
            if(pidx >= 0) {
                var ma = obj[getRowPedigreeJS(obj, obj[idx].mother)];
                var pa = obj[getRowPedigreeJS(obj, obj[idx].father)];
                if(!obj[pidx].level || obj[pidx].level < level) {
                    ma.level = level;
                    pa.level = level;
                }

                if(ma.level < pa.level) {
                    ma.level = pa.level;
                } else if(pa.level < ma.level) {
                    pa.level = ma.level;
                }
                update_parents_level(pidx, level, obj);
            }
        }
    }

    for(var j=0;j<2;j++) {
        for(var i=0;i<obj.length;i++) {
            getLevel(obj, obj[i].name);
        }
    }

    // find the max level (i.e. top_level)
    var max_level = 0;
    for(i=0;i<obj.length;i++) {
        if(obj[i].level && obj[i].level > max_level)
            max_level = obj[i].level;
    }

    // get the depth of the given person from the root
    getDepth = function(dataset, name) {
        var idx = getRowPedigreeJS(dataset, name);
        var depth = 1;

        while(idx >= 0 && ('mother' in dataset[idx] || dataset[idx].top_level)){
            idx = getRowPedigreeJS(dataset, dataset[idx].mother);
            depth++;
        }
        return depth;
    };

    // identify top_level and other nodes without parents
    for(i=0;i<obj.length;i++) {
        if(getDepth(obj, obj[i].name) == 1) { //?
            if(obj[i].level && obj[i].level == max_level) {
                obj[i].top_level = true;
            } else {
                obj[i].noparents = true;
                // 1. look for partners parents
                var pidx = getRowPedigreeJS(obj,getPartner(obj,i));
            
                if(typeof(pidx)!= 'undefined') {
                    if(obj[pidx].mother) {
                        obj[i].mother = obj[pidx].mother;
                        obj[i].father = obj[pidx].father;
                    }
                }
                
                // 2. or adopt parents from level above
                if(!obj[i].mother){
                    for(var j=0; j<obj.length; j++) {
                        if(obj[i].level == (obj[j].level-1)) {
                            pidx = getRowPedigreeJS(obj,getPartner(obj,j));
                            if(pidx > -1) {
                                obj[i].mother = (obj[j].sex === 'F' ? obj[j].name : obj[pidx].name);
                                obj[i].father = (obj[j].sex === 'M' ? obj[j].name : obj[pidx].name);
                            }
                        }
                    }
                }
                
            }
        } else {
            delete obj[i].top_level;
        }
    }
    return obj
}

function UpdateDiseases(o,i){
    for (var j = 0; j < colsDiseases.length; j++) {
        let col = colsDiseases[j],
            age = colsAges[j],
            content = o[i][col];
        
        if (content != "" && content != null){
            var new_col = o[i][ col ];
            o[i][new_col+"_diagnosis_age"] = (o[i][ age ]==null ? "" : o[i][ age ]);
            delete o[i][ col ];
            delete o[i][ age ];
        }
        // delete column disease and age either way
        if(o[i].hasOwnProperty(col)) delete o[i][ col ];
        if(o[i].hasOwnProperty(age)) delete o[i][ age ];
    };
}

function UpdateOptions(o,i) {
    var content = o[i][ "Option" ],
        options1 = [lang.miscarriage, lang.termination, lang.adopted_in],
        output1 = ['miscarriage', 'termination', 'adopted_in'];

    if (content != "" && content != null && typeof(content) !="undefined"){
        for (var j = 0; j < options1.length; j++) {
            if (o[i][ "Option" ] == options1[j ]) {
                o[i][output1[j]] = true;
                if (o[i][ "Option" ]==lang.termination) o[i][ "status" ]= "1"
                delete o[i][ "Option" ];
            }
        if (o[i][ "Option" ]==lang.mztwin) {o[i][ "mztwin" ]= "1" ; delete o[i][ "Option" ] }
        else if (o[i][ "Option" ]==lang.dztwin) {o[i][ "dztwin" ]= "1" ; delete o[i][ "Option" ] }
        else if (o[i][ "Option" ]==lang.pregnancy) {o[i][ "sex" ]= "U" ; delete o[i][ "Option" ] }
        };
    }
}

function getTablePatho(obj) {
    let patho = [];
    for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < colsDiseases.length; j++) {
            let val = obj[i][colsDiseases[j]];
            if(!patho.includes(val) && val != '' && val != null) patho.push(val);
        }
    }
    return patho;
}

function FormatToTable(JSONData) {
    var obj = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        toRep = [];

    for (var i = 0; i < obj.length; i++) {
        //Options
        const options = () => {
            var opt = '';
            if(obj[i].hasOwnProperty('miscarriage')) opt = lang.miscarriage;
            if(obj[i].hasOwnProperty('termination')) opt =  lang.termination;
            if(obj[i].hasOwnProperty('adopted_in')) opt =  lang.adopted_in;
            if(obj[i].hasOwnProperty('mztwin')) opt =  lang.mztwin;
            if(obj[i].hasOwnProperty('dztwin')) opt =  lang.dztwin;
            if(obj[i].sex == 'U') opt =  lang.pregnancy;
            return opt;
        }

        //diseases & age
        var patho = [],
            age = [],
            keys = Object.keys(obj[i]);
        
        for (var j = 0; j < keys.length; j++) {
            if (keys[j].indexOf("_diagnosis_age") !== -1) {
                var out = keys[j].substring(0, keys[j].length - 14);
                patho.push(out);
                age.push(obj[i][keys[j]]);
            }
        }

        //save all other fields in other object
        const toRemove = new Set(['famid','display_name','name','father','mother','sex', 'affected', 'status','yob','age'
                                    ,'proband','top_level','noparents','miscarriage','termination','adopted_in','mztwin','dztwin'
                                    , 'Option', 'level']);
        const otherKeys = keys.filter( x => !toRemove.has(x) );
        let otherObj = {};
        if (otherKeys != '') {
            for (var j = 0; j < otherKeys.length; j++) {
                if (obj[i][otherKeys[j]] !== '') {
                    otherObj[otherKeys[j]]=obj[i][otherKeys[j]];
                }
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
            "proband": obj[i].proband
        }

        //Add diseases
        for (let c = 0; c < colsDiseases.length; c++) {
            obj[i][colsDiseases[c]]=patho[c];
            obj[i][colsAges[c]]=age[c];
        }

        //Add misc. fields
        if (otherKeys != '') {
            for (let j = 0; j < otherKeys.length; j++) {
                obj[i][otherKeys[j]]= otherObj[otherKeys[j]];
            }
        }

        //Add new IndivID if non numerical
        if(isNaN(obj[i].IndivID)) {
            toRep.push(obj[i].IndivID);
        };
    }

    //if non numeric replace in IndivID FathID MothID by newName(obj)
    if(toRep != "") {
        for (var j = 0; j < toRep.length; j++) {
            let newID = newName(obj);
            for (var k = 0; k < obj.length; k++) {
                obj[k].IndivID=obj[k].IndivID.replace(toRep[j], newID);
                obj[k].FathID=obj[k].FathID.replace(toRep[j], newID);
                obj[k].MothID=obj[k].MothID.replace(toRep[j], newID);
            };
        };
    }
    return obj;
}

function Formatboadicea(boadicea_lines) { //import Boadicea file
    var lines = boadicea_lines.trim().split('\n'),
        ped = [];

    // assumes two line header
    for(var i = 2;i < lines.length;i++){
        var attr = $.map(lines[i].trim().split(/\s+/), function(val, i){return val.trim();});
            if(attr.length > 1) {
                var indi = {
                    'FamID': attr[0],
                    'Name': attr[1],
                    'IndivID':	attr[3],
                    'FathID': attr[4],
                    'MothID': attr[5],
                    'Sex': attr[6],
                    'Affected': '1',
                    'Deceased': attr[8]
                };
                if(attr[2] == 1) indi.proband = true;
                if(attr[9] !== "0") indi.Age = attr[9];
                if(attr[10] !== "0") indi.Yob = attr[10];
                
                // add diseases
                // Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
                var patho = [],
                    age = [];

                var idx = 11;
                for (var o = 0; o < onco().length; o++) {
					if(attr[idx] !== "0") {
                        patho.push(onco()[o]);
                        var out = attr[idx] != 'AU' ? attr[idx] : '';
                        age.push(out);
					}
					idx++;
                };
                
                //Add diseases
                for (let c = 0; c < colsDiseases.length; c++) {
                    indi[colsDiseases[c]]=patho[c];
                    indi[colsAges[c]]=age[c];
                }

                //Add test and hormonal status
                let gt = ['brca1', 'brca2', 'palb2', 'atm', 'chek2'];
                let pathology_tests = ['er', 'pr', 'her2', 'ck14', 'ck56'];               
                
                if(attr[idx++] !== "0") indi.ashkenazi = 1;
				// BRCA1, BRCA2, PALB2, ATM, CHEK2, .... genetic tests
				// genetic test type, 0 = untested, S = mutation search, T = direct gene test
				// genetic test result, 0 = untested, P = positive, N = negative
                
				for(let j=0; j<gt.length; j++) {
					let gene_test = [attr[idx], attr[idx+1]];
					if(gene_test[0] !== '0') {
						if((gene_test[0] === 'S' || gene_test[0] === 'T') && (gene_test[1] === 'P' || gene_test[1] === 'N'))
							indi[gt[j] + '_gene_test'] = {'type': gene_test[0], 'result': gene_test[1]};
						else
							console.warn('UNRECOGNISED GENE TEST ON LINE '+ (i+1) + ": " + gene_test[0] + " " + gene_test[1]);
					}
					idx+=2;
				}

				// status, 0 = unspecified, N = negative, P = positive
                let path_test = [attr[idx], attr[idx+1], attr[idx+2], attr[idx+3], attr[idx+4]];
				for(let j=0; j<path_test.length; j++) {
					if(path_test[j] !== '0') {
						if(path_test[j] === 'N' || path_test[j] === 'P')
							indi[pathology_tests[j] + '_bc_pathology'] = path_test[j];
						else
							console.warn('UNRECOGNISED PATHOLOGY ON LINE '+ (i+1) + ": " +pathology_tests[j] + " " +path_test[j]);
					}
				}
                ped.push(indi);  
            }
        }
    return ped;
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

function getPartner(o,i) {
    if (typeof GetChild(o,i) === 'undefined') return 'undefined';
    
    let child = GetChild(o,i)[0].index,
        parent = (o[child]['father']==o[i]['name'] ? 'mother' : 'father' );
    
    return o[child][parent];
}

function getChildFromHot(obj,row) { //IndivID FathID MothID Sex
    for (let j = 0; j < obj.length; j++) {
        if (obj[j]['FathID']==obj[row]['IndivID'] | obj[j]['MothID']==obj[row]['IndivID']) {
            let result = [{'index':j,
                            'name':obj[j]['IndivID']
                        }];
            return result;
        };
    };
}

function getPartnerFromHot(obj,row) {
    if (typeof getChildFromHot(obj,row) === 'undefined') return 'undefined';
    let child = getChildFromHot(obj,row)[0].index,
        parent = (obj[child]['FathID']==obj[row]['IndivID'] ? 'MothID' : 'FathID' );
    
    return obj[child][parent];
}

function getPartnersFromHot(obj, row) {
    let children = [];
    for (let j = 0; j < obj.length; j++) {
        if (obj[j]['FathID']==obj[row]['IndivID'] | obj[j]['MothID']==obj[row]['IndivID']) {
            children.push(j);
        };
    };

    if (children == []) return 'undefined';
    let partners = [];
    for (let c = 0; c < children.length; c++) {
        let child = children[c];
        let parent = (obj[child]['FathID']==obj[row]['IndivID'] ? 'MothID' : 'FathID' );
        if(!partners.includes(obj[child][parent])) partners.push(obj[child][parent])
    }
    return partners
}


function getChildListFromHot(obj,row) { //to do
    let child,
        child1 = [],
        child2 = [],
        fath,
        moth,
        sex = obj[row].sex;
    var fcs1=0, fcs2=0; //miscarriage
    var img1=0, img2=0; //termination
    //grossesse : obj[k].sex == "U"
  
    for (var k = 0; k < obj.length; k++) {
      if (obj[k].sex == "U" || obj[k].hasOwnProperty('noparents')) continue
      if (obj[k]['FathID'] == obj[row]['IndivID'] || obj[k]['MothID'] == obj[row]['name']) {
        if (typeof fath === 'undefined') {
            let fath = obj[k]['father'],
                moth = obj[k]['mother'];
            child1.push(k);
        } else if(fath != obj[k]['father'] || moth != obj[k]['mother']) { //si 2ième union
          child1.push(k);
        } else child1.push(k)
      };
    };
}

function getFormattedTime() {
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth() + 1; // JavaScript months are 0-based.
    var d = today.getDate();
    return y + "-" + m + "-" + d;
}

function ExportBOADICEv4(JSONData) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        CSV = '',   
        row = "BOADICEA import pedigree file format 4.0",
        mainHeader = ["FamID","Name","Target","IndivID","FathID","MothID","Sex","MZTwin","Dead","Age","Yob","1stBrCa","2ndBrCa","OvCa","ProCa","PanCa"].join('\t'),
        otherHeader = ["Ashkn","BRCA1t","BRCA1r","BRCA2t","BRCA2r","PALB2t","PALB2r","ATMt","ATMr","CHEK2t","CHEK2r","ER","PR","HER2","CK14","CK56"].join('\t'),
        fileName = 'Boadicea_'+ getFormattedTime() +'.txt';
        
    // Put the header
    header = mainHeader + ' \t' + otherHeader;
    row += '\r\n' + header;
    CSV += row + '\r\n';

    //Set warning
    let warning='',
        warningAge=false;

    // Adding each rows of the table
    for (var i = 0; i < arrData.length; i++) {

        function KeyStatus(i,key,output) {
            return (arrData[i].hasOwnProperty(key) ? (arrData[i][ key ] != '0' ? output : '0') : '0');
        }

        let father = (arrData[i].hasOwnProperty('father') && !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'father' ] : '0'),
            mother = (arrData[i].hasOwnProperty('mother')&& !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'mother' ] : '0'),
            age = (arrData[i].age =="" || typeof(arrData[i].age)=="undefined" ? '0' : arrData[i].age),
            yob = (arrData[i].yob =="" || typeof(arrData[i].yob)=="undefined" ? '0' : arrData[i].yob),
            name= arrData[i]['display_name'],
            proband=KeyStatus(i,'proband','1');
        
        // shorter long name : get uppercase + last word if exists
        if(name != '') {
            name=name.replace(/-/g," ")//split words
            name = name.replace(/[^a-zA-Z0-9 ]/g, "") //replace non alpha-numeric characters
            if (name.length >8) { //max length in boadicea
                name = name.match(/\b(\w)/g).join(''); // \b : “word boundary” \w : word characters, a-z, A-Z, 0-9, _
            } else { name = name.replace(/ /g, "_")};
        } else {
            name = arrData[i]['name']; 
        };

        //Boadicea diseases
        function BoadiceaDisease(i,nb) {
            let col = onco()[nb]+'_diagnosis_age';
            return KeyStatus(i,col,arrData[i][col] !=0 ? arrData[i][col] : 'AU');
        }

        let rowDiseases=[];
        for(let d =0; d < 5; d++){
            rowDiseases.push(BoadiceaDisease(i,d))
        }
        
        let rowInit = [
            arrData[i]['famid'],
            name,
            proband,
            arrData[i]['name'],
            father,
            mother,
            arrData[i]['sex'],
            KeyStatus(i,'mztwin','1'),
            KeyStatus(i,'status','1'),
            age,
            yob];

        let row = rowInit.concat(rowDiseases);
        row.push(KeyStatus(i,'Ashkn',arrData[i]['Ashkn']));
        
        //tests
        let gt = ['brca1', 'brca2', 'palb2', 'atm', 'chek2'];
        let pathology_tests = ['er', 'pr', 'her2', 'ck14', 'ck56'];               

        let rowTest=[];
        let p = arrData[i];
        for(let j=0; j<gt.length; j++) {
            if(gt[j]+'_gene_test' in p &&
            p[gt[j]+'_gene_test']['type'] !== '-' &&
            p[gt[j]+'_gene_test']['result'] !== '-') {
                rowTest.push(p[gt[j]+'_gene_test']['type']);
                rowTest.push(p[gt[j]+'_gene_test']['result']);
            } else {
                rowTest.push(0);
                rowTest.push(0);
            }
        }

        // receptors
        let rowRecept=[];    
        for(let j=0; j<pathology_tests.length; j++) {
            // status, 0 = unspecified, N = negative, P = positive
            if(pathology_tests[j]+'_bc_pathology' in p) {
                rowRecept.push(p[pathology_tests[j]+'_bc_pathology']);
                // console.log('pathology '+p[pathology_tests[j]+'_bc_pathology']+' for '+p.display_name);
            } else {
                rowRecept.push('0');
            }
            // if(j<(pathology_tests.length-1))
            //     msg += ":";
        }

        row = row.concat(rowTest).concat(rowRecept).join('\t');
        CSV += row + '\r\n';
        
        //Check boadicea conformity
        if(proband==1 && yob==0) warning +='\r   -'+ boadicea.proband; //index need to have yob

        //if cancer : need valide age
        const exist = (element) => element != 0;
        if (rowDiseases.some(exist) && yob==0 && !warningAge){
            warning +='\r   -'+ boadicea.disease
            warningAge=true;
        }

        //if test : need to have result
        for(let r =0; r < rowTest.length; r+=2){
            if(rowTest[r]!=0 && rowTest[r+1]==0) warning +='\r   -'+ boadicea.test1 + ' ' + test[r] + ' ' + boadicea.test2;
            if(rowTest[r+1]!=0 && rowTest[r]==0) warning +='\r   -'+ boadicea.result1 + ' ' + test[r] + ' ' + boadicea.result2;
        }
        
    }

    if(warning!='') {
        alert('Fichier Boadicea non conforme : '+ warning);
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

function getRow(obj, id) {
    for (var j = 0; j < obj.length; j++) {
        if (obj[j].IndivID == id) {
            return j;
        };
    };
}

function getIndexRow(obj) {
    for (var j = 0; j < obj.length; j++) {
        if (obj[j].proband == true) {
            return j;
        };
    };
}

function getName(i, tableData, rowData) { //JSONData, table format
    var obj = typeof tableData != 'object' ? JSON.parse(tableData) : tableData;

    //define const
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

    function isFather(index) {
        return(rowData.IndivID == obj[getRow(obj, index)].FathID);
    }
    
    function isMother(index) {
        return(rowData.IndivID == obj[getRow(obj, index)].MothID);
    }
    
    if(rowData.IndivID==indexID) result = lang.index;

    else if (isBrother(indexID)){result = lang.brother}
    else if (isSister(indexID)){result = lang.sister}

    else if(isFather(indexID)){result = lang.father}
    else if (isMother(indexID)){result = lang.mother}

    else if (isBrother(father)){result = lang.unclePat}
    else if (isSister(father)){result = lang.auntPat}
    else if (isBrother(mother)){result = lang.uncleMat}
    else if (isSister(mother)){result = lang.auntMat}
    
    else if(isFather(father)){result = lang.gpp} 
    else if(isMother(father)){result = lang.gmp}
    else if(isFather(mother)){result = lang.gpm}
    else if(isMother(mother)){result = lang.gmm}

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
        result = getName(i, obj);
        names.push([result]);
    }
    hot.populateFromArray(0, 1, names);
}

  function copyToClipboard(element) {
    var text = $('#'+element).clone().find('br').prepend('\r\n').end().text();
    element = $('<textarea>').appendTo('body').val(text).select();
    document.execCommand('copy');
    element.remove();
  }

function newName(obj){
    let col=[];
    for (let i = 0; i < obj.length; i++) {
        if(!isNaN(obj[i].IndivID)) {col.push(obj[i].IndivID)};
    }
    if (col=="") return 1;
    let max = Math.max.apply(null, col)+1;
    return max.toString();
};

function createFamily(famObj, hotObj){
    if(typeof(hotObj) !== 'undefined') {
        let deepObj = JSON.stringify(hotObj.getSourceData());
        try {
            var obj=JSON.parse(deepObj),
                index = hotObj.getSelectedLast()[0]; //index' row
          } catch (error) {
            alert(lang.noIndSelected);
          }
    }else{
        var obj = JSON.parse(myDataSafe),
            index=0; //index' row
    };

    var father=getRow(obj, obj[index].FathID),
        mother=getRow(obj, obj[index].MothID);

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
       if(replace == true && typeof(ind)!='undefined' && ind != '') (sex =='M' ? obj[ind].FathID = row.IndivID : obj[ind].MothID = row.IndivID);
       row.Name = (getName(i, obj, row) == '' & typeof(pre) != 'undefined' ? pre : getName(i, obj, row)); //i not used
       return row;
    };

    function addNewInd(fathID, mothID, sex, obj, ind, replace=false, pre){
        let row = NewInd(fathID, mothID, sex, obj, ind, replace, pre)
        if (typeof(ind)!='undefined') {
            obj.splice(ind+1, 0, row);
        } else {
            obj.push(row);
        }
        // obj.splice(1, 0, row);
    }

    function hasParents(row){//obj[i]
        return (row.FathID != '0' || row.MothID != '0');
    }

    function newParents(obj,i){ //i=row index
        if(hasParents(obj[i])) return
        //create parent and replace index row content
        addNewInd(0, 0, 'F', obj, i, true);
        addNewInd(0, 0, 'M', obj, i, true);
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

    function newChild(obj,i,sex, n=famObj[keys[j]],forceCreation){
        for (let step = 0; step < n; step++) {        
            let spouse = partner(obj,i),
                spouseSex = (obj[i].Sex=='M' ? 'F' : 'M' );
            var pre = (sex == 'M' ? lang.son : lang.daughter);
            
            // if partner doesn't exist : create it
            if (typeof(spouse) == 'undefined' || forceCreation==true) {
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
                newParents(obj,index);
                father=getRow(obj, obj[index].FathID);
                newSiblings(obj, father, 'M', famObj[keys[j]]);
                break;
            case 'auntP':
                newParents(obj,index);
                father=getRow(obj, obj[index].FathID);
                newSiblings(obj, father, 'F', famObj[keys[j]]);
                break;
            case 'uncleM':
                newParents(obj,index);
                mother=getRow(obj, obj[index].MothID);
                newSiblings(obj, mother, 'M', famObj[keys[j]]);
                break;
            case 'auntM':
                newParents(obj,index);
                mother=getRow(obj, obj[index].MothID);
                newSiblings(obj, mother, 'F', famObj[keys[j]]);
                break;
            case 'parents':
                newParents(obj,index);
                break;
            case 'spouse':
                newChild(obj,index,'F', 1, true);
                break;
            default:
                break;
        }
    };

    //load new data
    hot.loadData(obj);
  }

  function createjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    return fileref
}
 
function replacejscssfile(oldfilename, newfilename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist using
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1){
            var newelement=createjscssfile(newfilename, filetype)
            allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
        }
    }
}

function setSetterLanguage(newLang, src=''){
    let fullLang = (newLang=="fr" ? "Français" : "English");
    let shortLang = (newLang=="fr" ? "Fr" : "Eng");

    $( "#LangSetterImg" ).attr("src", src+"/GeneTree/data/images/"+newLang+".svg");
    $( "#LangSetterImg" ).prop("alt", fullLang);
    $( "#LangSetterText" ).text(shortLang);

    localStorage.setItem("language", newLang);
}

function setLanguage(oldLang, newLang){ 
    setSetterLanguage(newLang);

    //Replace all occurences of "oldscript.js" with "newscript.js" //relative path
    let root='';
    if(window.location.pathname == "/GeneTree/docs/user-interface.html") root='../'
    //https://stackoverflow.com/questions/1034621/get-the-current-url-with-javascript
    replacejscssfile(root+"lang/lang."+oldLang+".js", root+"lang/lang."+newLang+".js", "js")
    replacejscssfile(root+"lang/story."+oldLang+".js", root+"lang/story."+newLang+".js", "js")

    //change HPO source
    if(window.location.pathname == "/GeneTree/docs/user-interface.html") return
    let rootPath='';
    filePath = rootPath + (newLang=="fr" ? 'data/HPO_fr_CISMeF_1611083.txt' : 'data/HPO_eng_20200726.txt');
    
    //bug
    HPOArr = ImportHPO(filePath);
    OrphaArr = ImportOrphaData(rootPath + 'data/ORPHAnomenclature_fr.xml.txt'); //todo : set language
    HPOArr = HPOArr.concat(OrphaArr); //concatenate HPO and OrphaData
}

function updateLangage(oldLang, newLang) { 
    setLanguage(oldLang, newLang);

    var delayInMilliseconds = 100;  //ugly hack need to use async / awate ?
    setTimeout(function() {
        populateText();

        //update hot settings
        let checkBox = document.getElementById("myCheckOnco"),
            checkBoxHPO = document.getElementById("myCheckHPO");

        if(checkBox == null || checkBoxHPO == null) return;
        if (checkBox.checked == true){
            document.getElementById('myCheckHPO').checked = false;
            
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
            
        } else if (checkBoxHPO.checked == true){
          document.getElementById('myCheckOnco').checked = false;
          hot.updateSettings({
              cells: function (row, col, prop) {
                  isDiseaseProp = function(val) {return prop == val};
                  if (colsDiseases.some(isDiseaseProp)) {
                      var cellProperties = {};
                    //   cellProperties.type = 'dropdown';
                      cellProperties.source = HPOArr;
                      return cellProperties;
                    }
                    if(prop=="Option") {
                        var cellProperties = {};
                        cellProperties.source = optionList();
                        return cellProperties;
                    }
                  },
                  columns: cols,
                  colHeaders: cols_header
          });
        } else { 
            hot.updateSettings({
                cells: function (row, col, prop) {
                    isDiseaseProp = function(val) {return prop == val};
                    if (colsDiseases.some(isDiseaseProp)) {
                        var cellProperties = {};
                        cellProperties.renderer = autRenderer2;
                        return cellProperties;
                    }
                    if(prop=="Option") {
                        var cellProperties = {};
                        cellProperties.source = optionList();
                        return cellProperties;
                    }
                },
                columns: cols,
                colHeaders: cols_header
            });
        }

        if (checkBox.checked == true){
            opts.diseases = $.extend(true, [], DEFAULT_DISEASES);
        } else {
            opts.diseases = $.extend(true, [], []);
        }
        sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));

        //reset tree
        pbuttons.reset(opts, opts.keep_proband_on_reset);

        //load new table
        hot.loadData(JSON.parse(myDataSafe));

    }, delayInMilliseconds);
}

// Synchronously read a text file from the web server with Ajax
// from https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript/41133213

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    // xmlhttp.overrideMimeType('text/xml; charset=iso-8859-1'); //debug accent ?
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    return result;
}
  
//Convert tsvtoJSON
function tsvJSON(tsv) {
    const lines = tsv.split('\n');
    const headers = lines.shift().trim().split('\t');
    return lines.map(line => {
    var data = line.trim().split('\t');
    return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
    }, {});
    });
};

//Upload HPO terms and OrphaData
function ImportHPO(filePath) {
    let tsv = loadFile(filePath),
        HPO = tsvJSON(tsv),
        Arr = [];

    for(var i in HPO) {
        if(HPO[i].LABEL!='' & HPO[i].LABEL!='undefined' & HPO[i].LABEL!=null) Arr.push(HPO[i].LABEL);
    }
    return Arr;
} 
var filePath = 'data/HPO_fr_CISMeF_1611083.txt';
HPOArr = ImportHPO(filePath);

//Import Orphadata and concatenate
function ImportOrphaData(filePath) {
    let tsv = loadFile(filePath); //bug importing accents
    var x = tsv.split('\n');
    return x;
}
OrphaArr = ImportOrphaData('data/ORPHAnomenclature_fr.xml.txt');
HPOArr = HPOArr.concat(OrphaArr); //concatenate HPO and OrphaData

function loadStory(){
    let myDeepClone = JSON.stringify(hot.getSourceData()),
        obj = FormatToPedigreeJS(JSON.parse(myDeepClone));
    document.getElementById('story').innerHTML = buildStoryText(obj);
}

function checkOption(obj,k,key) {
    return obj[k][key] == true;
}

function textOption(opt,textOption1, textOption2,prefixe,suffixe) {
    if(opt>0) {
        return (typeof(prefixe)!='undefined' ? prefixe : '') + opt + ' ' + (opt>1 ? textOption1 : textOption2)
        + (typeof(suffixe)!='undefined' ? suffixe : '');
    } else {
        return '';
    }
}

function getRowPedigreeJS(obj, id) {
    for (var j = 0; j < obj.length; j++) {
        if (obj[j].name == id) {
            return j;
        };
    };
}
  
function isFatherPedigreeJS(obj, i, index) {
    return(obj[i].name == obj[index].father);
}

function isMotherPedigreeJS(obj, i, index) {
    return(obj[i].name == obj[index].mother);
}

function cleanDiseaseText(patho) {
    if(dicoD().hasOwnProperty(patho.toLowerCase())) {
        return dicoD()[patho].replace(/_/g , " ")
    } else {
        return lowerFirstLetter(patho);
    }
}

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}