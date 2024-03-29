function getPatho(obj, i,text_neg, text_pos) {
  let keys = Object.keys(obj[i]),
      tag = '_diagnosis_age',
      result = '';
  
  let comment = (obj[i].hasOwnProperty('comment') ? ' ('+obj[i].comment+')' : '')
  if (!keys.join().includes(tag)) return text_neg + comment

  for (var j = 0; j < keys.length; j++) {  
    if (keys[j].indexOf(tag) !== -1) {
      let out = keys[j].substring(0, keys[j].length - tag.length),
          a = obj[i][keys[j]],
          y = Number(obj[i].yob) + Number(a);
      result = (result != '' ? result + " et d'un " : text_pos);
      result += cleanDiseaseText(out);
      if(a != "" && a != null) {
        result += " diagnostiqué";
        if(obj[i].yob != "" && obj[i].yob != null) result += " en " + y; 
        result += " à l'âge de " + a + " ans";
      }
    };
  }; return result + comment
}

function buildStoryText(obj) { //Meta function to build story
  let indexRow = getIndexRow(obj);  
  let text,
      father = getRowPedigreeJS(obj, obj[indexRow].father),
      mother = getRowPedigreeJS(obj, obj[indexRow].mother);

  if(!obj[father].hasOwnProperty('noparents')) var gpp = getRowPedigreeJS(obj, obj[father].father);
  if(!obj[father].hasOwnProperty('noparents')) var gmp = getRowPedigreeJS(obj, obj[father].mother);
  if(!obj[mother].hasOwnProperty('noparents')) var gpm = getRowPedigreeJS(obj, obj[mother].father);
  if(!obj[mother].hasOwnProperty('noparents')) var gmm = getRowPedigreeJS(obj, obj[mother].mother);
  
  text = textIndex(obj, indexRow) + '<br>';
  text += '<br>' + "Son père" + textline(obj, father);
  text += '<br>' + "Sa mère" + textline(obj, mother);

  if(typeof(gpp) !== 'undefined') text += '<br>' + "Son grand-père paternel" + textline(obj, gpp);
  if(typeof(gmp) !== 'undefined') text += '<br>' + "Sa grand-mère paternelle" + textline(obj, gmp);
  if(typeof(gpm) !== 'undefined') text += '<br>' + "Son grand-père maternel" + textline(obj, gpm);
  if(typeof(gmm) !== 'undefined') text += '<br>' + "Sa grand-mère maternelle" + textline(obj, gmm);

  // Final polishing
  text = text.replace(/ \) \(/g, ''); //remove ") ("
  text = text.replace(/  /g, ' '); //replace double space by simple space
  text = text.replace(/\) \(/g, ', '); //replace ) (  by ", "
  text = text.replace(/un enfant : /g, ''); //remove "un enfant : " 
  return text;
}

