import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface CreateEventInput {
  placeId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  category?: string;
  imageUrl?: string;
  sourceEmail?: string;
  sourceType?: string;
  externalUrl?: string;
  externalId?: string;
}

export interface FilterEventsInput {
  startDate?: Date;
  endDate?: Date;
  placeId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export const eventService = {
  /**
   * Create a new event
   */
  createEvent: async (userId: string, input: CreateEventInput) => {
    try {
      // Check if event already exists by externalId
      if (input.externalId) {
        const existing = await prisma.event.findUnique({
          where: { externalId: input.externalId },
        });

        if (existing) {
          logger.info(`Event already exists: ${input.externalId}`);
          return existing;
        }
      }

      const event = await prisma.event.create({
        data: {
          userId,
          placeId: input.placeId,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          category: input.category || 'other',
          imageUrl: input.imageUrl,
          sourceEmail: input.sourceEmail,
          sourceType: input.sourceType || 'gmail',
          externalUrl: input.externalUrl,
          externalId: input.externalId,
          date: new Date(input.startTime.toDateString()), // Normalize to date only
        },
        include: {
          place: true,
        },
      });

      logger.info(`Event created: ${event.id}`);
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Get events for a user with optional filters
   */
  getUserEvents: async (userId: string, filters?: FilterEventsInput) => {
    const where: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters?.placeId) {
      where.placeId = filters.placeId;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    return prisma.event.findMany({
      where,
      include: {
        place: true,
      },
      orderBy: { startTime: 'asc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });
  },

  /**
   * Get a specific event
   */
  getEvent: async (userId: string, eventId: string) => {
    return prisma.event.findFirst({
      where: { id: eventId, userId },
      include: {
        place: true,
      },
    });
  },

  /**
   * Get events for a place
   */
  getPlaceEvents: async (userId: string, placeId: string) => {
    return prisma.event.findMany({
      where: { userId, placeId },
      orderBy: { startTime: 'asc' },
      include: {
        place: true,
      },
    });
  },

  /**
   * Get upcoming events (next 30 days)
   */
  getUpcomingEvents: async (userId: string, days: number = 30) => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: future,
        },
      },
      include: {
        place: true,
      },
      orderBy: { startTime: 'asc' },
    });
  },

  /**
   * Delete an event
   */
  deleteEvent: async (userId: string, eventId: string) => {
    const event = await prisma.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return prisma.event.delete({
      where: { id: eventId },
    });
  },

  /**
   * Count events by date range for dashboard analytics
   */
  getEventStats: async (userId: string) => {
    const now = new Date();
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);

    const [totalEvents, upcomingEvents, byCategory] = await Promise.all([
      prisma.event.count({
        where: { userId },
      }),
      prisma.event.count({
        where: {
          userId,
          startTime: {
            gte: now,
            lte: next30,
          },
        },
      }),
      prisma.event.groupBy({
        by: ['category'],
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      totalEvents,
      upcomingEvents,
      byCategory: byCategory.map((cat) => ({
        category: cat.category,
        count: cat._count,
      })),
    };
  },
};
