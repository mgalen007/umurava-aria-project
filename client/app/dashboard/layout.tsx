"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import './dashboard.css';

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`;
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="avatar-circle"
      style={{
        backgroundColor: stringToColor(name),
        color: '#fff',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
      }}
    >
      {name ? name.charAt(0).toUpperCase() : '?'}
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

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((value) => !value);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="dashboard-wrapper">
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar} />

      <button className="hamburger-btn" onClick={toggleSidebar} type="button">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div
            className="org-profile"
            style={{ backgroundColor: 'transparent', padding: 0, marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/image/logo-white.png" alt="ARIA Logo" style={{ height: '32px' }} />
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link
              href="/dashboard"
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/jobs"
              className={`nav-item ${isActive('/dashboard/jobs') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              Jobs
            </Link>
            <Link
              href="/dashboard/screenings"
              className={`nav-item ${isActive('/dashboard/screenings') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              Screenings
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <Avatar name="Admin" />
            <div className="admin-info">
              <span className="admin-name">Admin</span>
              <span className="admin-email">admin@gmail.com</span>
            </div>
          </div>

          <nav className="sidebar-footer-nav">
            <Link href="#" className="nav-item">
              Settings
            </Link>
            <Link href="#" className="nav-item">
              Help Center
            </Link>
          </nav>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
