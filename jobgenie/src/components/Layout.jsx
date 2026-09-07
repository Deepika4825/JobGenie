import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ height:'100vh', overflow:'hidden', background:'var(--rose-background)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <Navbar onToggle={() => setSidebarOpen(p => !p)} />
        <main style={{ flex:1, overflowY:'auto', padding:'2rem 2.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
