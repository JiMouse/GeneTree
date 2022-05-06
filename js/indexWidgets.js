
$(document).ready(function(){
	
	// Set dialog form
	var dialog, obj, index;
	var sex;
	var width;
	width = ($(window).width() > 400 ? 480 : $(window).width()- 30)
	dialog = $( "#supp_info" ).dialog({
		autoOpen: false,
		classes: {
			"ui-dialog": "custom-background",
			"ui-dialog-titlebar": "custom-theme",
			"ui-dialog-title": "custom-theme text-center",
			// "ui-dialog-titlebar-close":"custom-btn",
			"ui-dialog-content": "custom-background",
			"ui-dialog-buttonpane": "custom-background"
		},
		width: width,
		maxHeight: 700,
		// modal: true,
		buttons: {
			"Sauvegarder": updateHot,
			"Annuler": function() {
				$( this ).dialog( "close" );
			}
		}
	})
	$(".ui-dialog-buttonset .ui-button").addClass('custom-btn');
	   
	// Set onclick action
	$( "#supp_edit_info" ).on( "click", function() {
		//load hot and selected row
		var hotObj=hot

		if(typeof(hotObj) !== 'undefined') {
			let deepObj = JSON.stringify(hotObj.getSourceData());
			try {
				obj=JSON.parse(deepObj);
				index = hotObj.getSelectedLast()[0]; //selected row
				} catch (error) {
					obj=JSON.parse(deepObj);
					index = 0;
				// alert(lang.noIndSelected);
				}
		}

		//name
		var name = obj[index]['Name'];
		$( "#form_id_name" ).val(name);

		//proband
		let proband = obj[index].hasOwnProperty("proband");
		$("#proband").prop("checked", proband);
		//to do => switch proband

		//civil_name
		$( "#civil_name" ).val(obj[index]['civil_name']);

		//Date of birth
		$( "#dbirth" ).val(obj[index]['dbirth']);

		$("#dbirth").inputmask({
			alias: "datetime", inputFormat: "dd/mm/yyyy", placeholder: "jj/mm/aaaa"
		})
			
		//Update linked fields ; age, yob, age at first birth
		$('#dbirth').on('change', function() { 
			//year of birth
			let yob = $(this).val().split('/')[2];
			if(yob!=undefined) {
				obj[index]['Yob'] = yob;

				//Age
				var month = Number($(this).val().split('/')[1]) - 1;
				var day = Number($(this).val().split('/')[0]);
				var today = new Date();
				var age = today.getFullYear() - yob;	

				if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
					age--;
				}
				obj[index]['Age'] = age

				//update age at first birth
				let first_birth = getOlderChild(obj,index)
				if(first_birth!= undefined) {
					first_birth=first_birth-Number(obj[index].Yob);
					$( "#first_birth" ).val(first_birth);
				}
			}
		});
		
		//sex
		sex = obj[index]['Sex'];
		$("input[name=sex][value="+sex+"]").prop("checked",true);
		if(sex == undefined || sex == 'F') {
			$( '#bc_pathology #gene_test' ).hide();
			let clicked = $(this).find('a:first').attr('href');
			if(clicked == '#canrisk' || clicked == undefined) $( '#canrisk' ).show()
		} else {
			$( '#canrisk' ).hide();
		}

		//comment
		$( "#form_id_comment" ).val(obj[index]['comment']);

		//genetic tests 
		let tests = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'rad51d', 'rad51c', 'brip1'];
		for (let j = 0; j < tests.length; j++) {
			if(obj[index].hasOwnProperty(tests[j]+'_gene_test')) {
				$( '#'+tests[j]+'_gene_test' ).val(obj[index][tests[j]+'_gene_test']['type']);
				$( '#'+tests[j]+'_gene_test'+'_result' ).val(obj[index][tests[j]+'_gene_test']['result']);	
			}
		};

		//CanRisk
		if(sex == 'F') {
			$( "#menarche" ).val(obj[index]['menarche']);

			$( "#parity" ).val(getChildNumber(obj, index).parity);
			function getChildNumber(obj, i) {
				// old_key  = ['FamID','Name','IndivID','FathID','MothID','Sex', 'Affected', 'Deceased','Yob', 'Age'];
				let child = [];
				for (var k = 0; k < obj.length; k++) {
					if (obj[k].Sex == "U") continue
					if (obj[k]['FathID'] == obj[i]['IndivID'] || obj[k]['MothID'] == obj[i]['IndivID']) {
						if (obj[k]['Option']=='FCS' || obj[k]['Option']=='IMG' ) continue
						child.push(k)
					};
				};
				let result = {
					parity:child.length,
					index:child
				}
				return result
			}

			function getOlderChild(obj, index) {
				if(getChildNumber(obj, index).parity>0) {
					//find older child ?
					let child = getChildNumber(obj, index).index;
					for (var i = 0; i < child.length; i++) {
						k = child[i];
						if(obj[k].Yob == '' || obj[k].Yob == undefined) continue;
						if(typeof older_child == 'undefined'){
							var older_child = obj[k].Yob;
						} else {
							older_child = (Number(obj[k].Yob) < Number(older_child) ? obj[k].Yob : older_child);
						}
					};
					return Number(older_child);
				}
			}	

			//update first birth
			let first_birth = getOlderChild(obj,index)
			if(first_birth!= undefined) {
				first_birth=first_birth-Number(obj[index].Yob);
				$( "#first_birth" ).val(first_birth);
			}

			// CanRisk env. factors
			// $( "#oc_use" ).val(obj[index]['oc_use']);
			// $( "#mht_use" ).val(obj[index]['mht_use']);
			$( "#bmi" ).val(obj[index]['bmi']);
			// $( "#alcohol" ).val(obj[index]['alcohol']);
			$( "#menopause" ).val(obj[index]['menopause']);
			$( "#mdensity" ).val(obj[index]['mdensity']);
			$( "#hgt" ).val(obj[index]['hgt']);
			loadKeyObjectToJSform(obj,index, 'wgt');
			$( "#tl" ).val(obj[index]['tl']);
			$( "#endo" ).val(obj[index]['endo']);
			$( "#ovary2" ).val(obj[index]['ovary2']);
			$( "#mast2" ).val(obj[index]['mast2']);

			//Anapath fields
			$( "#er_bc_pathology" ).val(obj[index]['er_bc_pathology']);
			$( "#pr_bc_pathology" ).val(obj[index]['pr_bc_pathology']);
			$( "#her2_bc_pathology" ).val(obj[index]['her2_bc_pathology']);
			$( "#ck14_bc_pathology" ).val(obj[index]['ck14_bc_pathology']);
			$( "#ck56_bc_pathology" ).val(obj[index]['ck56_bc_pathology']);
		}

		//oc use
		oc_use = obj[index]['oc_use'];
		if(oc_use == undefined) {
			$("#oc_use").val('-');
		} else {
			if(oc_use == 'N') {
				$("#oc_use").val('N');
			} else {
				$("#oc_use").val('Y');
				$("input[name=oc_usage][value=Yes]").prop("checked",true)
				if(oc_use.replace("<","").split(':')[0] == 'C') {
					$('input[name=oc_use_2_radio][value=Yes]').prop("checked",true)
				} else {$('input[name=oc_use_2_radio][value=No]').prop("checked",true)}
				$("input[name=OC_yrs_radio][value="+oc_use.replace("<","").split(':')[1]+"]").prop("checked",true)
			}
		}

		//alcohol
		alcohol = obj[index]['alcohol'];
		if(alcohol>0) $("#alcohol").val('Y');

		//mht_use
		mht_use = obj[index]['mht_use'];
		if(mht_use>0) $("#mht_use").val('Y');

		let n =0;
		n = obj[index]['mht_use_yrs'];
		if(n>0) $("#mht_use_yrs").val(n);

		//title
		dialog.dialog({title: name})
		dialog.dialog( "option", "width", width);
		dialog.dialog( "open" );
	});

	function updateHot() {
		//update obj
		//name
		obj[index]['Name'] = $( "#form_id_name" ).val();

		//proband

		//civil_name
		addKeyToObject(obj, index, 'civil_name')

		//date of birth
		addKeyToObject(obj, index, 'dbirth')

		//sex
		obj[index]['Sex'] = $('input[name="sex"]:checked').val();

		//comment
		addKeyToObject(obj, index, 'comment', 'form_id_comment');

		//height, weight and BMI
		// addKeyToObject(obj, index, 'hgt');
		// addKeyToObject(obj, index, 'wgt');
		
		//calculate BMI
		let bmi;
		if(obj[index].hasOwnProperty('wgt') && obj[index].hasOwnProperty('hgt')) {
			bmi = Number(obj[index].wgt) / ((obj[index].hgt/100)*(obj[index].hgt/100));
			obj[index]['bmi'] = bmi.toFixed(2);
		}
		
		//genetic tests
		let tests = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'rad51d', 'rad51c', 'brip1'];
		for (let j = 0; j < tests.length; j++) {
			let key = tests[j]+'_gene_test',
				test_type = $( "#"+key ).val(),
				key_result = key+'_result',
				test_result = $( "#"+key_result ).val();
			
			// delete empty field
			if(test_type=="" || test_type=="-")
				delete obj[index][key];
			if(test_result=="" || test_result=="-")
				delete obj[index][key_result];
			
			//update field
			if((test_type === 'S' || test_type === 'T') && (test_result === 'P' || test_result === 'N'))
				obj[index][key]= {'type': test_type, 'result': test_result};
		};

		//CanRisk fields
		sex = $('input[name="sex"]:checked').val();
		if(sex == 'F') {
			let Canriskfield=['menarche','parity','first_birth','menopause','mdensity','hgt','tl','endo', 'ovary2','mast2']; //except bmi ,'oc_use','alcohol','mht_use'
			for (let j = 0; j < Canriskfield.length; j++) {  
				addKeyToObject(obj, index, Canriskfield[j])
			};

			let anapath=['er_bc_pathology','pr_bc_pathology','her2_bc_pathology','ck14_bc_pathology','ck56_bc_pathology'];
			for (let j = 0; j < anapath.length; j++) {  
				addKeyToObject(obj, index, anapath[j])
			};
		}

		//reinject in hot (whole table)
		hot.loadData(obj);

		//close dialog
		dialog.dialog( "close" );
	}

	addKeyToObject=function(obj,i, key, jsname=key){
		if($( "#"+jsname ).val()=="") {
			delete obj[i][key];
		} else if($( "#"+jsname ).val()!=null && $( "#"+jsname ).val()!=undefined) {
			obj[i][key]=$( "#"+jsname ).val();
		}
	}

	loadKeyObjectToJSform=function(obj,i, key, jsname=key){
		$( "#"+jsname ).val(obj[i][key]);
	}

	$('#tablist li').click(function(e) {
		// let sex=$('input[name="sex"]:checked').val();
		var clicked = $(this).find('a:first').attr('href');

		//avoid canrisk appearance if not woman
		if(clicked == '#canrisk' && sex != 'F') return

	  	$('#info .hideTab').hide();
	  	$('#tablist .current').removeClass("current custom-btn-light");
	  	$(this).addClass('current custom-btn-light');
	  	$('#info ' + clicked).fadeIn('fast');
	  	e.preventDefault();
	}).eq(0).addClass('current');

	// oc_use
	dialogOc_use = $("#oc_use_div").dialog({
		autoOpen: false,
		classes: {
			"ui-dialog": "custom-background",
			"ui-dialog-titlebar": "custom-theme",
			"ui-dialog-title": "custom-theme text-center",
			// "ui-dialog-titlebar-close":"custom-btn",
			"ui-dialog-content": "custom-background",
			"ui-dialog-buttonpane": "custom-background"
		},
		width: ($(window).width() > 400 ? 420 : $(window).width()- 30),
		height: 440,
		modal: true,
		title: "Usage d'une contraception orale (pilule)",
		buttons: {
			"Sauvegarder": function() {
				if($('input[name="oc_use_2_radio"]:checked').val()=='Yes') {
					oc_use = "C"
				} else {
					oc_use = "F"
				}
				oc_use_tmp=$('input[name="OC_yrs_radio"]:checked').val();
				oc_use+=':' + (oc_use_tmp=='1' ? '<' : '') + oc_use_tmp
				obj[index]['oc_use']=oc_use;
				$( this ).dialog( "close" );
			},
			"Annuler": function() {
				$( this ).dialog( "close" );
			}
		}
	})
	$(".ui-dialog-buttonset .ui-button").addClass('custom-btn');

	let oc_use;
	$("#oc_use").on("change", function () { 
		let oc_use_cat =$("#oc_use").val();
		if(oc_use_cat == "Y") {
			$("input[name=oc_usage][value=Yes]").prop("checked",true)
			dialogOc_use.dialog( "open" );
		} else {
			oc_use="N";
			obj[index]['oc_use']=oc_use;
		}
	});

	// alcohol
	dialogAlcohol = $("#alcohol_div").dialog({
		autoOpen: false,
		classes: {
			"ui-dialog": "custom-background",
			"ui-dialog-titlebar": "custom-theme",
			"ui-dialog-title": "custom-theme text-center",
			// "ui-dialog-titlebar-close":"custom-btn",
			"ui-dialog-content": "custom-background",
			"ui-dialog-buttonpane": "custom-background"
		},
		width: ($(window).width() > 400 ? 400 : $(window).width()- 30),
		height: 340,
		modal: true,
		title: "Consommation alcoolique",
		buttons: {
			"Sauvegarder": function() {
				alcohol=0;
				let wine = $("#wine").prop("value");
				if(!isNaN(wine)) alcohol += wine*(15.40)

				let pint = $("#pint").prop("value");
				if(!isNaN(pint)) alcohol += pint*(15.40)

				let beer = $("#beer").prop("value");
				if(!isNaN(beer)) alcohol += beer*(15.40)

				let shots = $("#shots").prop("value");
				if(!isNaN(shots)) alcohol += shots*(15.40)

				obj[index]['alcohol']=alcohol;
				if(alcohol==0) $("#alcohol").val("0")
				$( this ).dialog( "close" );
			},
			"Annuler": function() {
				obj[index]['alcohol']=0;
				$("#alcohol").val("0")
				$( this ).dialog( "close" );
			}
		}
	})

	let alcohol=0;
	$("#alcohol").on("change", function () { 
		let alcohol_cat =$("#alcohol").val();
		if(alcohol_cat == "Y") {
			dialogAlcohol.dialog( "open" );
		} else {
			alcohol=0;
			obj[index]['alcohol']=alcohol;
		}
	});

	// mht_use
	dialogMht_use = $("#mht_use_div").dialog({
		autoOpen: false,
		classes: {
			"ui-dialog": "custom-background",
			"ui-dialog-titlebar": "custom-theme",
			"ui-dialog-title": "custom-theme text-center",
			// "ui-dialog-titlebar-close":"custom-btn",
			"ui-dialog-content": "custom-background",
			"ui-dialog-buttonpane": "custom-background"
		},
		width: ($(window).width() > 400 ? 600 : $(window).width()- 30),
		maxHeight: 500,
		modal: true,
		title: "Traitement hormonal substitutif (THS)",
		buttons: {
			"Sauvegarder": function() {
				mht_use_section();		
				obj[index]['mht_use']=mht_use;
				$( this ).dialog( "close" );
			},
			"Annuler": function() {
				obj[index]['mht_use']='N';
				$("#mht_use").val("N");
				$( this ).dialog( "close" );
			}
		}
	})

	let mht_use;
	$("#mht_use").on("change", function () { 
		let mht_use_cat =$("#mht_use").val();
		if(mht_use_cat == "Y") {
			mht_use_section();
			dialogMht_use.dialog( "open" );
		} else {
			mht_use="N";
			obj[index]['mht_use']=mht_use;
		}
	});
	function mht_use_section(){
		$('#mhc_use_type').hide()
		// use in the last five years ?
		$('input[type=radio][name=mht_use_5]').on('change', function() {
			switch($(this).val()) {
				case 'No':
					mht_use="E";
					$('#mhc_use_type').hide()
				break;
				default:  // KnownCtype, KnownOthertype, Unknown
					$('#mhc_use_type').show()
					mht_use= "C";
				break;
			}
		});

		$('input[type=radio][name=A3_4_3_radio]').on('change', function() {
			//type ?
			switch($(this).val()) {
				case 'KnownEtype':
					mht_use="E";
				break;
				default:  // KnownCtype, KnownOthertype, Unknown
					mht_use= "C";
				break;
			}
		});

		$("#mht_use_yrs").on("blur", function () {
            var n = parseFloat($("#mht_use_yrs").prop("value"));
            if(!isNaN(n)) {
				obj[index]['mht_use_yrs']=n;
            }
        });

	}

	$("#select_all_gene_tests").on('change', function (e) {
		if(this.value === "S") {
			// select all mutation search to be negative
			$("#gene_test").find("select[name$='_gene_test']").val("S").change();
			$("#gene_test").find("select[name$='_gene_test_result']").val("N").change();
		} else if(this.value === "T") {
			// select all direct gene tests to be negative
			$("#gene_test").find("select[name$='_gene_test']").val("T").change();
			$("#gene_test").find("select[name$='_gene_test_result']").val("N").change();
		} else if(this.value === "N") {
			// select all gene tests to be negative
			$("#gene_test").find("select[name$='_gene_test_result']").val("N").change();
		} else if(this.value === "reset") {
			$("#gene_test").find("select[name$='_gene_test']").val("-").change();
			$("#gene_test").find("select[name$='_gene_test_result']").val("-").change();
		}
	});


});