//................ LOAD HPO and ORPHAData ........................//
var HPOArr = [];
var OrphaArr = [];

// Async file loader using fetch
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

// Convert TSV to JSON
function tsvJSON(tsv) {
    const lines = tsv.split('\n');
    const headers = lines.shift().trim().split('\t');
    return lines.map(line => {
        const data = line.trim().split('\t');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    });
}

// Parse HPO file content into an array of LABELs
function ImportHPO(tsv) {
    const HPO = tsvJSON(tsv);
    const Arr = [];

    for (let i in HPO) {
        const label = HPO[i].LABEL;
        if (label !== '' && label !== 'undefined' && label !== null) {
            Arr.push(label);
        }
    }
    return Arr;
}

// Load HPO and ORPHA data, combining both
async function loadExternalData(newLang, rootPath) {
    // Only run on main pages
    if (window.location.pathname !== "/GeneTree/" && window.location.pathname !== "/index.html") return;

    const HPO_path = rootPath + (newLang === "fr" ? 'data/HPO_fr_CISMeF_1611083.txt' : 'data/HPO_eng_20200726.txt');
    const ORPHA_path = rootPath + 'data/ORPHAnomenclature_fr.xml.txt';

    // Load both files asynchronously
    const hpoData = await loadHPOFile(HPO_path);
    const orphaData = await loadHPOFile(ORPHA_path);

    // Store them in global variables
    HPOArr = hpoData || [];
    OrphaArr = orphaData || [];

    // Combine both arrays into HPOArr
    HPOArr = HPOArr.concat(OrphaArr);
}

// Example of how to call loadExternalData
async function initApp() {
    await loadExternalData(load_lang, '');
    // You can now safely use HPOArr
    console.log(HPOArr);
}

// Initialize app
initApp();
