
$(document).ready(function(){
	
	// Set dialog form
	var dialog, obj, index;
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
		width: ($(window).width() > 400 ? 420 : $(window).width()- 30),
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
		//obj[i].proband
		// if ($( "#proband" ).checked == true)

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

				// obj[index]['first_birth'] =
			}
		});
		
		
		//sex
		var sex = obj[index]['Sex'];
		$("input[name=sex][value="+sex+"]").prop("checked",true);
		// hide can risk tab if not F
		if (sex != 'F') {
			$( '#canrisk' ).hide();
			//disable
		}
		
		//comment
		$( "#form_id_comment" ).val(obj[index]['comment']);

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
					for (var k = 0; k < child.length; k++) {
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

			let first_birth = getOlderChild(obj,index)
			if(first_birth!= undefined) {
				first_birth=first_birth-Number(obj[index].Yob)
				$( "#first_birth" ).val(first_birth);
			}

			$( "#oc_use" ).val(obj[index]['oc_use']);
			$( "#mht_use" ).val(obj[index]['mht_use']);
			$( "#bmi" ).val(obj[index]['bmi']);
			$( "#alcohol" ).val(obj[index]['alcohol']);
			$( "#menopause" ).val(obj[index]['menopause']);
			$( "#mdensity" ).val(obj[index]['mdensity']);
			$( "#hgt" ).val(obj[index]['hgt']);
			$( "#tl" ).val(obj[index]['tl']);
			$( "#endo" ).val(obj[index]['endo']);
			$( "#ovary2" ).val(obj[index]['ovary2']);
			$( "#mast2" ).val(obj[index]['mast2']);
		}
		//title
		dialog.dialog({
			title: name
		})
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
		addKeyToObject(obj, index, 'comment', 'form_id_comment')

		//CanRisk fields
		sex = $('input[name="sex"]:checked').val();
		if(sex == 'F') {
			let Canriskfield=['menarche','parity','first_birth','oc_use','mht_use','bmi','alcohol','menopause','mdensity','hgt','tl','endo', 'ovary2','mast2'];

			for (let j = 0; j < Canriskfield.length; j++) {  
				addKeyToObject(obj, index, Canriskfield[j])
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

	//tabs
	$( '#bc_pathology #gene_test' ).hide(); //#cancer #bc_pathology #gene_test

	$('#tablist li').click(function(e) {
		let sex=$('input[name="sex"]:checked').val();
		var clicked = $(this).find('a:first').attr('href');

		//avoid canrisk appearance if not woman
		if(clicked == '#canrisk' && sex != 'F') return

	  	$('#info .hideTab').hide();
	  	$('#tablist .current').removeClass("current custom-btn-light");
	  	$(this).addClass('current custom-btn-light');
	  	$('#info ' + clicked).fadeIn('fast');
	  	e.preventDefault();
	}).eq(0).addClass('current');
	
});