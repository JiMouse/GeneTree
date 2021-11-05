// define column to display
var cols = [{data: 'FamID'}, 
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
            source: optionList()
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
    for (var i = 0; i < onco().length; i++) {
        index = diseases.indexOf(onco()[i]);
        if (index == -1) {
            diseases.push(onco()[i]);
        }
    };
    
    //add new value to disease list
    let val = value;
    if(typeof val != 'undefined' & val != '' & !diseases.includes(val)) {
        diseases.push(val);
    }

    //Update cell properties
    cellProperties.type = 'autocomplete';
    cellProperties.source = diseases
    Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
};

//autRenderer without onco
function autRenderer2(instance, td, row, col, prop, value, cellProperties) {
    //remove onco diseases (if any)
    let index;
    for (var i = 0; i < onco().length; i++) {
        index = diseases.indexOf(onco()[i]);
        if (index > -1) {
            diseases.splice(index, 1);
        }
    };

    //add new value to disease list
    let val = value;
    if(typeof val != 'undefined' & val != '' & !diseases.includes(val)) {
        diseases.push(val);
    }

    //Update cell properties
    cellProperties.type = 'autocomplete';
    cellProperties.source = diseases
    Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
};

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
    'width': ($(window).width() > 450 ? 1200 : $(window).width()- 30), //900
    'height': 500,
    'symbol_size': 30,
    'edit': true,
    'zoomIn': .8,
    'zoomOut': 3.,
    'font_size': '0.75em',
    'edit': true,
    'labels': ['stillbirth', 'age', 'yob', 'alleles', 'comment'],
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

                } else {
                    data = JSON.parse(event.target.result);
                    if (!data[0].hasOwnProperty('FathID')) {
                        data = FormatToTable(data);
                    }
                }
                hot.loadData(data);
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

    $( "#reload" ).click(function() {
        hot.loadData(JSON.parse(sessionStorage['data']));
    });
    $( "#reset" ).click(function() {
        hot.loadData(JSON.parse(myDataSafe));
    });
    $( "#undo" ).click(function() {
        hot.undo();
    });
    $( "#redo" ).click(function() {
        hot.redo();
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
                      cellProperties.type = 'dropdown';
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

    $( "#loadStory" ).click(function() {
        loadStory();
    });
  
    $( "#copyToClip" ).click(function() {
        copyToClipboard('story');
    });
    
    $( "#LangSetterFr" ).click(function() {
        $(".se-pre-con").show();
        updateLangage("eng", "fr");
        $(".se-pre-con").fadeOut("slow");;
    });

    $( "#LangSetterEng" ).click(function() {
        $(".se-pre-con").show();
        updateLangage("fr", "eng");
        $(".se-pre-con").fadeOut("slow");;
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
    var dis = localStorage.getItem('diseases');
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
                                    localStorage.setItem('diseases', JSON.stringify(opts.diseases));
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
                                    localStorage.setItem('diseases', JSON.stringify(opts.diseases));
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
            width: ($(window).width() > 400 ? 500 : $(window).width()- 30)
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
            localStorage.setItem('diseases', JSON.stringify(opts.diseases));
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
            localStorage.setItem('diseases', JSON.stringify(opts.diseases));
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
                localStorage.setItem('diseases', JSON.stringify(opts.diseases));
                update_diseases();
            }
        });
    }

    // Update dataset from handsontable
    function loadFromHot() {
        // load table and convert it
        let myDeepClone = JSON.stringify(hot.getSourceData());
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
        localStorage.setItem('diseases', JSON.stringify(opts.diseases));
        update_diseases();

    }

    $('#loadFromHot').click(function() {
        loadFromHot();
    });

    $('#save_canrisk_fromHot').on('click', function (e) {
        loadFromHot();
		$('#save-canrisk-dialog').modal('show');
	});
});