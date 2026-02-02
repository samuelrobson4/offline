import express from 'express';
import { protect } from '../middlewares/auth';

const router = express.Router();

// GET /api/email-sources - List email sources
router.get('/', protect, (_req, res) => {
  res.json({ message: 'List email sources - TODO' });
});

// POST /api/email-sources/:emailSourceId/associate - Associate email with place
router.post('/:emailSourceId/associate', protect, (_req, res) => {
  res.json({ message: 'Associate email source - TODO' });
});

export default router;