function textIndex(obj, i){
  let result = {'index':'', 'child':'', 'fratrie':''},
      sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');
  
  //civil
  result.index = textCivil(obj,i);
  result.index += "se présente en consultation de génétique pour évaluation d'une éventuelle prédisposition familiale";
  
  // motif de consultation
  let text_neg = '. ' + dico.pronom[sex] + ' ne présente pas, au jour de la consultation, de pathologie cancéreuse',
      text_pos = " dans le cadre d'un ";
  result.index += getPatho(obj, i,text_neg, text_pos)+'.';

  //add anapath fields
  let msg="";
  let er_bc_pathology = obj[i]['er_bc_pathology'];
  let pr_bc_pathology = obj[i]['pr_bc_pathology'];
  let her2_bc_pathology = obj[i]['her2_bc_pathology'];
  let ck14_bc_pathology = obj[i]['ck14_bc_pathology'];
  let ck56_bc_pathology = obj[i]['ck56_bc_pathology'];

  if(er_bc_pathology !== undefined)
    msg += 'sensible aux oestrogène.'
  if(pr_bc_pathology !== undefined)
    msg += 'sensible à la progestérone.'
  if(her2_bc_pathology !== undefined)
    msg += 'HER2-positif.'
  if(ck14_bc_pathology !== undefined)
    msg += 'CK14-positif.'
  if(ck56_bc_pathology !== undefined)
    msg += 'CK56-positif.'

  //add canrisk infos
  let menarche    = obj[i]['menarche'];
  let parity      = obj[i]['parity'];
  let first_birth = obj[i]['first_birth'];
  let oc_use      = obj[i]['oc_use'];
  let mht_use     = obj[i]['mht_use'];
  let bmi         = obj[i]['bmi'];
  let alcohol     = obj[i]['alcohol'];
  let menopause   = obj[i]['menopause'];
  let mdensity    = obj[i]['mdensity'];
  let hgt         = obj[i]['hgt'];
  let wgt         = obj[i]['wgt'];
  let tl          = obj[i]['tl'];
  let endo        = obj[i]['endo'];

  if(menarche !== undefined) {
    msg += '. ' + dico.pronom[sex] + " avait "+menarche+" ans à l'âge de la ménarche.";
  } else {msg += '.'}
  // if(parity !== undefined)
  //   msg += dico.pronom[sex] + "\n##parity="+parity+".";
  if(first_birth !== undefined)
    msg += ' ' + dico.pronom[sex] + " avait "+first_birth+" ans lors de la naissance de son premier enfant.";
  if(oc_use !== undefined) {
    let oc_use_msg = ' ' + dico.pronom[sex];
    if(oc_use == 'N') {
      oc_use_msg += " n'a pas pris de pillule contraceptive oestroprogestative"
    } else {
      oc_use_msg += " a pris une pillule contraceptive oestroprogestative"
      let oc_use_yrs = oc_use.replace("<","").split(':');
      if(oc_use_yrs[0] == 'C') {
        oc_use_msg += " (au cours de ces deux derniers années)"
      }
      oc_use_msg += " pendant " + lang["OC_yrs_radio"+oc_use_yrs[1]+"_txt"] + "."
    }
    msg += oc_use_msg;
  }
  if(mht_use !== undefined)
    msg += ' ' + dico.pronom[sex] + " a bénéficié d'un traitement hormonal substitutif";
    msg += (obj[i]['mht_use_yrs'] !== undefined ? ' pendant une durée cumulée de '+obj[i]['mht_use_yrs']+' ans.':'.')
  if(bmi !== undefined)
    msg += " Son IMC est calculé à "+bmi.replace('.',',') +" kg/m².";
  if(hgt !== undefined)
    msg += " Sa taille est de "+hgt+" cm.";
  if(wgt !== undefined)
    msg += " Son poids est de "+wgt+" kg.";
  if(alcohol !== undefined)
    msg += " Sa consommation alcoolique quotidienne moyenne est de "+alcohol+" g/j.";
  if(menopause !== undefined)
    msg += ' ' + dico.pronom[sex] + " avait "+menopause+" ans à l'âge de la ménopause.";
  if(mdensity !== undefined)
    msg += ' Son score BiRads (densité mamaire) est «'+mdensity+'» (' + lang.mdensity[mdensity] + ').';
  if(tl !== undefined)
    msg += ' ' + dico.pronom[sex] + "\n##tl="+tl+".";
  if(endo !== undefined)
    msg += ' ' + dico.pronom[sex] + "\n##endo="+endo+".";

  msg=msg.slice(0,-1)   //remove last dot

  // // add genetic test if positive
  let tests = ['brca1', 'brca2', 'palb2', 'atm', 'chek2', 'rad51d', 'rad51c', 'brip1'];
  let msg_test=''
  for (let j = 0; j < tests.length; j++) {
    if(obj[i].hasOwnProperty(tests[j]+'_gene_test') && obj[i][tests[j]+'_gene_test']['result'] == 'P') {
      msg_test = (msg_test === '' ? tests[j].toUpperCase() + '+' : msg_test + ' ,'+tests[j].toUpperCase() + '+') ;	
    }
  };
  if(msg_test != '')
    msg = msg.slice(0, -1) + ' ('+msg_test+')'+'.'; //remove last char

  if(msg !== undefined && msg != '')
    result.index = result.index.slice(0, -1) + msg;

  //fratrie
  let text_frat_neg = "" + dico.pronom[sex] + ' ' + dico.etre[status] + " enfant unique.";
  result.fratrie = getFratList(obj,i,text_frat_neg);

  //enfant & conjoint
  let text_child_neg = "" + dico.pronom[sex] + " n'a pas d'enfant.";
  result.child = getChildList(obj,i,text_child_neg);  

  //final
  return result.index + '<br>' + result.fratrie + '<br>' + result.child
}

