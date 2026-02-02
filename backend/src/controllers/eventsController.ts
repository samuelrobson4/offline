import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { eventService } from '../services/eventService';
import { logger } from '../utils/logger';

export const eventsController = {
  /**
   * GET /api/events
   */
  listEvents: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        startDate,
        endDate,
        placeId,
        category,
        limit = '50',
        offset = '0',
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        placeId: placeId as string | undefined,
        category: category as string | undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const events = await eventService.getUserEvents(req.user.id, filters);
      res.json(events);
    } catch (error) {
      logger.error('Error listing events:', error);
      res.status(500).json({ error: 'Failed to list events' });
    }
  },

  /**
   * GET /api/events/upcoming
   */
  getUpcoming: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { days = '30' } = req.query;
      const events = await eventService.getUpcomingEvents(req.user.id, parseInt(days as string));

      res.json(events);
    } catch (error) {
      logger.error('Error getting upcoming events:', error);
      res.status(500).json({ error: 'Failed to get upcoming events' });
    }
  },

  /**
   * GET /api/events/stats
   */
  getStats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await eventService.getEventStats(req.user.id);
      res.json(stats);
    } catch (error) {
      logger.error('Error getting event stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  },

  /**
   * GET /api/events/:id
   */
  getEvent: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const event = await eventService.getEvent(req.user.id, id);

      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json(event);
    } catch (error) {
      logger.error('Error getting event:', error);
      res.status(500).json({ error: 'Failed to get event' });
    }
  },

  /**
   * GET /api/events/place/:placeId
   */
  getPlaceEvents: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { placeId } = req.params;
      const events = await eventService.getPlaceEvents(req.user.id, placeId);

      res.json(events);
    } catch (error) {
      logger.error('Error getting place events:', error);
      res.status(500).json({ error: 'Failed to get place events' });
    }
  },

  /**
   * DELETE /api/events/:id
   */
  deleteEvent: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      await eventService.deleteEvent(req.user.id, id);

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      logger.error('Error deleting event:', error);

      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to delete event' });
    }
  },
};
