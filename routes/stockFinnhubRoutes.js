import express from 'express';

const router = express.Router();

router.get('/get_stocks', async (req, res) => {
  res.json({ message: "Stocks coming soon!" });
});

export default router;
