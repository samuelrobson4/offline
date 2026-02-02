import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/Calendar';
import Map from '../components/Map';
import PlacesManager from '../components/PlacesManager';

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calendar' | 'map' | 'places'>('places');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold">EventSync</h1>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          {(['calendar', 'map', 'places'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium text-sm border-b-2 transition ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'calendar' && '📅 Calendar'}
              {tab === 'map' && '🗺️ Map'}
              {tab === 'places' && '📍 Places'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Calendar onSelectEvent={setSelectedEventId} />
            </div>
          )}
          {activeTab === 'map' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <Map onSelectEvent={setSelectedEventId} />
            </div>
          )}
          {activeTab === 'places' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <PlacesManager />
            </div>
          )}
        </div>

        {selectedEventId && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              Selected event ID: {selectedEventId}{' '}
              <button
                onClick={() => setSelectedEventId(null)}
                className="ml-2 text-blue-600 hover:underline"
              >
                Clear
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
