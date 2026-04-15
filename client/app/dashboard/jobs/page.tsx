import React from 'react';
import './jobs.css';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export default function JobsPage() {
  const jobs = Array(6).fill({
    title: 'Javascript Senior developer',
    status: 'Active',
    skills: '3 skills',
    level: 'Mid-level',
    workType: 'Remote',
    location: 'Kigali',
    candidatesCount: 42,
    lastScreened: '2 days ago'
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-h1">Job openings</h1>
      </header>

      <div className="jobs-actions">
<<<<<<< HEAD
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">
            Sort by Name <ArrowDown size={14} />
          </button>
          <button className="btn btn-primary">
            Sort by Status <ArrowDown size={14} />
          </button>
        </div>
        <button className="btn btn-secondary create-job-btn">
=======
        <button className="btn btn-secondary">
          Sort by Status <ArrowDown size={14} />
        </button>
        <button className="btn btn-primary create-job-btn">
>>>>>>> main
          Create new job
        </button>
      </div>

      <div className="jobs-grid">
        {jobs.map((job, idx) => (
          <div className="job-card surface" key={idx}>
            <div className="job-card-header">
              <h3 className="job-title">
                Javascript <br/>
                Senior developer
              </h3>
<<<<<<< HEAD
              <span className={idx === 2 || idx === 4 ? "status-badge-draft" : "status-badge-active"}>
                 {idx === 2 || idx === 4 ? "Draft" : "Active"}
              </span>
=======
              <span className="status-badge-solid">{job.status}</span>
>>>>>>> main
            </div>

            <div className="job-meta">
              <span>{job.skills} &bull; {job.level} &bull; {job.workType} &bull; {job.location}</span>
            </div>

            <div className="job-footer">
              <span className="badge-outline">{job.candidatesCount} candidates</span>
              <span className="screened-time">Last screened {job.lastScreened}</span>
              <button className="btn btn-ghost link-btn">
                View job <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
