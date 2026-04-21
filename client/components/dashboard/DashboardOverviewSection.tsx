'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DashboardJobRow, JobListStatus } from '@/lib/mock-data';
import './dashboard-overview.css';

export type StatusFilter = 'all' | 'active' | 'drafted';

function matchesStatusFilter(status: JobListStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'Active';
  if (filter === 'drafted') return status === 'Drafted';
  return true;
}

function matchScoreVariant(score: number | null): 'high' | 'mid' | 'low' | 'empty' {
  if (score == null) return 'empty';
  if (score >= 75) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

export function DashboardOverviewSection({ rows }: { rows: DashboardJobRow[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [jobQuery, setJobQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    const q = jobQuery.trim().toLowerCase();
    return rows.filter((job) => {
      if (!matchesStatusFilter(job.status, statusFilter)) return false;
      if (q && !job.role.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, statusFilter, jobQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedJobs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, jobQuery]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handlePrevious = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNext = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = filtered.length === 0 ? 0 : Math.min(currentPage * pageSize, filtered.length);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 2),
    Math.max(0, currentPage - 2) + 3
  );

  return (
    <section className="overview-panel">
      <div className="overview-toolbar">
        <div className="overview-toolbar__left">
          <h2 className="overview-heading">Overview</h2>
          <div className="overview-filter" role="tablist" aria-label="Filter jobs by status">
            {(
              [
                { id: 'all' as const, label: 'All' },
                { id: 'active' as const, label: 'Active' },
                { id: 'drafted' as const, label: 'Drafted' },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={statusFilter === id}
                className={`overview-filter__btn ${statusFilter === id ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overview-toolbar__search">
          <Search size={16} className="overview-toolbar__search-icon" aria-hidden />
          <input
            type="search"
            className="overview-toolbar__search-input"
            placeholder="Search jobs"
            value={jobQuery}
            onChange={(e) => setJobQuery(e.target.value)}
            aria-label="Search jobs"
          />
        </div>
      </div>

      <div className="overview-table-shell">
        <div className="overview-table-head">
          <span>Job role</span>
          <span>Status</span>
          <span>Candidates</span>
          <span>Match Score</span>
          <span>Last screened</span>
          <span>Action</span>
        </div>

        <div className="overview-table-body">
          {paginatedJobs.map((job) => {
            const variant = matchScoreVariant(job.matchScoreAvg);
            return (
              <article className="overview-row" key={job.id}>
                <div className="overview-row__job">
                  <Link href={`/dashboard/jobs/${job.id}`} className="overview-job-link">
                    {job.role}
                  </Link>
                </div>
                <div className="overview-row__status">
                  <span className={`status-pill status-pill--${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                <div className="overview-row__candidates">{job.candidatesCount}</div>
                <div className="overview-row__score">
                  <div className="match-score-cell">
                    <div className="match-score-track" aria-hidden={job.matchScoreAvg == null}>
                      {job.matchScoreAvg != null ? (
                        <div
                          className={`match-score-fill match-score-fill--${variant}`}
                          style={{ width: `${Math.min(100, job.matchScoreAvg)}%` }}
                        />
                      ) : null}
                    </div>
                    <span className="match-score-value">
                      {job.matchScoreAvg != null ? `${job.matchScoreAvg}%` : '—'}
                    </span>
                  </div>
                </div>
                <div className="overview-row__date">{job.lastScreened}</div>
                <div className="overview-row__action">
                  <Link href={`/dashboard/jobs/${job.id}`} className="overview-action-btn">
                    View
                  </Link>
                </div>
              </article>
            );
          })}

          {paginatedJobs.length === 0 ? <div className="overview-empty">No jobs match your filters.</div> : null}
        </div>

        <div className="overview-footer">
          <p className="overview-footer__summary">
            Showing {pageStart}-{pageEnd} jobs out of {filtered.length} jobs
          </p>

          <div className="overview-pagination">
            <button
              type="button"
              className="overview-pagination__nav"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="overview-pagination__pages">
              {visiblePages.map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`overview-pagination__page ${pageNumber === currentPage ? 'is-active' : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="overview-pagination__nav"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
