// define column to display
var cols = [
    // {data: 'FamID'}, 
    {data: 'Name'},
    {data: 'IndivID'},
    {data: 'FathID'},
    {data: 'MothID'},
    {data: 'Sex',
    type: 'dropdown',
    source: ['M','F','U']}, 
    // {
    // data: 'Affected',
    // type: 'checkbox',
    // checkedTemplate: '2',
    // uncheckedTemplate: '1'
    // },
    {
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
    source: optionList()
    }, {
    data: 'Disease1',
    renderer: autRenderer
    }, {
    data: 'Age1',
    type: 'numeric'
    }, {
    data: 'Disease2',
    renderer: autRenderer
    }, {
    data: 'Age2',
    type: 'numeric'
    }, {
    data: 'Disease3',
    renderer: autRenderer
    }, {
    data: 'Age3',
    type: 'numeric'
    }, {
    data: 'comment',
    type: 'text'
    }
];

//Boadicea supp. cols 
var colsOnco = [
    //{data: 'Ashkn', type: 'numeric'},
    ];
colsOnco=cols.concat(colsOnco);

//define dynamically diseases cols
var colsDiseases = [];
for (var j = 0; j < cols.length; j++) {
    if (cols[j].data.indexOf("Disease") !== -1) {
        colsDiseases.push(cols[j].data);
    };
};

var colsAges = [];
for (var j = 0; j < colsDiseases.length; j++) {
    colsAges.push("Age"+(j+1));
};

// autRenderer with onco
var set = false;
function autRenderer(instance, td, row, col, prop, value, cellProperties) {
    //add onco diseases (if not included)
    let index;
    for (var i = 0; i < onco_full().length; i++) {
        index = diseases.indexOf(onco_full()[i]);
        if (index == -1) {
            diseases.push(onco_full()[i]);
        }
    };
    
    //add new value to disease list
    let val = value;
    if(typeof val != 'undefined' & val != '' & val != null & !diseases.includes(val)) {
        diseases.push(val);
    }

    //Update cell properties
    Handsontable.renderers.TextRenderer.apply(this, arguments); 
};

//autRenderer without onco
function autRenderer2(instance, td, row, col, prop, value, cellProperties) {
    //remove onco diseases (if any)
    let index;
    for (var i = 0; i < onco_full().length; i++) {
        index = diseases.indexOf(onco_full()[i]);
        if (index > -1) {
            diseases.splice(index, 1);
        }
    };

    //add new value to disease list
    let val = value;
    if(typeof val != 'undefined' & val != '' & val != null & !diseases.includes(val)) {
        diseases.push(val);
    }

    //Update cell properties
    Handsontable.renderers.TextRenderer.apply(this, arguments); 
};

