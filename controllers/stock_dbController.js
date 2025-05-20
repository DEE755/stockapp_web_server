import db from '../services/db.js';

export const fetchallStockDB = async (res) => {
const query=`SELECT * FROM stocks`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching stocks:', err);
            return;
        }
        console.log('Fetched stocks:', results);
        res.status(200).json(results);
    });
    return results;
}


export const loginRequest = (req, res) => {
  const { username, password } = req.query;
  const query = `SELECT * FROM user_login_stocks WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Error');
    if (!results.length) return res.status(401).send('Invalid');
    res.send(results);
  });
};