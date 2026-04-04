import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col h-full">
        <Navbar onToggle={() => setSidebarOpen((p) => !p)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
