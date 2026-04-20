'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { mockScreeningFilters, mockScreeningMetrics, mockScreeningTableRows } from '@/lib/mock-data';
import './screenings.css';

const PAGE_SIZE = 5;

export default function ScreeningsPage() {
  const [query, setQuery] = useState('');
  const [jobFilter, setJobFilter] = useState(mockScreeningFilters.jobOptions[0]?.value ?? 'all');
  const [statusFilter, setStatusFilter] = useState(mockScreeningFilters.statusOptions[0]?.value ?? 'all');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mockScreeningTableRows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        row.jobTitle.toLowerCase().includes(normalizedQuery) ||
        row.sessionLabel.toLowerCase().includes(normalizedQuery);
      const matchesJob = jobFilter === 'all' || row.jobId === jobFilter;
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      return matchesQuery && matchesJob && matchesStatus;
    });
  }, [jobFilter, query, statusFilter]);

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
    <div className="page-container screenings-page">
      <DashboardTopBar breadcrumbs={['Screenings']} />

      <div className="screenings-metrics-grid">
        {mockScreeningMetrics.map((metric) => (
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
                placeholder={mockScreeningFilters.searchPlaceholder}
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
                {mockScreeningFilters.jobOptions.map((option) => (
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
                {mockScreeningFilters.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="screenings-select-icon" aria-hidden />
            </div>
          </div>
        </div>

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
            {paginatedRows.map((row) => (
              <article className="screenings-row" key={`${row.jobId}-${row.sessionId}-${row.dateRun}`}>
                <div className="screenings-row__session">
                  <span className="screenings-session-label">{row.sessionLabel}</span>
                  <span className="screenings-session-title">{row.jobTitle}</span>
                </div>
                <div className="screenings-row__date">{row.dateRun}</div>
                <div className="screenings-row__number">{row.candidates}</div>
                <div>
                  <span className={`screenings-score-pill screenings-score-pill--${row.topScoreClass}`}>{row.topScore}%</span>
                </div>
                <div className={`screenings-row__number ${row.overrides > 0 ? 'is-warning' : ''}`}>{row.overrides}</div>
                <div className={`screenings-status screenings-status--${row.status.toLowerCase()}`}>{row.status}</div>
                <div className="screenings-row__action">
                  {row.status === 'Running' ? (
                    <button type="button" className="screenings-action-btn screenings-action-btn--secondary">
                      Cancel
                    </button>
                  ) : (
                    <Link href={`/dashboard/jobs/${row.jobId}/session/${row.sessionId}`} className="screenings-action-btn">
                      View results
                    </Link>
                  )}
                </div>
              </article>
            ))}

            {paginatedRows.length === 0 ? <div className="screenings-empty">No screenings match your filters.</div> : null}
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
  );
}
