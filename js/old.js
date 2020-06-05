//<!-- create export to PED button -->
		<button id="export-ped" class="intext-btn">Download PED</button>
		<script> var button2 = document.getElementById('export-ped');
		
  		var exportPlugin2 = hot.getPlugin('exportFile');
		button2.addEventListener('click', function() {
			//save data
			let myDeepClone = JSON.stringify(hot.getSourceData())
			let myDeepCloneCols = JSON.stringify(cols)
			let myDeepCloneColsHeaders = JSON.stringify(cols_header)

			//select columns
			//find column index
			var val = 'Name'
			var index = cols.findIndex(function(item, i){
				return item.data === val
			});
			if (index > -1) {
				cols.splice(index, 1);
				cols_header.splice(index, 1);
			}
			hot.updateSettings({
				columns: cols,
				colHeaders: cols_header
			})

			//search and replace
			function SearchReplace(query, replace, column){
				var search = hot.getPlugin('search'); // => need to limit to colonne
    			queryResult = search.query(query); //query
				hot.render()

				//var replace = 1 //replace
				for (row = 0, r_len = queryResult.length; row < r_len; row++) {
    				if(queryResult[row].col === column-1) {
						hot.setDataAtCell(queryResult[row].row, queryResult[row].col, replace);
					};
    			};
			};
			SearchReplace("M",1,5);
			SearchReplace("F",2,5);

			//export
			exportPlugin2.downloadFile('csv', {
				bom: false,
				columnDelimiter: '\t',
				columnHeaders: false,
				exportHiddenColumns: false,
				exportHiddenRows: false,
				fileExtension: 'tsv',
				filename: 'ped_[YYYY]-[MM]-[DD]',
				mimeType: 'text/csv',
				rowDelimiter: '\r\n',
				rowHeaders: false
			});

			//reload data
			hot.loadData(JSON.parse(myDeepClone));
			hot.updateSettings({
				columnHeaders: true,
				columns: [{
					data: 'FamID'
					}, {
					data: 'Name'
					}, {
					data: 'IndivID'
					}, {
					data: 'FathID'
					}, {
					data: 'MothID'
					}, {
					data: 'Sex'
					}], //JSON.parse(myDeepCloneCols),
				colHeaders: ['FamID','Name','IndivID','FathID','MothID','Sex'] //JSON.parse(myDeepCloneColsHeaders)
			});
			hot.render()
		});
		</script>