import express from 'express';
import { protect } from '../middlewares/auth';
import { placesController } from '../controllers/placesController';

const router = express.Router();

// GET /api/places - List user's places
router.get('/', protect, placesController.listPlaces);

// POST /api/places - Add a new place
router.post('/', protect, placesController.createPlace);

// GET /api/places/:id - Get place details
router.get('/:id', protect, placesController.getPlace);

// PATCH /api/places/:id - Update place
router.patch('/:id', protect, placesController.updatePlace);

// DELETE /api/places/:id - Remove place
router.delete('/:id', protect, placesController.deletePlace);

export default router;
