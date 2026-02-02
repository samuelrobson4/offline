import express from 'express';
import { protect } from '../middlewares/auth';

const router = express.Router();

// GET /api/gmail/oauth-url - Get OAuth URL for Gmail
router.get('/oauth-url', (_req, res) => {
  res.json({ message: 'Get OAuth URL - TODO' });
});

// POST /api/gmail/callback - Handle OAuth callback
router.post('/callback', (_req, res) => {
  res.json({ message: 'Gmail OAuth callback - TODO' });
});

// POST /api/gmail/sync - Manually trigger email sync
router.post('/sync', protect, (_req, res) => {
  res.json({ message: 'Sync emails - TODO' });
});

// GET /api/gmail/sync-status - Get last sync status
router.get('/sync-status', protect, (_req, res) => {
  res.json({ message: 'Get sync status - TODO' });
});

export default router;
