import { getAllMovingAverages } from '../cron/automaticStockFetching.js';
import db from '../services/db.js';
import { getCurrentPrice as oldgetCurrentPrice }  from '../controllers/yahooFinancesController.js'; 
import { setRandomFallback } from 'bcryptjs';

//import { googleSheetProcess } from './googleSheetsController.js';
export const fetchallStocksDB = (req, res) => {
  const limit = parseInt(req.query.limit) || 20000; //getall_remoteDB_stocks?limit=200) several time to avoid too many stocks at once in the client
  const offset = parseInt(req.query.offset) || 0;
  db.query('SELECT * FROM stocks LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};



export const fetbunchofStockDB = (req, res) => {
  //const limit = parseInt(req.query.limit) || 30000; //getall_remoteDB_stocks?limit=200) several time to avoid too many stocks at once in the client
  const symbol = req.query.symbol || 'A';
  db.query('SELECT * FROM stocks WHERE symbol > ? ORDER BY symbol LIMIT 6000', [symbol], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};


const linkStocksAndFollowset = (req, res, followsetId) => { //creates the relationship between followset and stocks (nedded when creating a new followset)
  return new Promise((resolve, reject) => {
    
    const followsetStocksIds = req.body.set_ids; // Array of stock symbols to link -->NOW IT IS AN ARRAY OF IDS AND THIS DOESNT EXIST YET
                                               // problem: we use stock ids in the followset but they dont exist in db and could be different from the stock ids in the stocks table if implented
                                              //the front autogenerates the id so we need instead that the end autogenerates idea and front follows
                                              //OR use only symbols but need to send the symbols in the front end maybe separatly as body + symbols or include them in the body (via original kotlin object) from the front as a list of strings                                        
    const query_pattern = "INSERT INTO followset_stocks (followset_id, stock_id) VALUES (?, ?)";
    let completed = 0;
    let hasError = false;

    if (!Array.isArray(followsetStocksIds) || followsetStocksIds.length === 0) {
      resolve();
      return;
    }

    for (const stockID of followsetStocksIds) {
      db.query(query_pattern, [followsetId, stockID], (err) => {
        if (hasError) return;
        if (err) {
          hasError = true;
          reject(err);
          return;
        }
        completed++;
        if (completed === followsetStocksIds.length) {
          resolve();
        }
      });
    }
  });
}

const setUserFollowsSet = (req, res, userId) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    const { name, image_uri, user_description, notifications_prices } = req.body;

    const query = "INSERT INTO followset (name, image_uri, user_description, notifications_prices, user_id, owner_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [name, image_uri, user_description, notifications_prices, userId, userId], (err, result) => {
      if (err) {
        console.error('setUserFollowsSet: Database error:', err);
        res.status(500).json({ error: 'setUserFollowsSet: Database error' });
        return reject(err);
      }
      resolve(result.insertId);
    });
  });
};


//we can separate the logic of creating a followset and when a user follows it.

export const addNewFollowsettoDB = async (req, res, userId) => {// can be modifed to allow adding other users created followsets
try {
  const followsetId = await setUserFollowsSet(req, res, userId);
  await linkStocksAndFollowset(req, res, followsetId);
  res.json({ success: true, message: 'Followset added successfully' });
}

catch (err) {
  console.error('Database error:', err);
  res.status(500).json({ error: 'addNewFollowsettoDB: Database error' });

}

}

//NOT USED FOR NOW
export const getFollowsetById = (req, res) => {
  const followsetId = req.query.followsetId;
  if (!followsetId) {
    return res.status(400).json({ error: 'Missing followsetId' });
  }
  db.query(
    'SELECT * FROM followset WHERE id = ?',
    [followsetId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Followset not found' });
      }
      res.json(results[0]);
    }
  );
};

//retrieve the followsets user follows 
export const getUserFollowsets = async (userId) => {
  return new Promise((resolve, reject) => {
    if (!userId) {
      return reject({ status: 400, error: 'Missing userId' });
    }

    db.query(
      `SELECT fs.followset_id, fs.name, fs.user_id, fss.stock_id
       FROM followset AS fs
       JOIN followset_stocks AS fss ON fs.followset_id = fss.followset_id
       WHERE fs.user_id = ?`,
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return reject({ status: 500, error: 'Database error' });
        }
        if (results.length === 0) {
          return reject({ status: 404, error: 'No Followset found for this user' });
        }

        const followsetsMap = {};

        results.forEach(row => {
          const id = row.followset_id;
          if (!followsetsMap[id]) {
            followsetsMap[id] = {
              followset_id: id,
              name: row.name,
              user_id: row.user_id,
              set_ids: []
            };
          }
          followsetsMap[id].set_ids.push(parseInt(row.stock_id, 10));
        });

        const groupedFollowsets = Object.values(followsetsMap);
        resolve(groupedFollowsets);
      }
    );
  });
};



