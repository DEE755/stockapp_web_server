import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import stockFinnhubRoutes from './routes/stockFinnhubRoutes.js';
import AIperplexityRoutes from './routes/askAIPerplexityRoutes.js';

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/', stockFinnhubRoutes);
app.use('/', AIperplexityRoutes);



// Start
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
