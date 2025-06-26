
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { userfollowstock, getUpdateForFollowedStocksMA,getUpdateForFollowedStocksPR, addNewFollowsettoDB, getUserFollowsets, getUserFollowedStocksIds} from '../controllers/stock_dbController.js';

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

userProtectedRouter.get('/followset/pull', async (req, res) => {
    try {
        const followsets = await getUserFollowsets(req.user.user_id);
        console.log('Followsets fetched:', followsets);
        res.json(followsets); //send back the result to the client
    } catch (err) {
        console.error('Error fetching followsets:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

userProtectedRouter.get('/stocks/pull', async (req, res) => {
  try {
    const ids = await getUserFollowedStocksIds(req.user.user_id);
    res.json(ids); //send back the result to the client
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});




    

export default userProtectedRouter;
