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

  // TEST
  const records = (`
  0 @I1@ INDI
  1 NAME Sarah //
  1 SEX F
  1 FAMS @F1@
  1 BIRT  
  2 DATE ABT 1723
  0 @I19@ INDI
  1 NAME Robert /Shipley/
  1 SEX M
  1 FAMS @F1@
  1 BIRT  
  2 DATE ABT 1719
  0 @I18@ INDI
  1 NAME Nancy /Shipley/
  1 SEX F
  1 BIRT  
  2 DATE ABT 1745
  2 PLAC Pembroke, Wash, ME
  1 FAMC @F1@
  1 FAMS @F5@
  1 DEAT  
  2 PLAC Amelia, Amelia, VA
  0 @F1@ FAM
  1 HUSB @I19@
  1 WIFE @I1@
  1 MARR Y
  1 CHIL @I18@
  `	
  )

  const test = (`0 HEAD
1 SOUR Ancestry.com Family Trees
2 VERS (2010.3)
2 NAME Ancestry.com Family Trees
2 CORP Ancestry.com
1 GEDC
2 VERS 5.5
2 FORM LINEAGE-LINKED
0 @I1@ INDI
1 NAME Sarah //
1 SEX F
1 FAMS @F1@
1 BIRT  
2 DATE ABT 1723
0 @I2@ INDI
1 NAME Sarah /Evans/
1 SEX F
1 FAMS @F2@
1 BIRT  
2 DATE ABT 1714
2 PLAC Pembroke, Wash, ME
0 @I3@ INDI
1 NAME Rebecca /Flowers/
1 SEX F
1 BIRT  
2 DATE 30 MAR 1720
2 PLAC Berks, Co., Penn.
1 FAMS @F3@
1 DEAT  
2 DATE 1806
2 PLAC Berks, Co., Penn
0 @I4@ INDI
1 NAME John /Hanks/
1 SEX M
1 FAMS @F4@
1 FAMS @F2@
1 BIRT  
2 DATE 22 OCT 1709
2 PLAC Pembroke, Wash, ME
1 DEAT  
2 DATE 6 SEP 1742
2 PLAC Pembroke, Wash, ME
1 NOTE This individual has the following other parents in the AncestralFile: 
2 CONC Benjamin /HANKS/ (AFN:4S0H-QM) and Abigail /HANKS/ (AFN:9N1B-Z5)
1 NOTE CATEGORY:Hanks
0 @I5@ INDI
1 NAME Joseph /Hanks/
1 SEX M
1 BIRT  
2 DATE ABT 1740
2 PLAC Pembroke, Wash, ME
1 FAMC @F2@
1 FAMS @F5@
1 DEAT  
2 PLAC Amelia, Amelia, VA
1 NOTE CATEGORY:Hanks
0 @I6@ INDI
1 NAME Nancy /Hanks/
1 SEX F
1 BIRT  
2 DATE 5 FEB 1784
2 PLAC Campbell Co., Virginia
1 FAMC @F5@
1 FAMS @F6@
1 DEAT  
2 DATE 5 OCT 1818
2 PLAC Centryville, Spencer, Ind
1 NOTE CATEGORY:Hanks
0 @I7@ INDI
1 NAME Bethsheba /Herring/
1 SEX F
1 BIRT  
2 DATE 1746
2 PLAC Rockingham, Co., VA.
1 FAMS @F7@
0 @I8@ INDI
1 NAME Abraham /Lincoln/
1 SEX M
1 BIRT  
2 DATE 17 MAY 1744
2 PLAC Berks, Co., Penn.
1 FAMC @F3@
1 FAMS @F8@
1 FAMS @F7@
1 DEAT  
2 DATE 1786
2 PLAC Jefferson County, KY
1 NOTE CATEGORY:Lincoln
0 @I9@ INDI
1 NAME Abraham /Lincoln/
1 SEX M
1 DSCR Over 6 feet tall with a beard
1 EDUC Could not afford law school
1 OCCU 16th President of the United States
1 OCCU Lawyer
1 BIRT  
2 DATE 12 FEB 1809
2 PLAC Hardin, KY
1 FAMC @F6@
1 FAMS @F9@
1 BURI  
2 DATE APR 1865
2 PLAC Springfield, Sangamon, IL
1 DEAT  
2 DATE 15 APR 1865
2 PLAC Washington, Dc
1 NOTE Abraham Lincoln has 3 personal notes. This is note 1.
1 NOTE Abraham Lincoln has 3 personal notes. This is note 2.
1 NOTE Abraham Lincoln has 3 personal notes. This is note 3.
1 SOUR @S2@
2 DATA
3 TEXT This is the text of the source citation from the biography.
2 QUAY 2
1 SOUR @S1@
2 DATA
3 TEXT This is the text of the source citation from the book on American 
4 CONC Presidents.
2 QUAY 2
1 NOTE CATEGORY:Lincoln
0 @I10@ INDI
1 NAME Edward Baker /Lincoln/
1 SEX M
1 BIRT  
2 DATE 10 MAR 1846
1 FAMC @F9@
1 DEAT  
2 DATE 1 FEB 1850
1 NOTE CATEGORY:Lincoln
0 @I11@ INDI
1 NAME John /Lincoln/
1 SEX M
1 BIRT  
2 DATE 3 MAY 1711
2 PLAC Freehold, Monmouth, N.J.
1 FAMC @F10@
1 FAMS @F3@
1 DEAT  
2 DATE 1778
2 PLAC PA
1 NOTE CATEGORY:Lincoln
0 @I12@ INDI
1 NAME Mordecai /Lincoln/
1 SEX M
1 BIRT  
2 DATE 24 APR 1686
2 PLAC Hingham, Norfolk, Co., Mass.
1 FAMS @F10@
1 FAMS @F11@
1 DEAT  
2 DATE 12 MAY 1736
2 PLAC , Penn.
1 NOTE CATEGORY:Lincoln
0 @I13@ INDI
1 NAME Robert Todd /Lincoln/
1 SEX M
1 BIRT  
2 DATE 1 AUG 1843
1 FAMC @F9@
1 NOTE CATEGORY:Lincoln
0 @I14@ INDI
1 NAME Thomas /Lincoln/
1 SEX M
1 BIRT  
2 DATE 20 JAN 1780
2 PLAC Rockingham, VA
1 FAMC @F7@
1 FAMS @F6@
1 DEAT  
2 DATE 17 JAN 1851
2 PLAC Beechland, Co., KY.
1 NOTE CATEGORY:Lincoln
0 @I15@ INDI
1 NAME Thomas /Lincoln/
1 SEX M
1 BIRT  
2 DATE 4 APR 1853
1 FAMC @F9@
1 DEAT  
2 DATE 1871
1 NOTE CATEGORY:Lincoln
0 @I16@ INDI
1 NAME William Wallace /Lincoln/
1 SEX M
1 BIRT  
2 DATE 21 DEC 1850
1 FAMC @F9@
1 DEAT  
2 DATE 20 FEB 1862
1 NOTE CATEGORY:Lincoln
0 @I17@ INDI
1 NAME Hannah /Salter/
1 SEX F
1 BIRT  
2 DATE ABT 1692
2 PLAC Freehold, Monmouth, N.J.
1 FAMS @F10@
0 @I18@ INDI
1 NAME Nancy /Shipley/
1 SEX F
1 BIRT  
2 DATE ABT 1745
2 PLAC Pembroke, Wash, ME
1 FAMC @F1@
1 FAMS @F5@
1 DEAT  
2 PLAC Amelia, Amelia, VA
0 @I19@ INDI
1 NAME Robert /Shipley/
1 SEX M
1 FAMS @F1@
1 BIRT  
2 DATE ABT 1719
0 @I20@ INDI
1 NAME Mary /Todd/
1 SEX F
1 BIRT  
2 DATE ABT 1811
1 FAMS @F9@
0 @F1@ FAM
1 HUSB @I19@
1 WIFE @I1@
1 MARR Y
1 CHIL @I18@
0 @F2@ FAM
1 HUSB @I4@
1 WIFE @I2@
1 MARR  
2 DATE 31 484
2 PLAC Pembroke, Wash, ME
1 CHIL @I5@
0 @F3@ FAM
1 HUSB @I11@
1 WIFE @I3@
1 MARR  
2 DATE 5 JUN 1743
2 PLAC Berks, Co., Penn.
1 CHIL @I8@
0 @F4@ FAM
1 HUSB @I4@
1 MARR  
2 DATE 31 452
2 PLAC Pembroke, Wash, ME
0 @F5@ FAM
1 HUSB @I5@
1 WIFE @I18@
1 MARR  
2 DATE ABT 1772
2 PLAC Pembroke, Wash, ME
1 CHIL @I6@
0 @F6@ FAM
1 HUSB @I14@
1 WIFE @I6@
1 MARR  
2 DATE 12 JUN 1806
2 PLAC Washington Co., Kentucky
1 CHIL @I9@
0 @F7@ FAM
1 HUSB @I8@
1 WIFE @I7@
1 MARR  
2 DATE 1770
2 PLAC Bridgewater, Agusta, VA.
1 CHIL @I14@
0 @F8@ FAM
1 HUSB @I8@
1 MARR  
2 DATE 1767
2 PLAC Lunenburg, Co., VA.
0 @F9@ FAM
1 HUSB @I9@
1 WIFE @I20@
1 MARR  
2 DATE 4 NOV 1842
2 PLAC Springfield, Sangamon, IL
1 CHIL @I13@
1 CHIL @I10@
1 CHIL @I16@
1 CHIL @I15@
0 @F10@ FAM
1 HUSB @I12@
1 WIFE @I17@
1 CHIL @I11@
1 MARR  
2 DATE 1714
2 PLAC Freehold, Monmouth, N.J.
0 @F11@ FAM
1 HUSB @I12@
1 MARR  
2 DATE 1729
2 PLAC Amity, Berks., Co., Penn.
0 @S1@ SOUR
1 TITL American Presidents of the 19th Century
0 @S2@ SOUR
1 TITL Biography of Abraham Lincoln
0 TRLR
`)

  // alert(JSON.stringify(records));
  // hot.loadData(records);
  // alert(JSON.stringify(gedCom_to_GeneTree(test)))
  // hot.loadData(gedCom_to_GeneTree(test))

});