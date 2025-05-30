import express from 'express';
import { fetbunchofStockDB } from '../controllers/stock_dbController.js';
import { fetchallStocksDB } from '../controllers/stock_dbController.js';
import { userfollowstock } from '../controllers/stock_dbController.js';
import { getNumberOfStocks } from '../controllers/stock_dbController.js';

const router = express.Router();

router.get('/getall_remoteDB_stocks', fetchallStocksDB);
router.get('/get_number_of_stocks', getNumberOfStocks);


export default router;
