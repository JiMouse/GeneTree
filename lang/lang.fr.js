var lang = {
    //index.html
    home:"Outil",
    guide:"Guide",
    user_friendly:"Interface patient",
    greeting : "Bonjour",
    title:"GeneTree",
    subtitle:"Un outil intégré pour construire un arbre généalogique, téléchargeable en fichier BOADICEA, et l'histoire clinique d'une famille.",
    
    introduction_txt:"Note : l'année de la pathologie ou du décés peuvent être renseigné dans les colonnes « Âge » des pathologies ou de décés si la date de naissance est également renseignée."+
    " L'âge correspondant sera automatiquement calculé",

    title_table:"Tableau",
    LangSetterText:"Fr",
    LangSetterTextFr:"Fr",
    LangSetterTextEng:"Eng",
    NewFam:"Nouvelle famille",
    loadFile : " Charger un fichier ou glisser-déposer un fichier ici",
    dragAndDrop:" Glisser-déposer un fichier ici !",
    drop:"Déposer le fichier !",
    savePedigree:" Enregistrer",
    nuclear_1:"Noyau",
    extended1_1:"er",
    extended1_2:" degré",
    extended2_1:"nd",
    extended2_2:" degré",
    AddFam:"Créer une famille",
    AddFamStructure:"Structure standard",
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
    loadFromPedigreeText:"Charger les données de l'arbre ",
    resetText:"Réinitialiser",
    add_parents:" parents",
    add_brother:" frère",
    add_sister:" sœur",
    add_son:" fils",
    add_daughter:" fille",
    add_spouse:" conjoint",
    add_miscarriage:" fausse-couche",
    title_pedigree:"Arbre généalogique",
    loadFromHotText:"Charger le tableau ",
    legend:" Modifier la légende",
    print:"Imprimer",
    exportText:"Exporter",
    copyToClip:"Copier",
    title_story:"Histoire clinique",
    storyBtn: "Générer le texte",
    title_reference:"Références",
    miscarriage:'FCS',
    termination:'IMG',
    adopted_in:'Adopté',
    mztwin:"JumMZ",
    dztwin:"JumDZ",
    pregnancy:"Grossesse",
    Acknowledgment: "Outil initié au sein du service de génétique clinique du CHRU de Nancy.",
    contact:" Me contacter",
    unknown: "Inconnu",
    pos:"Positif",
    neg:"Négatif",
    full:"Complet",
    untested:"Non testé",
    targeted:"Ciblé",
    alert_noAge:"date de naissance non renseignée",
    probandLabel:"propositus",
    about:"À propos",
    saveJson:" Sauvegarder",
    saveJson2:" Sauvegarder",
    savePicture: " Image",
    saveSVG: "Image vectorielle",

    //about
    about_text0:"Plusieurs propositions permettant la génération d’arbre généalogique existent, aussi bien payantes que gratuites. "+ 
    "Néanmoins, à ce jour, aucune solution gratuite ne permettait la génération d’un arbre généalogique modifiable "+ 
    "et exportable rapidement ainsi que le texte correspondant."+"\n",
    about_text1:"Cette application est un outil intégré pour simplifier l’activité administratives des médecins et conseillers "+ 
    "en génétiques dans le cadre de leur consultation de génétique.\n"+
    "Cet outil dispose d'un mode spécifique pour la consultation d'oncogénétique et d’un mode utilisant les phénotypes HPO. ",
    about_text2:"La famille peut être chargée (fichiers JSON ou BOADICEA) ou créée à partir d'une structure standard ou personnalisée, "+ 
    "puis complétée via un tableau ou une interface graphique, tous deux interconnectés. \n",
    about_text3: "L'arbre est exportable dans plusieurs formats de fichiers (TSV, JSON, PED, BOADICEA) et modifiable "+ 
    "par un éditeur vectoriel (format PDF, SVG) ou peut être imprimé directement. \n",
    about_text4:"Enfin, cette application permet la génération automatique de texte à partir du contenu du tableau correspondant "+ 
    "à l’histoire personnelle et familiale du patient.  Il s’agit, à ma connaissance, de la seule solution permettant "+ 
    "ainsi de rédiger en un clic une partie importante du compte-rendu de consultation.\n",
    about_text5:"L’interface en ligne optimisée pour le navigateur Google Chrome permet une utilisation simple sans nécessiter d’installation préalable. "+
    "Cet outil a été particulièrement pensé pour les consultations d'oncogénétique afin d'éviter la triple saisie "+ 
    "(texte – arbre généalogique - score de risque Boadicea ou CanRisk).\n",
    about_text6:"GeneTree est développé est maintenu par le Dr Jean-Marie Ravel avec la participation des membres de l'équipe de génétique clinique "+
    "du CHRU de Nancy (France).",

    //guide
    guide_introTitle:"Présentation générale",
    guide_intro0:"L'application est articulée autour de trois volets : le tableau, l'arbre et l'histoire clinique. " +
    "La famille peut être chargée à partir d'un fichier existant ou créée et modifiée avec le tableau et l'interface graphique. " + "\n" +
    // guide_intro1:
    + "Les données sont sauvegardées en cache local et sont supprimées lorsque l'onglet du navigateur est fermé. " +
    "Par ailleurs, aucune donnée n'est envoyée au serveur ce qui garantie la confidentialité des données.",
    guide_intro2:"Une première barre de navigation permet de charger une famille existante (en sélectionnant un fichier ou en le faisant glisser), " +
    "d'enregistrer la famille en cours ou de réinitialiser la famille.",
    guide_fig1:"Figure 1. Fonctionnement général de l'application",
    guide_intro3:"Il existe également deux modes d'utilisation optionnels permettant de restreindre les pathologies (à droite de la fenêtre) :",
    guide_introOnco:"le mode 'onco' est destiné aux consultations d'oncogénétique. Il permet de pré-remplir la liste des pathologies avec les cancers fréquents",
    guide_introHPO:"le mode 'HPO' limite la liste des pathologies aux symptômes et maladies des bases HPO et ORPHAdata.",
    guide_intro4:"Le tableur est également utilisable comme un tableur excel : il est possible de copier et coller des lignes."+
    "Il est possible également de sélectionner une ou plusieurs lignes et de les glisser à une autre position. Cela peut être utile lorsque"+
    "l'arbre généré a des branches croisées.",
    guide_famTitle:"Création d'une famille",
    guide_famTitle1:"Chargement d'un fichier",
    guide_fam0:"Une famille déjà créée peut être chargée grâce au bouton 'Charger un fichier ou glisser-déposer un fichier ici'. " +
    "De nombreux fichiers sont pris en charge : les fichiers créés par l'application (.json), les fichier CanRisk et Boadicea (v2 et v4) ainsi que les fichiers .ped. " +
    "Les fichiers GEDCOM sont pris en charge partiellement (import de la structure de la famille avec les noms des membres)",
    guide_famTitle2:"Création d'une nouvelle famille",
    guide_fam1:"La structure de base d'une famille est composée de trois membres : le cas index et ses parents. " +
    "Il est possible de créer une famille plus élaborée en quelques clics en cliquant sur le menu déroulant 'Nouvelle Famille' :",
    guide_fam2:"soit à partir d'une structure standard",
    guide_fam3:"le cas index et ses parents",
    guide_fam4:"le cas index, ses parents, et ses grands-parents",
    guide_fam5:"le cas index, ses parents, ses grands-parents, et les arrières-grands-parents",
    guide_fam6:"soit à partir d'une structure personalisée avec le nombre de membres adéquats (frères, soeurs, oncles et tantes de chaque branches)."+
    "La famille est créée en cliquant sur le bouton 'Créer un nouvel arbre'. ",
    guide_fam7:"Note : il est également possible, à tout moment, de sélectionner un individu sur le tableau " +
    "et de lui ajouter des membres via ce menu en cliquant sur le bouton 'Ajouter à l'individu'.",
    guide_famFig2:"Figure 2. Menu déroulant du tableau",
    guide_modTitle:"Modification d'une famille au niveau du tableau",
    guide_modTitle1:"Ajout d'un individu",
    guide_mod0: "Une fois un individu sélectionné, il est possible de cliquer sur les boutons afin d'ajouter un membre correspondant."+"\n"+
    "Note : le bouton conjoint permets d'ajouter un nouveau conjoint à l'individu. ",
    guide_modTitle2:"Personnalisation d'un individu",
    guide_mod1:"Plusieurs paramètres peuvent être remplis pour chaque individu : genre, décès, âge, année de naissance, pathologie avec âge de début etc." +
    "L'année d'une pathologie ou du décés peuvent être renseignés dans les colonnes « Âge » des pathologies ou de décés si la date de naissance est également renseignée." +
    "L'âge correspondant sera automatiquement calculé." + "\n" +
    "Un champs 'commentaire' est également existant et son contenu ajouté dans le texte généré.",
    guide_intTitle:"Prise en main de l'interface graphique de l'arbre généalogique",
    guide_int0:"L'arbre est chargeable à partir d'un fichier pedigreeJS, depuis le tableur ou d'un fichier BOADICEA v4." +
    "Il est possible de mettre l'arbre en plein écran, de défaire ou refaire la dernière action et également de centrer l'arbre.",
    guide_int1:"Une fois que vous avez commencé à construire votre arbre généalogique, placez le pointeur de la souris sur un individu, pour faire apparaître les 'widgets' utilisés pour l'édition." +
    "Vous pouvez utiliser ces 'widgets' pour ajouter des partenaires, des parents, des frères et sœurs, des enfants à votre arbre." +
    "La roulette permets, elle, d'ouvrir un menu afin de modifier l'individu : âge, sexe, pathologies, etc.",
    guide_int2:"Les pathologies sont paramétrables grâce à la roulette à droite. Chaque pathologie corresponds à une couleur (en HEX ou en toute lettre) ou à un motif."+"\n"+
    "Un bouton spécifique permets de transformer les couleurs en motifs.",
    guide_intFig3:"Figure 3. 'Widgets' autour d'un individu",
    guide_int3:"Il existe quatre boutons suplémentaires au dessus de l'interface graphique :",
    guide_int4:"annuler la dernière action",
    guide_int5:"refaire la dernière action annulée",
    guide_int6:"réinitialiser l'arbre",
    guide_int7:"'centrer l'arbre', afin de centrer l'arbre et le mettre à l'échelle du cadre (utile avant de l'exporter)",
    guide_expTitle:"Export des différents fichiers",
    guide_exp0:"De nombreux fichiers sont exportables, soit au niveau du tableau, soit au niveau de l'interface graphique. "+
    "Les deux interfaces ne sont pas synchronisées par défaut pour optimiser la performance de l'outil. "+
    "Il suffit de cliquer sur 'Charger les données de l'arbre' pour charger les données de l'interface graphique au niveau du tableau "+
    "et symétriquement de cliquer sur 'Charger le tableau' pour charger les données du tableur au niveau de l'interface graphique.",
    guide_exp1:"Il est possible d'exporter le tableau aux formats :",
    guide_exp2:"Et également via le menu déroulant",
    guide_exp3:"tableur simple (.tsv)",
    guide_exp4:"GEDCOM (export partiel avec la structure et les noms)",
    guide_exp5:"Il est possible d'exporter l'interface graphique aux formats :",
    guide_exp6:"image (.jpeg)",
    guide_exp7:"image vectorielle (.svg)",
    guide_exp8:"Imprimer (.pdf)",
    guide_texTitle:"Génération du texte",
    guide_tex0:"Le texte est généré à partir du tableau (et non de l'arbre) grâce au bouton 'générer le texte'. "+
    "Le texte est ensuite modifiable, sélectionable et copiable.",

    // addInfo
    canRiskDialog: "Ajouter un identifiant (Famid) dans le fichier",
    pid_fnameTxt: "inclure dans le nom du fichier",
    canrisk_save : "Sauvegarder",
    canrisk_addInfo: "Sauvegarder : ajout d'un identifiant ?",
    addInfo: "Ajouter des informations à un individu",
    id: "Identifiant",
    save:"Enregistrer",
    probandSwith_dialog:"Souhaitez-vous utiliser cet individu comme cas index ?",
    probandSwith_title:"Changement du propositus",
    probandSwith_cancel:"Non",

    canRiskInfo: "Info. CanRisk",
    name_surname: "Nom Prénom",
    dbirth_txt: "Date de naissance",
    sex_txt:"Sexe",
    man_txt:"Homme",
    woman_txt:"Femme",
    comment_txt: "Commentaire",
    anapath:"Anatomopathologie",
    tests:"Tests génétiques",
    menarche_txt:"Ménarche",
    parity_txt: "Parité",
    first_birth_txt: " Âge lors du premier né",
    oc_use_label_txt: "Contraception",
    mht_use_txt: "T. hormonale substitutif",
    bmi_txt:"IMC",
    alcohol_txt:"Alcool",
    menopause_txt:"Ménopause",
    mdensity_txt: "Score BI-RADS",
    hgt_txt:"Taille (cm)",
    wgt_txt:"Poids (kg)",
    tl_txt:"Ligature des trompes",
    endo_txt:"Endométriose",
    ovary2_txt:"Ovariectomie",
    mast2_txt:"Mastectomie",
    er_bc_pathology_txt:"Récepteur d’œstrogènes",
    pr_bc_pathology_txt:"Récepteurs à la progestérone",
    ck14_bc_pathology_txt:"Cytokératine 14",
    ck56_bc_pathology_txt:"Cytokératine 5/6",
    select_all_gene_tests_txt:"Définir pour tous les gènes",
    test_type:"Type de test",
    result: "Résultat",
    reset_txt:"Réinitialiser",


    // Alcohol
    alcohol_cons: "Qu'elle est votre consommation quotidienne moyenne (en nombre de verre standardisé) ?",
    wine_txt: "Verre de vin",
    pint_txt:"Pinte",
    beer_txt:"Bouteille de bière",
    shots_txt:"Liqueur, spiritueux",

    //oc_use
    oc_use_txt:"Avez-vous pris un jour une pillule contraceptive ?",
    oc_use_yes_txt: "Combien de temps au total ?",
    OC_yrs_radio1_txt: " moins d'un an",
    OC_yrs_radio2_txt: " 1-4 ans",
    OC_yrs_radio7_txt: " 5-9 ans",
    OC_yrs_radio12_txt: " 10-14 ans",
    OC_yrs_radio15_txt: " 15 ans ou plus",
    oc_use_5_txt: "Avez-vous pris la pillule au cours des deux dernières années ?",

    //mdensity
    mdensity: {
        a: "presque entièrement gras",
        b: "densités fibroglandulaires dispersées",
        c: "densité hétérogène",
        d: "extrêmement dense",
    },

    // mht_use
    mht_use_q_txt:"Depuis environ combien d’années au total avez-vous recours à un THS ? Indiquez 0 si vous avez eu recours à un THS pendant moins d’un an au total.",
    mht_use_yes:"Yes",
    mht_use_no:"No",
    years: "Années",
    mht_use_5_txt: "Avez-vous eu recours à un THS au cours des 5 dernières années ?",
    mht_use_type_txt: "A quel type de THS avez-vous eu recours ?",
    mht_use_radio1_txt:" Monothérapie à base d’œstrogènes connue",
    mht_use_radio2_txt:" THS combinée connue",
    mht_use_radio3_txt:" Autre type de THS",
    mht_use_radio4_txt:" Type de THS inconnu",

    //io.js
    pedigree:"arbre",

    //main.js
    index:"Index",
    brother:"Frère",
    sister:"Sœur",
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

    //updatePartnersAndChildren_dialog
    updatePartnersAndChildren_title:'Mise à jour des conjoints et enfants',
    updatePartnersAndChildren_dialog:"Le genre d'un individu vient d'être modifié. Le genre des conjoints et enfants concernés va être mis à jour.",
    removePartnersAndChildren_title:'Mise à jour des conjoints et enfants',
    removePartnersAndChildren_dialog:"Un individu qui a des enfants vient d'être supprimé. Les conjoints et enfants concernés vont être supprimés.",

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
    // add_miscarriage:"Ajouter Fausses couches",
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
    diagnosticAge:"Âge au diagnostic",

    //user-interface.html
    ui_introduction_txt: 'Cette page a pour but de proposer une interface simplifiée permettant de préparer sa consultation en faisant' 
    + ' le recueil de son histoire familiale et personnelle (arbre généalogique) en lien avec des pathologies oncologiques.' 
    + " Il ne se substitut pas à une consultation d'oncogénétique mais peut vous permettre de la préparer."
    + " Vous pouvez sauvegarder l'arbre sous forme d'images ou les données bruts dans la dernière section de cette page."
    + ' A chaque section, vous pouvez remplir les âges ou les dates de naissance et symétriquement les années ou dates de diagnostics'
    + ' des pathologies concernées.',
    ui_history: 'Votre histoire personnelle',
    ui_name:'Nom Prénom :',
    ui_dbirth:'Date de naissance :',
    ui_man:'Homme',
    ui_woman:'Femme',
    ui_comment:'Commentaire :',
    ui_cancer:'Avez-vous eu un cancer ?',
    ui_cancer_type:'Renseigner type et date ou âge du diagnostic',
    ui_breast_cancer:' Cancer du sein',
    ui_breast_cancer2:'Cancer du sein controlatéral',
    ui_ov_cancer: " Cancer de l'ovaire",
    ui_prostate_cancer: " Cancer de la prostate",
    ui_colon_cancer: " Cancer du colon",
    ui_cancer_poumon:" Cancer du poumon",
    ui_pan_cancer: " Cancer du pancréas",
    ui_uterus_cancer: " Cancer de l'utérus",
    ui_rein_cancer: " Cancer du rein",
    ui_foie_cancer: " Cancer du foie",
    ui_melanome: " Mélanome",
    ui_cancer_orl: " Cancer ORL",
    ui_polypes: " Polypes",
    ui_other: " Autre",
    ui_children: "Vos enfants",
    ui_children_q: "Avez-vous des enfants ?",
    ui_children_cb:"Combien d'enfants avez-vous?",
    ui_children_qd:"Quand sont nés vos enfants ?",
    ui_siblings: "Vos frères et sœurs",
    ui_siblings_q:"Avez-vous des frères et sœurs ?",
    ui_siblings_cb: "Combien de frères et sœurs avez-vous?",
    ui_siblings_qd: "Quand sont nés vos frères et sœurs ?",
    ui_parents: "Vos parents",
    ui_parents_q: "Vos parents.",
    ui_patFam:"Votre famille paternelle",
    ui_gpp:"Vos grands-parents paternels.",
    ui_sib:"Est-ce que votre père a des frères et sœurs ?",
    ui_sib_cb:"Combien de frères et sœurs a votre père ?",
    ui_sib_cb_pm: "Quand sont nés les frères et sœurs de votre père ?",
    ui_gpm:"Votre famille maternelle",
    ui_gpm_q:"Vos grands-parents maternels.",
    ui_m_sib: "Est-ce que votre mère a des frères et sœurs ?",
    ui_m_sib_cb: "Combien de frères et sœurs a votre mère ?",
    ui_m_sib_cb_qd:"Quand sont nés les frères et sœurs de votre mère ?",
    ui_click:"Cliquer sur le bouton ci-dessous afin de générer l'arbre à partir des données que vous avez entré.",
    ui_build_pedigree : "Créer l'abre généalogique",
    ui_dl: "Télécharger les deux fichiers à envoyer à votre médecin",
    ui_dl_png: "Télécharger l'arbre généalogique (image)",
    ui_add_id:"Ajouter un identifiant (Famid) dans le fichier",
    ui_add_id_file:"inclure dans le nom du fichier",
    ui_dl:"Télécharger les deux fichiers à envoyer à votre médecin",
    ui_ind_sex:"Est-ce un homme (garçon) ou une femme (fille) ?",
    ui_ind_sex_M:"Homme",
    ui_ind_sex_F:"Femme",
    ui_ind_bd:"Quelle est son année de naissance ou son âge ?",
    ui_ind_dcd:"Est-il décédé ?",
    ui_ind_dcd_yrs:"Quelle est son année de décés ou son âge au décés ?",
    ui_ind_cancer: "Est-ce que cet enfant est (ou a été) atteint par un cancer ?",
    ui_ind_cancer1:"Premier cancer",
    ui_ind_cancer1_loc:" Localisation",
    ui_ind_cancer1_age: " Âge ou année du diagnostic",
    ui_ind_cancer2:"Deuxième cancer",
    ui_ind_cancer2_loc:" Localisation",
    ui_ind_cancer2_age: " Âge ou année du diagnostic",
    ui_ind_comment: "Commentaire :",
    ui_finalisation:"Finalisation"
};

