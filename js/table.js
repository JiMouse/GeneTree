//HOT
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

// define column to display
var cols = function() {
    return [{data: 'FamID'}, 
            {data: 'Name'},
            {data: 'IndivID'},
            {data: 'FathID'},
            {data: 'MothID'},
            {data: 'Sex'}, 
            {
            data: 'Affected',
            type: 'checkbox',
            checkedTemplate: '2',
            uncheckedTemplate: '1'
            },{
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
            }, {
            data: 'comment',
            type: 'text'
            }
        ];
    };

//Boadicea supp. cols 
var colsOnco = [
    {data: 'Ashkn', type: 'numeric'},
    {data: 'BRCA1t', type: 'dropdown', source:['T','S']},
    {data: 'BRCA1r', type: 'dropdown', source:['P','N']},
    {data: 'BRCA2t', type: 'dropdown', source:['T','S']},
    {data: 'BRCA2r', type: 'dropdown', source:['P','N']},
    {data: 'PALB2t', type: 'dropdown', source:['T','S']},
    {data: 'PALB2r', type: 'dropdown', source:['P','N']},
    {data: 'ATMt', type: 'dropdown', source:['T','S']},
    {data: 'ATMr', type: 'dropdown', source:['P','N']},
    {data: 'CHEK2t', type: 'dropdown', source:['T','S']},
    {data: 'CHEK2r', type: 'dropdown', source:['P','N']},
    {data: 'ER', type: 'dropdown', source:['P','N', 'U']},
    {data: 'PR', type: 'dropdown', source:['P','N', 'U']},
    {data: 'HER2', type: 'dropdown', source:['P','N', 'U']},
    {data: 'CK14', type: 'dropdown', source:['P','N', 'U']},
    {data: 'CK56', type: 'dropdown', source:['P','N', 'U']}
    ];
//colsOnco=cols().concat(colsOnco); //not processed outside of script?

// define column header
var cols_header = ['Fam.', 'Nom', 'Indiv.', 'Père', 'Mère', 'Genre', 'Atteint', 'Décés', 'Âge', 'Ddn', 'Option', 'Maladie1', 'Âge1', 'Maladie2', 'Âge2', 'Maladie3', 'Âge3','Comment.']
var cols_headerOnco = ["Ashkn","BRCA1t","BRCA1r","BRCA2t","BRCA2r","PALB2t","PALB2r","ATMt","ATMr","CHEK2t","CHEK2r","ER","PR","HER2","CK14","CK56"]
cols_headerOnco=cols_header.concat(cols_headerOnco)

//Define onco disease list
var onco = function(){
return ['cancer_sein', 'cancer_sein2','cancer_ovaire','cancer_pancréas','cancer_prostate']
}
var diseases = onco()

// autRenderer with onco
var set = false
function autRenderer(instance, td, row, col, prop, value, cellProperties) {
    let index;
    for (var i = 0; i < onco().length; i++) {
        index = diseases.indexOf(onco()[i]);
        if (index == -1) {
            diseases.push(onco()[i]);
        }
    };
    
    let val = value;
    if(typeof val != 'undefined' & val != '' & !diseases.includes(val)) {
        diseases.push(val);
    }
    cellProperties.type = 'autocomplete';
    cellProperties.source = diseases
    Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
};

//autRenderer without onco
function autRenderer2(instance, td, row, col, prop, value, cellProperties) {
    let index;
    for (var i = 0; i < onco().length; i++) {
        index = diseases.indexOf(onco()[i]);
        if (index > -1) {
            diseases.splice(index, 1);
        }
    };

    let val = value;
    if(typeof val != 'undefined' & val != '' & !diseases.includes(val)) {
        diseases.push(val);
    }
    cellProperties.type = 'autocomplete';
    cellProperties.source = diseases
    Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
};


