import React from 'react';
import { mockDashboardJobRows } from '@/lib/mock-data';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardOverviewSection } from '@/components/dashboard/DashboardOverviewSection';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import './dashboard-page.css';

export default function DashboardPage() {
  return (
    <div className="page-container">
      <DashboardTopBar breadcrumbs={['Dashboard']} showSearch showCreateJobButton />

      <DashboardOverviewSection rows={mockDashboardJobRows} />

      <DashboardCharts />
    </div>
  );
}