//@Modify when we allow users to follow other users' followsets (+add owner/differentiate between owner and user_id(followers) of followsets)
export const getFollowsetsForUser = (userId) => { 
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM followset WHERE user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

export const userfollowstock = (isFollowing, req, res, userId) => {
  const stockSymbol = req.body.stockSymbol;
  if (!userId || !stockSymbol) {
    return res.status(400).json({ error: 'Missing userId or stockSymbol' });
  }

  // Ensure stockSymbol is a string and wrap it in quotes if needed
 
  const formattedStockSymbol = typeof stockSymbol === 'string' ? stockSymbol : String(stockSymbol);

  const query = isFollowing
    ? 'INSERT INTO followed_by_user_stocks (user_id, followed_stock_symbol) VALUES (?, ?)'
    : 'DELETE FROM followed_by_user_stocks WHERE user_id = ? AND followed_stock_symbol = ?';
    

  db.query(query, [userId, formattedStockSymbol], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, message: isFollowing ? 'Stock followed successfully' : 'Stock unfollowed successfully' });
  
  });
};

  export const getNumberOfStocks = (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM stocks', (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ count: results[0].count });
  }); 
  };



export const getUserFollowedStocksIds = (userId, res) => {
  console.log('Received request entered for /user/stocks/pull');

  return new Promise((resolve, reject) => {
    db.query(
      'SELECT stock_id FROM stocks JOIN followed_by_user_stocks ON stocks.symbol = followed_by_user_stocks.followed_stock_symbol WHERE followed_by_user_stocks.user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          if (res) res.status(500).json({ error: 'Database error' });
          return reject(err);
        }
       
      console.log('Sending response for /user/stocks/pull:, results:', results);
        // Return just the array of IDs
        resolve(results);
      }
    );
  });
};


export const getfollowedStocks = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM stocks JOIN followed_by_user_stocks ON stocks.symbol = followed_by_user_stocks.followed_stock_symbol WHERE followed_by_user_stocks.user_id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        // Return the list of followed stock symbols as array
        resolve(results);
      }
    );
  });
};

//MOCK FUNCTION BECAUSE API FOR FETCHING PRICES COST $$$$$$$, REPLACE WITH REAL API CALLS IN THE PRODUCTION
export const getCurrentPrice = async (symbol) => {

  const mock_value= (Math.random() * (500 - 10) + 10).toFixed(2); // Mock price between 10 and 500
  
  db.query(
    'UPDATE stocks SET current_price = ? WHERE symbol = ?',
    [mock_value, symbol], // Mock price between 10 and 500
    (err) => {
      if (err) {
        console.error('Error updating current price:', err);
        return;
      }
      console.log(`Updated current price for ${symbol}`);
    }
  );
  // Return a random mock price between 10 and 500 for testing
  return { symbol, price: mock_value };

};
//run every 30 seconds
  export const fetchUpdatePricesForUser = async(userId) => {
    //const userId = req.query.userId;

    const results = await getfollowedStocks(userId);


    for (let i = 0; i < results.length; i++) {
      await getCurrentPrice(results[i].symbol); //replace with new function
    }


  };

    //run at app launch
    export const fetchUpdateMovingAveragesForUser = async(res, userId) => {
      //const userId = req.query.userId;
      try {
        const results = await getfollowedStocks(userId);
        for (let i = 0; i < results.length; i++) {
          getAllMovingAverages(results[i]);
        }
      } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
      }
    };

      export const getUpdateForFollowedStocksMA = async (res, userId ) => {

      await fetchUpdatePricesForUser(userId);
        const results = await getfollowedStocks(userId);
        const prices = results.map(stock => {
          return {
            symbol: stock.symbol,
            ma_25: stock.ma_25,
            ma_50: stock.ma_50,
            ma_150: stock.ma_150,
            ma_200: stock.ma_200
          };
        });
        res.json(prices);

      }

      export const getUpdateForFollowedStocksPR = async (res, userId ) => {
        await fetchUpdatePricesForUser(userId);

        const results = await getfollowedStocks(userId);

        const prices = results.map(stock => {
          return {
            symbol: stock.symbol,
            current_price: stock.current_price
          };
        });
        res.json(prices);

      }

     