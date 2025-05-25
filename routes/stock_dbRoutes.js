import express from 'express';
import { fetchallStockDB } from '../controllers/stock_dbController.js';
import { userfollowstock } from '../controllers/stock_dbController.js';

const router = express.Router();

router.get('/getall_remoteDB_stocks', fetchallStockDB);

router.post('/user/follows_stock', (req, res) => userfollowstock(true, req, res));
router.post('/user/unfollows_stock', (req, res) => userfollowstock(false, req, res));

export default router;
