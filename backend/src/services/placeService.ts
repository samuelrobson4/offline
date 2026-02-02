import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface CreatePlaceInput {
  name: string;
  address?: string;
  website?: string;
  category?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UpdatePlaceInput {
  name?: string;
  address?: string;
  website?: string;
  category?: string;
  isFollowing?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const placeService = {
  /**
   * Create a new place for a user
   */
  createPlace: async (userId: string, input: CreatePlaceInput) => {
    try {
      const place = await prisma.place.create({
        data: {
          userId,
          name: input.name,
          address: input.address,
          website: input.website,
          category: input.category || 'other',
          coordinates: input.coordinates,
        },
      });

      logger.info(`Place created: ${place.id} for user ${userId}`);
      return place;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint failed')) {
        throw new Error('You are already following this venue');
      }
      throw error;
    }
  },

  /**
   * Get all places for a user
   */
  getUserPlaces: async (userId: string) => {
    return prisma.place.findMany({
      where: { userId, isFollowing: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  },

  /**
   * Get a specific place by ID
   */
  getPlace: async (userId: string, placeId: string) => {
    return prisma.place.findFirst({
      where: { id: placeId, userId },
      include: {
        events: {
          orderBy: { date: 'asc' },
          take: 10,
        },
      },
    });
  },

  /**
   * Update a place
   */
  updatePlace: async (userId: string, placeId: string, input: UpdatePlaceInput) => {
    const place = await prisma.place.findFirst({
      where: { id: placeId, userId },
    });

    if (!place) {
      throw new Error('Place not found');
    }

    return prisma.place.update({
      where: { id: placeId },
      data: {
        name: input.name || place.name,
        address: input.address || place.address,
        website: input.website || place.website,
        category: input.category || place.category,
        isFollowing: input.isFollowing !== undefined ? input.isFollowing : place.isFollowing,
        coordinates: input.coordinates || place.coordinates,
      },
    });
  },

  /**
   * Delete a place
   */
  deletePlace: async (userId: string, placeId: string) => {
    const place = await prisma.place.findFirst({
      where: { id: placeId, userId },
    });

    if (!place) {
      throw new Error('Place not found');
    }

    return prisma.place.delete({
      where: { id: placeId },
    });
  },

  /**
   * Find or create a place by email domain
   */
  findByEmailDomain: async (userId: string, emailDomain: string) => {
    return prisma.place.findFirst({
      where: {
        userId,
        website: {
          contains: emailDomain,
        },
      },
    });
  },
};
