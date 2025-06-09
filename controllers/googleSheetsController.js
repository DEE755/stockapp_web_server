/*import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import db from '../services/db.js';

// Utilitaire pour __dirname (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin du fichier de credentials
const keyPath = path.join(__dirname, '../stockapp-462411-e706a77a0817.json');

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
const sheetName = 'Stocks';
const SHEET_RANGE = `${sheetName}!A2:B`; // A = symbol, B = price

let sheetsClient = null;
let auth = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  auth = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key.replace(/\\n/g, '\n'), // 🔑 Correction des retours à la ligne
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  await auth.authorize();
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getSheetRows(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });
  return res.data.values || [];
}

async function appendNewSymbols(sheets, inputStocks) {
  const existing = await getSheetRows(sheets);
  const existingSymbols = new Set(existing.map(row => row[0]));

  const filteredInputStocks = inputStocks.filter(s => !existingSymbols.has(s));

  if (filteredInputStocks.length === 0) return;

  const newRows = filteredInputStocks.map(stock => [
    stock.symbol,
    `=GOOGLEFINANCE("${stock.symbol}", "price")`
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: SHEET_RANGE,
    valueInputOption: 'USER_ENTERED',
    resource: { values: newRows }
  });
}

async function readPrices(sheets, inputStocks) {
  const allRows = await getSheetRows(sheets);
  const prices = {};
  const inputSymbols = inputStocks.map(stock => stock.symbol);
  for (const [symbol, price] of allRows) {
    if (inputSymbols.includes(symbol)) {
      prices[symbol] = price;
    }
  }
  return prices;
}

export async function googleSheetProcess(stocks) {
  try {
    const sheets = await getSheetsClient();
    await appendNewSymbols(sheets, stocks);

    console.log('Waiting 60 seconds for price data to populate...');
    await new Promise(r => setTimeout(r, 60000));

    const prices = await readPrices(sheets, stocks);

    for (const stock of stocks) {
      const symbol = stock.symbol;
      const price = prices[symbol];
      console.log(`${symbol}: $${price}`);
      if (price) {
        try {
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE stocks SET current_price = ? WHERE symbol = ?`,
              [price, symbol],
              (err) => {
                if (err) {
                  console.error('Error updating current price:', err);
                  return reject(err);
                }
                resolve();
              }
            );
          });
        } catch (error) {
          console.error('Error updating DB for', symbol, error.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in googleSheetProcess:', err.message);
  }
}
*/