//---Load functions ---
$(document).ready(function() {
    //Load functions
    $( "#submitLoad" ).change(function(event) {
        var file = event.target.files[0];
													
        if(file) {
            var reader = new FileReader();
            reader.onload = function(event) {

                if(event.target.result.startsWith("BOADICEA import pedigree file format 4.0")) {
                    data = Formatboadicea(event.target.result)

                } else {
                    data = JSON.parse(event.target.result);
                    if (!data[0].hasOwnProperty('FathID')) {
                        data = FormatToTable(data)
                    }
                }
                hot.loadData(data)
            };
            reader.readAsText(file);
        } else {
            console.error("File could not be read!");
        }
        $("#submitLoad")[0].value = ''; // reset value

        // close tab
        document.getElementById('dropdownFam').classList.remove('open')
    });
    $( "#nuclear" ).click(function() {
        hot.loadData(JSON.parse(myDataSafe));
        hot.loadData(JSON.parse(myDataSafe)); //bug ?
        document.getElementById('dropdownFam').classList.remove('open')
    });
    $( "#extended1" ).click(function() {
        hot.loadData(JSON.parse(myDataExtended1Safe));
        hot.loadData(JSON.parse(myDataExtended1Safe)); //bug ?
        document.getElementById('dropdownFam').classList.remove('open')
    });
    $( "#extended2" ).click(function() {
        hot.loadData(JSON.parse(myDataExtended2Safe));
        hot.loadData(JSON.parse(myDataExtended2Safe)); //bug ?
        document.getElementById('dropdownFam').classList.remove('open')
    });
    $( "#submitCustomFam" ).click(function() {
        // construct famObj
        fam = ['brother','sister','son','daughter','uncleP','auntP','uncleM'];
        famObj = {};

        $.each(fam, function(index, value) {
            if ($('#'+value).val() != undefined && $('#'+value).val() > 0) {
                famObj[value] = $('#'+value).val();
            }
        });

        //create new family
        createFamily(famObj,hot);
    });

    $( "#reload" ).click(function() {
        hot.loadData(JSON.parse(sessionStorage['data']))
    });
    $( "#reset" ).click(function() {
        hot.loadData(JSON.parse(myDataSafe))
    });
    $( "#undo" ).click(function() {
        hot.undo()
    });
    $( "#redo" ).click(function() {
        hot.redo()
    });
    $( "#add-parents" ).click(function() {
        createParents();
    });
    $( "#add-brother" ).click(function() {
        createBrother();
    });
    $( "#add-sister" ).click(function() {
        createSister();
    });
    $( "#add-son" ).click(function() {
        createChild("M");
    });
    $( "#add-daughter" ).click(function() {
        createChild("F");
    });
    $( "#add-partner" ).click(function() {
        createChild("F", true);
    });
    $( "#myCheckOnco" ).click(function() {
        var checkBox = document.getElementById("myCheckOnco");
        if (checkBox.checked == true){
            document.getElementById('myCheckHPO').checked = false;
            hot.updateSettings({
                cells: function (row, col, prop) {
                    if (prop == 'Disease1' || prop == 'Disease2' || prop == 'Disease3') {
                        var cellProperties = {};
                        cellProperties.renderer = autRenderer;
                        return cellProperties;
                    }
                },
                columns: colsOnco,
                colHeaders: cols_headerOnco
            });
        } else {
            hot.updateSettings({
                cells: function (row, col, prop) {
                    if (prop == 'Disease1' || prop == 'Disease2' || prop == 'Disease3') {
                        var cellProperties = {};
                        cellProperties.renderer = autRenderer2;
                        return cellProperties;
                    }
                },
                columns: cols(),
                colHeaders: cols_header
            });
        }
    });

    //Export functions
    $( "#exportJson" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData())
        ExportJSON(JSON.parse(myDeepClone))
    });
    $( "#exportBOADICEA" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData()) //save hot
        var Tdata = FormatToPedigreeJS(JSON.parse(myDeepClone))
        ExportBOADICEv4(Tdata)
    });
    $( "#exportPedigreejs" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData())
        var obj = FormatToPedigreeJS(JSON.parse(myDeepClone))
        ExportJSON(obj)
    });
    $( "#savePed" ).click(function() {
        var toKeep = ['FamID','IndivID','FathID','MothID','Sex','Affected']
        JSONToPEDConvertor(hot.getSourceData(), toKeep); 
    });
    $( "#export-file" ).click(function() {
        var exportPlugin1 = hot.getPlugin('exportFile');
        exportPlugin1.downloadFile('csv', {
            bom: false,
            columnDelimiter: '\t',
            columnHeaders: cols_header,
            exportHiddenColumns: true,
            exportHiddenRows: true,
            fileExtension: 'tsv',
            filename: 'GeneTree_[YYYY]-[MM]-[DD]',
            mimeType: 'text/csv',
            rowDelimiter: '\r\n',
            rowHeaders: false
        });
    });    
});