var title = {
    loadFile:"Formats acceptés : GeneTree (JSON), Boadicea, CanRisk, PedigreeJS (JSON), GEDCOM",
    submitLoad: "Formats acceptés : GeneTree (JSON), Boadicea, CanRisk, PedigreeJS (JSON), GEDCOM",
    loadFormPedigreeText:"Charger depuis l'arbre généalogique",
    reload:"Charger depuis la sauvegarde locale",
    reset:"Réinitialiser",
    add_parents:"Ajouter des parents",
    add_brother:"Ajouter un frère",
    add_sister:"Ajouter une sœur",
    add_son:"Ajouter un fils",
    add_daughter:"Ajouter une fille",
    add_spouse:"Ajouter un nouveau conjoint avec un enfant",
    add_miscarriage:"Ajouter une fausse-couche",
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
    pattern:"Motifs",
    switchToPatterns:"Réinitialiser les couleurs et utiliser des motifs ?",
    help: "Les pathologies sont représentées sur le graphique par des couleurs ou des motifs. Les couleurs peuvent être renseignées par un code HEX ou en toute lettre anglais. Les motifs possibles sont : ",
    // first_birth_title: "âge lors de la naissance du premier-né",

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
        "cancer_sein2" :"cancer du sein controlatéral",
        "cancer_ovaire":"cancer de l'ovaire",
        "cancer_pancréas":"cancer du pancréas",
        "cancer_prostate":"cancer de la prostate",
        "cancer_colon":"cancer du côlon",
        "cancer_poumon":"cancer du poumon",
        "cancer_estomac":"cancer de l'estomac",
        "cancer_utérus":"cancer de l'utérus",
        "cancer_rein":"cancer du rein",
        "cancer_foie":"cancer du foie",
        "cancer_orl":"cancer ORL"
    };
}

