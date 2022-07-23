var lang = {
    //index.html
    home:"Tool",
    guide:"Guide",
    user_friendly:"Patient interface",
    greeting : "Hello",
    title:"GeneTree",
    subtitle:"An integrated tool to build a family tree, downloadable as a BOADICEA file, and the clinical history of a family.",

    introduction_txt:'Note: the year of the disease can be entered in the "Age" columns of the diseases if the date of birth is entered',

    title_table:"Table",
    LangSetterText:"Eng",
    LangSetterTextFr:"Fr",
    LangSetterTextEng:"Eng",
    NewFam:"New family",
    loadFile : " Upload a file or drag and drop a file here",
    dragAndDrop:"Drag and drop a file here!",
    drop:"Drop a file here!",
    savePedigree:"Save",
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
    resetText:"Reset",
    add_parents:" parents",
    add_brother:" brother",
    add_sister:" sister",
    add_son:" son",
    add_daughter:" dau.",
    add_spouse:" spouse",
    add_miscarriage:" miscarriage",
    title_pedigree:"Pedigree",
    loadFromHotText:"Load the table ",
    legend:" Update legend",
    print:"Print",
    exportText:"Export",
    copyToClip:"Copy",
    title_story:"Clinical history",
    storyBtn: "Build text",
    title_reference:"References",
    miscarriage:'miscarriage',
    termination:'termination',
    adopted_in:'adopted',
    mztwin:"mztwin",
    dztwin:"dztwin",
    pregnancy:"pregnancy",
    Acknowledgment: "Tool initiated in the clinical genetics service of the CHRU of Nancy.",
    contact:" Contact me",
    unknown: "unknown",
    pos:"Positive",
    neg:"Negative",
    full:"Full",
    untested:"Untested",
    targeted:"Targeted",
    alert_noAge:"year of birth not given",
    probandLabel:"proband",
    about:"About",
    saveJson:" Save",
    saveJson2:" Save",
    savePicture: " Picture",
    saveSVG: "SVG picture",

    //about
    about_text0: "There are several proposals for generating family trees, both paid and free. "+ 
    "However, to date, no free solution has been able to generate a family tree that can be quickly edited and exported, along with the corresponding text"+"\n",
    about_text1: "This application is an integrated tool to simplify the administrative activity of doctors and genetic counsellors "+
    "in the context of their genetic consultation.\n"+
    "This tool has a specific mode for oncogenetic consultation and a mode using HPO phenotypes. ",
    about_text2: "The family can be loaded (JSON or BOADICEA files) or created from a standard or custom structure, "+
    "and then filled in via a table or GUI, both of which are interconnected. \n",
    about_text3: "The pedigree can be exported in several file formats (TSV, JSON, PED, BOADICEA) and modified "+
    " by a vector editor (PDF, SVG format) or can be printed directly. \n",
    about_text4: "Finally, this application allows the automatic generation of text from the content of the table corresponding "+
    "to the personal and family history of the patient.  To my knowledge, this is the only solution allowing "+ 
    "to write an important part of the consultation report in one click\n",
    about_text5: "The online interface, optimised for the Google Chrome browser, makes it easy to use without the need for prior installation. "+
    "This tool has been especially designed for oncogenetic consultations in order to avoid triple entry "+ 
    "(text - family tree - Boadicea or CanRisk score)\n",
    about_text6: "GeneTree is developed and maintained by Dr Jean-Marie Ravel with the participation of members of the clinical genetics team "+" of the Nancy University Hospital (France).",

    //guide
    guide_introTitle:"General presentation",
    guide_intro0:"The application is articulated around three components: the table, the tree and the clinical history. " +
    "The family can be loaded from an existing file or created and modified with the table and the graphic interface. " +
    "Data is saved in local cache and is deleted when the browser tab is closed." + "\n" +
    "Furthermore, no data is sent to the server which guarantees data confidentiality.",
    guide_intro2:"A first navigation bar (Figure 1) allows you to load an existing family (by selecting a file or dragging it, 1)," + 
    " to save the current family locally (2) or to reset the family (3)",
    guide_fig1:"Figure 1: General function of the application",
    guide_intro3:"There are also two optional modes of use to restrict pathologies (7):",
    guide_introOnco:"the 'onco' mode is intended for oncogenetic consultations. It allows the list of pathologies to be pre-filled with frequent cancers.",
    guide_introHPO:"The 'HPO' mode limits the list of conditions to symptoms and diseases in the HPO and ORPHAdata databases.",
    guide_intro4:"The spreadsheet (8) can also be used as an Excel spreadsheet: it is possible to copy and paste rows."+
    "It is also possible to select one or more rows and drag them to another position. This can be useful when "+
    "the generated pedigree has crossed branches",
    guide_famTitle:"Creating a family",
    guide_famTitle1:"Loading a file",
    guide_fam0:"A family already created can be loaded using the dedicated button (1). " +
    "Many files are supported: files created by the application (.json), CanRisk and Boadicea files (v2 and v4) as well as .ped files." +
    "GEDCOM files are partially supported (import of the family structure with the names of the members)",
    guide_famTitle2:"Creating a new family",
    guide_fam1:"The basic structure of a family is composed of three members: the index case and its parents. " +
    "It is possible to create a more elaborate family in a few clicks by clicking on the 'New Family' drop-down menu (4):",
    guide_fam2:"either from a standard structure (9)",
    guide_fam3:"the index case and its parents",
    guide_fam4:"the index case, his parents and grandparents",
    guide_fam5:"the index case, his parents, grandparents and great-grandparents",
    guide_fam6:"or from a personalised structure (10) with the appropriate number of members (brothers, sisters, uncles and aunts of each branch). "+
    "The family is created by clicking on the 'Create a new tree' button (11). ",
    guide_fam7:"Note: it is also possible, at any time, to select an individual on the "+
    "table and add members to it via this menu by clicking on the 'Add to individual' button (12).",
    guide_famFig2:"Figure 2: Table drop-down menu",
    guide_modTitle:"Modification of a family at table level",
    guide_modTitle1:"Adding an individual",
    guide_mod0: "Once an individual is selected, it is possible to click on the buttons to add a relative (6): brother, sister, son, daughter, parents, new spouse, miscarriage.",
    guide_modTitle2:"Personalisation of an individual",
    guide_mod1: "Several parameters can be filled in for each individual: gender, death, age, year of birth, disease with age of onset etc." + 
    "The year of a disease or of death can be filled in the 'Age' columns of diseases or death if the date of birth is also filled in." +
    "The corresponding age will be automatically calculated." + "\n" +
    "A 'comment' field also exists and its content is added to the generated text.",
    guide_mod2:"An additional menu exists to fill in other information and in particular the data needed to calculate the CanRisk. " +
    "It is opened by clicking on 'Add information to an individual' (5). By default, the index case is selected",
    guide_intTitle: "Getting to grips with the graphic interface of the family tree",
    guide_int0:"The pedigree is loaded from the spreadsheet using the dedicated button (13). " +
    "It is possible to undo or redo the last action, to reset the tree, to put the tree in full screen, and also to centre the tree (14)",
    guide_int1:"Once you have started building your family tree, place the mouse pointer over an individual, to bring up the 'widgets' used for editing." +
    "You can use these 'widgets' to add partners, parents, brothers and sisters, children to your tree"+
    "The wheel allows you to open a menu to modify the individual: age, sex, pathologies, etc.",
    guide_int2:"The colours of the pathologies are configurable thanks to the button on the right (15)." + 
    "A specific button allows to transform the colours into patterns",
    guide_intFig3:"Figure 3: 'Widgets' around an individual",
    guide_int3:"There are four additional buttons above the GUI:",
    guide_int4:"cancel the last action",
    guide_int5:"redo the last cancelled action",
    guide_int6:"reset the tree",
    guide_int7:"'centre the tree', to centre the tree and scale it to the frame (useful before exporting)",
    guide_int8:"fullscreen",
    guide_expTitle:"Export of different files",
    guide_exp0:"Many files are exportable, either at the table level or at the graphical interface level. "+
    "The two interfaces are not synchronised by default to optimise the performance of the tool. "+
    "Simply click on 'Load Tree Data' (5) to load the data from the GUI to the table "+
    "and symmetrically to click on 'Load Table' (13) to load the data from the spreadsheet to the graphical interface.",
    guide_exp1:"It is possible to export the table in :",
    guide_exp2:"And also via the drop-down menu",
    guide_exp3:"simple spreadsheet (.tsv)",
    guide_exp4:"GEDCOM (partial export with structure and names)",
    guide_exp5:"It is possible to export the graphical interface in :",
    guide_exp6:"picture (.jpeg)",
    guide_exp7:"vector image (.svg)",
    guide_exp8:"Print (.pdf)",
    guide_texTitle:"Text generation",
    guide_tex0:"The text is generated from the table (not the graphical pedigree) using the 'generate text' button. "+
    "The text can then be edited, selected and copied.",

    // addInfo
    canRiskDialog: "Add an identifier (Famid) in the file",
    pid_fnameTxt: "add in filename",
    canrisk_save : "Sauvegarder",
    canrisk_addInfo: "Sauvegarder : ajout d'un identifiant ?",
    addInfo: "Add informations to individual",
    id: "Identifier",
    save:"Save",
    probandSwith_dialog:"Do you want to use this individual as proband?",
    probandSwith_title:"Proband modification",
    probandSwith_cancel:"cancel",

    canRiskInfo: "CanRisk Info. ",
    name_surname: "Name Surname",
    dbirth_txt: "Date of birth",
    sex_txt:"Sex",
    man_txt:"Man",
    woman_txt:"Woman",
    comment_txt: "Comment",
    anapath:"Anatomopathology",
    tests:"Genetic tests",
    menarche_txt:"Menarche",
    parity_txt: "Parity",
    first_birth_txt: " Age at firth birth",
    oc_use_label_txt: "Contraception",
    mht_use_txt: "hormone replacement therapy",
    bmi_txt:"BMI",
    alcohol_txt:"Alcohol",
    menopause_txt:"Menopause",
    mdensity_txt: "BI-RADS score",
    hgt_txt:"Height (cm)",
    wgt_txt:"Weight (kg)",
    tl_txt:"Tubal ligation",
    endo_txt:"Endometriosis",
    ovary2_txt:"Ovariectomy",
    mast2_txt:"Mastectomy",
    er_bc_pathology_txt:"œstrogène receptors",
    pr_bc_pathology_txt:"progesterone receptors",
    ck14_bc_pathology_txt:"Cytokeratine 14",
    ck56_bc_pathology_txt:"Cytokeratine 5/6",
    select_all_gene_tests_txt:"Set for all genes",
    test_type:"Test type",
    result: "Resultat",
    reset_txt:"Réinitialiser",

    // Alcohol
    alcohol_cons: "On average how many drinks do you have and how often?",
    wine_txt: "Wine glass",
    pint_txt:"Pint",
    beer_txt:"Beer bottle",
    shots_txt:"Liqueur, spiritueux",

    //oc_use
    oc_use_txt:"Did you take contraction pilld ?",
    oc_use_yes_txt: "How many time ?",
    OC_yrs_radio1_txt: " less than a year",
    OC_yrs_radio2_txt: " 1-4 years",
    OC_yrs_radio7_txt: " 5-9 years",
    OC_yrs_radio12_txt: " 10-14 years",
    OC_yrs_radio15_txt: " 15 years or more",
    oc_use_5_txt: "Have you taken the pill in the last two years?",

    //mdensity
    mdensity: {
        a: "almost entirely fat",
        b: "scattered fibroglandular densities",
        c: "heterogeneously dense",
        d: "extremely dense"
    },

    // mht_use
    mht_use_q_txt:"For about how many years in total have you used HRT? Please write 0 if you used HRT for less than a year in total.",
    mht_use_yes:"Yes",
    mht_use_no:"No",
    years: "Years",
    mht_use_5_txt: "Have yoy taken LHT in the last 5 years ? ",
    mht_use_type_txt: "What kind of HRT ?",
    mht_use_radio1_txt:" Known Oestrogen Monotherapy HRTe",
    mht_use_radio2_txt:" Known combined monotherapy",
    mht_use_radio3_txt:" unknown",
    mht_use_radio4_txt:" Type de THS inconnu",

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
    diseases:"Disease",
    color:"Colour",

    //updatePartnersAndChildren_dialog
    updatePartnersAndChildren_title:'Update of children and partners',
    updatePartnersAndChildren_dialog:'Would you like to update children and partners?',

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
    add_miscarriage:"Add miscarriage",
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
    diagnosticAge:"Age at diagnosis",

    //user-interface.html
    ui_introduction_txt: "The aim of this page is to provide a simplified interface to prepare for a consultation by" 
    + ' the collection of your family and personal history (family tree) in relation to oncological pathologies.' 
    + " It is not a substitute for an oncogenetic consultation but can help you prepare for it."
    + " You can save the tree as images or the raw data in the last section of this page."
    + ' In each section you can fill in the ages or dates of birth and symmetrically the years or dates of diagnosis'
    + ' of the relevant diseases',
    ui_history: 'Your personal story',
    ui_name:'Name Firstname :',
    ui_dbirth:'Birthday :',
    ui_man:'Man',
    ui_woman:'Woman',
    ui_comment:'Comment :',
    ui_cancer:'Did you developp cancer ?',
    ui_cancer_type:'Fill type and diagnostic year or age',
    ui_breast_cancer:' Breast cancer',
    ui_breast_cancer2:'Controlateral breast cancer',
    ui_ov_cancer: " Ovarian cancer",
    ui_prostate_cancer: " Prostate cancer",
    ui_pan_cancer: " Pancreatic cancer",
    ui_colon_cancer: " Colon cancer",
    ui_cancer_poumon: "Lung cancer",
    ui_uterus_cancer: " Uterus cancer",
    ui_rein_cancer: " Kidney cancer",
    ui_foie_cancer: " Liver cancer",
    ui_melanome: " Melanoma",
    ui_cancer_orl: " Head cancer",
    ui_polypes: " Polyposis",
    ui_other: " Other",
    ui_children: "Your children",
    ui_children_q: "Do you have children?",
    ui_children_cb:"How many children do you have?",
    ui_children_qd:"When were your children born?",
    ui_siblings: "Your siblings.",
    ui_siblings_q:"Do you have any brothers or sisters?",
    ui_siblings_cb: "How many brothers and sisters do you have?",
    ui_siblings_qd: "When were your brothers and sisters born?",
    ui_parents: "Your parents",
    ui_parents_q: "Your parents.",
    ui_patFam:"Your paternal family",
    ui_gpp:"Your paternal grandparents.",
    ui_sib:"Does your father have any brothers or sisters?",
    ui_sib_cb:"How many brothers and sisters does your father have?",
    ui_sib_cb_pm: "When were your father's brothers and sisters born?",
    ui_gpm:"Your maternal family",
    ui_gpm_q:"Your maternal grandparents.",
    ui_m_sib: "Does your mother have any brothers or sisters?",
    ui_m_sib_cb: "How many brothers and sisters does your mother have?",
    ui_m_sib_cb_qd:"When were your mother's brothers and sisters born?",
    ui_click:"Click on the button below to generate the tree from the data you have entered.",
    ui_build_pedigree : "Create the family pedigree",
    ui_dl: "Download the two files to send to your doctor",
    ui_dl_png: "Download the pedigree (image)",
    ui_add_id:"Add an identifier (Famid) to the file",
    ui_add_id_file:"include in the file name",
    ui_dl:"Save",
    ui_ind_sex:"Is it a man (boy) or a woman (girl)?",
    ui_ind_sex_M:"Male",
    ui_ind_sex_F:"Female",
    ui_ind_bd:"What is its year of birth or age?",
    ui_ind_dcd:"Is he dead?",
    ui_ind_dcd_yrs:"What is the year of death or age at death?",
    ui_ind_cancer: "Does this child have (or have had) cancer?",
    ui_ind_cancer1:"First cancer",
    ui_ind_cancer1_loc:" Localisation",
    ui_ind_cancer1_age: " Age or year of diagnosis",
    ui_ind_cancer2:"Second cancer",
    ui_ind_cancer2_loc:" Localisation",
    ui_ind_cancer2_age: " Age or year of diagnosis",
    ui_ind_comment: "Comment:",
    ui_finalisation:"Finalisation"
};

