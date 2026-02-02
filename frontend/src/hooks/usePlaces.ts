import { useState, useCallback } from 'react';
import apiClient from '../services/api';

export interface Place {
  id: string;
  name: string;
  address?: string;
  website?: string;
  category: string;
  isFollowing: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  _count?: {
    events: number;
  };
}

export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/places');
      setPlaces(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaceById = useCallback(async (placeId: string) => {
    try {
      const response = await apiClient.get(`/places/${placeId}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const createPlace = useCallback(
    async (input: {
      name: string;
      address?: string;
      website?: string;
      category?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    }) => {
      setError(null);
      try {
        const response = await apiClient.post('/places', input);
        const newPlace = response.data;
        setPlaces([...places, newPlace]);
        return newPlace;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create place';
        setError(message);
        throw err;
      }
    },
    [places],
  );

  const updatePlace = useCallback(
    async (placeId: string, input: Partial<Place>) => {
      setError(null);
      try {
        const response = await apiClient.patch(`/places/${placeId}`, input);
        const updated = response.data;
        setPlaces(places.map((p) => (p.id === placeId ? updated : p)));
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update place';
        setError(message);
        throw err;
      }
    },
    [places],
  );

  const deletePlace = useCallback(
    async (placeId: string) => {
      setError(null);
      try {
        await apiClient.delete(`/places/${placeId}`);
        setPlaces(places.filter((p) => p.id !== placeId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete place';
        setError(message);
        throw err;
      }
    },
    [places],
  );

  return {
    places,
    loading,
    error,
    fetchPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace,
  };
};
