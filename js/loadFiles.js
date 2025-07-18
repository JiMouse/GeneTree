//................ LOAD HPO and ORPHAData ........................//
var HPOArr = [];
var OrphaArr = [];

async function loadHPOFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        let result;

        // ImportHPO
        if (filePath.includes("HPO")) {
            result = ImportHPO(text);
        }
        // ImportOrphaData
        else if (filePath.includes("ORPHA")) {
            result = text.split('\n');
        }

        return result;

    } catch (error) {
        console.error(`Failed to load ${filePath}:`, error);
        return null;
    }
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
    if(window.location.pathname != "/GeneTree/" && window.location.pathname != "/index.html") return // /GeneTree/docs/user-interface.html") return
    HPO_path = rootPath + (newLang=="fr" ? 'data/HPO_fr_CISMeF_1611083.txt' : 'data/HPO_eng_20200726.txt');
    HPOArr = loadHPOFile(HPO_path);
    OrphaArr = loadHPOFile(rootPath + 'data/ORPHAnomenclature_fr.xml.txt');
    HPOArr = HPOArr.concat(OrphaArr); //concatenate HPO and OrphaData
}

loadExternalData(load_lang, '');
