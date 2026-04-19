import React from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { mockJobOpenings } from '@/lib/mock-data';
import './jobs.css';

export default function JobsPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-h1">Job openings</h1>
      </header>

      <div className="jobs-actions">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" type="button">
            Sort by Name <ArrowDown size={14} />
          </button>
          <button className="btn btn-primary" type="button">
            Sort by Status <ArrowDown size={14} />
          </button>
        </div>
        <Link href="/dashboard/jobs/new" className="btn btn-secondary create-job-btn" style={{ textDecoration: 'none' }}>
          Create new job
        </Link>
      </div>

      <div className="jobs-grid">
        {mockJobOpenings.map((job) => (
          <div className="job-card surface" key={job.id}>
            <div className="job-card-header">
              <h3 className="job-title">
                {job.titleLine1} <br />
                {job.titleLine2}
              </h3>
              <span className={job.status === 'Draft' ? 'status-badge-draft' : 'status-badge-active'}>{job.status}</span>
            </div>

            <div className="job-meta">
              <span>
                {job.skillsSummary} &bull; {job.level} &bull; {job.workType} &bull; {job.location}
              </span>
            </div>

            <div className="job-footer">
              <span className="badge-outline">{job.candidatesCount} candidates</span>
              <span className="screened-time">Last screened {job.lastScreened}</span>
              <Link href={`/dashboard/jobs/${job.id}`} className="btn btn-ghost link-btn" style={{ textDecoration: 'none' }}>
                View job <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
