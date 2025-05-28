import db from '../services/db.js';

export const fetchallStockDB = (req, res) => {
  const limit = parseInt(req.query.limit) || 10000; // default 100
  const offset = parseInt(req.query.offset) || 0;
  db.query('SELECT * FROM stocks LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
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
}

