import React from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { mockDashboardJobRows } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardOverviewSection } from '@/components/dashboard/DashboardOverviewSection';
import './dashboard-page.css';

export default function DashboardPage() {
  return (
    <div className="page-container">
      <header className="page-header dashboard-page-header">
        <div className="dashboard-page-header__left">
          <div className="dashboard-page-header__navbtns">
            <button type="button" className="icon-btn" aria-label="Go back">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button type="button" className="icon-btn" aria-label="Go forward">
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
          <h1 className="dashboard-page-header__title">
            <span className="dashboard-crumb">Aria</span>
            <span className="dashboard-crumb-sep" aria-hidden>
              {' '}
              /{' '}
            </span>
            <span className="dashboard-crumb dashboard-crumb--current">Dashboard</span>
          </h1>
        </div>


        

        <div className="dashboard-page-header__actions">
        <div className="dashboard-page-header__search">
          <div className="search-bar search-bar--header">
            <Search size={16} className="search-icon" aria-hidden />
            <input type="search" placeholder="Search" className="search-input" aria-label="Search" />
          </div>
        </div>
          <Link href="/dashboard/jobs/new" className="btn btn-primary create-job-btn">
            Create new job
          </Link>
          <button type="button" className="icon-btn icon-btn--bell" aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      <DashboardOverviewSection rows={mockDashboardJobRows} />

      <DashboardCharts />
    </div>
  );
}
