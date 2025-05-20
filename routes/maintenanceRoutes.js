import express from 'express';
import { automaticscript } from '../cron/automaticStockFetching';


const router = express.Router();

router.get('/run_maintenance', automaticscript);


export default router;