//Defaut datasets
var myData = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Père","IndivID": "2","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataSafe = JSON.stringify(myData);

var myDataExtended1 = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
    {"FamID": "1","Name": "Père","IndivID": "2","FathID": "4","MothID": "5","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Mère","IndivID": "3","FathID": "6","MothID": "7","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Père pat","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Mère pat","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Père mat","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""},
    {"FamID": "1","Name": "Grand-Mère mat","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":""}
],
    myDataExtended1Safe = JSON.stringify(myDataExtended1);

var myDataExtended2 = [
    {"FamID": "1","Name": "Index","IndivID": "1","FathID": "2","MothID": "3","Sex": "F","Affected":"1","Deceased":"0","Age":"","Yob":"","Option":"","Disease1":"","Age1":"","Disease2":"","Age2":"","Disease3":"","Age3":"","proband": true},
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
    {'type': 'cancer_sein2', 'colour': '#F00C93'},
    {'type': 'cancer_ovaire', 'colour': '#008080'},
    {'type': 'cancer_pancréas', 'colour': '#800080'},
    {'type': 'cancer_prostate', 'colour': '#8DB8D5'},
    {'type': 'cancer_colon', 'colour': '#3E5FB5'},
    {'type': 'cancer_estomac', 'colour': '#C9D6FF'},
    {'type': 'cancer_poumon', 'colour': '#808080'},
    {'type': 'cancer_utérus', 'colour': '#FFE5B4'},
    {'type': 'cancer_rein', 'colour': '#FFA500'},
    {'type': 'cancer_foie', 'colour': '#01D758'},
    {'type': 'mélanome', 'colour': '#808080'},
    {'type': 'cancer_orl', 'colour': '#808080'},
    {'type': 'polypes', 'colour': 'croisé'}
];

