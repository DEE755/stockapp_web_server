const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 5000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
    host: 'MacBook-Pro-6.local',
    user: 'root',
    password: 'Dodo755432123',
    database: 'user_login'
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

    // Insert data into the database
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error saving data to the database.');
            return;
        }
        console.log('Data inserted:', results);
        res.send('Data saved successfully into mySQL!');  
    });
});

// Route to handle login requests
app.get('/login_request', (req, res) => {
    //console.log('reached the endpoint /login_request');
    const { username, password } = req.query;
    //console.log('identifiers', username, password);

    // Retrieve data from the database
    const query = `SELECT * FROM users WHERE username = '${username}'AND password = '${password}'`;

    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Error retrieving data from the database.');
            return;
        }

        if (results.length === 0) {
            //console.log('No matching user found.');
            res.status(401).send('Invalid username or password.');
            return;
        }
        else {
            console.log('User found:', results);
        
        //console.log(results);
        res.send(results);
        //notify the app that the user is logged in and retrieve the corresping data from the client key
        
        }

    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

