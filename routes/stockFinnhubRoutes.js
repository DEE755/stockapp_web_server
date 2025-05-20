import express from 'express';
import { getStocks } from '../controllers/stockFinnhubController.js';

const router = express.Router();

router.get('/get_stocks', getStocks);

export default router;
