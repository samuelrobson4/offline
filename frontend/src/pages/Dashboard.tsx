import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'map' | 'places'>('calendar');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold">EventSync</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          {(['calendar', 'map', 'places'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg p-8 shadow">
          {activeTab === 'calendar' && <div>Calendar View - TODO</div>}
          {activeTab === 'map' && <div>Map View - TODO</div>}
          {activeTab === 'places' && <div>Places Manager - TODO</div>}
        </div>
      </div>
    </div>
  );
}
