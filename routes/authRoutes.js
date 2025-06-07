import express from 'express';
import { submitForm, secured_loginRequest } from '../controllers/authController.js';

const router = express.Router();

router.post('/submit', submitForm);
router.get('/login_request', secured_loginRequest);

export default router;
