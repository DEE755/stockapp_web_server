const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 5000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

// environment variables
require('dotenv').config();

// MySQL connection
const connection = mysql.createConnection({
    host: process.env.MY_SQL_HOST,
    user: process.env.MY_SQL_USER,
    password: process.env.MY_SQL_PASSWORD,
    database: process.env.MY_SQL_DATABASE,
    port: process.env.MY_SQL_PORT,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});



// Route to handle form submission
app.post('/submit', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO user_login_stocks (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ success: false, message: 'Error saving data to the database.' });
            return;
        }
        console.log('Data inserted:', results);
        res.status(200).json({ success: true, message: 'Data saved successfully into mySQL!' });
    });
});

// Route to handle login requests
app.get('/login_request', (req, res) => {
    //console.log('reached the endpoint /login_request');
    const { username, password } = req.query;
    //console.log('identifiers', username, password);

    // Retrieve data from the database
    const query = `SELECT * FROM user_login_stocks WHERE username = '${username}'AND password = '${password}'`;

    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).json({ success: false, message: 'Error retrieving data from the database.' });
            return;
        }
        if (results.length === 0) {
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
            return;
        } else {
            console.log('User found:', results);
            res.status(200).json({ success: true, user: results[0] }); // or send the whole array if needed
        }
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});









