
$(document).ready(function(){
	// save CanRisk
	$('#save_canrisk').on('click', function (e) {
		$('#save-canrisk-dialog').modal('show');
	});

	// CanRisk file save dialog
	$('#cr_file_save').on('click', function (e) {
		var this_canrisk;
		this_canrisk = get_non_anon_pedigree(pedcache.current(opts), get_meta());

		var famid = $('#famid').val().trim();
		if(famid.length > 0) {
			this_canrisk = this_canrisk.replace(/^XXXX/mg, famid);
		}

		var fname = ($( "#pid_fname").is(':checked') ? "canrisk_"+famid+".txt": "canrisk.txt");
		io.save_file(opts, this_canrisk, fname);
	})

	// get surgical ops and PRS for canrisk header
	get_meta=function() {
		let meta = io.get_surgical_ops();
		let prs;
		try {
			prs = io.get_prs_values();
			if(prs.breast_cancer_prs && prs.breast_cancer_prs.alpha !== 0 && prs.breast_cancer_prs.zscore !== 0) {
				meta += "\n##PRS_BC=alpha="+prs.breast_cancer_prs.alpha+",zscore="+prs.breast_cancer_prs.zscore;
			}

			if(prs.ovarian_cancer_prs && prs.ovarian_cancer_prs.alpha !== 0 && prs.ovarian_cancer_prs.zscore !== 0) {
				meta += "\n##PRS_OC=alpha="+prs.ovarian_cancer_prs.alpha+",zscore="+prs.ovarian_cancer_prs.zscore;
			}
		} catch(err) { alert("PRS", prs); }
		return meta;
	}

	get_pedigree=function(dataset, famid, meta, isanon, version=2) {
		let cancers = cancers_canrisk //language dependant

		let genetic_test1 = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'rad51d', 'rad51c', 'brip1'];
		let genetic_test2 = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'bard1', 'rad51d', 'rad51c', 'brip1'];

		let RISK_FACTOR_STORE = new Object();

		let msg = "##CanRisk " + (version === 1 ? "1.0" : "2.0");
		if(!famid) {
			famid = "XXXX";
		}
		if(meta) {
			msg += meta;
		}
		if(typeof isanon === 'undefined') {
			isanon = true;
		}
		// array of individuals excluded from the calculation
		let excl = $.map(dataset, function(p, _i){return 'exclude' in p && p.exclude ? p.name : null;});

		// female risk factors
		let probandIdx  = pedigree_util.getProbandIndex(dataset);
		let sex = 'F';
		if(probandIdx) {
			sex = dataset[probandIdx].sex;
		}

		if(sex !== 'M') {
			let menarche    = undefined //get_risk_factor('menarche_age');
			let parity      = undefined //get_risk_factor('parity');
			let first_birth = undefined //get_risk_factor('age_of_first_live_birth');
			let oc_use      = undefined //get_risk_factor('oral_contraception');
			let mht_use     = undefined //get_risk_factor('mht');
			let bmi         = undefined //get_risk_factor('bmi');
			let alcohol     = undefined //get_risk_factor('alcohol_intake');
			let menopause   = undefined //get_risk_factor('age_of_menopause');
			let mdensity    = undefined //get_risk_factor('mammographic_density');
			let hgt         = undefined //get_risk_factor('height');
			let tl          = undefined //get_risk_factor('Age_Tubal_ligation');
			let endo        = undefined //get_risk_factor('endometriosis');

			if(menarche !== undefined)
				msg += "\n##menarche="+menarche;
			if(parity !== undefined)
				msg += "\n##parity="+parity;
			if(first_birth !== undefined)
				msg += "\n##first_live_birth="+first_birth;
			if(oc_use !== undefined)
				msg += "\n##oc_use="+oc_use;
			if(mht_use !== undefined)
				msg += "\n##mht_use="+mht_use;
			if(bmi !== undefined)
				msg += "\n##BMI="+bmi;
			if(alcohol !== undefined)
				msg += "\n##alcohol="+alcohol;
			if(menopause !== undefined)
				msg += "\n##menopause="+menopause;
			if(mdensity !== undefined)
				msg += "\n##birads="+mdensity;
			if(hgt !== undefined)
				msg += "\n##height="+hgt;
			if(tl !== undefined)
				if(tl !== "n" && tl !== "N")
					msg += "\n##TL=Y";
				else
					msg += "\n##TL=N";

			if(endo !== undefined)
				msg += "\n##endo="+endo;
		}
		msg += "\n##FamID\tName\tTarget\tIndivID\tFathID\tMothID\tSex\tMZtwin\tDead\tAge\tYob\tBC1\tBC2\tOC\tPRO\tPAN\tAshkn"

		let gt = (version === 1 ? genetic_test1 : genetic_test2);
		for(let i=0; i<gt.length; i++) {
			msg += "\t"+gt[i].toUpperCase();
		}
		msg += "\tER:PR:HER2:CK14:CK56";

		for(let i=0; i<dataset.length; i++) {
			let p = dataset[i];
			if($.inArray(p.name, excl) != -1) {
				console.log('EXCLUDE: '+p.name);
				continue;
			}

			msg += '\n'+famid+'\t';		
			// max 13 chars
			if(isanon)
				msg += i+'\t';													// display_name (ANONIMISE) max 8 chars
			else
				msg += (p.display_name ? p.display_name : "NA")+'\t';
			msg += ('proband' in p ? '1' : 0)+'\t';
			msg += p.name+'\t';													// max 7 chars
			msg += ('father' in p && !('noparents' in p) && ($.inArray(p.mother, excl) == -1)? p.father : 0)+'\t';	// max 7 chars
			msg += ('mother' in p && !('noparents' in p) && ($.inArray(p.mother, excl) == -1)? p.mother : 0)+'\t';	// max 7 chars
			msg += p.sex+'\t';
			msg += ('mztwin' in p ? p.mztwin : 0)+'\t'; 						// MZtwin
			msg += ('status' in p ? p.status : 0)+'\t';							// current status: 0 = alive, 1 = dead
			msg += ('age' in p ? p.age : 0)+'\t';								// Age at last follow up or 0 = unspecified
			msg += ('yob' in p ? p.yob : 0)+'\t';								// YOB or 0 = unspecified

			// bug if fr
			$.each(cancers, function(cancer, diagnosis_age) {
				// Age at 1st cancer or 0 = unaffected, AU = unknown age at diagnosis (affected unknown)
				if(diagnosis_age in p)
					msg += (diagnosis_age in p ? p[diagnosis_age] : 'AU')+'\t';
				else
					msg += '0\t';
			});

			// Ashkenazi status, 0 = not Ashkenazi, 1 = Ashkenazi
			msg += ('ashkenazi' in p ? p.ashkenazi : 0)+'\t';

			for(let j=0; j<gt.length; j++) {
				if(gt[j]+'_gene_test' in p &&
				p[gt[j]+'_gene_test']['type'] !== '-' &&
				p[gt[j]+'_gene_test']['result'] !== '-') {
					msg += p[gt[j]+'_gene_test']['type'] + ':';
					msg += p[gt[j]+'_gene_test']['result'] + '\t';
				} else {
					msg += '0:0\t';		// type, 0=untested, S=mutation search, T=direct gene test
										// result, 0=untested, P=positive, N=negative
				}
			}
			

			for(let j=0; j<io.pathology_tests.length; j++) {
				// status, 0 = unspecified, N = negative, P = positive
				if(io.pathology_tests[j]+'_bc_pathology' in p) {
					msg += p[io.pathology_tests[j]+'_bc_pathology'];
					console.log('pathology '+p[io.pathology_tests[j]+'_bc_pathology']+' for '+p.display_name);
				} else {
					msg += '0';
				}
				if(j<(io.pathology_tests.length-1))
					msg += ":";
			}
			// alert(msg) // bug si pathos non anglais (patho-diagnosis_age)
			
		}

		// console.log(msg, RISK_FACTOR_STORE);
		// alert(msg, RISK_FACTOR_STORE);
		return msg;
	}

	get_non_anon_pedigree=function(dataset, meta) {
		return get_pedigree(dataset, undefined, meta, false);
	}
})