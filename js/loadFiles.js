//................ LOAD HPO and ORPHAData ........................//
// Synchronously read a text file from the web server with Ajax
// from https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript/41133213
var HPOArr = [];
var OrphaArr= [];

function loadHPOFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    // xmlhttp.overrideMimeType('text/xml; charset=iso-8859-1'); //debug accent ?
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }

    //importHPO
    if(filePath.includes("HPO")) {
        result = ImportHPO(result);
    }

    //ImportOrphaData
    else if(filePath.includes("ORPHA")) {
        result = result.split('\n');
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

//Upload HPO terms
function ImportHPO(tsv) {
    // let tsv = loadFile(filePath);  //bug synch ?
    let HPO = tsvJSON(tsv),
        Arr = [];

    for(var i in HPO) {
        if(HPO[i].LABEL!='' & HPO[i].LABEL!='undefined' & HPO[i].LABEL!=null) Arr.push(HPO[i].LABEL);
    }
    return Arr;
} 

function loadExternalData(newLang, rootPath) {
    //change HPO source
    if(window.location.pathname == "/GeneTree/docs/user-interface.html") return
    HPO_path = rootPath + (newLang=="fr" ? 'data/HPO_fr_CISMeF_1611083.txt' : 'data/HPO_eng_20200726.txt');
    HPOArr = loadHPOFile(HPO_path);
    setTimeout(function() { 
        // alert(HPOArr);
    }, 1000); 

    OrphaArr = loadHPOFile('data/ORPHAnomenclature_fr.xml.txt');
    HPOArr = HPOArr.concat(OrphaArr); //concatenate HPO and OrphaData
}

loadExternalData(load_lang, '');