
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { userfollowstock, getUpdateForFollowedStocksMA,getUpdateForFollowedStocksPR} from '../controllers/stock_dbController.js';

const userProtectedRouter = express.Router();

userProtectedRouter.use(authenticateToken);

userProtectedRouter.post('/follows_stock', (req, res) => {
    const userId = req.user.user_id;
    userfollowstock(true, req, res, userId);
});

userProtectedRouter.post('/unfollows_stock', (req, res) => userfollowstock(false, res, req, userId));

userProtectedRouter.get('/get_update_for_followed_stocksMA', (req, res) => {
    const userId = req.user.user_id;
    getUpdateForFollowedStocksMA(res, userId);
});

userProtectedRouter.get('/get_update_for_followed_stocksPR', (res) => {
    const userId = req.user.user_id;
    getUpdateForFollowedStocksPR(res, userId);
});


export default userProtectedRouter;
