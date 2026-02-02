import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ApiError extends Error {
  statusCode: number;
  message: string;
}

export enum PlaceCategory {
  BAR = 'bar',
  RESTAURANT = 'restaurant',
  VENUE = 'venue',
  OTHER = 'other',
}

export enum EventCategory {
  MUSIC = 'music',
  FOOD = 'food',
  SPECIAL = 'special',
  OTHER = 'other',
}

export enum SourceType {
  GMAIL = 'gmail',
  EVENTSYNC = 'eventsync',
  MANUAL = 'manual',
}

export interface ParsedEvent {
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime?: string;
  location?: string;
  category?: EventCategory;
  imageUrl?: string;
  externalUrl?: string;
}