function textline(obj, i){
  let result = {'civil':'', 'patho':'', 'child':'', 'fratrie':''},
      sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');

  //nom
  let name = (keyExist(obj[i],'civil_name') ? ', ' + dico.civil[sex] + ' ' + obj[i].civil_name + ',' :'')
  
  //civil
  result.civil = textCivil(obj,i)
  if(result.civil!='') {result.civil = ' ' + dico.etre[status] + ' ' + result.civil}
  
  //patho
  let text_neg = (result.civil!='' ? '. ' + dico.pronom[sex] : '')  + ' ne '+ dico.presenter[status] + ' pas de pathologie cancéreuse',
      text_pos = (result.civil!='' ? '. ' + dico.pronom[sex] : '')  + ' ' + dico.etre[status] + " suivi" + dico.accord[sex] + " pour un "; //" et" + 
  result.patho = getPatho(obj, i,text_neg, text_pos)+'.';

  //fratrie
  let text_frat_neg = " " + dico.pronom[sex] + ' ' + dico.etre[status] + " enfant unique.";
  result.fratrie = getFratList(obj,i,text_frat_neg);

  //final
  return name + result.civil + result.patho  + ' ' + result.fratrie
}

function textCivil(obj,i){  //extra space at the end
  let sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');

  let out = (obj[i].proband == true ? 
      dico.civil[sex] + ' '
      // add name
      + (keyExist(obj[i],'civil_name') ? obj[i].civil_name + ' ' :'')
      + (obj[i].yob != ''||keyExist(obj[i],'dbirth') ? dico.etre[status] + '': '')
    :'');
  if(keyExist(obj[i],'dbirth')) {
    out += ' ' + dico.naissance[sex] + ' le ' + obj[i].dbirth;
  }else{
    out += (obj[i].yob != '' && obj[i].yob != null ? ' ' + dico.naissance[sex] + ' en ' + obj[i].yob : '');
  }
  if (obj[i].age != '' && obj[i].age != null) out += ' (' + (status == 'décés' ? dico.décés[sex] + " à " : "") + obj[i].age +' ans)';
  if(obj[i].proband == true && obj[i].yob != '') out += ' et '
  
  return out
}

function keyExist(obj, k) {
  if(!obj.hasOwnProperty(k)) return false
  return obj[k] != '' && obj[k] != null && obj[k] != undefined
}

