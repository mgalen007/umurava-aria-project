'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { ScreeningsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatRelativeDate, formatSessionStatus, getJobId, getJobTitle } from '@/lib/helpers';
import type { Session } from '@/lib/types';
import './screenings.css';

const PAGE_SIZE = 5;

export default function ScreeningsPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [query, setQuery] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isActive = true;
    setError(null);

    api.getSessions(token)
      .then((result) => {
        if (!isActive) return;
        setSessions(result);
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err instanceof ApiError ? err.message : 'Unable to load screening sessions.');
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const jobOptions = useMemo(() => {
    const entries = new Map<string, string>();
    sessions.forEach((session) => entries.set(getJobId(session), getJobTitle(session)));
    return [{ label: 'Job', value: 'all' }, ...Array.from(entries.entries()).map(([value, label]) => ({ label, value }))];
  }, [sessions]);

  const statusOptions = [
    { label: 'All status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Running', value: 'processing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const jobTitle = getJobTitle(session);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        jobTitle.toLowerCase().includes(normalizedQuery) ||
        session.name.toLowerCase().includes(normalizedQuery);
      const matchesJob = jobFilter === 'all' || getJobId(session) === jobFilter;
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      return matchesQuery && matchesJob && matchesStatus;
    });
  }, [jobFilter, query, sessions, statusFilter]);

  const metrics = useMemo(() => {
    const candidatesScreened = sessions.reduce((total, session) => total + session.candidateIds.length, 0);
    const completed = sessions.filter((session) => session.status === 'completed');
    const avgTopScore = completed.length
      ? Math.round(
          completed.reduce((total, session) => total + (session.rankedResults[0]?.finalScore ?? 0), 0) / completed.length
        )
      : 0;
    const overrides = completed.reduce(
      (total, session) => total + session.rankedResults.filter((result) => result.feedbackStatus === 'overridden').length,
      0
    );

    return [
      { label: 'Total sessions run', value: String(sessions.length) },
      { label: 'Candidates screened', value: String(candidatesScreened) },
      { label: 'Avg top score', value: `${avgTopScore}%` },
      { label: 'Sessions with overrides', value: String(overrides) },
    ];
  }, [sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = filteredRows.length === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 2),
    Math.max(0, currentPage - 2) + 3
  );

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <PageSkeletonGate skeleton={<ScreeningsPageSkeleton />}>
      <div className="page-container screenings-page">
        <DashboardTopBar breadcrumbs={['Screenings']} />

        <div className="screenings-metrics-grid">
          {metrics.map((metric) => (
            <article className="screenings-metric-card" key={metric.label}>
              <h2 className="screenings-metric-value">{metric.value}</h2>
              <p className="screenings-metric-label">{metric.label}</p>
            </article>
          ))}
        </div>

        <section className="screenings-panel">
          <div className="screenings-toolbar">
            <h1 className="screenings-heading">Screenings</h1>

            <div className="screenings-toolbar__controls">
              <label className="screenings-search">
                <Search size={18} className="screenings-search__icon" aria-hidden />
                <input
                  type="search"
                  className="screenings-search__input"
                  placeholder="Search by job or session"
                  value={query}
                  onChange={(event) => handleFilterChange(setQuery, event.target.value)}
                />
              </label>

              <div className="screenings-select-wrap">
                <select
                  className="screenings-select"
                  value={jobFilter}
                  onChange={(event) => handleFilterChange(setJobFilter, event.target.value)}
                >
                  {jobOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="screenings-select-icon" aria-hidden />
              </div>

              <div className="screenings-select-wrap">
                <select
                  className="screenings-select"
                  value={statusFilter}
                  onChange={(event) => handleFilterChange(setStatusFilter, event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="screenings-select-icon" aria-hidden />
              </div>
            </div>
          </div>

          {error ? <div className="screenings-empty">{error}</div> : null}

          <div className="screenings-table-shell">
            <div className="screenings-table-head">
              <span>Session</span>
              <span>Date run</span>
              <span>Candidates</span>
              <span>Top score</span>
              <span>Overrides</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            <div className="screenings-table-body">
              {!error ? paginatedRows.map((session) => {
                const topScore = session.rankedResults[0]?.finalScore ?? 0;
                const overrides = session.rankedResults.filter((result) => result.feedbackStatus === 'overridden').length;
                const statusLabel = formatSessionStatus(session.status);
                return (
                  <article className="screenings-row" key={session._id}>
                    <div className="screenings-row__session">
                      <span className="screenings-session-label">{session.name}</span>
                      <span className="screenings-session-title">{getJobTitle(session)}</span>
                    </div>
                    <div className="screenings-row__date">{formatRelativeDate(session.createdAt)}</div>
                    <div className="screenings-row__number">{session.candidateIds.length}</div>
                    <div>
                      <span className={`screenings-score-pill screenings-score-pill--${topScore >= 80 ? 'green' : topScore >= 50 ? 'orange' : 'blue'}`}>
                        {topScore}%
                      </span>
                    </div>
                    <div className={`screenings-row__number ${overrides > 0 ? 'is-warning' : ''}`}>{overrides}</div>
                    <div className={`screenings-status screenings-status--${session.status.toLowerCase()}`}>{statusLabel}</div>
                    <div className="screenings-row__action">
                      {session.status === 'processing' ? (
                        <button type="button" className="screenings-action-btn screenings-action-btn--secondary" disabled>
                          Running
                        </button>
                      ) : (
                        <Link href={`/dashboard/jobs/${getJobId(session)}/session/${session._id}`} className="screenings-action-btn">
                          View results
                        </Link>
                      )}
                    </div>
                  </article>
                );
              }) : null}

              {!error && paginatedRows.length === 0 ? (
                <div className="screenings-empty">
                  {sessions.length === 0
                    ? 'No screening sessions have been created yet.'
                    : 'No screenings match your filters.'}
                </div>
              ) : null}
            </div>

            <div className="screenings-footer">
              <p className="screenings-footer__summary">
                Showing {pageStart}-{pageEnd} sessions out of {filteredRows.length} sessions
              </p>

              <div className="screenings-pagination">
                <button
                  type="button"
                  className="screenings-pagination__nav"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="screenings-pagination__pages">
                  {visiblePages.map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`screenings-pagination__page ${pageNumber === currentPage ? 'is-active' : ''}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="screenings-pagination__nav"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageSkeletonGate>
  );
}
