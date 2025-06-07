import db from '../services/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const submitForm = async (req, res) => {
  console.log('Received signup request:');
   const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // 1. Check if user exists
        const existing = await getUserFromDb(username);
        if (existing) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Store user
        const newUserId = await insertUser(username/*email instead in the future*/, hashedPassword); // should return user_id

        // 4. Create tokens
        const accessToken = jwt.sign(
            { user_id: newUserId },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        const refreshToken = jwt.sign(
            { user_id: newUserId },
            process.env.REFRESH_SECRET,
            { expiresIn: '30d' }
        );

        // 5. Return tokens
        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken,
            username: username, //in the future differentiate between username and email then we will return here the username from db while login with email
            userId: newUserId // Return the user ID for further use
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const insertUser = async (username, password) => {
  const query = 'INSERT INTO user_login_stocks (username, password) VALUES (?, ?)';
  return new Promise((resolve, reject) => {
    db.query(query, [username, password], (err, res) => {
      if (err) return reject(err);
      console.log('User inserted with ID:', res.insertId);
      resolve(res.insertId); // Return the newly created user ID
    });
  });
};






export const secured_loginRequest = async (req, res) => {
  console.log('Received login request:');
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

    // Generate tokens
    const accessToken = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    const refreshToken = jwt.sign(
      { user_id: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      username: user.username,
      userId: user.id
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Internal server error');
  }
}



export const getUserFromDb = async (username) => {
  const query = `SELECT * FROM user_login_stocks WHERE username = ?`;
  return new Promise((resolve, reject) => {
    db.query(query, [username], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return resolve(null);
      resolve(results[0]);
    });
  });
};



