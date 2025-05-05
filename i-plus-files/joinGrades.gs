function joinGrades() {
  addGradeColumn()
  addScoreChange()

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Names of the sheets you want to merge
  const sheetNames = ['6th Grade Math iReady', '7th Grade Math iReady', '8th Grade Math iReady'];
  const targetSheetName = 'iReadyAllGrades';

  let mergedData = [];
  
  sheetNames.forEach((name, index) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error(`Sheet "${name}" not found. Make sure sheet exists and is correctly named "${name}"`);

    const data = sheet.getDataRange().getValues();

    // Skip headers from all but the first sheet
    if (index === 0) {
      mergedData = mergedData.concat(data);
    } else {
      mergedData = mergedData.concat(data.slice(1));
    }
  });

  // Create or clear the target sheet
  let targetSheet = ss.getSheetByName(targetSheetName);
  if (!targetSheet) {
    targetSheet = ss.insertSheet(targetSheetName);
  } else {
    targetSheet.clearContents();
  }

  // Paste the merged data
  targetSheet.getRange(1, 1, mergedData.length, mergedData[0].length).setValues(mergedData);

  Logger.log(`Merged ${sheetNames.length} sheets into "${targetSheetName}"`);
}