function getChildList(obj,i,text_child_neg, suffixe='.') {
  let child,
      child1 = [],
      child2 = [],
      fath,
      moth,
      sex = obj[i].sex;
  var fcs1=0, fcs2=0; //miscarriage
  var img1=0, img2=0; //termination
  //grossesse : obj[k].sex == "U"

  for (var k = 0; k < obj.length; k++) {
    if (obj[k].sex == "U" || obj[k].hasOwnProperty('noparents')) continue
    if (obj[k]['father'] == obj[i]['name'] || obj[k]['mother'] == obj[i]['name']) {
      if (typeof fath === 'undefined') {
        fath = obj[k]['father']
        moth = obj[k]['mother']
        if (checkOption(obj,k,'miscarriage')) {fcs1+=1
        } else if (checkOption(obj,k,'termination')) {img1+=1
        }else{child1.push(k)}
      } else if(fath != obj[k]['father'] || moth != obj[k]['mother']) { //si 2ième union
        if (checkOption(obj,k,'miscarriage')) {fcs2+=1
        }else if (checkOption(obj,k,'termination')) {img2+=1
        }else{child1.push(k)}
      } else child1.push(k)
    };
  };

  //if no child and/or no miscariage
  if(child1 =='' && fcs1 == 0 && img1 == 0) return text_child_neg

  function childText(child) {
    let result = [];
    for (var c = 0; c < child.length; c++) {
      let k = child[c]
      result = (result == '' ? result : result + ', ') + dico.enfant[obj[k].sex]
      result += textCivil(obj, k)

      //patho
      let text_neg = '',
          sex = obj[k].sex,
          text_pos = " suivi" + dico.accord[sex] + " pour un "; //" suivi pour un ";
      result += getPatho(obj, k,text_neg, text_pos);
    }
    return result
  }
  // text
  if(child2!="") {
    child = (child1.length>0 ? inWords(child1.length) : 'aucun') + (child1.length>1 ? ' enfants' : ' enfant') + " d'une première union : ";
    child += childText(child1);
    child += textOption(fcs1,'fausses-couches','fausse-couche');
    child += textOption(img1,'IMG','IMG',' ');
    child += ' ; ' + (child2.length>0 ? inWords(child2.length):'aucun') + (child2.length>1 ? ' enfants' : ' enfant') + " d'une seconde union : ";
    child += childText(child2);
    //child += '.'; //suffixe
    child += textOption(fcs2,'fausses-couches','fausse-couche','.');
    child +=textOption(img2,'IMG','IMG','.');
  } else {
    child = (child1.length>0 ? inWords(child1.length):'aucun') + (child1.length>1 ? ' enfants' : ' enfant') + ' : ';
    child += childText(child1);
    child += textOption(fcs1,'fausses-couches','fausse-couche',''); //'.'
    child += textOption(img1,'IMG','IMG','.');
  }
  if(obj[i].proband == true) child = dico.pronom[sex]+ " a " + child

  // conjoint pour le cas index
  if (obj[i].proband == true && child != ".") {
    // conjoint 1 & 2
  }
  child+=suffixe;

  //short childList
  // short text if no other data associated with s
  let pattern1 = dico.enfant['M']
  let replace1 = dico.enfant['M'].split(" ")[1];
  let pattern2 = dico.enfant['F']
  let replace2 = dico.enfant['F'].split(" ")[1];
  
  var addPoint=false;
  child=shortFrat(child, pattern1, replace1);
  child=shortFrat(child, pattern2, replace2);
  
  return child;
}

