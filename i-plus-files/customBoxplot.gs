// define function
function customBoxplot() {
  // get access to spreadsheet app
  const ui = SpreadsheetApp.getUi();
  // get access to current spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // get access to specific sheet
  const sheet = ss.getActiveSheet();

  // Prompt user for category and numeric column letters
  const categoryColLetter = ui.prompt("Enter the column letter for the categorical variable:").getResponseText().trim().toUpperCase();
  const numericColLetter = ui.prompt("Enter the column letter for the numeric variable:").getResponseText().trim().toUpperCase();

  // convert column letter to column index number
  const categoryColIndex = columnLetterToIndex(categoryColLetter)-1;
  const numericColIndex = columnLetterToIndex(numericColLetter)-1;

  // get all headers
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // get header of the two relevant colums
  const numericColName = headerRow[numericColIndex];
  const categoryColName = headerRow[categoryColIndex];

  // format title of chart
  const chartTitle = `${categoryColName} vs. ${numericColName} Boxplot`;

  // get data
  const rawData = sheet.getDataRange().getValues().slice(1); // skip header

  // Group data by category
  const grouped = {};
  // loop through each row
  for (const row of rawData) {
    // get category using the row of the loop and the category column index
    const category = row[categoryColIndex];
    // get the value using the row of the loop and the numeric column index
    const value = parseFloat(row[numericColIndex]);
    // if category is valid and value is a valid number
    if (category && !isNaN(value)) {
      // if category is not found yet
      if (!grouped[category]) {
        // make a new array for that new category
        grouped[category] = [];
      }
      // add value to array
      grouped[category].push(value);
    }
  }

  // get global min and max for y-axis adjustment
  let globalMin = Infinity;
  let globalMax = -Infinity;

  // for each category of values in grouped
  for (const values of Object.values(grouped)) {
    // find minimum
    const min = Math.min(...values);
    // find maximum
    const max = Math.max(...values);
    // set minimum as new global min if it is smaller
    if (min < globalMin) globalMin = min;
    // set maximum as new global max if it is larger
    if (max > globalMax) globalMax = max;
  }

  // round to nearest 10s at least 10 units away
  const yAxisMin = Math.floor((globalMin - 10) / 10) * 10;
  const yAxisMax = Math.ceil((globalMax + 10) / 10) * 10;

  // prepare open, high, low, close (ohlc) data
  const ohlcData = [];
  
  // loop through each cateogry in grouped data, where 'category' is the key, and 'values' is the array of numbers
  for (const [category, values] of Object.entries(grouped)) {
    // skip iteration if there are no values
    if (values.length < 1) continue;
    // make a new array in the ohlcData with the order category, low, open, close, high
    ohlcData.push([
      // get category
      category,
      // low: get minimum 
      Math.min(...values),     
      // open: get 75th percentile value
      getPercentile(values, 0.75),
      // close: get 25th percentile value
      getPercentile(values, 0.25),  
      // high: get maximum
      Math.max(...values)
    ]);
  }

  // Sort by category
  ohlcData.sort((a, b) => (a[0] > b[0]) ? 1 : -1);

  // Create new sheet
  // new sheet name
  const chartSheetName = "Boxplot " + new Date().toLocaleString();
  // make new sheet with name
  chartSheet = ss.insertSheet(chartSheetName);

  // add headers to new sheet
  chartSheet.getRange(1, 1, 1, 5).setValues([['Category', 'Low', 'Open', 'Close', 'High']]);
  // add data to new sheet
  chartSheet.getRange(2, 1, ohlcData.length, 5).setValues(ohlcData);

  // Define chart range (A1:E + data rows)
  const range = chartSheet.getRange(2, 1, ohlcData.length, 5); // do not include header
  // make new chart
  const chartBuilder = chartSheet.newChart()
    // use built-in candlestick chart type
    .setChartType(Charts.ChartType.CANDLESTICK)
    // add range
    .addRange(range)
    // set chart position
    .setPosition(2, 7, 0, 0)
    // set title
    .setOption('title', chartTitle)
    // set no legend
    .setOption('legend', { position: 'none' })
    // set x-axis label
    .setOption('hAxis', {title: categoryColName})
    // set y-axis label and viewing window
    .setOption('vAxis', {
      title: numericColName,
      viewWindow: {
        min: yAxisMin,
        max: yAxisMax
      }
    });;

  // build chart
  const chart = chartBuilder.build();
  // insert chart to sheet
  chartSheet.insertChart(chart);

  // send confirmation message to user 
  ui.alert("Boxplot created successfully!");
}

// Helper function to get column index by column letter
/**
 * Returns column index from column letter, e.g. (A, B, Z, AA, AB)
 * @param {String} letter: the letter of the column to get the index of
 * @return {Integer}: index: the column index
 */
function columnLetterToIndex(letter) {
  // set index at 0
  let index = 0;
  // iterate the number of characters in the column letter string
  for (let i = 0; i < letter.length; i++) {
    // multiply index by 26
    index *= 26;
    // get ASCII code and subtract 64 because 'A'.charCodeAt(0) = 65
    index += letter.charCodeAt(i) - 64;
  }
  // return index
  return index;
}

// Helper function to get 25% and 75% quartile values for open and close
/**
 * Gets 25% and 75% quartile values 
 * @param {Array} arr: the array of values to get the quartiles from
 * @param {Float}: percentile: the percentile to get in decimal form, e.g. (.25, .75)
 * @return {Number}: the value at the specified percentile
 */
function getPercentile(arr, percentile) {
  // make a copy of the array and sort it in ascending order
  const sorted = [...arr].sort((a, b) => a - b);
  // get the index corresponding to the specified percentile
  const index = (sorted.length - 1) * percentile;
  // round index down
  const lower = Math.floor(index);
  // round index up 
  const upper = Math.ceil(index);
  // if index is integer, return the index
  if (lower === upper) return sorted[lower];
  // if index is not integer, estimate the percentile value
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}