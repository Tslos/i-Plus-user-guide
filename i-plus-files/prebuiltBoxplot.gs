// define function to make pre-made boxplot
function prebuiltBoxplot() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast("Approximately 5 seconds to completion.","Creating Boxplot....", 15);
  // ------------------------------------ GET DATA ------------------------------------
  const sheet = ss.getSheetByName("Merged Data");
  const data = sheet.getDataRange().getValues();
  var headers = data[0];// get column headers as an array to search through

  catColID = indexByName(headers, 'Race', "exact", ui_alert = true)
  numColID = indexByName(headers, 'Score Change', "exact", ui_alert = true)
  const filtered_data = data.map(row => [row[catColID], row[numColID]]);

  // Create or clear the target sheet
  let targetSheet = ss.getSheetByName("Boxplot: Race/Score Change");
  if (targetSheet) {
    ss.deleteSheet(targetSheet);
  } 
  targetSheet = ss.insertSheet("Boxplot: Race/Score Change");
  //targetSheet.getRange(1, 1, filtered_data.length, 2).setValues([...filtered_data]);

  // Group data by category
  const grouped = {};
  // loop through each row
  for (const row of filtered_data) {
    // get category using the row of the loop and the category column index
    const category = row[0];
    // get the value using the row of the loop and the numeric column index
    const value = parseFloat(row[1]);
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

  // add headers to new sheet
  targetSheet.getRange(1, 1, 1, 5).setValues([['Category', 'Low', 'Open', 'Close', 'High']]);
  // add data to new sheet
  targetSheet.getRange(2, 1, ohlcData.length, 5).setValues(ohlcData);

  // Define chart range (A1:E + data rows)
  const range = targetSheet.getRange(2, 1, ohlcData.length, 5); // do not include header
  // make new chart
  const chartBuilder = targetSheet.newChart()
    // use built-in candlestick chart type
    .setChartType(Charts.ChartType.CANDLESTICK)
    // add range
    .addRange(range)
    // set chart position
    .setPosition(2, 7, 0, 0)
    // set title
    .setOption('title', `Race vs. Score Change Boxplot`)
    // set no legend
    .setOption('legend', { position: 'none' })
    // set x-axis label
    .setOption('hAxis', {title: 'Race'})
    // set y-axis label and viewing window
    .setOption('vAxis', {
      title: 'Score Change',
      viewWindow: {
        min: yAxisMin,
        max: yAxisMax
      }
    });
  // build chart
  const chart = chartBuilder.build();
  // insert chart to sheet
  targetSheet.insertChart(chart);

  // send confirmation message to user 
  ss.toast("Boxplot done!","Creating Boxplot....", 15);
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