var dataset = [
    {"famid":"1","display_name":"Index","name":"1","father":"2","mother":"3","sex":"F", "proband":true},
    {"famid":"1","display_name":"Père","name":"2","sex":"M","top_level":"true"},
    {"famid":"1","display_name":"Mère","name":"3","sex":"F","top_level":"true"}
];

var switches_fr = ["Adopté (dans)", "Adopté (hors)", "Fausse-couche", "Mort-né", "IMG"];

var optionList = function(){
    return ['FCS', 'IMG', 'Grossesse','JumMZ', 'JumDZ', 'Adopté'];
}

var cols_header = ['Nom', 'Id.', 'Père', 'Mère', 'Sexe', 'Décés', 'Âge', 'Ddn', 'Option', 'Maladie1', 'Âge1', 'Maladie2', 'Âge2', 'Maladie3', 'Âge3','Comment.'];
var cols_headerOnco = [];
cols_headerOnco=cols_header.concat(cols_headerOnco)

var onco = function(){//to not be modified: boadicea/canRisk export
    return ['cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_prostate','cancer_pancréas'];
}
var diseases = onco();

var onco_full = function(){
    return [
        'cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_prostate','cancer_pancréas',
        'cancer_colon', 'cancer_estomac', 'cancer_poumon', 'cancer_utérus', 'cancer_rein', 'cancer_foie',
        'mélanome','cancer_orl','polypes'
    ]
}
var diseases_full = onco_full();

