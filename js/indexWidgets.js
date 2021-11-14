
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
		// add on change => yob
		
		//sex
		var sex = obj[index]['Sex'];
		$("input[name=sex][value="+sex+"]").prop("checked",true);

		//comment
		$( "#form_id_comment" ).val(obj[index]['comment']);

		//CanRisk
		$( "#menarche" ).val(obj[index]['menarche']);
		$( "#parity" ).val(obj[index]['parity']);
		$( "#first_birth" ).val(obj[index]['first_birth']);
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
		//add to text

		//date of birth
		addKeyToObject(obj, index, 'dbirth')
		//add to text


		//sex
		obj[index]['Sex'] = $('input[name="sex"]:checked').val();

		//comment
		addKeyToObject(obj, index, 'comment', 'form_id_comment')

		//CanRisk fields
		let Canriskfield=['menarche','parity','first_birth','oc_use','mht_use','bmi','alcohol','menopause','mdensity','hgt','tl','endo', 'ovary2','mast2'];

		for (let j = 0; j < Canriskfield.length; j++) {  
			addKeyToObject(obj, index, Canriskfield[j])
		};

		//reinject in hot (whole table)
		hot.loadData(obj);

		//close dialog
		dialog.dialog( "close" );
	}

	addKeyToObject=function(obj,i, key, jsname=key){
		if($( "#"+jsname ).val()!=null && $( "#"+jsname ).val()!="" & $( "#"+jsname ).val()!=undefined) {
			obj[i][key]=$( "#"+jsname ).val();
		}
	}

	//tabs
	$( '#bc_pathology #gene_test' ).hide(); //#cancer #bc_pathology #gene_test
	
	$('#tablist li').click(function(e) {
	  $('#info .hideTab').hide();
	  $('#tablist .current').removeClass("current custom-btn-light");
	  $(this).addClass('current custom-btn-light');


	  var clicked = $(this).find('a:first').attr('href');
	  $('#info ' + clicked).fadeIn('fast');
	  e.preventDefault();
	}).eq(0).addClass('current');
	
});