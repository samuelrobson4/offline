import express from 'express';
import { protect } from '../middlewares/auth';
import { eventsController } from '../controllers/eventsController';

const router = express.Router();

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming', protect, eventsController.getUpcoming);

// GET /api/events/stats - Get event statistics
router.get('/stats', protect, eventsController.getStats);

// GET /api/events/place/:placeId - Get events for a place
router.get('/place/:placeId', protect, eventsController.getPlaceEvents);

// GET /api/events/:id - Get event details
router.get('/:id', protect, eventsController.getEvent);

// GET /api/events - List events with filters
router.get('/', protect, eventsController.listEvents);

// DELETE /api/events/:id - Delete event
router.delete('/:id', protect, eventsController.deleteEvent);

export default router;
