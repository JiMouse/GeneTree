$(document).ready(function(){
    //dbirth placeholder
    $("#dbirth").inputmask({
        alias: "datetime", inputFormat: "dd/mm/yyyy", placeholder: "jj/mm/aaaa"
    })

    //initialize panel
    cancer_init();
    children_init();
    siblings_init();
    gpp_init();
    fatherSiblings_init();
    gpm_init();
    motherSiblings_init();

    //To do afterSelectionEnd in disease column : for disease dropdown ? => modal.show based on $('#fh_settings').dialog in main_front.js

    //set variables
    var myDataChildren_new = [];

    // Add hooks to update age and yob
    var setter = false;
    hotCancer.addHook('afterChange',
        function(changes, source) {
            let dbirth = $( "#dbirth" ).val();
            if(dbirth != undefined)
                syncAgeYob(changes, source, 'Age', 'Year', hotCancer, 2, dbirth); //based on dbirth
        }
    );
    //hotChildren
    hotChildren.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotChildren);
        }
    );
    //hotChildren diseases
    hotChildren.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age1', 'Year1', hotChildren);
        }
    );

    // hotSiblings
    hotSiblings.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotSiblings);
        }
    );
    hotSiblings.addHook('afterChange',
    function(changes, source) {
        syncAgeYob(changes, source, 'Age1', 'Year1', hotSiblings);
    }
);

    // hotGpp
    hotGpp.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotGpp);
        }
    );
    hotGpp.addHook('afterChange',
    function(changes, source) {
        syncAgeYob(changes, source, 'Age1', 'Year1', hotGpp);
    }
);

    // hotGpm
    hotGpm.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotGpm);
        }
    );
    hotGpm.addHook('afterChange',
    function(changes, source) {
        syncAgeYob(changes, source, 'Age1', 'Year1', hotGpm);
    }
);

    // hotFatherSiblings
    hotFatherSiblings.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotFatherSiblings);
        }
    );
    hotFatherSiblings.addHook('afterChange',
    function(changes, source) {
        syncAgeYob(changes, source, 'Age1', 'Year1', hotFatherSiblings);
    }
);

    // hotMotherSiblings
    hotMotherSiblings.addHook('afterChange',
        function(changes, source) {
            syncAgeYob(changes, source, 'Age', 'Yob', hotMotherSiblings);
        }
    );
    hotMotherSiblings.addHook('afterChange',
    function(changes, source) {
        syncAgeYob(changes, source, 'Age1', 'Year1', hotMotherSiblings);
    }
);
    //update age and yob
    function syncAgeYob(changes, source, colAge='Age', colYear='Yob', hotTable, deceasedIndex=2, refDate) {
        if(changes != null) {
            col = changes[0][1];
            row = changes[0][0];
            dead = hotTable.getSourceDataAtCell(row, deceasedIndex)
            if((source == 'edit') && (changes.length == 1) && (col == colAge || col == colYear) && (dead != 1)) {
                newValue = changes[0][3];
                if(refDate==undefined) {
                    var today = new Date();
                    var y = today.getFullYear();
                }else{
                    let d = refDate.split('/')[0],
                        m = refDate.split('/')[1],
                        year = refDate.split('/')[2];
                    var refYear=new Date(year, m, d);
                    var y = refYear.getFullYear();
                    if(year==undefined) return;
                }
                if (!setter) {
                    setter = true;
                    let colSync = (col == colAge ? colYear : colAge);
                    let value = (refDate==undefined ? y-newValue : (col == colAge ? newValue+y : newValue-y));
                    hotTable.setDataAtRowProp(row, colSync, value);
                } else {
                    setter = false;
                }
            }
        }
    }

    function cancer_init() {
        $("#cancer_table_div").hide();
        $('input[type=radio][name=cancer_radio]').on('change', function() {
            switch($(this).val()) {
                case 'cancer_Yes':
                    $("#cancer_table_div").show();
                    hotCancer.render();
                    break;

                case 'cancer_No':
                    $("#cancer_table_div").hide();
                    break;
            }
        });
    
        $("#cancer_input").on("blur", function () {
            $("#cancer_table_div").show();
        });
        $("#collapseCancer").click(function () {
            window.setTimeout(()=>{hotCancer.render();});
        });

    }

    function children_init() {
        $("#children_div").hide();
        $("#children_table_div").hide();
    
        $('input[type=radio][name=children_radio]').on('change', function() {
            switch($(this).val()) {
                case 'children_Yes':
                    $("#children_div").show();
                    hotChildren.render()
                    break;

                case 'children_No':
                    $("#children_div").hide();
                    $("#children_table_div").hide();
                    break;
            }
        });
    
        $("#children_input").on("blur", function () {
            var nchild = parseFloat($("#children_input").prop("value"));

            if(!isNaN(nchild)) {
                myDataChildren_new=[];
                for (let i = 0; i < nchild; i++) {
                    let ind = {"FamID": "1",
                                "Name": "Enfant"+(i+1), "Sex": "", "Deceased":"0","Age":"","Yob":""}
                    myDataChildren_new.push(ind)
                }
                hotChildren.loadData(myDataChildren_new);
            }

            $("#children_table_div").show();
            window.setTimeout(()=>{hotChildren.render();});

        });

        $("#collapseChildren").click(function () {
            window.setTimeout(()=>{hotChildren.render();});
        });
    }
    
    function siblings_init() {
        $("#siblings_div").hide();
        $("#siblings_table_div").hide();
    
        $('input[type=radio][name=siblings_radio]').on('change', function() {
            switch($(this).val()) {
                case 'siblings_Yes':
                    $("#siblings_div").show();

                    hotSiblings.render();
                    break;

                case 'siblings_No':
                    $("#siblings_div").hide();
                    $("#siblings_table_div").hide();
                    break;
            }
        });
    
        $("#siblings_input").on("blur", function () {
            var nSiblings = parseFloat($("#siblings_input").prop("value"));
            if(!isNaN(nSiblings)) {
                myDataSiblings_new=[];
                for (let i = 0; i < nSiblings; i++) {
                    let ind = {"FamID": "1",
                                "Name": "FS"+(i+1), "Sex": "", "Deceased":"0","Age":"","Yob":""}
                    myDataSiblings_new.push(ind)
                }
                hotSiblings.loadData(myDataSiblings_new);
            }
            $("#siblings_table_div").show();
            hotSiblings.render();

        });
        $("#collapseSiblings").click(function () {
            window.setTimeout(()=>{hotSiblings.render();});
        });

    }
    
    function gpp_init() {
        $("#collapseGpp").click(function () {
            window.setTimeout(()=>{hotGpp.render();});
            window.setTimeout(()=>{hotFatherSiblings.render();});
        });
    }

    function fatherSiblings_init() {
        $("#fatherSiblings_div").hide();
        $("#fatherSiblings_table_div").hide();
    
        $('input[type=radio][name=fatherSiblings_radio]').on('change', function() {
            switch($(this).val()) {
                case 'fatherSiblings_Yes':
                    $("#fatherSiblings_div").show();
                    hotFatherSiblings.render();
                    break;

                case 'fatherSiblings_No':
                    $("#fatherSiblings_div").hide();
                    $("#fatherSiblings_table_div").hide();
                    break;
            }
        });
    
        $("#fatherSiblings_input").on("blur", function () {
            var nFatherSiblings = parseFloat($("#fatherSiblings_input").prop("value"));
            if(!isNaN(nFatherSiblings)) {
                myDataFatherSiblings_new=[];
                for (let i = 0; i < nFatherSiblings; i++) {
                    let ind = {"FamID": "1",
                                "Name": "Ind"+(i+1), "Sex": "", "Deceased":"0","Age":"","Yob":""};
                    myDataFatherSiblings_new.push(ind);
                }
                hotFatherSiblings.loadData(myDataFatherSiblings_new);
            }
            $("#fatherSiblings_table_div").show();
            hotFatherSiblings.render();

        });

    }

    function gpm_init() {
        $("#collapseGpm").click(function () {
            window.setTimeout(()=>{hotGpm.render();});
            window.setTimeout(()=>{hotMotherSiblings.render();});
        });
    }

    function motherSiblings_init() {
        $("#motherSiblings_div").hide();
        $("#motherSiblings_table_div").hide();
    
        $('input[type=radio][name=motherSiblings_radio]').on('change', function() {
            switch($(this).val()) {
                case 'motherSiblings_Yes':
                    $("#motherSiblings_div").show();
                    hotMotherSiblings.render();
                    break;

                case 'motherSiblings_No':
                    $("#motherSiblings_div").hide();
                    $("#motherSiblings_table_div").hide();
                    break;
            }
        });
    
        $("#motherSiblings_input").on("blur", function () {
            var nMotherSiblings = parseFloat($("#motherSiblings_input").prop("value"));
            if(!isNaN(nMotherSiblings)) {
                myDataMotherSiblings_new=[];
                for (let i = 0; i < nMotherSiblings; i++) {
                    let ind = {"FamID": "1",
                                "Name": "Ind"+(i+1), "Sex": "", "Deceased":"0","Age":"","Yob":""};
                    myDataMotherSiblings_new.push(ind);
                }
                hotMotherSiblings.loadData(myDataMotherSiblings_new);
            }
            $("#motherSiblings_table_div").show();
            hotMotherSiblings.render();

        });
    }


