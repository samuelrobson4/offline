import { useEffect, useState } from 'react';
import { usePlaces } from '../hooks/usePlaces';
import { useEvents } from '../hooks/useEvents';

interface MapProps {
  onSelectPlace?: (placeId: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export default function Map({ onSelectPlace, onSelectEvent }: MapProps): JSX.Element {
  const { places, fetchPlaces, loading: placesLoading } = usePlaces();
  const { upcomingEvents, fetchUpcomingEvents } = useEvents();
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces();
    fetchUpcomingEvents();
  }, [fetchPlaces, fetchUpcomingEvents]);

  const placesWithCoordinates = places.filter((p) => p.coordinates);
  const placesWithoutCoordinates = places.filter((p) => !p.coordinates);

  const getPlaceEvents = (placeId: string) => {
    return upcomingEvents.filter((e) => e.placeId === placeId);
  };

  const handlePlaceSelect = (placeId: string) => {
    setSelectedPlace(placeId);
    onSelectPlace?.(placeId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map placeholder - would integrate Google Maps API here */}
      <div className="lg:col-span-2">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center min-h-96">
          <div className="text-gray-600">
            <p className="text-lg font-medium mb-2">📍 Map View</p>
            <p className="text-sm mb-4">
              {placesWithCoordinates.length} venues with locations
            </p>
            <p className="text-xs text-gray-500">
              Google Maps integration coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Venues List */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Venues</h3>

          {placesLoading && <p className="text-sm text-gray-500">Loading...</p>}

          {places.length === 0 && !placesLoading && (
            <p className="text-sm text-gray-500">No venues added yet</p>
          )}

          <div className="space-y-3">
            {places.map((place) => {
              const events = getPlaceEvents(place.id);
              const isSelected = selectedPlace === place.id;

              return (
                <button
                  key={place.id}
                  onClick={() => handlePlaceSelect(place.id)}
                  className={`w-full text-left p-3 rounded border transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{place.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{place.category}</p>
                  {place.address && (
                    <p className="text-xs text-gray-600 mt-1">{place.address}</p>
                  )}
                  {events.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      {events.length} upcoming event{events.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {placesWithoutCoordinates.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                {placesWithoutCoordinates.length} venue{placesWithoutCoordinates.length !== 1 ? 's' : ''} without location
              </p>
              <div className="space-y-2">
                {placesWithoutCoordinates.map((place) => (
                  <p key={place.id} className="text-xs text-gray-600 truncate">
                    {place.name}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedPlace && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">Upcoming Events</h4>
            {getPlaceEvents(selectedPlace).length === 0 ? (
              <p className="text-xs text-gray-500">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {getPlaceEvents(selectedPlace).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent?.(event.id)}
                    className="w-full text-left p-2 text-xs hover:bg-gray-50 rounded"
                  >
                    <p className="font-medium">{event.title}</p>
                    <p className="text-gray-500">
                      {new Date(event.startTime).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
