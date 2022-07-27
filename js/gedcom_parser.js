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

      if(row.hasOwnProperty("BIRT.DATE")) {
        var yearPattern = /\d{4}/g;
        ind["Yob"] = row["BIRT.DATE"].match(yearPattern)[0]
      }

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
  function searchKey(nameKey, obj) {
    if (obj.hasOwnProperty(nameKey)) {
      return nameKey;
    } else {
      var res = Object.keys(obj).filter(function(k) {
        return (k.toLowerCase().indexOf(nameKey.toLowerCase()) > -1) || (nameKey.toLowerCase().indexOf(k.toLowerCase()) > -1);
      });
      return res ? res : false;
    }
  }

  function cleanString(input) {
    var output = "";
    for (var i=0; i<input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i);
        }
    }
    return output;
}

  function ExportGEDCOM(JSONData) {
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
        tree = '',   
        row = "0 HEAD\r\n1 GEDC\r\n2 VERS 5.5.5\r\n2 FORM LINEAGE-LINKED\r\n3 VERS 5.5.5\r\n1 CHAR UTF-8\r\n1 SOUR GeneTree"
        +"\r\n0 @U@ SUBM\r\n1 NAME gedcom.org",
        fileName = 'GEDCOM_'+ getFormattedTime() +'.ged';
        
    // Put the header
    tree += row;

    //Set warning
    let warning='';

    // populate parents obj
    let objFam = {};
    let FAMid = 1
    let FAMtree = '';

    for (var i = 0; i < arrData.length; i++) {
      // for each ind => create row with parents
      let father = (arrData[i].hasOwnProperty('father') && !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'father' ] : '0'),
          mother = (arrData[i].hasOwnProperty('mother')&& !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'mother' ] : '0');

      if(objFam.hasOwnProperty(father+"/"+mother)) {continue;}
      if(father == '0' || mother == '0') {continue;}
      objFam[father+"/"+mother] = FAMid
      
      //add fam to object
      FAMtree +='\r\n' + `0 @F${FAMid}@ FAM`
              + '\r\n' + `1 HUSB @I${father}@`
              + '\r\n' + `1 WIFE @I${mother}@`;
      //add children //to do ?
      // The FAMC tag provides a pointer to a family where this person is a child.
      // The FAMS tag provides a pointer to a family where this person is a spouse or parent
      FAMid +=1;
    }

    // Adding each ind
    for (var i = 0; i < arrData.length; i++) {
        
      let name= arrData[i]['display_name'];
      let ind = arrData[i]['name'];
      let sex = arrData[i]['sex'];

      let father = (arrData[i].hasOwnProperty('father') && !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'father' ] : '0'),
          mother = (arrData[i].hasOwnProperty('mother')&& !arrData[i].hasOwnProperty('noparents') ? arrData[i][ 'mother' ] : '0');
       
      indRow=['0', `@I${ind}@`, "INDI"].join(' ');
      nameRow=['1', "NAME", name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")].join(' '); //remove accent
      sexRow=['1', "SEX", sex].join(' ');
      row = [indRow, nameRow, sexRow].join('\r\n');

      //add yob
      let yob = arrData[i]['yob'];
      if(yob != undefined && yob != null && yob != '') {
        yobRow=['1', "BIRT"].join(' ');
        yobRow+= '\r\n' + (['2', "DATE", yob].join(' '));
        row = row + '\r\n' + yobRow
      }

      //if parents
      if(objFam.hasOwnProperty(father+"/"+mother)) {
        FAMCid = ['1', "FAMC", `@F${objFam[father+"/"+mother]}@`].join(' ');
        row += '\r\n' + FAMCid;
      }

      let fullKey = searchKey(ind, objFam);
      if(fullKey!=undefined && fullKey!="" && fullKey!=false) {
        FAMSid = ['1', "FAMS", `@F${objFam[fullKey]}@`].join(' ');
        row += '\r\n' + FAMSid;
      }
      
      tree +=  '\r\n' + row;
    }
    tree += FAMtree // Add each families
    tree += "\r\n0 TRLR" //Tailer

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
