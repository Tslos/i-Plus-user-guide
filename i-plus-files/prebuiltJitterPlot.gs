// This code was made using the following ChatGPT prompts: https://chatgpt.com/c/67eae128-7b00-8005-a3e6-43ade155bd9d
// https://chatgpt.com/c/67f68e37-af84-8005-b724-bad68eeb3c8f
function drawTeacherScoreJitterPlot() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast("Approximately 10 seconds to completion.","Creating Jitterplot....", 15);
  // ------------------------------------ GET DATA ------------------------------------
  const sheet = ss.getSheetByName("Merged Data");
  const data = sheet.getDataRange().getValues();
  var headers = data[0];// get column headers as an array to search through

  catColID = indexByName(headers, 'Math Teacher', "exact", ui_alert = true)
  numColID = indexByName(headers, 'Score Change', "exact", ui_alert = true)
  const filtered_data = data.map(row => [row[catColID], row[numColID]]);

  // Create or clear the target sheet
  let targetSheet = ss.getSheetByName("Jitterplot: Math Teacher/Score Change");
  if (targetSheet) {
    ss.deleteSheet(targetSheet);
  } 
  targetSheet = ss.insertSheet("Jitterplot: Math Teacher/Score Change");
  targetSheet.getRange(1, 1, filtered_data.length, 2).setValues([...filtered_data]);

  // Group data by category
  const grouped = {};
  for (const row of filtered_data) {
    const category = row[0];
    console.log(category)
    const value = parseFloat(row[1]);
    if (category && !isNaN(value)) {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(value);
    }
  }


console.log("GROUPED:", grouped)
  // Create jittered data
  const plotData = [["Category", 'Math Teacher']];
  const categoryList = Object.keys(grouped).sort();
  categoryList.forEach((cat, index) => {
    grouped[cat].forEach(value => {
      const jitter = (Math.random() - 0.5) * 0.4;
      const xValue = index + 1 + jitter;
      plotData.push([xValue, value]);
    });
  });

console.log(categoryList)

  // Write data
  targetSheet.getRange(1, 1, plotData.length, 2).setValues(plotData);

  // Write category key
  targetSheet.getRange(1, 4).setValue(`Math Teacher Key:`);
  categoryList.forEach((cat, i) => {
    targetSheet.getRange(i + 2, 4).setValue(`${i + 1} = ${cat}`);
  });

  // Create chart
  const chartBuilder = targetSheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(targetSheet.getRange(1, 1, plotData.length, 2))
    .setPosition(5, 5, 0, 0)
    .setOption('title', `Math Teacher vs. Score Change Jitter Plot`)
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: 'Math Teacher' })
    .setOption('vAxis', { title: 'Score Change' })
    .setOption('colors', ['rgba(0, 0, 0, 0.25)']);  
  targetSheet.insertChart(chartBuilder.build());

  ss.toast("Jitterplot done!","Creating Jitterplot....", 15);
}