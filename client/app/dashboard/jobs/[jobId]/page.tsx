import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { getJobDetail } from '@/lib/mock-data';
import './applicants.css';

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const job = getJobDetail(params.jobId);
  if (!job) {
    notFound();
  }

  return (
    <div className="page-container applicants-page">
      <DashboardTopBar breadcrumbs={['Jobs', 'Applicants']} />

      <div className="applicants-layout">
        <section className="applicants-main">
          <div className="applicants-actions">
            <h1 className="applicants-title">Job applicants</h1>

            <div className="applicants-actions-bar">
              <label className="applicants-search">
                <Search size={18} className="applicants-search__icon" aria-hidden />
                <input type="text" className="applicants-search__input" placeholder="Search" />
              </label>
              <button className="applicants-action-btn applicants-action-btn--primary" type="button">
                Upload files
              </button>
              <Link href={`/dashboard/jobs/${params.jobId}/draft`} className="applicants-action-btn applicants-action-btn--primary">
                View job
              </Link>
            </div>
          </div>

          <div className="applicants-table-shell">
            <div className="table-container applicants-table-container">
              <table className="jobs-table applicants-table">
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
          </div>

          <button className="screen-btn" type="button">
            Screen candidates
          </button>
        </section>

        <aside className="sessions-sidebar">
          <div className="sessions-sidebar__header">
            <h3 className="sessions-title">Previous sessions</h3>
          </div>

          <div className="sessions-list">
            {job.sessions.map((session) => (
              <div className="session-card" key={session.id}>
                <div className="session-header">
                  <span className="session-date">{session.date}</span>
                  <span className={session.status === 'Pending' ? 'status-badge-draft' : 'status-badge-active'}>
                    {session.status}
                  </span>
                </div>
                <div className="session-stats">
                  {session.stats.map((stat) => (
                    <div className="stat-row" key={`${session.id}-${stat.label}`}>
                      {stat.label === 'Candidates' ? '👥' : '⭐'} {stat.value}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/dashboard/jobs/${params.jobId}/session/${session.id}`}
                  className={`session-link ${session.status === 'Pending' ? 'is-pending' : ''}`}
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
