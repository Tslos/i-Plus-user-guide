/** 
 * Creates a scatterplot comparing a student's Attendance Score (found by searching for a partial match with "Attendance YTD" due to evidence of people changing that header when the number is updated quarterly) with their Score Improvement (found by comparing their Initial and Current Scale Scores. This comparison is made as part of running joinSheets())
 * 
 * Written by Tillie Slosser. Based on code from the customScatterplot() function, which was loosely based on code from the ChatGPT prompt here: 
 * https://chatgpt.com/share/67f2c926-2ae8-8001-b5a9-73b3ecbafb1a
 */
function preBuiltScatterplot() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  ss.toast("Approximately 10 seconds to completion.","Creating Scatterplot....", 15);

  // ------------------------------------ GET DATA ------------------------------------
  const sheet = ss.getSheetByName("Merged Data");
  const data = sheet.getDataRange().getValues();
  var headers = data[0];// get column headers as an array to search through
  const filtered_data = data.map(row => [row[indexByName(headers, 'Attendance YTD', "partial", ui_alert = true)], row[indexByName(headers, 'Score Change', "exact", ui_alert = true)]]);

  console.log(filtered_data)

  // Create or clear the target sheet
  let targetSheet = ss.getSheetByName("Scatterplot: Attendance/Score Change");
  if (!targetSheet) {
    targetSheet = ss.insertSheet("Scatterplot: Attendance/Score Change");
  } else {
    targetSheet.clearContents();
    targetSheet.removeChart(targetSheet.getCharts()[0])}
  
  targetSheet.getRange(1, 1, filtered_data.length, 2).setValues([...filtered_data]);
// ------------------------------------ BUILDING CHART ------------------------------------
  const chart = targetSheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(targetSheet.getRange(1, 1, filtered_data.length + 1, 2))
    .setPosition(1, 4, 0, 0)
    .setOption('title', `Attendance YTD vs Score Change`)
    .setOption("hAxis", {title: "Attendance YTD"})
    .setOption("vAxis", {title: 'Score Change'})
    .setOption('colors', ['rgba(0, 0, 0, 0.25)'])
    .setOption("hAxis.viewWindow.max", 0.45)
    .setOption("hAxis.viewWindow.min", 1)
    .build();

  targetSheet.insertChart(chart);

ss.toast("Done!","Creating Scatterplot....", 10);
}