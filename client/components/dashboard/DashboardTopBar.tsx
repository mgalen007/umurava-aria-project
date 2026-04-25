'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, ChevronRight, Search, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, Notification } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import styles from './DashboardTopBar.module.css';

type DashboardTopBarProps = {
  breadcrumbs: string[];
  showSearch?: boolean;
  showCreateJobButton?: boolean;
};

export function DashboardTopBar({
  breadcrumbs,
  showSearch = false,
  showCreateJobButton = false,
}: DashboardTopBarProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(token!);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAsRead = async (id?: string) => {
    try {
      await api.markNotificationsRead(token!, id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      handleMarkAsRead(notif._id);
    }
    setIsDropdownOpen(false);
    if (notif.jobId) {
      router.push(`/dashboard/jobs/${notif.jobId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'screening_completed': return <CheckCircle2 size={16} />;
      case 'parsing_failed': return <AlertCircle size={16} />;
      case 'stale_job': return <Clock size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <div className={styles.navButtons}>
          <button type="button" className={styles.iconButton} aria-label="Go back" onClick={() => router.back()}>
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Go forward"
            onClick={() => router.forward()}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        <h1 className={styles.title}>
          <span className={styles.crumb}>Aria</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              <span className={styles.crumbSeparator} aria-hidden>
                {' '}
                /{' '}
              </span>
              <span className={index === breadcrumbs.length - 1 ? styles.crumbCurrent : styles.crumb}>{crumb}</span>
            </React.Fragment>
          ))}
        </h1>
      </div>

      <div className={styles.actions}>
        {showSearch ? (
          <div className={styles.searchWrap}>
            <div className={styles.searchBar}>
              <Search size={16} className={styles.searchIcon} aria-hidden />
              <input type="search" placeholder="Search" className={styles.searchInput} aria-label="Search" />
            </div>
          </div>
        ) : null}

        {showCreateJobButton ? (
          <Link id="tour-create-job-btn" href="/dashboard/jobs/new" className={`btn btn-primary ${styles.createJobButton}`}>
            Create new job
          </Link>
        ) : null}

        <div className={styles.bellContainer} ref={dropdownRef}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonBell}`}
            aria-label="Notifications"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {isDropdownOpen && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className={styles.markAllRead} onClick={() => handleMarkAsRead()}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>No notifications yet</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif._id}
                      className={`${styles.notificationItem} ${!notif.read ? styles.notificationItemUnread : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`${styles.notificationIconWrap} ${styles[notif.type] || ''}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationMessage}>{notif.message}</p>
                        <span className={styles.notificationTime}>{formatTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
