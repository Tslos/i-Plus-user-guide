// This code was made using the following ChatGPT prompts: https://chatgpt.com/c/67eae128-7b00-8005-a3e6-43ade155bd9d
// https://chatgpt.com/c/67f68e37-af84-8005-b724-bad68eeb3c8f
// define function
function customJitterplot() {
  // get access to spreadsheet 
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Prompt user for category and numeric column letters
  const categoryColLetter = ui.prompt("Enter the column letter for the categorical variable:").getResponseText().trim().toUpperCase();
  const valueColLetter = ui.prompt("Enter the column letter for the numeric variable:").getResponseText().trim().toUpperCase();

  // convert column letter to column index number
  const categoryColIndex = columnLetterToIndex(categoryColLetter);
  const valueColIndex = columnLetterToIndex(valueColLetter);

  // get all headers
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // get header of the two relevant colums
  const valueColName = headerRow[valueColIndex];
  const categoryColName = sheet.getRange(1, categoryColIndex + 1).getValue();

  // format title of chart
  const chartTitle = `${categoryColName} vs. ${valueColName} Jitter Plot`;

  // get data
  const rawData = sheet.getDataRange().getValues().slice(1); // skip header

  // Group data by category
  const grouped = {};
  for (const row of rawData) {
    const category = row[categoryColIndex];
    const value = parseFloat(row[valueColIndex]);
    if (category && !isNaN(value)) {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(value);
    }
  }

  // Create new sheet
  const chartSheetName = "Jitter Plot";
  let chartSheet = ss.getSheetByName(chartSheetName);
  if (chartSheet) ss.deleteSheet(chartSheet);
  chartSheet = ss.insertSheet(chartSheetName);

  // Convert grouped data into jittered plotData
  const plotData = [["Category", valueColName]];
  const categoryList = Object.keys(grouped).sort();
  categoryList.forEach((cat, index) => {
    grouped[cat].forEach(value => {
      const jitter = (Math.random() - 0.5) * 0.4; // jitter between -0.2 and +0.2
      const xValue = index + 1 + jitter;
      plotData.push([xValue, value]);
    });
  });

  // Write the data to the sheet
  chartSheet.getRange(1, 1, plotData.length, 2).setValues(plotData);

  // Optional: Add category key for races
  chartSheet.getRange(1, 4).setValue(`${categoryColName} Key:`);
  categoryList.forEach((cat, i) => {
    chartSheet.getRange(i + 2, 4).setValue(`${i + 1} = ${cat}`);
  });

  const chartBuilder = chartSheet.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(chartSheet.getRange(1, 1, plotData.length, 2))
    .setPosition(5, 5, 0, 0)
    .setOption('title', chartTitle)
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: categoryColName })
    .setOption('vAxis', { title: valueColName })
    .setOption('colors', ['rgba(0, 0, 0, 0.25)']);   
  const chart = chartBuilder.build();
  chartSheet.insertChart(chart);

  ui.alert("Jitter Plot created successfully!");
}

// Helper to convert column letter to index (0-based)
function columnLetterToIndex(letter) {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index *= 26;
    index += letter.charCodeAt(i) - 64;
  }
  return index - 1;
}