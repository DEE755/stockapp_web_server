import db from '../services/db.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const keys = require('../keys/stockapp-462411-e706a77a0817.json');

import { google } from 'googleapis';


const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID; 

const auth = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

async function createAndSetupSheet() {
  const sheets = google.sheets({ version: 'v4', auth });

   // 1. Create new spreadsheet
  await sheets.spreadsheets.create({
    resource: {
      properties: { title: 'My Stock Tracker' },
      sheets: [{
        properties: { title: 'Stocks' }
      }]
    }
  });
}

  const sheetName = 'Stocks';
const SHEET_RANGE = `${sheetName}!A2:B`; // A = symbol, B = price

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
  await auth.authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  await appendNewSymbols(sheets, stocks);

  // Wait for GOOGLEFINANCE formulas to populate
  console.log('Waiting 60 seconds for price data to populate...');
  await new Promise(r => setTimeout(r, 60000));

  const prices = await readPrices(sheets, stocks);
for (const stock of stocks) {
    const symbol = stock.symbol;
    const price = prices[symbol];
    console.log(`${symbol}: $${price}`);
    if (price) {
      try {
        console.log(`Current price for ${symbol}:`, price);
        // Await the DB update
        await new Promise((resolve, reject) => {
          db.query(
            `UPDATE stocks SET current_price = ? WHERE symbol = ?`,
            [price, symbol],
            (err) => {
              if (err) {
                console.error('Error updating current price:', err);
                console.log('Failed to update price for symbol:', symbol);
                return reject(err);
              }
              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Error fetching current price for', symbol, error.message);
        return null;
      }
    }
    // Optionally: return price or collect results if needed
  }
  // res.json({ symbol, price }); // Remove or adapt as needed for your use case
}