var cancers_canrisk = {
    'cancer_sein': 'cancer_sein_diagnosis_age',
    'cancer_sein2': 'cancer_sein2_diagnosis_age',
    'cancer_ovaire': 'cancer_ovaire_diagnosis_age',
    'cancer_prostate': 'cancer_prostate_diagnosis_age',
    'cancer_pancréas': 'cancer_pancréas_diagnosis_age'
};

var patterns = function(){//all id selected by user
    return ['cercles', 'diagonale', 'points', 'horizontal', 'vertical', 'croisé', 'diagonale2'];
}  

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
    'pronom3':{
        'M':'il',
        'F':'elle'
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
      'F':'une sœur'
    },
    'presenter':{
      'vie':'présente',
      'décés':'présentait'
    },
    'accord':{
        'M':'',
        'F':'e'
    }
  };

  //user-interface.html
  var colCancer_header = ['Localisation du cancer', 'Âge au diagnostic', 'Année du diagnostic'];
  var colCancer_header2 = ['Localisation<br> du cancer', 'Âge au<br> diagnostic', 'Année du<br> diagnostic', 'Commentaire'];
  var colChildren_header = ['Nom', 'Genre', 'Décés', 'Âge', 'Année de<br> Naissance'];

  var myDataGpp = [
    {"FamID": "1","Name": "Grand-Père paternelle","IndivID": "4","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0"},
    {"FamID": "1","Name": "Grand-Mère paternelle","IndivID": "5","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0"},
    ]
    var myDataGpm = [
        {"FamID": "1","Name": "Grand-Père maternelle","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0"},
        {"FamID": "1","Name": "Grand-Mère maternelle","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0"}
        ]