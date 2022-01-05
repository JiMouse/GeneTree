var lang = {
    //index.html
    home:"Home",
    guide:"Guide",
    user_friendly:"Interface simplifiée",
    greeting : "Hello",
    title:"GeneTree",
    subtitle:"An integrated tool to build a family tree, downloadable as a BOADICEA file, and the clinical history of a family.",
    title_table:"Table",
    LangSetterText:"Eng",
    LangSetterTextFr:"Fr",
    LangSetterTextEng:"Eng",
    NewFam:"New family",
    loadFile : " Upload a file ",
    nuclear_1:"Nuclear",
    extended1_1:"st",
    extended1_2:" degree",
    extended2_1:"nd",
    extended2_2:" degree",
    AddFam:"Create a family",
    bro:"broth.",
    sis:"sisters",
    sons:"sons",
    daugh:"daugth.",
    patBranch:"Paternal branch",
    unc:"uncles",
    aunt:"aunts",
    matBranch:"Maternal branch",
    unc2:"uncles",
    aunt2:"tantes",
    submitCustomFam:"Create a new pedigree",
    submitAddBranch:"Add to individual",
    loadFromPedigreeText:"Load pedigree data",
    resetText:"Réinitialiser",
    add_parents:" parents",
    add_brother:" brother",
    add_sister:" sister",
    add_son:" son",
    add_daughter:" dau.",
    add_spouse:" spouse",
    title_pedigree:"Pedigree",
    loadFromHotText:"Load the table ",
    legend:" Update legend",
    print:"Print",
    exportText:"Export",
    copyToClip:"Copy",
    title_story:"Clinical history",
    title_reference:"References",
    miscarriage:'miscarriage',
    termination:'termination',
    adopted_in:'adopted',
    mztwin:"mztwin",
    dztwin:"dztwin",
    pregnancy:"pregnancy",
    Acknowledgment: "Tool initiated to satisfy a certain laziness and tested by the members of the team of the clinical genetics service of the CHRU of Nancy, whom I thank.",

    //io.js
    pedigree:"pedigree",

    //main.js
    index:"Index",
    brother:"Brother",
    sister:"Sister",
    father:"Father",
    mother:"Mother",
    unclePat:"Uncle pat",
    uncleMat:"Uncle mat",
    auntPat:"Aunt Pat",
    auntMat:"Aunt mat",
    gpp:"GrandFather pat",
    gmp:"GrandMother pat",
    gpm:"GrandFather mat",
    gmm:"GrandMother mat",
    noIndSelected:"No individual selected",
    son:"Son",
    daughter:"Daughter",

    //table.js
    pathoTitle:"Configuration of pathologies",
    reset_dialogs:'Confirm reset',
    yes:"Yes",
    no:"No",
    addDisease:"Add a disease",

    //undo_redo_refresh.js
    confirmReset:"Resetting will result in loss of data.",
    continue:"Continue",
    cancel:"Cancel",

    //widgets.js
    addMale:"Add man",
    addFemale:"Add woman",
    addUnknown:"Add unknown",
    addDZTwin:"Add dizygotic twins",
    addMZTwin:"Add monozygotic twins",
    addChild:"Add child",
    addSiblings:"Add sibling",
    addSpouse:"Add spouse",
    addParents:"Add parents",
    delete:"Delete",
    parameters:"Settings",
    addConsang:"extend to create a consanguineous spouse",
    id:"User ID",
    name:"Name",
    age:"Age",
    yob:"Year of birth",
    man:"Man",
    woman:"Woman",
    unknown:"Unknown",
    alive:"alive",
    dead:"deceased",
    diagnosticAge:"Age at diagnosis"
};

var title = {
    loadFileTitle:"JSON or Boadicea format",
    loadFormPedigreeText:"Load from Family Tree",
    reload:"Loading from local backup",
    reset:"Reset",
    add_parents:"Add parents",
    add_brother:"Add a brother",
    add_sister:"Add a sister",
    add_son:"Add a son",
    add_daughter:"Add a daughter",
    add_spouse:"Adding a new spouse with a child",
    reset_dialog:"Confirmation of disease reset",
    clearFam:"Clear the fields",
    undo:"Undo",
    redo:"Redo",
    exportJson:"Raw data",
    exportBOADICEA:"BOADICEA v4.0 format",
    exportText:"Other formats",
    export_file:"Download the table",
    savePed:"Plink File",
    exportPedigreejs:"Pedigreejs compatible file",
    BoadiceaLink:"Link to BOADICEA v4.0",
    loadStory:'Updating text',
    pattern:"Patterns",
    switchToPatterns:"Reset colours and use patterns",
    help: "Pathologies are represented on the graph by colours or patterns. The colours can be filled in with a HEX code or in English. The possible patterns are: ",

    //undo_redo_refresh.js
    center:"Center the pedigree",
    fullScreen:"Full screen"
};

var boadicea = {
    proband:"The age of the index case is not provided.",
    disease:"All family members with cancer must have a valid age.",
    test1:"",
    test2:"test is filled in but the result is not defined.",
    result1:"The result of the ",
    result2:"test is filled in but the type of test is not defined ('S' for mutation search or 'T' for direct gene test)."
}

