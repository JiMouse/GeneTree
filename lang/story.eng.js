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
            y = obj[i].yob + a;
        result = (result != '' ? result + " et d'un " : text_pos);
        result += cleanDiseaseText(out);
        if(a != "" && a != null) {
          result += " diagnosed";
          if(obj[i].yob != "" && obj[i].yob != null) result += " en " + y;
          result += " at the age of " + a + " year old";
        }
      };
    }; return result + comment
  }
  
  function histoire(obj) {
    let text,
        indexID = getRowPedigreeJS(obj,1),
        father = getRowPedigreeJS(obj, obj[indexID].father),
        mother = getRowPedigreeJS(obj, obj[indexID].mother),
        sex = obj[indexID].sex;
  
    if(!obj[father].hasOwnProperty('noparents')) var gpp = getRowPedigreeJS(obj, obj[father].father);
    if(!obj[father].hasOwnProperty('noparents')) var gmp = getRowPedigreeJS(obj, obj[father].mother);
    if(!obj[mother].hasOwnProperty('noparents')) var gpm = getRowPedigreeJS(obj, obj[mother].father);
    if(!obj[mother].hasOwnProperty('noparents')) var gmm = getRowPedigreeJS(obj, obj[mother].mother);
    
    text = textIndex(obj, 0) + '<br>';
    text += '<br>' + dico.pronom2[sex] +" father" + textline(obj, father);
    text += '<br>' + dico.pronom2[sex] +" mother" + textline(obj, mother);
  
    if(typeof(gpp) !== 'undefined') text += '<br>' + dico.pronom2[sex] +" paternal grandfather" + textline(obj, gpp);
    if(typeof(gmp) !== 'undefined') text += '<br>' + dico.pronom2[sex] +" paternal grandmother" + textline(obj, gmp);
    if(typeof(gpm) !== 'undefined') text += '<br>' + dico.pronom2[sex] +" maternal grandfather" + textline(obj, gpm);
    if(typeof(gmm) !== 'undefined') text += '<br>' + dico.pronom2[sex] +" maternal grandmother" + textline(obj, gmm);
  
    return text;
  }
  
  function textIndex(obj, i){
      let result = {'index':'', 'child':'', 'fratrie':''},
          sex = obj[i].sex,
          status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');
      
      //civil
      result.index = textCivil(obj,i);
      result.index += "comes for a genetic consultation to evaluate a possible familial predisposition";
      
      // motif de consultation
      let text_neg = '. On the day of the consultation, ' + dico.pronom3[sex] + ' does not present any cancerous pathology',
          text_pos = " in the context of a ";
      result.index += getPatho(obj, i,text_neg, text_pos)+'.';
  
      //enfant & conjoint
      let text_child_neg = " " + dico.pronom[sex] + " has no children.";
      result.child = getChildList(obj,i,text_child_neg);
  
      //fratrie
      let text_frat_neg = " " + dico.pronom[sex] + ' ' + dico.etre[status] + " an only child.";
      result.fratrie = getFratList(obj,i,text_frat_neg);
  
      //final
      return result.index + '<br>' + result.fratrie + '<br>' + result.child
  }
  
  function textline(obj, i){
    let result = {'civil':'', 'patho':'', 'child':'', 'fratrie':''},
        sex = obj[i].sex,
        status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');
  
    //civil
    result.civil = textCivil(obj,i)
    if(result.civil!='') {result.civil = ' ' + dico.etre[status] + ' ' + result.civil}
  
    //patho
    let text_neg = (result.civil!='' ? '. ' + dico.pronom[sex]:'')  + ' do not '+ dico.presenter[status] + ' any cancer pathology',
        text_pos = (result.civil!='' ? '. ' + dico.pronom[sex]:'')  + ' ' + dico.presenter[status] + " follow-up for a "; //" et" + 
    result.patho = getPatho(obj, i,text_neg, text_pos)+'.';
  
    //fratrie
    let text_frat_neg = " " + dico.pronom[sex] + ' ' + dico.etre[status] + " an only child.";
    result.fratrie = getFratList(obj,i,text_frat_neg);
  
    //final
    return result.civil + result.patho  + ' ' + result.fratrie
  }
  
  function textCivil(obj,i){
    let sex = obj[i].sex,
        status = (obj[i].hasOwnProperty('status') ? 'décés' : 'vie');
  
    let out = (obj[i].proband == true ? dico.civil[sex] + ' ' 
              + (obj[i].yob != '' ? dico.etre[status] + ' ':'')
              : '');
    out += (obj[i].yob != '' && obj[i].yob != null  ? ' ' + dico.naissance[sex] + ' in ' + obj[i].yob : '');
    if (obj[i].age != '' && obj[i].age != null) out += ' (' + (status == 'décés' ? dico.décés[sex] + " at " : "") + obj[i].age +' year old)';
    if(obj[i].proband == true && obj[i].yob != '') out += ' and '
    
    return out
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
            text_pos = " follow-up for a ";
        result += getPatho(obj, k,text_neg, text_pos);
      }
      return result
    }
    
    // text
    if(child2!="") {
      child = (child1.length>0 ? child1.length:'none') + (child1.length>1 ? ' children' : ' child') + " of a first union : ";
      child += childText(child1);
      child += textOption(fcs1,'miscarriages','miscarriage');
      child += textOption(img1,'terminations','termination',' ');
      child += ' ; ' + (child2.length>0 ? child2.length:'none') + (child2.length>1 ? ' children' : ' child') + " of a second union : ";
      child += childText(child2);
      //child += '.'; //suffixe
      child += textOption(fcs2,'miscarriages','miscarriage','.');
      child +=textOption(img2,'terminations','termination','.');
    } else {
      child = (child1.length>0 ? child1.length:'none') + (child1.length>1 ? ' children' : ' child') + ' : ';
      child += childText(child1);
      //child += '.';
      child += textOption(fcs1,'miscarriages','miscarriage','.');
      child += textOption(img1,'terminations','termination','.');
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
            text_pos = " follow-up for a ";
        result += getPatho(obj, k,text_neg, text_pos);
  
        //child
        let text_child_neg = "";
        if(getChildList(obj,k,text_child_neg) != "") result += ' (' + getChildList(obj,k,text_child_neg,'') +')'; //str.substring(0, str.length() - 1);
  
      }
      return result
    }
    
    //text
    frat = dico.pronom[sex] + ' ' + dico.etre[status]  + " a sibling of " + (fratpm.length+1) + ' children' + ' : ';
    frat += fratText(fratpm);
    frat += '.';
    if(fratpm == '') frat = text_frat_neg
    frat += ' ' + textOption(fcs1,'miscarriages','miscarriage', dico.pronom2[sex]+' parents had ','.');
    frat += ' ' + textOption(img1,'terminations','termination', dico.pronom2[sex]+' parents had ','.');
  
    if(fratp != ''){
      frat += ' ' + dico.pronom[sex] + " a ";
      frat += fratText(fratp, ' from '+dico.pronom2[sex]+" father");
      frat += '.';
      frat += ' ' + textOption(fcs2,'miscarriages','miscarriage',dico.pronom2[sex]+' parents had ','.');
      frat += ' ' + textOption(img2,'terminations','termination',dico.pronom2[sex]+' parents had ','.');
    }
  
    if(fratm != ''){
      frat += ' ' + dico.pronom[sex] + " a ";
      frat += fratText(fratm, ' from '+dico.pronom2[sex]+" mother");
      frat += '.';
      frat += ' ' + textOption(fcs3,'miscarriages','miscarriage',dico.pronom2[sex]+' parents had ','.');
      frat += ' ' + textOption(img3,'terminations','termination',dico.pronom2[sex]+' parents had ','.');
    }
    
    return frat;
    
  }