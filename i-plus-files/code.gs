// DO NOT EDIT THIS EXCEPT TO ADD A CALL TO A FUNCTION
function onOpen() {
  const ui = SpreadsheetApp.getUi(); 
  // ------------------------------------ CREATE MENU ------------------------------------
  ui.createMenu('iPlus')
    .addItem('Refresh Data', 'joinSheets')
    .addSubMenu(ui.createMenu('Pre-built Visualizations')
          .addItem('Scatterplot: Attendance vs. Score Improvement', 'preBuiltScatterplot')
          .addItem('Boxplot: Race vs. Score Improvement', 'prebuiltBoxplot')
          .addItem('Jitterplot: Score Improvement by Math Teacher', 'drawTeacherScoreJitterPlot'))
    .addSubMenu(ui.createMenu('Build-Your-Own Visualizations')
          .addItem('Scatterplot', 'customScatterplot')
          .addItem('Boxplot', 'customBoxplot')
          .addItem('Jitterplot', 'customJitterplot'))
    .addToUi();

 // ------------------------------------ UPDATE IF NEEDED ------------------------------------
  // check if update to merged data is needed
  const props = PropertiesService.getDocumentProperties();
  const needsUpdate = props.getProperty("needsUpdate");
  console.log()
  if (needsUpdate === "true") {
    // Example: show a toast message
    SpreadsheetApp.getActiveSpreadsheet().toast("Updates are needed based on recent edits. Please wait until the next message", "WARNING: Updating `Merged Data`", 200);
    joinSheets();
    SpreadsheetApp.getActiveSpreadsheet().toast("Updates are finished. You may continue", "`Merged Data` update finished", 200);
}
}

/**
 * From ChatGPT prompt: https://chatgpt.com/share/68151d54-ebc4-8001-8419-8221c63235fb
 * Triggered whenever a user changes a value in a cell.
 * Sets the "needsUpdate" flag to true in Document Properties.
 */
function onEdit(e) {
  const range = e.range;
  const oldValue = e.oldValue;
  const newValue = range.getValue();

  if (oldValue !== newValue) {
    const props = PropertiesService.getDocumentProperties();
    props.setProperty("needsUpdate", "true");
  }
}