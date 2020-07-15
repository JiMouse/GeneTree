// Synchronously read a text file from the web server with Ajax
// from https://stackoverflow.com/questions/36921947/read-a-server-side-file-using-javascript/41133213

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

//Convert tsvtoJSON
function tsvJSON(tsv) {
    const lines = tsv.split('\n');
    const headers = lines.shift().split('\t');
    return lines.map(line => {
      const data = line.split('\t');
      return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
      }, {});
    });
};

//Upload HPO terms
var filePath = 'data/HPO_fr_CISMeF_1611083.txt',
    tsv = loadFile(filePath),
    HPO = tsvJSON(tsv),
    HPOArr = [];

for(var i in HPO) {
  HPOArr.push(HPO[i].FR_LABEL);
}

$(document).ready(function() {
  $( "#myCheckHPO" ).click(function() {
    let checkBox = document.getElementById("myCheckHPO");
    if (checkBox.checked == true){
      document.getElementById('myCheckOnco').checked = false;
      hot.updateSettings({
          cells: function (row, col, prop) {
              isDiseaseProp = function(val) {return prop == val};
              if (colsDiseases.some(isDiseaseProp)) {
                  var cellProperties = {};
                  cellProperties.type = 'dropdown';
                  cellProperties.source = HPOArr;
                  return cellProperties;
                }
              },
              columns: cols,
              colHeaders: cols_header
      });
    } else {
      //autRenderer without onco
      hot.updateSettings({
          cells: function (row, col, prop) {
              isDiseaseProp = function(val) {return prop == val};
              if (colsDiseases.some(isDiseaseProp)) {
                  var cellProperties = {};
                  cellProperties.renderer = autRenderer2;
                  cellProperties.type = 'autocomplete';
                  return cellProperties;
              }
          },
          columns: cols,
          colHeaders: cols_header
      });
    }
  });
});

