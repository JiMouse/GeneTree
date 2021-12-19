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
      result += t(out);
      if(a != "" && a != null) {
        result += " diagnostiqué";
        if(obj[i].yob != "" && obj[i].yob != null) result += " en " + y; 
        result += " à l'âge de " + a + " ans";
      }
    };
  }; return result + comment
}

function histoire(obj) {
  let text,
      indexID = getRowPedigreeJS(obj,1),
      father = getRowPedigreeJS(obj, obj[indexID].father),
      mother = getRowPedigreeJS(obj, obj[indexID].mother);

  if(!obj[father].hasOwnProperty('noparents')) var gpp = getRowPedigreeJS(obj, obj[father].father);
  if(!obj[father].hasOwnProperty('noparents')) var gmp = getRowPedigreeJS(obj, obj[father].mother);
  if(!obj[mother].hasOwnProperty('noparents')) var gpm = getRowPedigreeJS(obj, obj[mother].father);
  if(!obj[mother].hasOwnProperty('noparents')) var gmm = getRowPedigreeJS(obj, obj[mother].mother);
  
  text = textIndex(obj, 0) + '<br>';
  text += '<br>' + "Son père" + textline(obj, father);
  text += '<br>' + "Sa mère" + textline(obj, mother);

  if(typeof(gpp) !== 'undefined') text += '<br>' + "Son grand-père paternel" + textline(obj, gpp);
  if(typeof(gmp) !== 'undefined') text += '<br>' + "Sa grand-mère paternelle" + textline(obj, gmp);
  if(typeof(gpm) !== 'undefined') text += '<br>' + "Son grand-père maternel" + textline(obj, gpm);
  if(typeof(gmm) !== 'undefined') text += '<br>' + "Sa grand-mère maternelle" + textline(obj, gmm);

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

  //add canrisk infos
  let msg="";
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
  let tl          = obj[i]['tl'];
  let endo        = obj[i]['endo'];

  if(menarche !== undefined)
    msg += ' ' + dico.pronom[sex] + " avait "+menarche+" ans à l'âge de la ménarche.";
  // if(parity !== undefined)
  //   msg += dico.pronom[sex] + "\n##parity="+parity+".";
  if(first_birth !== undefined)
    msg += ' ' + dico.pronom[sex] + " avait "+first_birth+" ans lors de la naissance de son premier enfant.";
  if(oc_use !== undefined)
    msg += ' ' + dico.pronom[sex] + "\n##oc_use="+oc_use+".";
  if(mht_use !== undefined)
    msg += " Traitement hormonal substitutif"+mht_use+".";
  if(bmi !== undefined)
    msg += " Son BMI est calculé à "+bmi+"kg/m².";
  if(hgt !== undefined)
    msg += " Sa taille est de "+hgt+"m.";
  if(alcohol !== undefined)
    msg += " Sa consommation alcoolique quotidienne moyenne est de "+alcohol+" g/j.";
  if(menopause !== undefined)
    msg += ' ' + dico.pronom[sex] + " avait "+menopause+" ans à l'âge de la ménopause.";
  if(mdensity !== undefined)
    msg += " Son score BiRads (densité mamaire) est"+mdensity+".";
  if(tl !== undefined)
    msg += ' ' + dico.pronom[sex] + "\n##tl="+tl+".";
  if(endo !== undefined)
    msg += ' ' + dico.pronom[sex] + "\n##endo="+endo+".";

  if(msg !== undefined)
    result.index += msg;

  //enfant & conjoint
  let text_child_neg = " " + dico.pronom[sex] + " n'a pas d'enfant.";
  result.child = getChildList(obj,i,text_child_neg);

  //fratrie
  let text_frat_neg = " " + dico.pronom[sex] + ' ' + dico.etre[status] + " enfant unique.";
  result.fratrie = getFratList(obj,i,text_frat_neg);

  //final
  return result.index + '<br>' + result.fratrie + '<br>' + result.child
}

