import fetch from 'node-fetch';
import db from '../services/db.js'; // your mysql connection
import { getBrandLogo } from '../branfetch.js';
import { getLogoFromLogoDev } from '../branfetch.js';
import { getMovingAverages } from '../controllers/stockFinnhubController.js';
import {yahooGetFourMovingAverages} from '../controllers/yahooFinancesController.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const AllStockFetching = async () => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.STOCK_API_KEY}`);
    const data = await response.json();

    //console.log('Fetched raw data:', response);
    //console.log('Fetched stock data:', data);
    // Clean the data if needed, choose the fields you want to return
    // and replace with db.query res.json[cleaned]
    //const cleaned = data.map(item => [item.symbol, item.description]);
    
    //all given fields version:
   //const cleaned = data.map(item => [...Object.values(item), null]); // Add null for logo_url
  const cleaned = data.map(item => [item.currency, item.description,item.symbol, null, null, null, null, null, null]); // Add null for logo_url and moving averages

  const insertQuery = 'INSERT IGNORE INTO stocks (currency, name, symbol,logo_url, current_price, ma_150,ma_200,ma_25,ma_50) VALUES ?';

    // Optional: delete old data
    //await db.query('DELETE FROM stocks', () => {
     // console.log('Old stocks cleared');
    //});

    // Insert new data
    db.query(insertQuery, [cleaned], (err) => {
      if (err) {
        console.error('Error inserting stock data:', err);
      } else {
        console.log(`✅ Inserted ${cleaned.length} stock rows`);
      }
    });

    // return the data:
    return data;
  } catch (error) {
    console.error(' Error in scheduled stock fetch:', error);
  }
};

//only for stocks that are followed by users
export const getAllMovingAverages = async () => {
  db.query(`SELECT * FROM stocks JOIN followed_by_user_stocks as fbs ON stocks.symbol = fbs.followed_stock_symbol`, async (err, results) => {
    if (err) {
      console.error('Error fetching stocks:', err);
      return;
    }

    for (const stock of results) {
      const symbol = stock.symbol;
      console.log('Fetching moving averages for symbol:', symbol);
      const movingaverages = await yahooGetFourMovingAverages(symbol); //dictionary

      await sleep(1000); // Sleep for 1 second to avoid hitting API rate limits

      if (!movingaverages) {
        console.error(`No moving averages found for ${symbol}`);
        continue;
      }
      // Update the database with the moving averages
      const updateQuery = 'UPDATE stocks SET ma_25 = ?, ma_50 = ?, ma_150 = ?, ma_200 = ? WHERE symbol = ?';
      db.query(updateQuery, [movingaverages.ma25, movingaverages.ma50, movingaverages.ma150, movingaverages.ma200, symbol], (err) => {
        if (err) {
          console.error('Error updating moving averages:', err);
        } else {
          console.log(`Updated moving averages for ${symbol}`);
        }
      });
    }
  });
}


// Function to check where logos of stocks are missing in the database and add them with the help of the getBrandLogo function (API call)
export const addLogosToDbifNeeded = async () => {
  db.query('SELECT * FROM stocks WHERE logo_url IS NULL', async (err, results) => {
    if (err) {
      console.error('Error fetching stocks without logo:', err);
      return;
    }
    // Use results as a queue
    const queue = results;
    while (queue.length > 0) {
      const stock = queue.shift(); // Remove first item from queue
      try {
        const logo = await getLogoFromLogoDev(stock.name);
        if (logo) {
          const updateQuery = 'UPDATE stocks SET logo_url = ? WHERE name = ?';
          await new Promise((resolve, reject) => {
            db.query(updateQuery, [logo, stock.name], (err) => {
              if (err) {
                console.error('Error updating logo URL:', err);
                reject(err);
              } else {
                console.log(`Updated logo for ${stock.name}`);
                resolve();
              }
            });
          });
        } else {
            console.log(`No logo found for ${stock.name}. Error: ${logo && logo.error ? logo.error : 'No error returned'}`);
        }
      } catch (error) {
        console.error('Error fetching brand logo:', error);
      }
    }
  });
};

export const automaticscript = async () => {
    await AllStockFetching();
    
    //send to the SQL only the stocks that have followed by active users
    await getAllMovingAverages();
    await addLogosToDbifNeeded();
    
    console.log('Finished automatic stock fetching and logo updating at time:', new Date().toLocaleString());
}



