import { useState, useEffect } from 'react';
import { usePlaces } from '../hooks/usePlaces';
import { useGmail } from '../hooks/useGmail';

export default function PlacesManager(): JSX.Element {
  const { places, fetchPlaces, createPlace, updatePlace, deletePlace, loading, error } =
    usePlaces();
  const { syncStatus, fetchSyncStatus, syncEmails, isSyncing } = useGmail();

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('other');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces();
    fetchSyncStatus();
  }, [fetchPlaces, fetchSyncStatus]);

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Place name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createPlace({
        name: name.trim(),
        website: website.trim() || undefined,
        category,
      });

      setName('');
      setWebsite('');
      setCategory('other');
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add place');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFollowing = async (placeId: string, isFollowing: boolean) => {
    try {
      await updatePlace(placeId, { isFollowing: !isFollowing });
    } catch (err) {
      console.error('Failed to update place:', err);
    }
  };

  const handleDelete = async (placeId: string) => {
    if (window.confirm('Are you sure you want to remove this place?')) {
      try {
        await deletePlace(placeId);
      } catch (err) {
        console.error('Failed to delete place:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Gmail Connection Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Email Integration</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1">
              {syncStatus?.gmailConnected ? '✓ Gmail Connected' : '✗ Gmail Not Connected'}
            </p>
            {syncStatus?.lastSync && (
              <p className="text-xs text-gray-500">
                Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={syncEmails}
            disabled={isSyncing || !syncStatus?.gmailConnected}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSyncing ? 'Syncing...' : 'Sync Emails'}
          </button>
        </div>
      </div>

      {/* Add Place Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition"
        >
          + Add a New Place
        </button>
      ) : (
        <form
          onSubmit={handleAddPlace}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <h3 className="font-semibold">Add a Place</h3>

          {formError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g., The Blue Note, Pizzeria 7"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website (optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="other">Other</option>
              <option value="restaurant">Restaurant</option>
              <option value="bar">Bar</option>
              <option value="venue">Venue</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Adding...' : 'Add Place'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName('');
                setWebsite('');
                setCategory('other');
                setFormError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Places List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Your Places ({places.length})</h3>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && places.length === 0 && (
          <p className="text-sm text-gray-500">No places added yet. Add one to get started!</p>
        )}

        {places.map((place) => (
          <div
            key={place.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
          >
            <div className="flex-1">
              <p className="font-medium">{place.name}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{place.category}</p>
              {place.address && (
                <p className="text-sm text-gray-600 mt-1">{place.address}</p>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Visit website →
                </a>
              )}
              {place._count && (
                <p className="text-xs text-gray-500 mt-2">
                  {place._count.events} event{place._count.events !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleToggleFollowing(place.id, place.isFollowing)}
                className={`px-3 py-1 text-xs font-medium rounded transition ${
                  place.isFollowing
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {place.isFollowing ? 'Following' : 'Unfollow'}
              </button>

              <button
                onClick={() => handleDelete(place.id)}
                className="px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 rounded transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
