$(document).ready(function(){

// https://github.com/tmcw/gedcom/blob/main/lib/tokenize.ts

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

  function gedCom_to_GeneTree (input) { //To do
    let JSONdata = parse(input);
    let obj =[];

    for (const row of JSONdata) {
      let ind = {};
      ind["Name"] = row.NAME
      ind["IndivID"] = row.INDI
      ind["Sex"] = row.SEX
      obj.push(ind)
    }

    //How to get family properly ?
  
    /* GeneTree template
    var myDataGpm = [
      {"FamID": "1","Name": "Grand-Père maternelle","IndivID": "6","FathID": "0","MothID": "0","Sex": "M","Affected":"1","Deceased":"0"},
      {"FamID": "1","Name": "Grand-Mère maternelle","IndivID": "7","FathID": "0","MothID": "0","Sex": "F","Affected":"1","Deceased":"0"}
    ]
    */

    return obj;
  }

  // TEST
  const records = gedCom_to_GeneTree(`
  0 @U1@ SUBM
  1 NAME gedcom.org
  1 ADDR
  2 CITY Leiden 
  1 WWW www.gedcom.org
  0 @I1@ INDI
  1 NAME Peter /Sweet/
  2 SURN Sweet
  2 GIVN Peter
  1 SEX M
  1 BIRT
  2 DATE 7 Jul 1877
  1 FAMS @F1@
  1 FAMS @F3@
  `	)
  // alert(JSON.stringify(records));

});