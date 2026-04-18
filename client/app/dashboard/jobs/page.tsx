import React from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import './jobs.css';

export default function JobsPage() {
  const jobs = Array(6).fill({
    title: 'Javascript Senior developer',
    status: 'Active',
    skills: '3 skills',
    level: 'Mid-level',
    workType: 'Remote',
    location: 'Kigali',
    candidatesCount: 42,
    lastScreened: '2 days ago',
  });

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
        <button className="btn btn-secondary create-job-btn" type="button">
          Create new job
        </button>
      </div>

      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <div className="job-card surface" key={job.title + index}>
            <div className="job-card-header">
              <h3 className="job-title">
                Javascript <br />
                Senior developer
              </h3>
              <span className={index === 2 || index === 4 ? 'status-badge-draft' : 'status-badge-active'}>
                {index === 2 || index === 4 ? 'Draft' : 'Active'}
              </span>
            </div>

            <div className="job-meta">
              <span>
                {job.skills} &bull; {job.level} &bull; {job.workType} &bull; {job.location}
              </span>
            </div>

            <div className="job-footer">
              <span className="badge-outline">{job.candidatesCount} candidates</span>
              <span className="screened-time">Last screened {job.lastScreened}</span>
              <button className="btn btn-ghost link-btn" type="button">
                View job <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
