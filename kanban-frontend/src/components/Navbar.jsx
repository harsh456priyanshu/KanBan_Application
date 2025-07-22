import { userAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Bell, Search } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ onMenuClick, onToggle }) => {
  const { user, logout } = userAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu buttons and logo */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            
            {/* Desktop sidebar toggle button */}
            <button
              onClick={onToggle}
              className="hidden lg:flex p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              KanBan Application
            </h1>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects, boards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right side - Notifications and profile */}
          <div className="flex items-center space-x-4">
            {/* Search button for mobile */}
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/preferences');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Preferences
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
