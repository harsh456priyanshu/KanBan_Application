import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: keep sidebar open, close mobile overlay
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: toggle collapse
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      // Mobile: toggle open/close
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Backdrop disabled for mobile and tablet as requested */}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-gray-800 transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <Sidebar 
          onToggle={toggleSidebar}
          collapsed={sidebarCollapsed}
          mobileOpen={sidebarOpen}
        />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} onToggle={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
