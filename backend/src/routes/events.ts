import express from 'express';
import { protect } from '../middlewares/auth';

const router = express.Router();

// GET /api/events - List events with filters
router.get('/', protect, (_req, res) => {
  res.json({ message: 'List events - TODO' });
});

// GET /api/events/:id - Get event details
router.get('/:id', protect, (_req, res) => {
  res.json({ message: 'Get event - TODO' });
});

// GET /api/events/place/:placeId - Get events for a place
router.get('/place/:placeId', protect, (_req, res) => {
  res.json({ message: 'Get place events - TODO' });
});

export default router;
