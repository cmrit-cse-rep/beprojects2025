import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Database, MessageSquare, LogOut, History, BarChart, ChevronDown, User, Settings } from 'lucide-react';
import { useAppStore } from '../lib/store';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { signOut, user } = useAppStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Split navigation items into left and right groups
  const leftNavigation = [
    { name: 'Workouts', href: '/', icon: Dumbbell },
    { name: 'Exercises', href: '/exercises', icon: Database },
  ];

  const rightNavigation = [
    { name: 'History', href: '/history', icon: History },
    { name: 'Stats', href: '/stats', icon: BarChart },
  ];

  const chatTab = { name: 'Chat', href: '/chat', icon: MessageSquare };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Dumbbell className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FitTrack</span>
            </div>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{user?.email}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      to="/onboarding"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSignOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8 mb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center relative">
            {/* Left Navigation Items */}
            <div className="flex-1 flex justify-around">
              {leftNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-3 ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="mt-1 text-xs font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Center Chat Button */}
            <Link
              to={chatTab.href}
              className={`absolute left-1/2 -translate-x-1/2 -translate-y-6 flex flex-col items-center justify-center w-16 h-16 rounded-full ${
                location.pathname === chatTab.href
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } shadow-lg transition-all duration-200`}
            >
              <chatTab.icon className="w-8 h-8" />
              <span className="mt-0.5 text-xs font-medium">{chatTab.name}</span>
            </Link>

            {/* Right Navigation Items */}
            <div className="flex-1 flex justify-around">
              {rightNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-3 ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="mt-1 text-xs font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}