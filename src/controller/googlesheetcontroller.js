
const { google } = require('googleapis');
require('dotenv').config();

// Load Google Sheets credentials from environment variable
const sheetConfig = JSON.parse(process.env.GOOGLE_SHEET_CONFIG);

// Replace escaped newlines with actual newlines in the private key
sheetConfig.private_key = sheetConfig.private_key.replace(/\\n/g, '\n');

// Load your environment variables for Spreadsheet ID
const SPREADSHEET_ID = process.env.SPREADSHEET_ID 
const RANGE = 'DELHI';

// Authenticate using Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: sheetConfig,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create Sheets API instance
const sheets = google.sheets({ version: 'v4', auth });

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
    res.status(500).send({ status: 'error', message: error.message });
  }
};
