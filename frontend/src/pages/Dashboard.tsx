import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'calendar' | 'map' | 'places'>('calendar');

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
              {tab === 'calendar' && 'Calendar'}
              {tab === 'map' && 'Map'}
              {tab === 'places' && 'Places'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          {activeTab === 'calendar' && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-2">📅 Calendar View</p>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
          )}
          {activeTab === 'map' && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-2">🗺️ Map View</p>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
          )}
          {activeTab === 'places' && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-2">📍 Places Manager</p>
              <p className="text-gray-500 text-sm">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
