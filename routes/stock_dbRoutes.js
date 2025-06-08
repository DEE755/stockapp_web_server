import express from 'express';
import { fetbunchofStockDB, fetchallStocksDB, getNumberOfStocks } from '../controllers/stock_dbController.js';

const router = express.Router();

router.get('/getall_remoteDB_stocks', fetchallStocksDB);
router.get('/get_number_of_stocks', getNumberOfStocks);
router.get('/get_stocks_from_to', fetbunchofStockDB)


export default router;
