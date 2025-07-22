import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, BarChart, Users, LogOut, Menu, X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { userAuth } from '../context/AuthContext';

const Sidebar = ({ onToggle, collapsed = false, mobileOpen = false }) => {
  const { logout, user } = userAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', fallback: '🏠' },
    { path: '/projects', icon: ClipboardList, label: 'Projects', fallback: '📋' },
    { path: '/reports', icon: BarChart, label: 'Reports', fallback: '📊' },
    { path: '/todo', icon: ClipboardList, label: 'To-Do', fallback: '✅' },
  ];

  return (
    <div className="bg-gray-800 text-white h-full flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className={`flex items-center transition-all duration-300 ${
            collapsed ? 'opacity-0 w-0' : 'opacity-100'
          }`}>
            <h2 className="text-md font-bold whitespace-nowrap">
              Task Manager
            </h2>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          hidden lg:flex absolute -right-3 top-20 z-10 w-8 h-8 bg-gray-800 border-2 border-gray-600
          rounded-full items-center justify-center hover:bg-gray-700 transition-all duration-300
          hover:border-gray-500 shadow-lg hover:shadow-xl
          ${collapsed ? 'transform translate-x-0' : ''}
        `}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="relative group">
              <Link
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onToggle && onToggle();
                  }
                }}
                className={`
                  flex items-center rounded-lg transition-all duration-200 relative
                  ${isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }
                  ${collapsed && window.innerWidth >= 1024 ? 'justify-center p-3 w-12 h-12 mx-auto' : 'p-3'}
                `}
              >
                {Icon ? (
                  <Icon 
                    size={collapsed && window.innerWidth >= 1024 ? 24 : 20} 
                    className={`flex-shrink-0 ${collapsed && window.innerWidth >= 1024 ? '' : 'mr-3'}`} 
                    strokeWidth={2}
                  />
                ) : (
                  <span className={`${collapsed && window.innerWidth >= 1024 ? 'text-xl' : 'text-lg mr-3'}`}>
                    {item.fallback}
                  </span>
                )}
                {(!collapsed || window.innerWidth < 1024) && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="
                  absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 
                  rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 
                  transition-opacity duration-200 pointer-events-none z-50
                ">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-gray-700">
          <div className="relative group">
            <div className={`
              flex items-center rounded-lg bg-gray-700 
              transition-all duration-200
              ${collapsed && window.innerWidth >= 1024 ? 'justify-center p-3 h-12' : 'p-3'}
            `}>
              <div className={`
                flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center
                ${collapsed && window.innerWidth >= 1024 ? '' : 'mr-3'}
              `}>
                <User size={16} className="text-white" />
              </div>
              {(!collapsed || window.innerWidth < 1024) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user.email || 'user@example.com'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Tooltip for collapsed user profile */}
            {collapsed && (
              <div className="
                absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 
                rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 pointer-events-none z-50
              ">
                <div className="font-medium">{user.name || 'User'}</div>
                <div className="text-xs text-gray-300">{user.email || 'user@example.com'}</div>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center rounded-lg bg-red-600 hover:bg-red-700 
              transition-colors duration-200
              ${collapsed && window.innerWidth >= 1024 ? 'justify-center p-3 h-12' : 'p-3'}
            `}
          >
            {LogOut ? (
              <LogOut 
                size={collapsed && window.innerWidth >= 1024 ? 24 : 20} 
                className={`flex-shrink-0 ${collapsed && window.innerWidth >= 1024 ? '' : 'mr-3'}`} 
                strokeWidth={2}
              />
            ) : (
              <span className={`${collapsed && window.innerWidth >= 1024 ? 'text-xl' : 'text-lg mr-3'}`}>
                🚪
              </span>
            )}
            {(!collapsed || window.innerWidth < 1024) && <span className="font-medium">Logout</span>}
          </button>
          
          {/* Tooltip for collapsed logout button */}
          {collapsed && (
            <div className="
              absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 
              rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 
              transition-opacity duration-200 pointer-events-none z-50
            ">
              Logout
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
