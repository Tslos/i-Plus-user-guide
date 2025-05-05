function addGradeColumn() {

  // Get the spreadsheet and sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Set 6 as starting grade
  var grade = 6

  // Create list of sheet names to loop through
  const sheets = ["6th Grade Math iReady", "7th Grade Math iReady", "8th Grade Math iReady"]

  // Loop through individual grade sheets to add grade columns
  for (let i = 0; i < sheets.length; i++) {

    // Access grade sheet
    var sheet = ss.getSheetByName(sheets[i]);

    if (!sheet) throw new Error(`Sheet "${sheets[i]}" not found. Make sure sheet exists and is correctly named "${sheets[i]}."`);

    var lastCol = sheet.getLastColumn()
    var lastColHead = sheet.getRange(1,lastCol-1).getValues().toString()

    if (lastColHead==="Grade") {
      var numRows = sheet.getLastRow()
      var range = sheet.getRange(1, lastCol-1, numRows, 1);
      range.setValue("")

      // Insert column before the end of the sheet
      sheet.insertColumnBefore(lastCol-1);

      // Set the new column header to "Grade"
      sheet.getRange(1, lastCol-1).setValue("Grade");

      // Get the number of rows in the sheet
      var numRows = sheet.getLastRow()

      // Create a range of the new column for all rows except for the header
      var range = sheet.getRange(2, lastCol-1, numRows-1, 1);

      // Set all cells in this range to the grade value
      range.setValue(grade)

      // Add 1 to grade for next iteration
      var grade = grade + 1

    } else {

      // Find last column + 1 
      var columnIndex = (sheet.getLastColumn() + 1)

      // Insert column on the end of the sheet
      sheet.insertColumnBefore(columnIndex);

      // Set the new column header to "Grade"
      sheet.getRange(1, columnIndex).setValue("Grade");

      // Get the number of rows in the sheet
      var numRows = sheet.getLastRow()

      // Create a range of the new column for all rows except for the header
      var range = sheet.getRange(2, columnIndex, numRows-1, 1);

      // Set all cells in this range to the grade value
      range.setValue(grade)

      // Add 1 to grade for next iteration
      var grade = grade + 1 
    
    }

}