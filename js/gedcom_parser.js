// Based on https://github.com/tmcw/gedcom/blob/main/lib/tokenize.ts

  const cDigit = "0-9";
  const rLevel = new RegExp(`^([${cDigit}]*)`);
  const cDelim = new RegExp("(\\s+)");
  const rDelim = new RegExp(`^([${cDelim}])`);
  const cAt = "@";
  const cAlpha = "A-ZÀ-ÿa-z_";
  const cAlphanum = `${cAlpha}${cDigit}`;
  const cHash = "#";
  const cNonAt = `${cAlpha}${cDigit}${cDelim}${cHash}`;
  const cPointerChar = cNonAt;
  const rPointer = new RegExp(
    `^${cAt}([${cAlphanum}])([${cPointerChar}\\-])*${cAt}`
  );
  const rTag = new RegExp(`^(_?[${cAlphanum}]+)`);
  const rLineItem = new RegExp(/^(.*)/);

  function tokenize(buf) {
    function expect(re, message) {
      const match = buf.match(re);
      if (!match) throw new Error(message);
      buf = buf.substring(match[0].length);
      return match[1];
    }

    buf = buf.trimStart();
    let xref_id = undefined;
    const levelStr = expect(rLevel, "Expected level");

    if (levelStr.length > 2 || (levelStr.length === 2 && levelStr[0] === "0")) {
      throw new Error(`Invalid level: ${levelStr}`);
    }

    const level = parseInt(levelStr);

    expect(rDelim, "Expected delimiter after level");

    const xref = buf.match(rPointer);
    if (xref) {
      xref_id = xref[0];
      buf = buf.substring(xref[0].length);
      expect(rDelim, "Expected delimiter after pointer");
    }

    const tag = expect(rTag, "Expected tag");

    let line  = {
      level,
      tag,
    };

    // if (xref_id) line.xref_id = xref_id;
    if (xref_id) line.value = xref_id;


    const delim = buf.match(rDelim);
    if (delim) {
      buf = buf.substring(delim[0].length);
      const pointer_match = buf.match(rPointer);
      const value_match = buf.match(rLineItem);
      if (pointer_match) {
        // line.pointer = pointer_match[0];
        line.value = pointer_match[0];
      } else if (value_match) {
        line.value = value_match[1];
      }
    }

    return line;
  }

  const rTerminator = new RegExp("(\\r|\\n|\\r\\n|\\n\\r)", "g");

  function parse(input) {

    const lines = input.split(rTerminator).filter((str) => str.trim());

    let stack = {};
    let lastLevel = 0;
    let tree = [];
    let previousTag = ""
    let tag =''
    let value =''

    for (const line of lines) {
      const tokens = tokenize(line);
      const { level } = tokens;
      value = tokens.value
      tag = tokens.tag

      if (level == 0) {
        if(Object.keys(stack).length !== 0) tree.push(stack); //push previous stack
        stack = {}
        stack[tag] = value
      } else {
        //check level => if > 2 : 
        
        if(level == 1) {
          stack[tag] = value
          previousTag = tag
        } else {
          tag = previousTag + '.' + tag
        }
        if(tag !== undefined) stack[tag] = tokens.value
        
      }
      lastLevel = level;
    }
    tree.push(stack);  //add last line
    return tree;
  }

  function gedCom_to_GeneTree (input) {
    let JSONdata = parse(input);
    let obj =[];
    var numberPattern = /\d+/g;
    // get parents
    let objParents = {};
    for(const row of JSONdata) {
      if(!row.hasOwnProperty("FAM")) continue;
      let parents = {HUSB:"", WIFE:""}
      if(row.hasOwnProperty("HUSB")) {
        parents.FathID=row.HUSB.match(numberPattern)[0]
      } else {parents.FathID = "0"}
      if(row.hasOwnProperty("WIFE")) {
        parents.MothID=row.WIFE.match(numberPattern)[0]
      } else {parents.FathID = "0"}
      objParents[row.FAM] = parents
    }
    // alert(JSON.stringify(objParents))

    //get individuals
    for (const row of JSONdata) {
      if(!row.hasOwnProperty("INDI")) continue;
      let ind = {};
      ind["Name"] = row.NAME
      ind["IndivID"] = row.INDI.match(numberPattern)[0]
      ind["Sex"] = row.SEX
      if(row.hasOwnProperty("FAMC")) {
        ind["FathID"] = objParents[row.FAMC].FathID
        ind["MothID"] = objParents[row.FAMC].MothID
      } else {
        ind["FathID"] = "0"
        ind["MothID"] = "0"
      }
      ind["Affected"]="1"
      ind["Deceased"] = "0"
      obj.push(ind)
    }
    // "proband": true => set proband
    return obj;
  }

  function ExportGEDCOM(JSONData) {
    alert('Fonction en cours de création.');
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        tree = '',   
        row = "0 HEAD",
        fileName = 'GEDCOM_'+ getFormattedTime() +'.ged';
        
    // Put the header
    tree += row + '\r\n';

    //Set warning
    let warning='',
        warningAge=false;

    let previousFAM=0

    // Adding each ind
    for (var i = 0; i < arrData.length; i++) {
        
      let name= arrData[i]['display_name'];
      let ind = arrData[i]['name'];
      let sex = arrData[i]['sex'];

      let father = (arrData[i].hasOwnProperty('father') && !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'father' ] : '0'),
          mother = (arrData[i].hasOwnProperty('mother')&& !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'mother' ] : '0');
       
      ind=['1', `@${ind}@`, "INDI"].join(' ')
      name=['1', "NAME", name].join(' ')
      sex=['1', "SEX", sex].join(' ')

      //if parents
      // fam=['1', "FAMS", "?"].join('\t')

      //if children



      /*
      0 @I1@ INDI
      1 NAME Sarah //
      1 SEX F
      1 FAMS @F1@

      0 @F5@ FAM
      1 HUSB @I5@
      1 WIFE @I18@
      1 MARR  
      2 DATE ABT 1772
      2 PLAC Pembroke, Wash, ME
      1 CHIL @I6@
      */

      row = [ind, name, sex].join('\r\n')

      tree += row + '\r\n';
        
    }

        // Adding each familiy


    if(warning!='') {
        alert('Fichier GEDCOM non conforme : '+ warning);
        return;
    }

    // Downloading the new generated tree.
    // For IE >= 9
    if(window.navigator.msSaveOrOpenBlob) {
    var fileData = [tree];
    blobObject = new Blob(fileData);
    window.navigator.msSaveOrOpenBlob(blobObject, fileName);
    } else { 
    // For Chome/Firefox/Opera
    var uri = 'data:text/csv;charset=utf-8,' + escape(tree);
    var link = document.createElement("a");    
    link.href = uri;
    link.style = "visibility:hidden";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    }
}