var title = {
    loadFileTitle:"Accepted files : GeneTree (JSON), Boadicea, CanRisk, PedigreeJS (JSON), GEDCOM",
    submitLoad:"Accepted files : GeneTree (JSON), Boadicea, CanRisk, PedigreeJS (JSON), GEDCOM",
    loadFormPedigreeText:"Load from Family Tree",
    reload:"Loading from local backup",
    reset:"Reset",
    add_parents:"Add parents",
    add_brother:"Add a brother",
    add_sister:"Add a sister",
    add_son:"Add a son",
    add_daughter:"Add a daughter",
    add_spouse:"Adding a new spouse with a child",
    add_miscarriage:"Add a miscarriage",
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
    // first_birth_title: "âge lors de la naissance du premier-né",

    //undo_redo_refresh.js
    center:"Center the pedigree",
    fullScreen:"Full screen"
};

var placeholder = {
    menarche: "(age)",
    menopause:"(age)",
    famid:"Ex. : pedigree identifier"
}

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
        "lung_cancer":"lung cancer",
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
    {'type': 'lung_cancer', 'colour': '#808080'},
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

var cols_header = ['Name', 'Id.', 'Father', 'Mother', 'Gender', 'Deceased', 'Age', 'Yob', 'Option', 'Disease1', 'Age1', 'Disease2', 'Age2', 'Disease3', 'Age3','Comment.'];
var cols_headerOnco = [];
cols_headerOnco=cols_header.concat(cols_headerOnco);

