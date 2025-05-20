import express from 'express';
import { askAIPerplexity } from '../controllers/perplexityController.js';

const router = express.Router();

router.post('/ask', askAIPerplexity);

export default router;