import db from '../services/db.js';

export const fetchallStockDB = (req, res) => {
  const limit = parseInt(req.query.limit) || 100; // default 100
  const offset = parseInt(req.query.offset) || 0;
  db.query('SELECT * FROM stocks LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};


export const loginRequest = (req, res) => {
  const { username, password } = req.query;
  const query = `SELECT * FROM user_login_stocks WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Error');
    if (!results.length) return res.status(401).send('Invalid');
    res.send(results);
  });
};