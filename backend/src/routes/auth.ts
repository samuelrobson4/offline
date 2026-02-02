import express from 'express';
import { authController } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', protect, authController.logout);

export default router;
