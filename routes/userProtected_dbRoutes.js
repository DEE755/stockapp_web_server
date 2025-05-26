
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { userfollowstock } from '../controllers/stock_dbController.js';

const userProtectedRouter = express.Router();

userProtectedRouter.use(authenticateToken);

userProtectedRouter.post('/user/follows_stock', (req, res) => userfollowstock(true, req, res));
userProtectedRouter.post('/user/unfollows_stock', (req, res) => userfollowstock(false, req, res));

export default userProtectedRouter;