//-----------------------------------
$(document).ready(function(){

    //add popup div to select cancer type
    // define variable
    var selectedRow;
    var selectedColumn;
    var dialogCancerList;
    var hotSelectedTable;

    // define cancerList dialog form
    dialogCancerList = $( "#cancerList" ).dialog({
        autoOpen: false,        
        closeOnEscape: true,
        classes: {
            "ui-dialog": "custom-background",
            "ui-dialog-titlebar": "custom-theme",
            "ui-dialog-title": "custom-theme text-center",
            "ui-dialog-content": "custom-background",
            "ui-dialog-buttonpane": "custom-background"
        },
        width: ($(window).width() > 400 ? 250 : $(window).width()- 30),
        maxHeight: 700
    })

    $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');
    
    // on radio click
    $(document).on("click","input[name='cancerListradio']", function(){     
        let cancerType = $('input[name="cancerListradio"]:checked').val();        
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //on 'OK' click, add other value
    $(document).on("click","#validOtherCancer", function() {
        cancerType = $('#other_cancer').val();
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //if press enter on other input field
    $(document).on("keydown", "input[id='other_cancer']", function search(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
           $("#validOtherCancer").click();
        }
    });

    //HPO list click
    $(document).on("click","a[name='cancerListradio']", function() {
        cancerType = $(this).data('val'); 
        updateDiseasecol(hotSelectedTable, selectedRow, selectedColumn, cancerType);
        dialogCancerList.dialog( "close" );
    });

    //HPO search
    $(document).on("keyup", "input[id='HPOInput']", function search(e) {
        searchInList();
        if(e.keyCode == 13) {
            e.preventDefault();
        }
    });

    hot.addHook('afterSelectionEndByProp',
        function(row, column, preventScrolling) {
            let checkBoxHPO = document.getElementById("myCheckHPO");
            let checkBoxOnco = document.getElementById("myCheckOnco");
            let dialogCancerListTitle;
            selectedRow = row;
            selectedColumn = column
            if(selectedColumn == "Disease1" || selectedColumn == "Disease2" || selectedColumn == "Disease3") {
                hotSelectedTable =  this;
                if (checkBoxHPO.checked == true) { //if HPO mode
                    var html_cancerListDialog = 
                    "<form>"
                        +"<fieldset>"
                            +'<input type="text" id="HPOInput" autocomplete="off" placeholder="Taper au moins deux lettres">'
                            + '<ul id="myUL" style="height: 500px; overflow-y: auto">'
                    
                    var items = HPOArr.slice(0,100);
                    for (let i = 0; i < items.length; i++) {
                        items[i] = "<li><a name='cancerListradio' data-val='" + items[i]+"'>"+ items[i]+"</li></a>";
                    }
                    var list = items.join("");

                    html_cancerListDialog += list;
                    html_cancerListDialog += 
                             '</ul>'
                        + "</fieldset>"
                    + "</form>"
                    dialogCancerListTitle = 'Termes HPO et Orphanet'; 
                    dialogWidth = '400';
                } else {
                    var html_cancerListDialog =
                    "<form>"
                    +    "<fieldset>"

                    $.each(diseases, function(k) {
                        disease_name = capitaliseFirstLetter(cleanDiseaseText(diseases[k]));

                        html_cancerListDialog += 
                                "<div class='form-check'>"
                        +            "<label class='form-check-label font-normal'>"
                        +                "<input type='radio' class='form-check-input' name='cancerListradio'"
                        +                    "value='" + diseases[k] + "'" + "> " + disease_name
                        +            "</label>"
                        +        "</div>"
                    });

                    html_cancerListDialog += "<br>"
                    + "<div class='row'>"
                    +       "<div class='form-check col-md-8'>"
                    +            "<label class='form-check-label font-normal'>"
                    +               "<input type='text' id='other_cancer' autocomplete='off' class='form-control'"  
                    +						"aria-invalid='false' placeholder='Autre'>"
                    +            "</label>"
                    +        "</div>"
                    +        "<div col-md-4>"
                    +           "<label class='btn btn-primary'>"
                    +               "<input id='validOtherCancer' type='button' style='display: none;'/>OK"
                    +           "</label>"
                    +       "</div>"
                    + "</div>"
                    +  "</fieldset>"
                    + "</form>"
                    dialogCancerListTitle = 'Localisation du cancer';
                    dialogWidth = '260';
                }
                if(checkBoxOnco) dialogCancerListTitle = 'Pathologie';
                dialogCancerList.dialog( "option", "title", dialogCancerListTitle);
                dialogCancerList.dialog( "option", "width", dialogWidth);
                dialogCancerList.dialog("option", "close", function() {
                    // alert(row)
                    // alert(column)
                    dialogCancerList.dialog('close');
                    // hotSelectedTable.selectCell(row, column);
                }
                );
        
                dialogCancerList.html(html_cancerListDialog);
                dialogCancerList.dialog('open');
            }
            preventScrolling.value = true;
        }
    );

    function updateDiseasecol(hotSelectedTable, row, column, cancerType) {
        if(cancerType != undefined) {
            hotSelectedTable.setDataAtRowProp(row, column, cancerType);
            $('input[name="cancerListradio"]:checked').prop('checked', false);
            hotSelectedTable.selectCell(row, column);
        }
    }
    function searchInList() {
        // Declare variables
        var input, filter, ul, li, a, i, txtValue, itemsFull;
        input = document.getElementById('HPOInput');
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName('li');

        //To improve efficiency : load full list after search of minimum two letters
        if(filter.length<2) {
            itemsFull = HPOArr.slice(1,20);
            return;
        } else {
            itemsFull = HPOArr//.concat(OrphaArr); //concatenate HPO and OrphaData
        }

        var filteredList = [];
        for (let i = 0; i < itemsFull.length; i++) {
            txtValue=capitaliseFirstLetter(itemsFull[i]);
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                filteredList.push("<li><a name='cancerListradio' data-val='" + txtValue+"'>"+ txtValue+"</li></a>");
            }
        }
        var newList = filteredList.join("");
        ul.innerHTML = newList;

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            txtValue = a.textContent || a.innerText;
            
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            } else {
            li[i].style.display = "none";
            }
        }
    }
});

