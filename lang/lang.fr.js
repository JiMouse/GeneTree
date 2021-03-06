var lang = {
    //index.html
    greeting : "Bonjour",
    title:"GeneTree",
    subtitle:"Un outil intégré pour construire un arbre généalogique, téléchargeable en fichier BOADICEA, et l'histoire clinique d'une famille.",
    title_table:"Tableau",
    LangSetterText:"Fr",
    LangSetterTextFr:"Fr",
    LangSetterTextEng:"Eng",
    NewFam:"Nouvelle famille",
    loadFile : " Charger un fichier ",
    nuclear_1:"Noyau",
    extended1_1:"er",
    extended1_2:" degré",
    extended2_1:"nd",
    extended2_2:" degré",
    AddFam:"Créer une famille",
    bro:"frères",
    sis:"sœurs",
    sons:"fils",
    daugh:"fille",
    patBranch:"Branche paternelle",
    unc:"oncles",
    aunt:"tantes",
    matBranch:"Branche maternelle",
    unc2:"oncles",
    aunt2:"tantes",
    submitCustomFam:"Créer un nouvel arbre",
    submitAddBranch:"Ajouter à l'individu",
    loadFormPedigreeText:"Charger l'arbre ",
    add_parents:" parents",
    add_brother:" frère",
    add_sister:" sœur",
    add_son:" fils",
    add_daughter:" fille",
    add_spouse:" conjoint",
    title_pedigree:"Arbre généalogique",
    loadFromHotText:"Charger le tableau ",
    print:"Imprimer",
    exportText:"Exporter",
    copyToClip:"Copier",
    title_story:"Histoire clinique",
    title_reference:"Références",
    miscarriage:'FCS',
    termination:'IMG',
    adopted_in:'Adopté',
    mztwin:"JumMZ",
    dztwin:"JumDZ",
    pregnancy:"Grossesse",
    Acknowledgment: "Outil initié pour satisfaire une certaine paresse et éprouvé par les membres de l'équipe du service de génétique clinique du CHRU de Nancy que je remercie.",

    //io.js
    pedigree:"arbre",

    //main.js
    index:"Index",
    brother:"Frère",
    sister:"Soeur",
    father:"Père",
    mother:"Mère",
    unclePat:"Oncle pat",
    uncleMat:"Oncle mat",
    auntPat:"Tante pat",
    auntMat:"Tante mat",
    gpp:"Grand-Père pat",
    gmp:"Grand-Mère pat",
    gpm:"Grand-Père mat",
    gmm:"Grand-Mère mat",
    noIndSelected:"Aucun individu sélectionné",
    son:"Fils",
    daughter:"Fille",

    //table.js
    pathoTitle:"Configuration des pathologies",
    reset_dialogs:'Confirmez la réinitialisation',
    yes:"Oui",
    no:"Non",
    addDisease:"Ajouter une maladie",

    //undo_redo_refresh.js
    confirmReset:"Réinitialiser entraînera une perte de données.",
    continue:"Continuer",
    cancel:"Annuler",

    //widgets.js
    addMale:"Ajouter homme",
    addFemale:"Ajouter femme",
    addUnknown:"Ajouter inconnu",
    addDZTwin:"Ajouter des jumeaux dizygotiques",
    addMZTwin:"Ajouter des jumeaux monozygotiques",
    addChild:"Ajouter enfant",
    addSiblings:"Ajouter frère/sœur",
    addSpouse:"Ajouter conjoint",
    addParents:"Ajouter parents",
    delete:"Supprimer",
    parameters:"Paramètres",
    addConsang:"étendre pour créer un conjoint consanguin",
    id:"Identifiant",
    name:"Nom",
    age:"Âge",
    yob:"Année de naissance",
    man:"Homme",
    woman:"Femme",
    unknown:"Inconnu",
    alive:"en vie",
    dead:"décédé",
    diagnosticAge:"Âge au diagnostic"
};

