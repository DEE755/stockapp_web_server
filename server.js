import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import {automaticscript} from './cron/automaticStockFetching.js';

import authRoutes from './routes/authRoutes.js';
import stockFinnhubRoutes from './routes/stockFinnhubRoutes.js';
import AIperplexityRoutes from './routes/askAIPerplexityRoutes.js';
import stock_dbRoutes from './routes/stock_dbRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import yahooFinancesRoutes from './routes/yahooFinancesRoutes.js';
import userProtectedRouter from './routes/userProtected_dbRoutes.js';


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
app.use('/', stock_dbRoutes);
app.use('/', maintenanceRoutes);
app.use('/', yahooFinancesRoutes);

app.use('/', userProtectedRouter);


// Cron job to fetch stocks every day at 00:00
// Run every day at midnight (00:00)

// Run every day at 20:43 (8:48 PM)--> GMT=+3 = 17:48 GMT
cron.schedule('00 20 * * *', () => {
  console.log('🕐 Running scheduled stock fetch...');
  automaticscript();
});


// Start
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
