/** 
 * Creates a scatterplot based on 2 user-specified columns. The user can optionally specify a 3rd column to be used to facet the plots in order to compare linear relationships between groups of data. 
 * 
 * Written by Tillie Slosser. Code is loosely based on the following ChatGPT prompt:
 * https://chatgpt.com/share/67f2c926-2ae8-8001-b5a9-73b3ecbafb1a
 */
function customScatterplot() {
  // --------------------------- SETUP ---------------------------
  // get active sheets, setup UI interface, pull data
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  const data = sheet.getDataRange().getValues(); 
   
  // Helper Functions
/**
 * Prompts a user with specified text, and optionally re-prompts upon invalid inputs.
 * @param {String} promptText: The message displayed to the user
 * @param {array}: validValues: The list of expected acceptable user responses. An array of strings in UPPERCASE
 * @return {response}: the user's response, converted to UPPERCASE and without trailing/leading whitespace
 */
function promptUntilValid(promptText, validValues = null) {
  let response;
  while (true){
    const result = ui.prompt(promptText);
    //if (result.getSelectedButton() !== ui.Button.OK) return null;
    response = result.getResponseText().trim().toUpperCase();
    if (!validValues|| validValues.includes(response)) break;
  }
  return response;
}

/** 
 * Converts a letter (or two) to an integer for data indexing.
 * @param {String} letter: the letter of the column (e.g. A, B, C, AA, AB)
 */
function columnLetterToNumber(label) {
let index = 0;
  label = label.toUpperCase();
  for (let i = 0; i < label.length; i++) {
    index *= 26;
    index += label.charCodeAt(i) - 'A'.charCodeAt(0) +1;
  }
  return index-1;
}

/**
 * Collects data from a specified column
 * @param {Array} data: the data in which to search, pulled directly from a sheet (i.e., not subsetted already)
 * @param {String} colLetter: A letter or two, in uppercase (e.g., 'A', 'AB')
 * @return the values from the specified column letter. 
 */
function getColumnData(data, colLetter) {
  console.log("getColumnData is working on letter:", colLetter, "corresponding to index:", columnLetterToNumber(colLetter))
  return data.map(row => row[columnLetterToNumber(colLetter)]);
}

  // ------------------------------------ PROMPTING USER ------------------------------------

  valid_columns = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z', 'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ','BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ','CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ','DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ','EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ','FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ','GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ','HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ','IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ','JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR','JS','JT','JU','JV','JW','JX','JY','JZ','KA','KB','KC','KD','KE','KF','KG','KH','KI','KJ','KK','KL','KM','KN','KO','KP','KQ','KR','KS','KT','KU','KV','KW','KX','KY','KZ','LA','LB','LC','LD','LE','LF','LG','LH','LI','LJ','LK','LL','LM','LN','LO','LP','LQ','LR','LS','LT','LU','LV','LW','LX','LY','LZ','MA','MB','MC','MD','ME','MF','MG','MH','MI','MJ','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NB','NC','ND','NE','NF','NG','NH','NI','NJ','NK','NL','NM','NN','NO','NP','NQ','NR','NS','NT','NU','NV','NW','NX','NY','NZ','OA','OB','OC','OD','OE','OF','OG','OH','OI','OJ','OK','OL','OM','ON','OO','OP','OQ','OR','OS','OT','OU','OV','OW','OX','OY','OZ','PA','PB','PC','PD','PE','PF','PG','PH','PI','PJ','PK','PL','PM','PN','PO','PP','PQ','PR','PS','PT','PU','PV','PW','PX','PY','PZ','QA','QB','QC','QD','QE','QF','QG','QH','QI','QJ','QK','QL','QM','QN','QO','QP','QQ','QR','QS','QT','QU','QV','QW','QX','QY','QZ','RA','RB','RC','RD','RE','RF','RG','RH','RI','RJ','RK','RL','RM','RN','RO','RP','RQ','RR','RS','RT','RU','RV','RW','RX','RY','RZ','SA','SB','SC','SD','SE','SF','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SP','SQ','SR','SS','ST','SU','SV','SW','SX','SY','SZ','TA','TB','TC','TD','TE','TF','TG','TH','TI','TJ','TK','TL','TM','TN','TO','TP','TQ','TR','TS','TT','TU','TV','TW','TX','TY','TZ','UA','UB','UC','UD','UE','UF','UG','UH','UI','UJ','UK','UL','UM','UN','UO','UP','UQ','UR','US','UT','UU','UV','UW','UX','UY','UZ','VA','VB','VC','VD','VE','VF','VG','VH','VI','VJ','VK','VL','VM','VN','VO','VP','VQ','VR','VS','VT','VU','VV','VW','VX','VY','VZ','WA','WB','WC','WD','WE','WF','WG','WH','WI','WJ','WK','WL','WM','WN','WO','WP','WQ','WR','WS','WT','WU','WV','WW','WX','WY','WZ','XA','XB','XC','XD','XE','XF','XG','XH','XI','XJ','XK','XL','XM','XN','XO','XP','XQ','XR','XS','XT','XU','XV','XW','XX','XY','XZ','YA','YB','YC','YD','YE','YF','YG','YH','YI','YJ','YK','YL','YM','YN','YO','YP','YQ','YR','YS','YT','YU','YV','YW','YX','YY','YZ','ZA','ZB','ZC','ZD','ZE','ZF','ZG','ZH','ZI','ZJ','ZK','ZL','ZM','ZN','ZO','ZP','ZQ','ZR','ZS','ZT','ZU','ZV','ZW','ZX','ZY','ZZ']
  // get X data
  const xLetter = promptUntilValid("Select X axis variable (enter a column letter):", valid_columns);
  console.log("USER INPUT: ", xLetter)
  if (!xLetter) return;
  const X_col = getColumnData(data, xLetter);
  const X_header = X_col[0];
  console.log("X_header", X_header)
  // get Y data
  const yLetter = promptUntilValid("Select a Y axis variable (enter a column letter):", valid_columns);
  if (!yLetter) return;
  const Y_col = getColumnData(data, yLetter);
  const Y_header = Y_col[0];
  console.log("Y_header", Y_header)
  // get facet (and if facet is desired, get facet data)
  let facet = null;
  let facet_col = null;
  let facet_header = '';
  let facet_values = [];
  let facetLetter='';
  while (true) {
    const facetAnswer = promptUntilValid("Would you like to facet this graph by anything (yes or no)? Faceting refers to creating a separate scatterplot for each group in a column, e.g. Math Teacher, Student Race, etc", ['YES', 'NO']);
    if (facetAnswer === 'NO') {
      break;
    } else if (facetAnswer === 'YES') {
      facetLetter = promptUntilValid("Select a variable to facet by (enter a column letter):", valid_columns);
      if (!facetLetter) return;
      facet_col = getColumnData(data, facetLetter);
      facet_header = facet_col[0];
      console.log("Facet header:", facet_header)
      facet_values = [...new Set(facet_col.slice(1))];
      facet = true;
      break;
    } else {
      ui.alert("Please enter 'yes' or 'no'.");
    }
  }

// ------------------------------------ BUILDING CHARTS ------------------------------------
//initialize new sheet for filtered data + plots
  const newSheetName = "Scatterplot " + new Date().toLocaleString();
  const new_sheet = ss.insertSheet(newSheetName);
  if (facet) {
    //iterate through unique values in facet column
    facet_values.forEach((this_value, index) => {
      console.log("this value is", this_value)
      if (this_value == ''){return;} // skip over blank facets - someone probably deleted something accidentally, the plot won't be useful
     const filtered_data = data
     //get rows for which the value in facet_col is the same as this_value
     .filter((row,i) => row[columnLetterToNumber(facetLetter)]== this_value) 
     //map new data to filtered_data. X col is first, then Y col
     .map(row => [row[columnLetterToNumber(xLetter)], row[columnLetterToNumber(yLetter)]]);
     console.log(filtered_data)
      if (filtered_data.length === 0) return;
      const startCol = index * 4 + 1;
      const range = new_sheet.getRange(1, startCol, filtered_data.length + 1, 2);
      range.setValues([[X_header, Y_header], ...filtered_data]);

      const chart = new_sheet.newChart()
        .setChartType(Charts.ChartType.SCATTER)
        .addRange(new_sheet.getRange(1, startCol, filtered_data.length + 1, 2))
        .setPosition(1, startCol + 2, 0, 0)
        .setOption('title', `${X_header} vs ${Y_header}`)
        .setOption('subtitle', `Faceted by ${facet_header}: ${this_value}`)
        .setOption("hAxis", {title: X_header})
        .setOption("vAxis", {title: Y_header})
        .setOption('colors', ['rgba(0, 0, 0, 0.25)'])
        .build();

      new_sheet.insertChart(chart);
    });
  } else {
    const filtered_data = data.slice(1).map(row => [row[columnLetterToNumber(xLetter)], row[columnLetterToNumber(yLetter)]]);
    new_sheet.getRange(1, 1, filtered_data.length + 1, 2)
      .setValues([[X_header, Y_header], ...filtered_data]);

    const chart = new_sheet.newChart()
      .setChartType(Charts.ChartType.SCATTER)
      .addRange(new_sheet.getRange(1, 1, filtered_data.length + 1, 2))
      .setPosition(1, 4, 0, 0)
      .setOption('title', `${X_header} vs ${Y_header}`)
      .setOption("hAxis", {title: X_header})
      .setOption("vAxis", {title: Y_header})
      .setOption('colors', ['rgba(0, 0, 0, 0.25)'])
      .build();

    new_sheet.insertChart(chart);
  }

  ui.alert("Scatterplot(s) created in new sheet: " + newSheetName);
}