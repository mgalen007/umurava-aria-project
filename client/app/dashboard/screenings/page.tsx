import React from 'react';
import Link from 'next/link';
import { mockScreeningMetrics, mockScreeningTableRows } from '@/lib/mock-data';
import './screenings.css';

export default function ScreeningsPage() {
  return (
    <div className="page-container">
      <div className="flex-row justify-between" style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Screenings</h1>
        <div className="header-actions" />
      </div>

      <div className="metrics-grid">
        {mockScreeningMetrics.map((m) => (
          <div className="metric-card surface" key={m.label}>
            <h2>{m.value}</h2>
            <p>{m.label}</p>
          </div>
        ))}
      </div>

      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-controls flex-row justify-between" style={{ padding: '1rem' }}>
          <input type="text" placeholder="Search..." className="input-field" style={{ width: '300px' }} />
          <button type="button" className="btn btn-secondary">
            Filter
          </button>
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
            {mockScreeningTableRows.map((row) => (
              <tr key={`${row.jobId}-${row.sessionId}-${row.dateRun}`}>
                <td>
                  <strong>{row.sessionLabel}</strong> {row.jobTitle}
                </td>
                <td>{row.dateRun}</td>
                <td>{row.candidates}</td>
                <td>
                  <span className={`badge-score ${row.topScoreClass}`}>{row.topScore}%</span>
                </td>
                <td>
                  {row.overrides > 0 ? <span className="badge-override red">{row.overrides}</span> : row.overrides}
                </td>
                <td>
                  <span
                    className={
                      row.status === 'Completed'
                        ? 'badge badge-completed'
                        : row.status === 'Running'
                          ? 'badge badge-running'
                          : 'badge badge-completed'
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  {row.status === 'Running' ? (
                    <button type="button" className="btn btn-secondary">
                      Cancel
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/jobs/${row.jobId}/session/${row.sessionId}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      View results
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
