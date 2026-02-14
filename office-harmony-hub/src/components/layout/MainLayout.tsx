

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start closed

  const toggleSidebar = () => {setSidebarOpen(!sidebarOpen);};

  return (
    <div className={`transition-all duration-300 flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
      {/* Sidebar only renders when open */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
