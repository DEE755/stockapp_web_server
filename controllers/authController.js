import db from '../services/db.js';

export const submitForm = (req, res) => {
  const { username, password } = req.body;
  const query = 'INSERT INTO user_login_stocks (username, password) VALUES (?, ?)';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Error saving data');
    res.status(200).json('Saved!');
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
