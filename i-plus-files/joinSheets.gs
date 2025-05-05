function joinSheets() {

  joinGrades()

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = ss.getSheetByName("Elmhurst Data"); // Main sheet
  const sheet2 = ss.getSheetByName("iReadyAllGrades"); // Lookup sheet

  if (!sheet1) throw new Error(`Sheet "Elmhurst Data" not found. Make sure sheet exists and is correctly named "Elmhurst Data"`);
  if (!sheet2) throw new Error(`Sheet "iReadyAllGrades" not found. Make sure sheet exists and is correctly named "iReadyAllGrades". If the sheet does not exist, run joinGrades.gs.`);

 // Create or clear the target sheet
  let targetSheet = ss.getSheetByName("Merged Data");
  if (!targetSheet) {
    targetSheet = ss.insertSheet("Merged Data");
  } else {
    targetSheet.clearContents();
  }

  const sheet1Data = sheet1.getDataRange().getValues(); // Get all data from Sheet1
  const sheet2Data = sheet2.getDataRange().getValues(); // Get all data from Sheet2

  if (sheet1Data.length < 2 || sheet2Data.length < 2) {
    Logger.log("One or both sheets have insufficient data.");
    return;
  }

  const sheet1Headers = sheet1Data[0];
  const sheet2Headers = sheet2Data[0];

  // Map Sheet2 headers to their column indexes
  const sheet2HeaderMap = {};
  sheet2Headers.forEach((header, index) => {
    sheet2HeaderMap[header] = index;
  });

  // Create a map of Sheet2 data using the ID column as the key
  const sheet2Map = new Map();
  for (let i = 1; i < sheet2Data.length; i++) {
    const row = sheet2Data[i];
    const id = row[0]; // ID is in the first column
    sheet2Map.set(id, row);
  }

  // Merge data into Sheet1
  const mergedData = [sheet1Headers.concat(sheet2Headers.slice(1))]; // Merge headers (avoid duplicate ID column)

  for (let i = 1; i < sheet1Data.length; i++) {
    const row1 = sheet1Data[i];
    const id = row1[0]; // ID from Sheet1
    const row2 = sheet2Map.get(id); // Lookup matching row from Sheet2

    if (row2) {
      mergedData.push(row1.concat(row2.slice(1))); // Merge data (avoid duplicate ID)
    } else {
      mergedData.push(row1.concat(Array(sheet2Headers.length -1).fill(""))); // Fill missing columns with empty values
    }
  }

  // Write the merged data back to Sheet1
  targetSheet.clear(); // Clear existing data
  targetSheet.getRange(1, 1, mergedData.length, mergedData[0].length).setValues(mergedData);

  Logger.log(`Successfully merged all Data to sheet "Merged Data".`)
}