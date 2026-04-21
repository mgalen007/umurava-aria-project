'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, FileSearch, PanelRightOpen, Search, Trash2, X } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { ApplicantsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { getJobDetail, type JobApplicant } from '@/lib/mock-data';
import './applicants.css';

function buildMockCvUrl(applicant: JobApplicant) {
  const content = [
    `${applicant.fullName} CV`,
    `Applicant ID: ${applicant.applicantId}`,
    `Email: ${applicant.email}`,
    `Phone: ${applicant.phone}`,
    `Location: ${applicant.city}, ${applicant.country}`,
    '',
    'This is a mock CV preview generated for the dashboard prototype.',
  ].join('\n');

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const job = getJobDetail(params.jobId);
  if (!job) {
    notFound();
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [applicants, setApplicants] = useState(job.applicants);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applicants;

    return applicants.filter((applicant) =>
      [
        applicant.applicantId,
        applicant.fullName,
        applicant.email,
        applicant.phone,
        applicant.city,
        applicant.country,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [applicants, searchQuery]);

  const selectedCount = selectedIds.length;
  const hasApplicants = applicants.length > 0;
  const hasFilteredApplicants = filteredApplicants.length > 0;
  const allVisibleSelected =
    hasFilteredApplicants && filteredApplicants.every((applicant) => selectedIds.includes(applicant.id));

  function toggleApplicantSelection(applicantId: string) {
    setSelectedIds((current) =>
      current.includes(applicantId) ? current.filter((id) => id !== applicantId) : [...current, applicantId]
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredApplicants.map((applicant) => applicant.id));
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    const merged = new Set([...selectedIds, ...filteredApplicants.map((applicant) => applicant.id)]);
    setSelectedIds(Array.from(merged));
  }

  function handleScreenSelected() {
    if (selectedCount === 0) return;
    setBannerMessage(`Screening queued for ${selectedCount} selected candidate${selectedCount > 1 ? 's' : ''}.`);
  }

  function handleRemoveSelected() {
    if (selectedCount === 0) return;

    const selectedIdSet = new Set(selectedIds);
    setApplicants((current) => current.filter((applicant) => !selectedIdSet.has(applicant.id)));
    setSelectedIds([]);
    setBannerMessage(`Removed ${selectedCount} candidate${selectedCount > 1 ? 's' : ''} from this shortlist.`);
  }

  return (
    <PageSkeletonGate skeleton={<ApplicantsPageSkeleton />}>
      <div className="page-container applicants-page">
        <DashboardTopBar breadcrumbs={['Jobs', 'Applicants']} />

        <section className="applicants-shell">
          <div className="applicants-header">
            <div>
              <p className="applicants-eyebrow">Applicants workspace</p>
              <h1 className="applicants-title">Candidate pipeline for {job.title}</h1>
              <p className="applicants-subtitle">
                Review applicants, bulk-select strong profiles, and open previous screening sessions only when you need the context.
              </p>
            </div>

            <div className="applicants-summary">
              <article className="applicants-summary-card">
                <span className="applicants-summary-card__label">Applicants</span>
                <strong className="applicants-summary-card__value">{applicants.length}</strong>
              </article>
              <article className="applicants-summary-card">
                <span className="applicants-summary-card__label">Selected</span>
                <strong className="applicants-summary-card__value">{selectedCount}</strong>
              </article>
            </div>
          </div>

          <div className="applicants-toolbar">
            <label className="applicants-search">
              <Search size={18} className="applicants-search__icon" aria-hidden />
              <input
                type="search"
                className="applicants-search__input"
                placeholder="Search by applicant ID, name, email, phone, or location"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="applicants-toolbar__controls">
              <button
                className="applicants-action-btn applicants-action-btn--secondary"
                type="button"
                onClick={handleScreenSelected}
                disabled={selectedCount === 0}
              >
                <FileSearch size={16} />
                Scan selected
              </button>

              <button
                className="applicants-action-btn applicants-action-btn--danger"
                type="button"
                onClick={handleRemoveSelected}
                disabled={selectedCount === 0}
              >
                <Trash2 size={16} />
                Remove selected
              </button>

              <button
                className="applicants-action-btn applicants-action-btn--primary"
                type="button"
                onClick={() => setIsSessionsOpen(true)}
              >
                <PanelRightOpen size={16} />
                Previous sessions
              </button>

              <Link href={`/dashboard/jobs/${params.jobId}/draft`} className="applicants-action-btn applicants-action-btn--ghost">
                View job
              </Link>
            </div>
          </div>

          {bannerMessage ? (
            <div className="applicants-banner" role="status">
              <span>{bannerMessage}</span>
              <button type="button" className="applicants-banner__close" onClick={() => setBannerMessage(null)} aria-label="Dismiss message">
                <X size={16} />
              </button>
            </div>
          ) : null}

          <div className="applicants-table-shell">
            <div className="applicants-table-meta">
              <span>
                Showing {filteredApplicants.length} of {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
              </span>
              <span>{selectedCount} selected</span>
            </div>

            <div className="table-container applicants-table-container">
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th className="applicants-table__checkbox-col">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        aria-label="Select all visible applicants"
                      />
                    </th>
                    <th>Applicant ID</th>
                    <th>Full name</th>
                    <th>Email address</th>
                    <th>Phone number</th>
                    <th>Location</th>
                    <th className="applicants-table__action-col">CV</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplicants.map((applicant) => {
                    const isSelected = selectedIds.includes(applicant.id);
                    return (
                      <tr key={applicant.id} className={isSelected ? 'is-selected' : ''}>
                        <td className="applicants-table__checkbox-col">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleApplicantSelection(applicant.id)}
                            aria-label={`Select ${applicant.fullName}`}
                          />
                        </td>
                        <td>
                          <span className="applicant-id-pill">{applicant.applicantId}</span>
                        </td>
                        <td className="applicant-name-cell">
                          <span className="applicant-name">{applicant.fullName}</span>
                        </td>
                        <td>
                          <a href={`mailto:${applicant.email}`} className="applicant-link">
                            {applicant.email}
                          </a>
                        </td>
                        <td>
                          <a href={`tel:${applicant.phone.replace(/\s+/g, '')}`} className="applicant-link">
                            {applicant.phone}
                          </a>
                        </td>
                        <td>{applicant.city}, {applicant.country}</td>
                        <td className="applicants-table__action-col">
                          <a
                            href={buildMockCvUrl(applicant)}
                            target="_blank"
                            rel="noreferrer"
                            className="cv-view-btn"
                          >
                            <Eye size={16} />
                            View CV
                          </a>
                        </td>
                      </tr>
                    );
                  })}

                  {!hasApplicants ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="applicants-empty">
                          No applicants have been added to this job yet.
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {hasApplicants && !hasFilteredApplicants ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="applicants-empty">
                          No applicants match your current search.
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div
          className={`sessions-drawer-backdrop ${isSessionsOpen ? 'is-open' : ''}`}
          onClick={() => setIsSessionsOpen(false)}
          aria-hidden={!isSessionsOpen}
        />

        <aside className={`sessions-drawer ${isSessionsOpen ? 'is-open' : ''}`} aria-hidden={!isSessionsOpen}>
          <div className="sessions-drawer__header">
            <div>
              <p className="sessions-drawer__eyebrow">History</p>
              <h2 className="sessions-drawer__title">Previous sessions</h2>
            </div>
            <button type="button" className="sessions-drawer__close" onClick={() => setIsSessionsOpen(false)} aria-label="Close previous sessions">
              <X size={18} />
            </button>
          </div>

          <div className="sessions-list">
            {job.sessions.length === 0 ? (
              <div className="sessions-empty">
                No screening sessions have been run for this role yet.
              </div>
            ) : (
              job.sessions.map((session) => (
                <article className="session-card" key={session.id}>
                  <div className="session-card__top">
                    <div>
                      <p className="session-card__label">Session {session.id.toUpperCase()}</p>
                      <h3 className="session-card__date">{session.date}</h3>
                    </div>
                    <span className={session.status === 'Pending' ? 'status-badge-draft' : 'status-badge-active'}>
                      {session.status}
                    </span>
                  </div>

                  <div className="session-card__metrics">
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">Candidates</span>
                      <strong>{session.candidates}</strong>
                    </div>
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">Top score</span>
                      <strong>{session.score}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/jobs/${params.jobId}/session/${session.id}`}
                    className={`session-link ${session.status === 'Pending' ? 'is-pending' : ''}`}
                    onClick={() => setIsSessionsOpen(false)}
                  >
                    View results
                  </Link>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </PageSkeletonGate>
  );
}
