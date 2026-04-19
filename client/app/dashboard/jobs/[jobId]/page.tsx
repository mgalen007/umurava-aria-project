import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobDetail } from '@/lib/mock-data';
import './applicants.css';

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const job = getJobDetail(params.jobId);
  if (!job) {
    notFound();
  }

  return (
    <div className="page-container applicants-page">
      <header className="job-detail-header">
        <h1 className="text-h1">Job / {job.title}</h1>
        <Link href={`/dashboard/jobs/${params.jobId}/draft`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          Edit job
        </Link>
      </header>

      <div className="applicants-layout">
        <div className="applicants-main surface">
          <div className="applicants-actions">
            <input type="text" className="input-field search-input-large" placeholder="Search" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="button">
                Upload files
              </button>
              <Link href={`/dashboard/jobs/${params.jobId}/draft`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                View job
              </Link>
            </div>
          </div>

          <h2 className="text-h2 applicants-title">Job applicants</h2>

          <div className="table-container applicants-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {job.applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="font-medium">{applicant.name}</td>
                    <td>{applicant.exp}</td>
                    <td>{applicant.loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary screen-btn w-full" type="button">
            Screen candidates
          </button>
        </div>

        <aside className="sessions-sidebar surface">
          <h3 className="sessions-title">Previous sessions</h3>

          <div className="sessions-list">
            {job.sessions.map((session) => (
              <div className="session-card" key={session.id}>
                <div className="session-header">
                  <span className="session-date">{session.date}</span>
                  <span
                    className={session.status === 'Pending' ? 'status-badge-draft' : 'status-badge-active'}
                  >
                    {session.status}
                  </span>
                </div>
                <div className="session-stats">
                  <div className="stat-row">Candidates: {session.candidates}</div>
                  <div className="stat-row">Top score: {session.score}</div>
                </div>
                <Link
                  href={`/dashboard/jobs/${params.jobId}/session/${session.id}`}
                  className="btn btn-primary w-full"
                  style={{ marginTop: '1rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                >
                  View results
                </Link>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
