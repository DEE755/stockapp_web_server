import express from 'express';
import { submitForm, loginRequest } from '../controllers/authController.js';

const router = express.Router();

router.post('/submit', submitForm);
router.get('/login_request', loginRequest);

export default router;