function getFratList(obj,i,text_frat_neg) { 
  let frat, //fratrie
      fratpm = [],
      fratm = [],
      fratp = [],
      fath = obj[i]['father'],
      moth = obj[i]['mother'],
      sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');

  var fcs1=0,fcs2=0,fcs3=0;
  var img1=0, img2=0,img3=0;
      
  //si pas de parents définis
  if (typeof(fath) === 'undefined' || obj[i].hasOwnProperty('noparents')) return ''
  
  //select siblings
  for (var k = 0; k < obj.length; k++) {
    if (obj[k].sex == "U") continue
    if (!obj[k].hasOwnProperty('noparents') && obj[k]['father'] == fath && obj[k]['mother'] == moth && k != i) {
      if (checkOption(obj,k,'miscarriage')) {fcs1+=1
      }else if (checkOption(obj,k,'termination')) {img1+=1
      }else{fratpm.push(k)}
    }
    if (!obj[k].hasOwnProperty('noparents') && obj[k]['father'] == fath && obj[k]['mother'] != moth && k != i) {
      if (checkOption(obj,k,'miscarriage')) {fcs1+=1
      }else if (checkOption(obj,k,'termination')) {img1+=1
      }else{fratp.push(k)}
    }
    if (!obj[k].hasOwnProperty('noparents') && obj[k]['father'] != fath && obj[k]['mother'] == moth && k != i) {
      if (checkOption(obj,k,'miscarriage')) {fcs1+=1
      }else if (checkOption(obj,k,'termination')) {img1+=1
      }else{fratm.push(k)}
    }
  };

  fcs = Number(fcs1)+Number(fcs2)+Number(fcs3)
  img = Number(img1)+Number(img2)+Number(img3)

  //if no siblings and no miscarriage
  if(fratpm == '' && fratp == '' && fratm == '' && fcs == 0 && img == 0) return text_frat_neg
  
  function fratText(frat, suf) {
    let result = [];
    for (var f = 0; f < frat.length; f++) {
      let k = frat[f]
      result = (result == '' ? result : result + ', ') + dico.fratrie[obj[k].sex]
      if(typeof(suf) !== 'undefined') result += suf
      result += textCivil(obj, k)

      //patho
      let text_neg = '',
          sex = obj[k].sex,
          text_pos = " suivi" + dico.accord[sex] + " pour un "; //" suivi pour un ";
      result += getPatho(obj, k,text_neg, text_pos);

      //child
      let text_child_neg = "";
      if(getChildList(obj,k,text_child_neg) != "") result += ' (' + getChildList(obj,k,text_child_neg,'') +')';
    }
    return result
  }
  
  //text
  frat = dico.pronom[sex] + ' ' + dico.etre[status] + ' ' + dico.issu[sex] + " d'une fratrie de " + inWords(fratpm.length+1) + ' enfants' + ' : ';
  frat += fratText(fratpm);
  frat += '.';

  // short text if no other data associated with s
  let pattern1 = dico.fratrie['M']
  let replace1 = dico.fratrie['M'].split(" ")[1];
  let pattern2 = dico.fratrie['F']
  let replace2 = dico.fratrie['F'].split(" ")[1];

  //short frat
  var addPoint=false;
  frat=shortFrat(frat, pattern1, replace1);
  frat=shortFrat(frat, pattern2, replace2);
  if(frat.slice(-1)!='.')  frat+='.'

  if(fratpm == '') frat = text_frat_neg
  frat += '' + textOption(fcs1,'fausses-couches','fausse-couche','Ses parents ont eu ','.');
  frat += '' + textOption(img1,'IMG','IMG','Ses parents ont fait ','.');

  if(fratp != ''){
    frat += ' ' + dico.pronom[sex] + " a ";
    frat += fratText(fratp, ' de père');
    frat += '.';
    frat += ' ' + textOption(fcs2,'fausses-couches','fausse-couche','Ses parents ont eu ','.');
    frat += ' ' + textOption(img2,'IMG','IMG','Ses parents ont fait ','.');
  }

  if(fratm != ''){
    frat += ' ' + dico.pronom[sex] + " a ";
    frat += fratText(fratm, ' de mère');
    frat += '.';
    frat += textOption(fcs3,'fausses-couches','fausse-couche','Ses parents ont eu ','.');
    frat += ' ' + textOption(img3,'IMG','IMG','Ses parents ont fait ','.');
  }
  return frat;
}

shortFrat = function(text, pattern, replace) {
  addPoint=false;
  var re = new RegExp(pattern+', |'+pattern+'\\.'+'|'+pattern+'$', "g");
  count = (text.match(re, "regex") || []).length;
  var reFull = new RegExp(pattern, "g"); 
  countFull = (text.match(reFull, "regex") || []).length 
  
  if(count==0) return text;

  if(text.match(re, "regex").join().match(/\./g)) addPoint=true; //ponctuation : "." ?
  text=text.replace(re, "") //remove matched pattern
  if(text.slice(-1)!=' ' & text.slice(-1)!='.') text+=', '; //add coma if last character before replacement is not a ponctuation
  if(text.slice(-1)=='.') { //add coma if last character before replacement is a point
    text=text.replace(/.$/,", ");
    addPoint=true;
  }
  text += inWords(count) 
  text += (count==1 && (pattern==dico.fratrie['F'] || pattern==dico.enfant['F']) ? 'e' :'')
  text += (countFull>count ? (count>1 ? " autres ":" autre ") : " ") + replace; //add short count
  if(count>1 && text.slice(-1)!='s') text+='s' //plural
  if(addPoint) text+='.' //ponctuation
  return text;
}

var a = ['','un','deux','trois','quatre', 'cinq','six','sept','huit','neuf','dix',
'onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf', 'vingt'];

function inWords (num) {
  if(Number(num)> 20) return num;
  str = a[Number(num)]
  return str;
}