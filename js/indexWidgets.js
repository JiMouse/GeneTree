
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
	//   width: ($(window).width() > 400 ? 540 : $(window).width()- 30)
	modal: true,
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

		// set variables
		// old_key  = ['FamID','Name','IndivID','FathID','MothID','Sex', 'Affected', 'Deceased','Yob', 'Age'];

		//name
		var name = obj[index]['Name'];
		$( "#form_id_name" ).val(name);

		//sex <- in case unknow ?
		var sex = obj[index]['Sex'];
		$("input[name=sex][value="+sex+"]").prop("checked",true);

		//comment
		$( "#form_id_comment" ).val(obj[index]['comment']);

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

		//sex
		obj[index]['Sex'] = $('input[name="sex"]:checked').val();

		//comment
		obj[index]['comment'] = $( "#form_id_comment" ).val();


		//reinject in hot (whole table)
		hot.loadData(obj);

		//close dialog
		dialog.dialog( "close" );
	}

	//tabs
	$( '#bc_pathology #gene_test' ).hide(); //#cancer #bc_pathology #gene_test
	
	$('#tablist li').click(function(e) {
	  $('#info .hideTab').hide(); //<= bug
	  $('#tablist .current').removeClass("ui-tab ui-tabs-active ui-state-active current");
	  $(this).addClass('ui-tab ui-tabs-active ui-state-active current');

	  var clicked = $(this).find('a:first').attr('href');
	  $('#info ' + clicked).fadeIn('fast');
	  e.preventDefault();
	}).eq(0).addClass('current');
	
});