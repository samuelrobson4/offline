import express from 'express';
import { protect } from '../middlewares/auth';

const router = express.Router();

// GET /api/places - List user's places
router.get('/', protect, (_req, res) => {
  res.json({ message: 'List places - TODO' });
});

// POST /api/places - Add a new place
router.post('/', protect, (_req, res) => {
  res.json({ message: 'Create place - TODO' });
});

// GET /api/places/:id - Get place details
router.get('/:id', protect, (_req, res) => {
  res.json({ message: 'Get place - TODO' });
});

// PATCH /api/places/:id - Update place
router.patch('/:id', protect, (_req, res) => {
  res.json({ message: 'Update place - TODO' });
});

// DELETE /api/places/:id - Remove place
router.delete('/:id', protect, (_req, res) => {
  res.json({ message: 'Delete place - TODO' });
});

export default router;
