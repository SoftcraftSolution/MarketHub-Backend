const { google } = require('googleapis');
require('dotenv').config(); // Load environment variables

// Load Google Sheets credentials from environment variable
const sheetConfigStr = process.env.GOOGLE_SHEET_CONFIG;

// Check if the GOOGLE_SHEET_CONFIG is set
if (!sheetConfigStr) {
  throw new Error('GOOGLE_SHEET_CONFIG environment variable is not set or is undefined.');
}

// Parse the JSON string and handle errors
let sheetConfig;
try {
  sheetConfig = JSON.parse(sheetConfigStr);
} catch (error) {
  throw new Error('Error parsing GOOGLE_SHEET_CONFIG: ' + error.message);
}

// Log the loaded values for debugging
console.log('GOOGLE_SHEET_CONFIG:', sheetConfig);
console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID);

// Replace escaped newlines with actual newlines in the private key
if (sheetConfig.private_key) {
  sheetConfig.private_key = sheetConfig.private_key.replace(/\\n/g, '\n');
} else {
  throw new Error('Private key is not defined in GOOGLE_SHEET_CONFIG.');
}

// Load your environment variables for Spreadsheet ID
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'DELHI';

// Authenticate using Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: sheetConfig,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create Sheets API instance
const sheets = google.sheets({ version: 'v4', auth });

// Function to update the Google Sheet
exports.updatesheet = async (req, res) => {
  try {
    const { CATEGARY, TYPE, 'SUB CATEGARY': SUB_CATEGARY, PRICE } = req.body;

    // Prepare data to be appended
    const values = [[CATEGARY, TYPE, SUB_CATEGARY, PRICE]];

    const resource = {
      values,
    };

    // Append data to Google Sheets
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource,
    });

    res.status(200).send({
      status: 'success',
      updatedRows: result.data.updates.updatedRows,
    });
  } catch (error) {
    console.error('Error updating Google Sheet:', error); // Log the error
    res.status(500).send({ status: 'error', message: error.message });
  }
};
