'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

        <button
          type="button"
          className={`${styles.iconButton} ${styles.iconButtonBell}`}
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