var title = {
    loadFileTitle:"Format JSON ou Boadicea",
    loadFormPedigreeText:"Charger depuis l'arbre généalogique",
    reload:"Charger depuis la sauvegarde locale",
    reset:"Réinitialiser",
    add_parents:"Ajouter des parents",
    add_brother:"Ajouter un frère",
    add_sister:"Ajouter une sœur",
    add_son:"Ajouter un fils",
    add_daughter:"Ajouter une fille",
    add_spouse:"Ajouter un nouveau conjoint avec un enfant",
    reset_dialog:"Confirmation de la réinitialisation des maladies",
    clearFam:"Vider les champs",
    undo:"Défaire",
    redo:"Refaire",
    exportJson:"Données brutes",
    exportBOADICEA:"Format BOADICEA v4.0",
    exportText:"Autres formats",
    export_file:"Télécharger le tableau",
    savePed:"Fichier Plink",
    exportPedigreejs:"Fichier compatible avec Pedigreejs",
    BoadiceaLink:"Lien vers BOADICEA v4.0",
    loadStory:"Màj texte",

    //undo_redo_refresh.js
    center:"Centrer l'arbre",
    fullScreen:"Plein écran"
};

var boadicea = {
    proband:"L'âge du cas index n'est pas renseigné.",
    disease:"Tous les membres atteints d'un cancer de la famille doivent avoir un âge valide.",
    test1:"Le test",
    test2:"est renseigné mais le résultat n'est pas rempli.",
    result1:"Le résultat du test",
    result2:"est renseigné mais le type de test n'est pas défini ('S' pour une recherche de mutation ponctuelle ou 'T' pour une analyse du gène complet)."
}

function dicoD () {
    return {
        "cancer_sein":"cancer du sein",
        "cancer_sein2" :"cancer du sein bilatéral",
        "cancer_ovaire":"cancer de l'ovaire",
        "cancer_pancréas":"cancer du pancréas",
        "cancer_prostate":"cancer de la prostate"
    };
}



//Defaut datasets
var myData = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Père","IndivID": "2","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataSafe = JSON.stringify(myData);

var myDataExtended1 = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Père","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Père pat","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Mère pat","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Père mat","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Mère mat","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataExtended1Safe = JSON.stringify(myDataExtended1);

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
],
    myDataExtended2Safe = JSON.stringify(myDataExtended2);

var DEFAULT_DISEASES = [
    {'type': 'cancer_sein', 'colour': '#FFC0CB'},
    {'type': 'cancer_sein2', 'colour': '#f00c93'},
    {'type': 'cancer_ovaire', 'colour': '#4DAA4D'},
    {'type': 'cancer_pancréas', 'colour': '#D5494A'},
    {'type': 'cancer_prostate', 'colour': '#4289BA'}
];

var dataset = [
    {"famid":"1","display_name":"Index","name":"1","father":"2","mother":"3","sex":"M", "proband":true},
    {"famid":"1","display_name":"Père","name":"2","sex":"M","top_level":"true"},
    {"famid":"1","display_name":"Mère","name":"3","sex":"F","top_level":"true"}
];

var switches_fr = ["Adopté (dans)", "Adopté (hors)", "Fausse-couche", "Mort-né", "IMG"];

var optionList = function(){
    return ['FCS', 'IMG', 'Grossesse','JumMZ', 'JumDZ', 'Adopté'];
}

var cols_header = ['Fam.', 'Nom', 'Indiv.', 'Père', 'Mère', 'Genre', 'Atteint', 'Décés', 'Âge', 'Ddn', 'Option', 'Maladie1', 'Âge1', 'Maladie2', 'Âge2', 'Maladie3', 'Âge3','Comment.'];
var cols_headerOnco = ["Ashkn","BRCA1t","BRCA1r","BRCA2t","BRCA2r","PALB2t","PALB2r","ATMt","ATMr","CHEK2t","CHEK2r","ER","PR","HER2","CK14","CK56"]
cols_headerOnco=cols_header.concat(cols_headerOnco)

var onco = function(){
    return ['cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_prostate','cancer_pancréas'] //
}
var diseases = onco();
                                    
//Story
//Create JSON dictionnary
var dico = {
    'pronom':{
        'M':'Il',
        'F':'Elle'
    },
    'pronom2':{
        'M':'Son',
        'F':'Sa'
    },
    'civil':{
        'M':'Monsieur',
        'F':'Madame'
    },
    'naissance':{
        'M':'né',
        'F':'née'
    },
    'décés':{
        'M':'décédé',
        'F':'décédée'
    },
    'etre':{
        'vie':'est',
        'décés':'était'
    },
    'issu':{
        'M':'issu',
        'F':'issue'
    },
    'enfant':{
      'M':'un fils',
      'F':'une fille'
    },
    'fratrie':{
      'M':'un frère',
      'F':'une soeur'
    },
    'presenter':{
      'vie':'présente',
      'décés':'présentait'
    }
  };

  
