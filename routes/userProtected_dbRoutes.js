
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { userfollowstock, getUpdateForFollowedStocksMA,getUpdateForFollowedStocksPR, addNewFollowsettoDB} from '../controllers/stock_dbController.js';

const userProtectedRouter = express.Router();

userProtectedRouter.use(authenticateToken);

//All routes here already start with /user/

userProtectedRouter.post('/follows_stock', (req, res) => {
    const userId = req.user.user_id;
    userfollowstock(true, req, res, userId);
});

userProtectedRouter.post('/unfollows_stock', (req, res) => 
    {const userId = req.user.user_id;
        userfollowstock(false, res, req, userId);
    });

userProtectedRouter.get('/get_update_for_followed_stocksMA', (req, res) => {
    const userId = req.user.user_id;
    getUpdateForFollowedStocksMA(res, userId);
});

userProtectedRouter.get('/get_update_for_followed_stocksPR', (req,res) => {
    const userId = req.user.user_id;
    getUpdateForFollowedStocksPR(res, userId);
});


userProtectedRouter.post('/followset/push', (req,res) => 
    {addNewFollowsettoDB(req,res, req.user.user_id);

    });

export default userProtectedRouter;
