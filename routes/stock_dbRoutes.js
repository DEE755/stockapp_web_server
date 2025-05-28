import express from 'express';
import { fetchallStockDB } from '../controllers/stock_dbController.js';
import { userfollowstock } from '../controllers/stock_dbController.js';

const router = express.Router();

router.get('/getall_remoteDB_stocks', fetchallStockDB);


export default router;