//---Pedigreejs variables---
if(utils.isIE() || utils.isEdge()) {
    //<!-- canvg used to convert svf to png image -->
    document.write('<script src="https://cdn.jsdelivr.net/npm/canvg@2.0.0/dist/browser/canvg.min.js"><\/script>');
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var opts = {
    'targetDiv': 'pedigree',
    'btn_target': 'pedigree_history',
    //'nodeclick': pedigree_form.nodeclick,
    'width': ($(window).width() > 450 ? 1100 : $(window).width()- 30), //900
    'height': 500,
    'symbol_size': 30,
    'edit': true,
    'zoomIn': .8,
    'zoomOut': 3.,
    'font_size': '0.75em',
    'edit': true,
    'labels': ['stillbirth', 'age', 'yob', 'comment', 'dbirth', 'civil_name'],
    'diseases': $.extend(true, [], DEFAULT_DISEASES),
    'DEBUG': (pedigree_util.urlParam('debug') === null ? false : true)};

//---Load table functions ---
$(document).ready(function() {
    //Load functions
    $( "#submitLoad" ).change(function(event) {
        var file = event.target.files[0];
													
        if(file) {
            var reader = new FileReader();
            reader.onload = function(event) {

                if(event.target.result.startsWith("BOADICEA import pedigree file format 4.0")) {
                    data = Formatboadicea(event.target.result);
                } else if(event.target.result.indexOf("##") === 0 && event.target.result.indexOf("CanRisk") !== -1) {
                    //load pedigreeJS
                    let canrisk_data = io.readCanRiskFile(event.target.result);
                    risk_factors = canrisk_data[0]; //to add as new key
                    content = canrisk_data[1];
                    content = FormatToTable(content);
                    get_risk_factors(content, risk_factors) //add risk_factors as new keys
                    hot.loadData(content);
                    loadFromHot(); //Load pedigreeJS
                    loadStory(); //load text
                } else {
                    data = JSON.parse(event.target.result);
                    if (!data[0].hasOwnProperty('FathID')) {
                        data = FormatToTable(data);
                    }
                }
                hot.loadData(data);
                loadFromHot(); //Load pedigreeJS
                loadStory(); //load text
            };
            reader.readAsText(file);
        } else {
            console.error("File could not be read!");
        }
        $("#submitLoad")[0].value = ''; // reset value

        // close tab
        document.getElementById('dropdownFam').classList.remove('open');
    });
    $( "#nuclear" ).click(function() {
        hot.loadData(JSON.parse(myDataSafe));
        loadFromHot();
    });
    $( "#extended1" ).click(function() {
        hot.loadData(JSON.parse(myDataExtended1Safe));
        loadFromHot();
    });
    $( "#extended2" ).click(function() {
        hot.loadData(JSON.parse(myDataExtended2Safe));
        loadFromHot();
    });

    var fam = ['brother','sister','son','daughter','uncleP','auntP','uncleM','auntM'];
    $( "#clearFam" ).click(function(e) {
        $.each(fam, function(index, value) {
            $('#'+value).val("")
        });
        e.stopPropagation();
    });

    $( "#submitCustomFam" ).click(function() {
        let famObj = {};
        $.each(fam, function(index, value) {
            if ($('#'+value).val() != undefined && $('#'+value).val() > 0) {
                famObj[value] = $('#'+value).val();
            }
        });

        createFamily(famObj);
        loadFromHot();
    });
    $( "#submitAddBranch" ).click(function() {
        let famObj = {};
        $.each(fam, function(index, value) {
            if ($('#'+value).val() != undefined && $('#'+value).val() > 0) {
                famObj[value] = $('#'+value).val();
            }
        });

        createFamily(famObj,hot);
        loadFromHot();
    });

    //create reset_dialog
    var reset_dialog;
    reset_dialog = $('<div id="msgDialog">'+lang.confirmReset+'</div>').dialog({
        autoOpen: false,
        title: lang.reset_dialogs,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        classes: {
            "ui-dialog": "custom-background",
            "ui-dialog-titlebar": "custom-theme",
            "ui-dialog-title": "custom-theme text-center",
            // "ui-dialog-titlebar-close":"custom-btn",
            "ui-dialog-content": "custom-background",
            "ui-dialog-buttonpane": "custom-background"
        },
        buttons: [{
            text: lang.continue,
            click: function () {
                //reset data
                hot.loadData(JSON.parse(myDataSafe));
                
                //reset disease
                let checkBox = document.getElementById("myCheckOnco");
                if(checkBox) {
                    diseases=onco_full();
                }else{
                    diseases=[];
                }
                
                loadFromHot();
                loadStory();
                $(this).dialog( "close" );
            },
        }, {
            text: lang.cancel,
            click: function () {
                $(this).dialog( "close" );
                return;
            },
        }],
    });
    $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');

    $( "#reset" ).click(function() {
        reset_dialog.dialog( "open" );
    });
    $( "#add-parents" ).click(function() {
        famObj = {parents:1};
        createFamily(famObj,hot);
    });
    $( "#add-brother" ).click(function() {
        famObj = {brother:1};
        createFamily(famObj,hot);
    });
    $( "#add-sister" ).click(function() {
        famObj = {sister:1};
        createFamily(famObj,hot);
    });
    $( "#add-son" ).click(function() {
        famObj = {son:1};
        createFamily(famObj,hot);
    });
    $( "#add-daughter" ).click(function() {
        famObj = {daughter:1};
        createFamily(famObj,hot);
    });
    $( "#add-partner" ).click(function() {
        famObj = {spouse:1};
        createFamily(famObj,hot);
    });
    $( "#add-miscarriage" ).click(function() {
        famObj = {son:1};
        createFamily(famObj,hot);
        let selectedRow = hot.getSelectedLast()[0];
        hot.setDataAtRowProp([[selectedRow+1, 'Name', 'FCS'],[selectedRow+1, 'Sex', 'U'],[selectedRow+1, 'Option', optionList()[0]]]);
    });
    
    $( "#myCheckOnco" ).click(function() {
        var checkBox = document.getElementById("myCheckOnco");
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
            //reset diseases (onco)
            opts.diseases = $.extend(true, [], DEFAULT_DISEASES);
            newdataset = ptree.copy_dataset(pedcache.current(opts));
            opts.dataset = newdataset;
            ptree.rebuild(opts);
            update_diseases();
            sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
            
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
                //reset diseases (empty if not onco)
                opts.diseases = $.extend(true, [], []);
                newdataset = ptree.copy_dataset(pedcache.current(opts));
                opts.dataset = newdataset;
                ptree.rebuild(opts);
                update_diseases();
                sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
        }
    });

    $( "#myCheckHPO" ).click(function() {
        let checkBox = document.getElementById("myCheckHPO");
        if (checkBox.checked == true){
          document.getElementById('myCheckOnco').checked = false;
          hot.updateSettings({
              cells: function (row, col, prop) {
                  isDiseaseProp = function(val) {return prop == val};
                  if (colsDiseases.some(isDiseaseProp)) {
                      var cellProperties = {};
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
          //autRenderer without onco
          hot.updateSettings({
              cells: function (row, col, prop) {
                  isDiseaseProp = function(val) {return prop == val};
                  if (colsDiseases.some(isDiseaseProp)) {
                      var cellProperties = {};
                      cellProperties.renderer = autRenderer2;
                      cellProperties.type = 'autocomplete';
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
      });

    //Export functions
    $( "#exportJson" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData());
        ExportJSON(JSON.parse(myDeepClone));
    });
    $( "#exportBOADICEA" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData()),
            Tdata = FormatToPedigreeJS(JSON.parse(myDeepClone));
        ExportBOADICEv4(Tdata);
    });
    $( "#exportPedigreejs" ).click(function() {
        let myDeepClone = JSON.stringify(hot.getSourceData()),
            obj = FormatToPedigreeJS(JSON.parse(myDeepClone));
        ExportJSON(obj);
    });
    $( "#savePed" ).click(function() {
        let toKeep = ['FamID','IndivID','FathID','MothID','Sex','Affected'];
        JSONToPEDConvertor(hot.getSourceData(), toKeep);
    });
    $( "#export_file" ).click(function() {
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
    $( "#exportPedigreejsCanRisk" ).click(function() {
        //1 export canRisk
        $('#save-canrisk-dialog').modal('show');
        let obj = pedcache.current(opts);

        //export pedigreeJS
        ExportJSON(obj);
    });


    $( "#loadStory" ).click(function() {
        loadStory();
    });
  
    $( "#copyToClip" ).click(function() {
        copyToClipboard('story');
    });
    
    $( "#LangSetterFr" ).click(function() {
        // $(".se-pre-con").show();
        updateLangage("eng", "fr");
        // $(".se-pre-con").fadeOut("slow");
    });

    $( "#LangSetterEng" ).click(function() {
        // $(".se-pre-con").show();
        updateLangage("fr", "eng");
        // $(".se-pre-con").fadeOut("slow");
    });

//---Pedigreejs script---
    var DEBUG = (pedigree_util.urlParam('debug') === null ? false : true);

    // append graphic to body
    $( "#pedigrees" ).append( $( "<div id='pedigree_history'></div>" ) );
    $( "#pedigrees" ).append( $( "<div id='pedigree'></div>" ) );

    // load tree 
    var local_dataset = pedcache.current(opts);
    if (local_dataset !== undefined && local_dataset !== null) {
        opts.dataset = local_dataset;
    } else {
        opts.dataset = dataset;
    }

    // load diseases
    var dis = sessionStorage.getItem('diseases');
    if(dis !== undefined && dis !== null){
        opts.diseases = JSON.parse(dis);
    } else {
        opts.diseases = $.extend(true, [], DEFAULT_DISEASES);
    }
    
    opts= ptree.build(opts);

    //edit disease configuration
    $('#fh_edit_settings').on( "click", function() {
        $('#fh_settings').dialog({
            autoOpen: false,
            title: lang.pathoTitle,
            buttons: [
                {
                    text: "?", //switch colour to pattern
                      click: function() {
                          $('<div id="msgDialog">'+title.help+patterns().join(', ')+'</div>').dialog({
                            title: title.switchToPatterns,
                            width: ($(window).width() > 400 ? 500 : $(window).width()- 30),
                            modal: true
                        });
                    }
                },{
                    text: title.pattern, //switch colour to pattern
                      click: function() {
                          $("#reset_dialog").dialog({
                            title: title.switchToPatterns,
                            width: ($(window).width() > 400 ? 500 : $(window).width()- 30),
                            modal: true,
                            buttons: [{
                                text: lang.yes,
                                click: function () {
                                    newdataset = ptree.copy_dataset(pedcache.current(opts));
                                    opts.dataset = newdataset;

                                    //update colour
                                    let k;
                                    for (let i = 0; i < opts.diseases.length; i++) {
                                        k=i%(patternsId().length)
                                        opts.diseases[i].colour = patterns()[k];
                                    }

                                    ptree.rebuild(opts);
                                    update_diseases();
                                    sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
                                    $(this).dialog("close");
                                },
                            }, {
                                text: lang.no,
                                click: function () {
                                    $(this).dialog("close");
                                },
                            }],
                        });
                    }
                },
                {
                    text: title.reset,
                      click: function() {
                          $("#reset_dialog").dialog({
                            title: lang.reset_dialogs,
                            modal: true,
                            buttons: [{
                                text: lang.yes,
                                click: function () {
                                    newdataset = ptree.copy_dataset(pedcache.current(opts));
                                    opts.dataset = newdataset;
                                    opts.diseases = $.extend(true, [], DEFAULT_DISEASES);
                                    ptree.rebuild(opts);
                                    update_diseases();
                                    sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
                                    $(this).dialog("close");
                                },
                            }, {
                                text: lang.no,
                                click: function () {
                                    $(this).dialog("close");
                                },
                            }],
                        });
                    }
                },
                {
                  text: "OK",
                  click: function() {
                    $( this ).dialog( "close" );
                    newdataset = ptree.copy_dataset(pedcache.current(opts));
                    opts.dataset = newdataset;
                    ptree.rebuild(opts);
                  }
                }
              ],
            width: ($(window).width() > 400 ? 500 : $(window).width()- 30),
			maxHeight: 600
        });
        var html_dis =
            '<br><div class="row">'+
                '<div class="col-md-4 text-right">'+
                      '<label for="dis_name">'+lang.addDisease+':</label>' +
                '</div>' +
                '<div class="col-md-6">'+
                      '<input type="text" class="form-control" id="dis_name">' +
                '</div>' +
                '<div class="col-md-2">'+
                    '<label class="btn btn-default btn-file">' +
                        '<input id="add_disease" type="button" style="display: none;"/><i class="fa fa-plus" aria-hidden="true"></i>' +
                    '</label>' +
                '</div>' +
            '</div><br><div id="disease_table"></div>';

        $('#fh_settings').html(html_dis);
        update_diseases();
        $('#fh_settings').dialog('open');
        
        $('#add_disease').on( "click", function() {
            if($('#dis_name').val() == "")
                return;
            var new_diseases = $.extend(true, [], opts.diseases);
            new_diseases.push({'type': $('#dis_name').val().replace(/\s/g , "_"), 'colour': 'red'});
            opts.diseases = new_diseases;
            sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
            update_diseases();
        });
    });

    function validTextColour(stringToTest) {
        //Alter the following conditions according to your need.
        if (stringToTest === "") { return false; }
        if (stringToTest === "inherit") { return false; }
        if (stringToTest === "transparent") { return false; }
        
        var image = document.createElement("img");
        image.style.color = "rgb(0, 0, 0)";
        image.style.color = stringToTest;
        if (image.style.color !== "rgb(0, 0, 0)") { return true; }
        image.style.color = "rgb(255, 255, 255)";
        image.style.color = stringToTest;
        var isValid = image.style.color !== "rgb(255, 255, 255)";
        image.remove();
        return isValid;
    }

    function update_diseases() {
        var tab = "<table class='table table-condensed table-striped table-bordered'>" +
                    "<thead><tr><th>Maladie</th><th>Couleur</th><th></th></tr></thead>";
        $.each(opts.diseases, function(k, v) {
            var disease_colour = '&thinsp;<span style="padding-left:5px;background:'+opts.diseases[k].colour+'"></span>';
            tab += "<tr>" +
                        "<td style='text-align:right'>"+capitaliseFirstLetter(v.type.replace(/_/g , " "))+
                            disease_colour+"&nbsp;</td>" +
                        "<td>" +
                          "<input type='text' class='form-control' id='disease_colour-"+v.type+"' value='" + opts.diseases[k].colour + "'>" +
                        "</td>" +
                        "<td>" +
                            "<label class='btn btn-default btn-sm'>" +
                                "<input id='delete_disease-"+v.type+"' type='button' style='display: none;'/>" +
                                    "<i class='fa fa-times' aria-hidden='true' style='color:#8B0000'></i>" +
                            "</label>" +
                        "</td>" +
                    "</tr>";
        });
        tab += "</table>";
        $('#disease_table').html(tab);

        $("input[id^='delete_disease-']").on( "click", function() {
            var this_disease = $(this).attr('id').replace('delete_disease-', '');
            var new_diseases = $.extend(true, [], opts.diseases);
            new_diseases = new_diseases.filter(function(el) {
                return el.type !== this_disease;
            });
            opts.diseases = new_diseases;
            sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
            update_diseases();
        });

        $('input[id^="disease_colour-"]').on('keypress mouseleave', function(e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13 || code == 0) {
                var this_disease = $(this).attr('id').replace('disease_colour-', '');
                var this_colour = $(this).val();
                // test if valid colour string or hex or pattern
                if(!validTextColour(this_colour) && !/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(this_colour) 
                    && !patterns().includes(this_colour) && !patternsId().includes(this_colour) //test valid HEX color representation
                    ){ 
                    alert('Couleur invalide !', this_colour);
                    return;
                }

                //update disease
                var new_diseases = $.extend(true, [], opts.diseases);
                $.each(new_diseases, function(index, value) {
                     if(value.type == this_disease) {
                         value.colour = this_colour;
                     }
                });
                opts.diseases = new_diseases;
                sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
                update_diseases();
            }
        });
    }

    // Update dataset from handsontable
    function loadFromHot(hotTable=hot) {
        loadFromObj(hotTable.getSourceData());
    }
    function loadFromObj(hotData = hot.getSourceData()) {
        // load table and convert it
        let myDeepClone = JSON.stringify(hotData);
        var obj = JSON.parse(myDeepClone);
        obj = FormatToPedigreeJS(obj, true); //without
        //TO DO: add clean level update as with Boadicea input.

        // get all disease of the obj 
        let allDiseases = getTablePatho(JSON.parse(myDeepClone));

        //update diseases list
        var new_diseases = $.extend(true, [], opts.diseases); //get previous list of diseases
        for (let i = 0; i < allDiseases.length; i++) {
            let val=allDiseases[i],
                new_diseaseList = [];

            //list of all disease of the current pedigree
            for (var j = 0; j < new_diseases.length; j++) {
                new_diseaseList.push(new_diseases[j].type);
            }
            
            //add disease if not included
            if(typeof(val) != 'undefined' && !new_diseaseList.includes(val) && val != '') {
                const setBg = () => {
                    const randomColor = Math.floor(Math.random()*16777215).toString(16);
                    return "#" + randomColor.toUpperCase();
                }
                new_diseases.push({'type': val, 'colour': setBg()});
            }
        }

        //Update pedigree and diseases
        opts.diseases = $.extend(true, [], new_diseases);
        opts.dataset = obj;
        ptree.rebuild(opts);

        opts.diseases = new_diseases;
        sessionStorage.setItem('diseases', JSON.stringify(opts.diseases));
        update_diseases();
    }

    $('#loadFromHot').click(function() {
        loadFromHot();
    });

    $('#save_canrisk_fromHot').on('click', function (e) {
        loadFromHot();
		$('#save-canrisk-dialog').modal('show');
	});

    //create pedigree in user interface
    $( "#createPed" ).click(function() {
        finalFamObj = createPed();
        loadFromObj(finalFamObj);
    });

    function createPed() {//build pedigree object for user-interface
        //set variables
        var indexRow = 0;
        var indexID = 1;
        var LastIndivID=indexID;

        //get index object
        var indObj=[
            {"FamID": "1",
            "Name": "Index",
            "IndivID": "1",
            "FathID": "2",
            "MothID": "3",
            "Affected":"1",
            "Deceased":"0",
            "proband": true}
        ];

		addKeyToObject(indObj, indexRow, 'dbirth')
        addKeyToObject(indObj, indexRow, 'civil_name')
        indObj[indexRow]['Sex'] = $('input[name="sex"]:checked').val();
        addKeyToObject(indObj, indexRow, 'comment', 'form_id_comment');

        //year of birth and age
        let yob = $(dbirth).val().split('/')[2];
        if(yob!=undefined) {
            indObj[indexRow]['Yob'] = yob;

            var month = Number($(dbirth).val().split('/')[1]) - 1;
            var day = Number($(dbirth).val().split('/')[0]);
            var today = new Date();
            var age = today.getFullYear() - yob;	

            if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
                age--;
            }
            indObj[indexRow]['Age'] = age;
        };

        // index cancer
        let cancerObj = hotCancer.getSourceData();
        
        for (let i = 0; i < cancerObj.length; i++) {
            if(cancerObj[i]['Cancer'] != '' && cancerObj[i]['Cancer'] != null) {
                indObj[indexRow]['Disease'+(i+1)]=cancerObj[i]['Cancer'];
                indObj[indexRow]['Age'+(i+1)]=cancerObj[i]['Age'];
            }
        }
        
        //Add parents
        let parentsObj = hotParents.getSourceData();
        var famObj = indObj.concat(parentsObj);

        //Add grandfather and grand mother
        let gppObj = hotGpp.getSourceData();
        let gpmObj = hotGpm.getSourceData();
        famObj = famObj.concat(gppObj).concat(gpmObj);
        LastIndivID=7; //numbering start from last IndivID

        //children
        let childrenObj = hotChildren.getSourceData();
        if (childrenObj.length>0) {
            let ind;

            // create husband or wife
            LastIndivID+=1
            ind = {"FamID": "1","Name": "Conjoint",
                "IndivID": LastIndivID,
                "FathID": "0","MothID": "0",
                "Sex": (indObj[indexRow]['Sex'] == 'F' ? 'M' : 'F'),
                "Affected":"1","Deceased":"0"};
            famObj.push(ind);
            let partnerID = LastIndivID;

            // add children
            for (let i = 0; i < childrenObj.length; i++) {
                LastIndivID+=1
                childrenObj[i]["IndivID"]=LastIndivID;
                childrenObj[i]["FathID"]= (indObj[indexRow]['Sex'] == 'F' ? partnerID : '1');
                childrenObj[i]["MothID"]= (indObj[indexRow]['Sex'] == 'F' ? '1' : partnerID);
            }
        }
        famObj = famObj.concat(childrenObj);
        
        //Sibilings
        let siblingsObj = hotSiblings.getSourceData();
        if (siblingsObj.length>0) {
            // add siblings
            for (let i = 0; i < siblingsObj.length; i++) {
                LastIndivID+=1
                siblingsObj[i]["IndivID"]=LastIndivID;
                siblingsObj[i]["FathID"]= "2";
                siblingsObj[i]["MothID"]= "3";
            }
        }
        famObj = famObj.concat(siblingsObj);

        //Paternal familly
        let fatherSiblingsObj = hotFatherSiblings.getSourceData();
        if (fatherSiblingsObj.length>0) {
            // add Fathersiblings
            for (let i = 0; i < fatherSiblingsObj.length; i++) {
                LastIndivID+=1
                fatherSiblingsObj[i]["IndivID"]=LastIndivID;
                fatherSiblingsObj[i]["FathID"] = "4";
                fatherSiblingsObj[i]["MothID"] = "5";
            }
        }
        famObj = famObj.concat(fatherSiblingsObj);

        //Maternal familly
        let motherSiblingsObj = hotMotherSiblings.getSourceData();
        if (motherSiblingsObj.length>0) {
            // add motherSiblings
            for (let i = 0; i < motherSiblingsObj.length; i++) {
                LastIndivID+=1
                motherSiblingsObj[i]["IndivID"]=LastIndivID;
                motherSiblingsObj[i]["FathID"] = "6";
                motherSiblingsObj[i]["MothID"] = "7";
            }
        }
        famObj = famObj.concat(motherSiblingsObj);

        return famObj
    };  
});