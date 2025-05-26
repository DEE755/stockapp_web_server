import db from '../services/db.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


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


export const secured_loginRequest = async (req, res) => {
  const { username, password } = req.query;

  try {
    // Check if the user exists
    const user = await getUserFromDb(username);
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    // 2. Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token with key that we generated in .env file from open SSH
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Internal server error');
  }
}



export const getUserFromDb = async (username) => {

  
  const query = `SELECT * FROM user_login_stocks WHERE username = ?`;
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).send('Error');
    if (!results.length) return res.status(401).send('Invalid');
    
    return results[0];
  });
};



