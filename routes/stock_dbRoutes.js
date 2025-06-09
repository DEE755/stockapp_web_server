import express from 'express';
import { fetbunchofStockDB, fetchallStocksDB, getNumberOfStocks } from '../controllers/stock_dbController.js';
import {getCurrentPrice} from '../controllers/alphawantageController.js';
const router = express.Router();

router.get('/getall_remoteDB_stocks', fetchallStocksDB);
router.get('/get_number_of_stocks', getNumberOfStocks);
router.get('/get_stocks_from_to', fetbunchofStockDB)

router.get('/alphaprice', (req, res) => {
  const symbol = req.query.symbol;
  getCurrentPrice(symbol)
    .then(price => {
      res.json({ symbol, price });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch current price' });
    });
});

export default router;