function dicoD () {
    return {
        "breast_cancer":"breast cancer",
        "breast_cancer2" :"bilateral breast cancer",
        "ovarian_cancer":"ovarian cancer",
        "pancreatic_cancer":"pancreatic cancer",
        "prostate_cancer":"prostate cancer",
        "colon_cancer":"colon cancer",
        "stomach_cancer":"stomach cancer",
        "uterine_cancer":"uterine cancer",
        "kidney_cancer":"kidney cancer",
        "liver_cancer":"liver cancer",
        "head_neck_cancer":"head and neck cancer"
    };
}

//Defaut datasets
var myData = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Father","IndivID": "2","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mother","IndivID": "3","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataSafe = JSON.stringify(myData);

var myDataExtended1 = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Father","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mother","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandFather pat","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandMother pat","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandFather mat","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandMother mat","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataExtended1Safe = JSON.stringify(myDataExtended1);

var myDataExtended2 = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Père","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandFather pat","IndivID": "4","FathID": "8","MothID": "9","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandMother pat","IndivID": "5","FathID": "10","MothID": "11","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandFather mat","IndivID": "6","FathID": "12","MothID": "13","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "GrandMother mat","IndivID": "7","FathID": "14","MothID": "15","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "8","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "9","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "10","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "11","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "12","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "13","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "14","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "","IndivID": "15","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataExtended2Safe = JSON.stringify(myDataExtended2);

var DEFAULT_DISEASES = [
    {'type': 'breast_cancer', 'colour': '#FFC0CB'},
    {'type': 'breast_cancer2', 'colour': '#F00C93'},
    {'type': 'ovarian_cancer', 'colour': '#008080'},
    {'type': 'pancreatic_cancer', 'colour': '#800080'},
    {'type': 'prostate_cancer', 'colour': '#8DB8D5'},
    {'type': 'colon_cancer', 'colour': '#3E5FB5'},
    {'type': 'stomach_cancer', 'colour': '#C9D6FF'},
    {'type': 'uterine_cancer', 'colour': '#FFE5B4'},
    {'type': 'kidney_cancer', 'colour': '#FFA500'},
    {'type': 'liver_cancer', 'colour': '#01D758'},
    {'type': 'head_neck_cancer', 'colour': '#808080'},
    {'type': 'melanoma', 'colour': '#808080'},
    {'type': 'polypes', 'colour': 'crosshatch'}
];

var dataset = [
    {"famid":"1","display_name":"Index","name":"1","father":"2","mother":"3","sex":"F", "proband":true},
    {"famid":"1","display_name":"Father","name":"2","sex":"M","top_level":"true"},
    {"famid":"1","display_name":"Mother","name":"3","sex":"F","top_level":"true"}
];

var switches_fr = ["Adopted (in)", "Adopted (out)", "Miscarriage", "Stillbirth", "Termination"];
var optionList = function(){
    return ['miscarriage', 'termination', 'pregnancy','mztwin', 'dztwin', 'Adopted'];
}

var cols_header = ['Fam.', 'Name', 'Indiv.', 'Father', 'Mother', 'Gender', 'Affected', 'Deceased', 'Age', 'Yob', 'Option', 'Disease1', 'Age1', 'Disease2', 'Age2', 'Disease3', 'Age3','Comment.'];
var cols_headerOnco = ["Ashkn","BRCA1t","BRCA1r","BRCA2t","BRCA2r","PALB2t","PALB2r","ATMt","ATMr","CHEK2t","CHEK2r","ER","PR","HER2","CK14","CK56"]
cols_headerOnco=cols_header.concat(cols_headerOnco)

var onco = function(){
    return ['breast_cancer', 'breast_cancer2','ovarian_cancer','prostate_cancer','pancreatic_cancer', 'colon_cancer', 'stomach_cancer'];
}
var diseases = onco()

var cancers_canrisk = {
    'breast_cancer': 'breast_cancer_diagnosis_age',
    'breast_cancer2': 'breast_cancer2_diagnosis_age',
    'ovarian_cancer': 'ovarian_cancer_diagnosis_age',
    'prostate_cancer': 'prostate_cancer_diagnosis_age',
    'pancreatic_cancer': 'pancreatic_cancer_diagnosis_age'
};

var patterns = function(){//all id selected by user
    return ['circles', 'diagonal', 'dots', 'horizontal', 'vertical', 'crosshatch', 'diagonal'];
}  

//Story
//Create JSON dictionnary
var dico = {
    'pronom':{
        'M':'He',
        'F':'She'
    },
    'pronom2':{
        'M':'His',
        'F':'Her'
    },
    'pronom3':{
        'M':'he',
        'F':'she'
    },
    'civil':{
        'M':'Mister',
        'F':'Miss'
    },
    'naissance':{
        'M':'born',
        'F':'born'
    },
    'décés':{
        'M':'deceased',
        'F':'deceased'
    },
    'etre':{
        'vie':'is',
        'décés':'was'
    },
    'issu':{
        'M':'from',
        'F':'from'
    },
    'enfant':{
      'M':'a son',
      'F':'a daughter'
    },
    'fratrie':{
      'M':'a brother',
      'F':'a sister'
    },
    'presenter':{
      'vie':'have',
      'décés':'had'
    }
  };
