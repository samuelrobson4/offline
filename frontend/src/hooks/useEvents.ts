import { useState, useCallback } from 'react';
import apiClient from '../services/api';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  category: string;
  placeId: string;
  place?: {
    id: string;
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  byCategory: Array<{
    category: string;
    count: number;
  }>;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: {
    startDate?: Date;
    endDate?: Date;
    placeId?: string;
    category?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.placeId) params.append('placeId', filters.placeId);
      if (filters?.category) params.append('category', filters.category);

      const response = await apiClient.get(`/events?${params.toString()}`);
      setEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingEvents = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/events/upcoming?days=${days}`);
      setUpcomingEvents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events/stats');
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventById = useCallback(async (eventId: string) => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const getPlaceEvents = useCallback(async (placeId: string) => {
    try {
      const response = await apiClient.get(`/events/place/${placeId}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      throw err;
    }
  }, [events]);

  return {
    events,
    upcomingEvents,
    stats,
    loading,
    error,
    fetchEvents,
    fetchUpcomingEvents,
    fetchStats,
    getEventById,
    getPlaceEvents,
    deleteEvent,
  };
};
