import fetch from 'node-fetch';
import db from '../services/db.js'; // your mysql connection
import { getBrandLogo } from '../branfetch.js';

export const AllStockFetching = async () => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.STOCK_API_KEY}`);
    const data = await response.json();

    // Clean the data if needed, choose the fields you want to return
    // and replace with db.query res.json[cleaned]
    //const cleaned = data.map(item => [item.symbol, item.description]);
    
    //all given fields version:
   const cleaned = data.map(item => [...Object.values(item), null]); // Add null for logo_url

  const insertQuery = 'INSERT IGNORE INTO stocks (currency, name, display_symbol, figi, isin, mic, share_class_figi, symbol, symbol2, security_type, logo_url) VALUES ?';

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
    console.error('🚨 Error in scheduled stock fetch:', error);
  }
};

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
        const logo = await getBrandLogo(stock.name);
        if (logo) {
          const updateQuery = 'UPDATE stocks SET logo_url = ? WHERE name = ?';
          await new Promise((resolve, reject) => {
            db.query(updateQuery, [logo, stock.name], (err) => {
              if (err) {
                console.error('Error updating logo URL:', err);
                reject(err);
              } else {
                console.log(`✅ Updated logo for ${stock.symbol}`);
                resolve();
              }
            });
          });
        } else {
          console.log(`🚨 No logo found for ${stock.symbol}`);
        }
      } catch (error) {
        console.error('Error fetching brand logo:', error);
      }
    }
  });
};

export const automaticscript = async () => {
    await AllStockFetching();
    await addLogosToDbifNeeded();
    console.log('✅ Finished automatic stock fetching and logo updating at time:', new Date().toLocaleString());
}