function textline(obj, i){
  let result = {'civil':'', 'patho':'', 'child':'', 'fratrie':''},
      sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');

  //nom
  let name = (keyExist(obj[i],'civil_name') ? ', ' + dico.civil[sex] + ' ' + obj[i].civil_name + ', ' :'')
  
  //civil
  result.civil = textCivil(obj,i)
  if(result.civil!='') {result.civil = ' ' + dico.etre[status] + ' ' + result.civil}
  
  //patho
  let text_neg = (result.civil!='' ? '. ' + dico.pronom[sex] : '')  + ' ne '+ dico.presenter[status] + ' pas de pathologie cancéreuse',
      text_pos = (result.civil!='' ? '. ' + dico.pronom[sex] : '')  + ' ' + dico.etre[status] + " suivi pour un "; //" et" + 
  result.patho = getPatho(obj, i,text_neg, text_pos)+'.';

  //fratrie
  let text_frat_neg = " " + dico.pronom[sex] + ' ' + dico.etre[status] + " enfant unique.";
  result.fratrie = getFratList(obj,i,text_frat_neg);

  //final
  return name + result.civil + result.patho  + ' ' + result.fratrie
}

function textCivil(obj,i){
  let sex = obj[i].sex,
      status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');

  let out = (obj[i].proband == true ? 
    dico.civil[sex] + ' '
    // add name
    + (keyExist(obj[i],'civil_name') ? obj[i].civil_name + ' ' :'')
    + (obj[i].yob != ''||keyExist(obj[i],'dbirth') ? dico.etre[status] + ' '
    : '')
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
          text_pos = " suivi pour un ";
      result += getPatho(obj, k,text_neg, text_pos);
    }
    return result
  }
  
  // text
  if(child2!="") {
    child = (child1.length>0 ? child1.length:'aucun') + (child1.length>1 ? ' enfants' : ' enfant') + " d'une première union : ";
    child += childText(child1);
    child += textOption(fcs1,'fausses-couches','fausse-couche');
    child += textOption(img1,'IMG','IMG',' ');
    child += ' ; ' + (child2.length>0 ? child2.length:'aucun') + (child2.length>1 ? ' enfants' : ' enfant') + " d'une seconde union : ";
    child += childText(child2);
    //child += '.'; //suffixe
    child += textOption(fcs2,'fausses-couches','fausse-couche','.');
    child +=textOption(img2,'IMG','IMG','.');
  } else {
    child = (child1.length>0 ? child1.length:'aucun') + (child1.length>1 ? ' enfants' : ' enfant') + ' : ';
    child += childText(child1);
    //child += '.';
    child += textOption(fcs1,'fausses-couches','fausse-couche','.');
    child += textOption(img1,'IMG','IMG','.');
  }
  if(obj[i].proband == true) child = dico.pronom[sex]+ " a " + child

  // conjoint pour le cas index
  if (obj[i].proband == true && child != ".") {
    // conjoint 1 & 2
  }
  return child+suffixe;
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
          text_pos = " suivi pour un ";
      result += getPatho(obj, k,text_neg, text_pos);

      //child
      let text_child_neg = "";
      if(getChildList(obj,k,text_child_neg) != "") result += ' (' + getChildList(obj,k,text_child_neg,'') +')'; //str.substring(0, str.length() - 1);

    }
    return result
  }
  
  //text
  frat = dico.pronom[sex] + ' ' + dico.etre[status] + ' ' + dico.issu[sex] + " d'une fratrie de " + (fratpm.length+1) + ' enfants' + ' : ';
  frat += fratText(fratpm);
  frat += '.';
  if(fratpm == '') frat = text_frat_neg
  frat += ' ' + textOption(fcs1,'fausses-couches','fausse-couche','Ses parents ont eu ','.');
  frat += ' ' + textOption(img1,'IMG','IMG','Ses parents ont fait ','.');

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