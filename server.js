
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import fetch from 'node-fetch';
import cors from 'cors';
import finnhub from 'finnhub';

const app = express();
const port = 5000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// environment variables
dotenv.config();

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


//finnhub Stock API client
const finnhubClient = new finnhub.DefaultApi();
finnhub.ApiClient.instance.authentications['api_key'].apiKey = process.env.STOCK_API_KEY;





// Route to handle form submission
app.post('/submit', (req, res) => {
    const { username, password } = req.body;

    // Insert data into the database
    const query = 'INSERT INTO user_login_stocks (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error saving data to the database.');
            return;
        }
        console.log('Data inserted:', results);
        res.status(200).json('Data saved successfully into mySQL!');  
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


//FINNNHUB API route to get stock data

app.get('/get_stocks', async (req, res) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.STOCK_API_KEY}`);
    const data = await response.json();

    const cleaned = data.map(item => ({
      symbol: item.symbol,
      name: item.description
    }));

    res.json(cleaned);
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    res.status(500).json({ error: 'Failed to load stock symbols' });
  }
});


app.get('/get_quote', async (req, res) => {
  console.log('POST /get_quote route hit');

  finnhubClient.stockSymbols("US", (error, data, response) =>  {
    console.log('Callback triggered'); // Log when the callback is triggered

    if (error) {
      console.error('Error fetching stock quote:', error);
      res.status(500).send('Error fetching stock quote');
    } else {
      console.log('Stock quote data:', data);
      res.json(data); // Send the data back to the client
    }
  });

  console.log('After finnhubClient.quote call'); // Log after the call
});

app.post('/test', (req, res) => {
  res.send('Test route working!');
});

finnhub.ApiClient.instance.timeout = 120000; // Set timeout to 120 seconds




//PERPEXLITY API route to get AI ANSWERS TO QUESTIONS

app.post('/ask', async (req, res) => {
  const { question } = req.body;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'Be precise and concise.' },
        { role: 'user', content: question }
      ]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices?.[0]?.message?.content || 'No reply received.' });
});











// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Finnhub Client:', finnhubClient);
});









