import React from 'react';
import './dashboard-page.css';
import { Search, Plus } from 'lucide-react';

export default function DashboardPage() {
  const jobs = [
    { role: 'Senior Node.js developer', dept: '', status: 'Active' },
    { role: 'Product Designer', dept: '', status: 'Drafted' },
    { role: 'Engineer developer', dept: '', status: 'Archived' },
    { role: 'Junior Data Analyst', dept: '', status: 'Active' },
    { role: 'Product Developer', dept: '', status: 'Archived' }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-h1">Dashboard</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <button className="btn btn-primary create-job-btn">
            Create new job
          </button>
        </div>
      </header>

      {/* Jobs Table */}
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
            {jobs.map((job, index) => (
              <tr key={index}>
                <td className="font-medium">{job.role}</td>
                <td>{job.dept}</td>
                <td>
                  <span className={`status-badge status-${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </td>
                <td></td>
                <td>
                   <div className="placeholder-circle"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Area */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Application Volume trend</h3>
          <p className="chart-subtitle">Number of applicants per day</p>
          <div className="chart-placeholder line-chart-placeholder">
              {/* Line chart SVG drawing placeholder */}
              <svg width="100%" height="150" viewBox="0 0 300 100" preserveAspectRatio="none">
<<<<<<< HEAD
                  <path d="M 10 90 Q 40 90, 60 70 T 120 70 T 160 30 T 220 50 T 290 10" fill="none" stroke="var(--accent-color)" strokeWidth="3" />
=======
                  <path d="M 10 90 Q 40 90, 60 70 T 120 70 T 160 30 T 220 50 T 290 10" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
>>>>>>> main
              </svg>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Shortlist Conversation</h3>
          <div className="chart-placeholder bar-chart-placeholder">
            {/* Bar chart divs placeholder */}
            {[60, 40, 30, 50, 40, 30, 45, 30].map((h, i) => (
              <div key={i} className="bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
