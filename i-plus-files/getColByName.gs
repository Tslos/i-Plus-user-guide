function getColByName(sheet, name) {
  
  // get column headers as an array to search through
  var headers = sheet.getDataRange().getValues().shift();
  
  // search array looking for specific text to return its position
  var colindex = headers.indexOf(name);
  
  return colindex+1;
  
}