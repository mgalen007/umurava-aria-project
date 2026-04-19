import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { mockApplicationTrend, mockDashboardJobRows, mockShortlistBars } from '@/lib/mock-data';
import './dashboard-page.css';

export default function DashboardPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-h1">Dashboard</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <Link href="/dashboard/jobs/new" className="btn btn-primary create-job-btn" style={{ textDecoration: 'none' }}>
            Create new job
          </Link>
        </div>
      </header>

      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Job role</th>
              <th>Department</th>
              <th>Status badge</th>
              <th>Match score avg</th>
              <th>High matched candidate</th>
            </tr>
          </thead>
          <tbody>
            {mockDashboardJobRows.map((job) => (
              <tr key={job.id}>
                <td className="font-medium">
                  <Link href={`/dashboard/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {job.role}
                  </Link>
                </td>
                <td>{job.dept}</td>
                <td>
                  <span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span>
                </td>
                <td>{job.matchScoreAvg != null ? `${job.matchScoreAvg}%` : '—'}</td>
                <td>
                  {job.highMatchedCandidate ? (
                    <span>{job.highMatchedCandidate}</span>
                  ) : (
                    <div className="placeholder-circle" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Application Volume trend</h3>
          <p className="chart-subtitle">Number of applicants per day</p>
          <div className="chart-placeholder line-chart-placeholder">
            <svg width="100%" height="150" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d={`M 10 90 ${mockApplicationTrend
                  .map((v, i) => {
                    const x = 10 + (i * 280) / Math.max(mockApplicationTrend.length - 1, 1);
                    const y = 100 - (v / 35) * 80;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="var(--accent-color)"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Shortlist Conversation</h3>
          <div className="chart-placeholder bar-chart-placeholder">
            {mockShortlistBars.map((height, index) => (
              <div key={index} className="bar" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