// Set cancerList dialog form
    var selectedRow;
    var selectedColumn;
    var hotTable;
    hotCancer.addHook('afterSelectionEndByProp', //afterSelectionEnd //afterSelection //afterSelectionByProp
        function(row, column, row2, column2, preventScrolling, selectionLayerLevel) {
            let colDisease = "Cancer";
            selectedRow = row;
            selectedColumn = column
            if(selectedColumn == colDisease) {
                hotTable = hotCancer;
                dialogCancerList.dialog( "open" );
            }
            preventScrolling.value = true;
        }
    )
    var dialogCancerList;

	dialogCancerList = $( "#cancerList" ).dialog({
		autoOpen: false,
		classes: {
			"ui-dialog": "custom-background",
			"ui-dialog-titlebar": "custom-theme",
			"ui-dialog-title": "custom-theme text-center",
			"ui-dialog-content": "custom-background",
			"ui-dialog-buttonpane": "custom-background"
		},
		width: ($(window).width() > 400 ? 250 : $(window).width()- 30),
		maxHeight: 700,
        title: 'Localisation du cancer',
	})
    $(".ui-dialog-buttonset .ui-button").addClass('custom-btn');
	  
    function updateDiseasecol(hotTable, row, column) {
        let cancerType = $('input[name="cancerListradio"]:checked').val();
        hotTable.setDataAtRowProp(row, column, cancerType);
        $('input[name="cancerListradio"]:checked').prop('checked', false);
    }
    $('input[name="cancerListradio"]').on("click", function(e) {
        updateDiseasecol(hotTable, selectedRow, selectedColumn);
        dialogCancerList.dialog( "close" );
    })
});