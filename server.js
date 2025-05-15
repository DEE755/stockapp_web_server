const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));



// Route to handle form submission
app.post('/submit', (req, res) => {
   

    // Insert data into the database
   
        res.send('Data saved successfully into mySQL!');  
        console.log('Data received:');
});

// Route to handle login requests
app.get('/login_request', (req, res) => {
    
        res.send("hello");
        //notify the app that the user is logged in and retrieve the corresping data from the client key
        
        });



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

