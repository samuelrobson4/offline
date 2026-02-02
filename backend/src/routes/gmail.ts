import express from 'express';
import { protect } from '../middlewares/auth';
import { gmailController } from '../controllers/gmailController';

const router = express.Router();

// GET /api/gmail/oauth-url - Get OAuth URL for Gmail
router.get('/oauth-url', gmailController.getOAuthUrl);

// POST /api/gmail/callback - Handle OAuth callback
router.post('/callback', protect, gmailController.handleOAuthCallback);

// POST /api/gmail/sync - Manually trigger email sync
router.post('/sync', protect, gmailController.syncEmails);

// GET /api/gmail/sync-status - Get last sync status
router.get('/sync-status', protect, gmailController.getSyncStatus);

export default router;
