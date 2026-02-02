import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { placeService } from '../services/placeService';
import { createPlaceSchema, updatePlaceSchema } from '../validators/placeValidator';
import { logger } from '../utils/logger';

export const placesController = {
  /**
   * GET /api/places
   */
  listPlaces: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const places = await placeService.getUserPlaces(req.user.id);
      res.json(places);
    } catch (error) {
      logger.error('Error listing places:', error);
      res.status(500).json({ error: 'Failed to list places' });
    }
  },

  /**
   * POST /api/places
   */
  createPlace: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = createPlaceSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors,
        });
        return;
      }

      const place = await placeService.createPlace(req.user.id, parsed.data);
      res.status(201).json(place);
    } catch (error) {
      logger.error('Error creating place:', error);

      if (error instanceof Error && error.message === 'You are already following this venue') {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to create place' });
    }
  },

  /**
   * GET /api/places/:id
   */
  getPlace: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const place = await placeService.getPlace(req.user.id, id);

      if (!place) {
        res.status(404).json({ error: 'Place not found' });
        return;
      }

      res.json(place);
    } catch (error) {
      logger.error('Error getting place:', error);
      res.status(500).json({ error: 'Failed to get place' });
    }
  },

  /**
   * PATCH /api/places/:id
   */
  updatePlace: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const parsed = updatePlaceSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.errors,
        });
        return;
      }

      const place = await placeService.updatePlace(req.user.id, id, parsed.data);
      res.json(place);
    } catch (error) {
      logger.error('Error updating place:', error);

      if (error instanceof Error && error.message === 'Place not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to update place' });
    }
  },

  /**
   * DELETE /api/places/:id
   */
  deletePlace: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      await placeService.deletePlace(req.user.id, id);
      res.json({ message: 'Place deleted successfully' });
    } catch (error) {
      logger.error('Error deleting place:', error);

      if (error instanceof Error && error.message === 'Place not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to delete place' });
    }
  },
};
