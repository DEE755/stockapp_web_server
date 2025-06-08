import express from 'express';
import { yahooGetFourMovingAverages } from '../controllers/yahooFinancesController.js';
import { getCurrentPrice } from '../controllers/yahooFinancesController.js';

const router = express.Router();

//TRANSFORM THE CLASSIC RETURN TO A JSON RETURN (so can be used both versions for front and back)
router.get('/get_current_price', async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }
  const price = await getCurrentPrice(symbol);
  if (price === null) {
    return res.status(404).json({ error: 'Price not found' });
  }
  res.json({ symbol, price });
}); // should be run every x seconds for followed only




router.get('/update_ma', yahooGetFourMovingAverages)

export default router;