import db from '../services/db.js';

export const fetchallStocksDB = (req, res) => {
  const limit = parseInt(req.query.limit) || 30000; //getall_remoteDB_stocks?limit=200) several time to avoid too many stocks at once in the client
  const offset = parseInt(req.query.offset) || 0;
  db.query('SELECT * FROM stocks LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

export const fetbunchofStockDB = (req, res) => {
  //const limit = parseInt(req.query.limit) || 30000; //getall_remoteDB_stocks?limit=200) several time to avoid too many stocks at once in the client
  const symbol = req.query.symbol || 'A';
  db.query('SELECT * FROM stocks WHERE symbol > ? ORDER BY symbol', [symbol], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

export const userfollowstock = (isFollowing, req, res) => {
  const { userId, stockSymbol } = req.body;
  if (!userId || !stockSymbol) {
    return res.status(400).json({ error: 'Missing userId or stockSymbol' });
  }

  const query = isFollowing
    ? 'INSERT INTO followed_by_user_stocks (user_id, followed_stock_symbol) VALUES (?, ?)'
    : 'DELETE FROM followed_by_user_stocks WHERE user_id = ? AND followed_stock_symbol = ?';

  db.query(query, [userId, stockSymbol], (err) => {
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


 