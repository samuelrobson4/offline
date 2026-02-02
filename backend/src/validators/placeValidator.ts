import { z } from 'zod';

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}).optional();

export const createPlaceSchema = z.object({
  name: z.string().min(1, 'Place name is required'),
  address: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  category: z.enum(['bar', 'restaurant', 'venue', 'other']).optional(),
  coordinates: coordinatesSchema,
});

export const updatePlaceSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  category: z.enum(['bar', 'restaurant', 'venue', 'other']).optional(),
  isFollowing: z.boolean().optional(),
  coordinates: coordinatesSchema,
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
