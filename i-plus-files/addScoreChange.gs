
function addScoreChange() {

  // Get the spreadsheet and sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create list of sheet names to loop through
  const sheets = ["6th Grade Math iReady", "7th Grade Math iReady", "8th Grade Math iReady"]

  // Loop through individual grade sheets to add score change columns
  for (let i = 0; i < sheets.length; i++) {

    // Access grade sheet
    var sheet = ss.getSheetByName(sheets[i]);

    if (!sheet) throw new Error(`Sheet "${sheets[i]}" not found. Make sure sheet exists and is correctly named "${sheets[i]}."`);

    var lastCol = sheet.getLastColumn()
    var lastColHead = sheet.getRange(1,lastCol).getValues().toString()

    if (lastColHead==="Score Change") {
      var numRows = sheet.getLastRow()
      var range = sheet.getRange(1, lastCol, numRows, 1);
      range.setValue("")
    }

  // Get the number of rows in the sheet
      var numRows = sheet.getLastRow();


    const col1 = getColByName(sheet, "Initial Scale Score");
    const col2 = getColByName(sheet, "Current Scale Score");

    // Get previous and current score values, starting from second row
    const col1Values = sheet.getRange(2, col1, numRows).getValues();
    const col2Values = sheet.getRange(2, col2, numRows).getValues();
  
  // Calculate differences in scores by looping through col1Values
    const diffValues = col1Values.map((row, i) => {
      // get initial score value of a row
      const val1 = parseFloat(row[0]);
      // get recent score value of that row
      const val2 = parseFloat(col2Values[i][0]);
      // calculate score difference
      return [val2 - val1];
    });

    // Find last column + 1 
    var columnIndex = (sheet.getLastColumn() + 1)

    // Insert column on the end of the sheet
    sheet.insertColumnBefore(columnIndex);

    // Set the new column header to "Score Change"
    sheet.getRange(1, columnIndex).setValue("Score Change");

    // Create a range of the new column for all rows except for the header
    var range = sheet.getRange(2, columnIndex, numRows, 1);

    // Set all cells in this range to the grade value
    range.setValues(diffValues);

}

}