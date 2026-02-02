import express from 'express';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', (_req, res) => {
  res.json({ message: 'Signup endpoint - TODO' });
});

// POST /api/auth/login
router.post('/login', (_req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

// POST /api/auth/refresh
router.post('/refresh', (_req, res) => {
  res.json({ message: 'Refresh endpoint - TODO' });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logout endpoint - TODO' });
});

export default router;
