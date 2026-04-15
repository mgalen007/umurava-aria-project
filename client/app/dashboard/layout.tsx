"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import './dashboard.css';

// Generate consistent beautiful colors based on a string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
}

function Avatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const bgColor = stringToColor(name);
  
  return (
    <div 
      className="avatar-circle" 
      style={{ 
        backgroundColor: bgColor, 
        color: '#fff', 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px'
      }}
    >
      {initial}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Helper to check if link is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="dashboard-wrapper">
      {/* Mobile overlay */}
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}></div>

      {/* Hamburger button */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
<<<<<<< HEAD
          <div className="org-profile" style={{ backgroundColor: 'transparent', padding: '0', marginBottom: '2rem' }}>
            <div className="aria-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent-color)', borderRadius: '8px' }}></div>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '1px' }}>ARIA</span>
=======
          <div className="org-profile">
            <Avatar name="Umurava" />
            <div className="org-info">
              <span className="org-name">Organization name</span>
              <span className="org-subtitle">Umurava screening system</span>
>>>>>>> main
            </div>
          </div>

          <nav className="sidebar-nav">
<<<<<<< HEAD
            <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link href="/dashboard/jobs" className={`nav-item ${pathname.includes('/jobs') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Jobs</Link>
            <Link href="/dashboard/screenings" className={`nav-item ${pathname.includes('/screenings') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Screenings</Link>
=======
            <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link href="/dashboard/jobs" className={`nav-item ${isActive('/dashboard/jobs') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Jobs</Link>
            <Link href="#" className="nav-item">Shortlists</Link>
            <Link href="#" className="nav-item">Admin</Link>
>>>>>>> main
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <Avatar name="Admin" />
            <div className="admin-info">
              <span className="admin-name">Admin</span>
              <span className="admin-email">Admin@gmail.com</span>
            </div>
          </div>
          <nav className="sidebar-footer-nav">
            <Link href="#" className="nav-item">Settings</Link>
            <Link href="#" className="nav-item">Help Center</Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
