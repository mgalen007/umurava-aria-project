import React from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { JobsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { mockJobOpenings } from '@/lib/mock-data';
import './jobs.css';

export default function JobsPage() {
  return (
    <PageSkeletonGate skeleton={<JobsPageSkeleton />}>
      <div className="page-container">
        <DashboardTopBar breadcrumbs={['Jobs']} />

        <section className="jobs-page-shell">
          <div className="jobs-toolbar">
            <h1 className="jobs-heading">Job openings</h1>

            <div className="jobs-toolbar__controls">
              <div className="jobs-sort-group">
                <button className="jobs-sort-btn jobs-sort-btn--primary" type="button">
                  Sort by Status <ArrowDown size={14} />
                </button>
                <button className="jobs-sort-btn" type="button">
                  Sort by Date <ArrowDown size={14} />
                </button>
              </div>

              <Link href="/dashboard/jobs/new" className="jobs-create-btn">
                Create new job
              </Link>
            </div>
          </div>

          <div className="jobs-grid">
            {mockJobOpenings.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-card-header">
                  <h2 className="job-title">
                    {job.titleLine1}
                    <br />
                    {job.titleLine2}
                  </h2>
                  <span className={job.status === 'Draft' ? 'status-badge-draft' : 'status-badge-active'}>{job.status}</span>
                </div>

                <p className="job-meta">
                  {job.skillsSummary} â€¢ {job.level} â€¢ {job.workType} â€¢ {job.location}
                </p>

                <div className="job-card-footnote">
                  <span className="badge-outline">{job.candidatesCount} candidates</span>
                  <span className="screened-time">Last screened {job.lastScreened}</span>
                </div>

                <div className="job-card-divider" />

                <div className="job-footer">
                  <Link href={`/dashboard/jobs/${job.id}`} className="link-btn">
                    View job <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageSkeletonGate>
  );
}
