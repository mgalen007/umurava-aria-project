'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DashboardJobRow, JobListStatus } from '@/lib/mock-data';

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

  const handlePrevious = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNext = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  return (
    <div className="table-container table-container--dashboard">
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

      <table className="jobs-table jobs-table--dashboard">
        <thead>
          <tr>
            <th>Job role</th>
            <th>Status badge</th>
            <th>Candidates</th>
            <th>Average Match Score (%)</th>
            <th>Last screened</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="jobs-table-empty">
                No jobs match your filters.
              </td>
            </tr>
          ) : (
            paginatedJobs.map((job) => {
              const variant = matchScoreVariant(job.matchScoreAvg);
              return (
                <tr key={job.id}>
                  <td className="font-medium">
                    <Link href={`/dashboard/jobs/${job.id}`} className="dashboard-job-link">
                      {job.role}
                    </Link>
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${job.status.toLowerCase()}`}>{job.status}</span>
                  </td>
                  <td>{job.candidatesCount}</td>
                  <td>
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
                  </td>
                  <td className="text-body-sm">{job.lastScreened}</td>
                  <td>
                    <Link href={`/dashboard/jobs/${job.id}`} className="btn btn-primary btn-view-job">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls overview-pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="pagination-info">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
