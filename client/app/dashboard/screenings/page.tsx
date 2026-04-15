import React from 'react';
import Link from 'next/link';
import './screenings.css';

export default function ScreeningsPage() {
  return (
    <div className="page-container">
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Screenings</h1>
        <div className="header-actions">
           {/* Empty spacer or notification bell area could go here */}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card surface">
          <h2>14</h2>
          <p>Total sessions run</p>
        </div>
        <div className="metric-card surface">
          <h2>235</h2>
          <p>Candidates screened</p>
        </div>
        <div className="metric-card surface">
          <h2>86%</h2>
          <p>Avg top score</p>
        </div>
        <div className="metric-card surface">
          <h2>5</h2>
          <p>Sessions with overrides</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-controls flex-row justify-between" style={{ padding: '1rem' }}>
          <input type="text" placeholder="Search..." className="input-field" style={{ width: '300px' }} />
          <button className="btn btn-secondary">Filter</button>
        </div>

        <table className="jobs-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Date run</th>
              <th>Candidates</th>
              <th>Top score</th>
              <th>Overrides</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#14</strong> Javascript senior developer</td>
              <td>April 18, 2026</td>
              <td>25</td>
              <td><span className="badge-score green">82%</span></td>
              <td>0</td>
              <td><span className="badge badge-completed">Completed</span></td>
              <td><Link href="/dashboard/screenings/14"><button className="btn btn-primary">View results</button></Link></td>
            </tr>
            <tr>
              <td><strong>#12</strong> Javascript senior developer</td>
              <td>April 18, 2026</td>
              <td>25</td>
              <td><span className="badge-score green">89%</span></td>
              <td><span className="badge-override red">2</span></td>
              <td><span className="badge badge-completed">Completed</span></td>
              <td><Link href="/dashboard/screenings/12"><button className="btn btn-primary">View results</button></Link></td>
            </tr>
            <tr>
              <td><strong>#1</strong> Product engineer</td>
              <td>April 17, 2026</td>
              <td>25</td>
              <td><span className="badge-score blue">0%</span></td>
              <td>0</td>
              <td><span className="badge badge-running">Running</span></td>
              <td><button className="btn btn-secondary">Cancel</button></td>
            </tr>
            <tr>
              <td><strong>#14</strong> Javascript senior developer</td>
              <td>April 16, 2026</td>
              <td>25</td>
              <td><span className="badge-score orange">65%</span></td>
              <td>0</td>
              <td><span className="badge badge-completed">Completed</span></td>
              <td><Link href="/dashboard/screenings/14"><button className="btn btn-primary">View results</button></Link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