var onco = function(){//to not be modified: boadicea/canRisk export
    return ['breast_cancer', 'breast_cancer2','ovarian_cancer','prostate_cancer','pancreatic_cancer'];
}
var diseases = onco()

var onco_full = function(){
    return [
        'breast_cancer', 'breast_cancer2','ovarian_cancer','prostate_cancer','pancreatic_cancer',
        'colon_cancer', 'lung_cancer', 'stomach_cancer', 'uterus_cancer', 'kidney_cancer', 'liver_cancer',
        'melanoma','head_cancer','polypes'
    ]
}
var diseases_full = onco_full();

var cancers_canrisk = {
    'breast_cancer': 'breast_cancer_diagnosis_age',
    'breast_cancer2': 'breast_cancer2_diagnosis_age',
    'ovarian_cancer': 'ovarian_cancer_diagnosis_age',
    'prostate_cancer': 'prostate_cancer_diagnosis_age',
    'pancreatic_cancer': 'pancreatic_cancer_diagnosis_age'
};

var patterns = function(){//all id selected by user
    return ['circles', 'diagonal', 'dots', 'horizontal', 'vertical', 'crosshatch', 'diagonal2'];
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
    },
    'accord':{
        'M':'',
        'F':'e'
    }
  };
  
  //user-interface.html
  var colCancer_header = ['Cancer location', 'Age at diagnosis', 'Year of diagnosis'];
  var colCancer_header2 = ['Cancer<br> localisation', 'Diagnostic<br> age', 'Diagnostic<br> year', 'Comment'];
  var colChildren_header = ['Name', 'Gender', 'Death', 'Age', 'Year of<br> birth'];

var myDataGpp = [
    {"FamID": "1","Name": "Paternal grandfather","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0"},
    {"FamID": "1","Name": "Paternal grandmother","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0"},
]
var myDataGpm = [
    {"FamID": "1","Name": "Maternal grandfather","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0"},
    {"FamID": "1","Name": "Maternal grandmother","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0"}
]