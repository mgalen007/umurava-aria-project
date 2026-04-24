"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Briefcase, ClipboardList, Settings, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';
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
        flexShrink: 0
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
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((value) => !value);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Auto-collapse sidebar on smaller screens (but not completely narrow like mobile where hamburger triggers)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth > 1024) {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return <main className="main-content" />;
  }

  return (
    <div className={`dashboard-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={toggleSidebar} />

      <button className="hamburger-btn" onClick={toggleSidebar} type="button">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div
            className="org-profile org-profile-toggle"
            onClick={toggleCollapse}
            style={{ backgroundColor: 'transparent', padding: 0, marginBottom: '2rem', cursor: 'pointer' }}
          >
            <div className="org-profile-brand">
              <div className="logo-slot">
                <img src="/image/logo-white.png" alt="ARIA Logo" className="logo-slot-img" />
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link
              href="/dashboard"
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Home size={20} className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/jobs"
              className={`nav-item ${isActive('/dashboard/jobs') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Briefcase size={20} className="nav-icon" />
              <span className="nav-label">Jobs</span>
            </Link>
            <Link
              href="/dashboard/screenings"
              className={`nav-item ${isActive('/dashboard/screenings') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <ClipboardList size={20} className="nav-icon" />
              <span className="nav-label">Screenings</span>
            </Link>
            <Link
              href="/dashboard/candidates"
              className={`nav-item ${isActive('/dashboard/candidates') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Users size={20} className="nav-icon" />
              <span className="nav-label">Candidates</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <Avatar name={user.name} />
            <div className="admin-info">
              <span className="admin-name">{user.name}</span>
              <span className="admin-email">{user.email}</span>
            </div>
          </div>

          <nav className="sidebar-footer-nav">
            <Link
              href="/dashboard/settings"
              className={`nav-item ${isActive('/dashboard/settings') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Settings size={20} className="nav-icon" />
              <span className="nav-label">Settings</span>
            </Link>
            <button
              type="button"
              className="nav-item nav-item--logout"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
            >
              <LogOut size={20} className="nav-icon" />
              <span className="nav-label">Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
