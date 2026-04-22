'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, FileSearch, PanelRightOpen, Search, X } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { ApplicantsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { buildCandidateCvUrl, formatRelativeDate, formatSessionStatus, getCandidateName, getJobId } from '@/lib/helpers';
import type { Candidate, Job, Session } from '@/lib/types';
import './applicants.css';

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
  const { token } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!token) return;

    Promise.all([api.getJob(params.jobId, token), api.getCandidates(token), api.getSessions(token)])
      .then(([jobResult, candidatesResult, sessionsResult]) => {
        setJob(jobResult);
        setAllCandidates(candidatesResult);
        setSessions(sessionsResult.filter((session) => getJobId(session) === params.jobId));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load job workspace.'));
  }, [params.jobId, token]);

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allCandidates;

    return allCandidates.filter((candidate) =>
      [
        getCandidateName(candidate),
        candidate.email,
        candidate.location,
        candidate.headline,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [allCandidates, searchQuery]);

  const selectedCount = selectedIds.length;
  const hasApplicants = allCandidates.length > 0;
  const hasFilteredApplicants = filteredApplicants.length > 0;
  const allVisibleSelected =
    hasFilteredApplicants && filteredApplicants.every((candidate) => selectedIds.includes(candidate._id));

  function toggleApplicantSelection(candidateId: string) {
    setSelectedIds((current) =>
      current.includes(candidateId) ? current.filter((id) => id !== candidateId) : [...current, candidateId]
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredApplicants.map((candidate) => candidate._id));
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    const merged = new Set([...selectedIds, ...filteredApplicants.map((candidate) => candidate._id)]);
    setSelectedIds(Array.from(merged));
  }

  async function handleScreenSelected() {
    if (selectedCount === 0 || !token) return;

    setIsRunning(true);
    try {
      const session = await api.createSession(
        {
          jobId: params.jobId,
          name: `Session ${new Date().toLocaleString()}`,
          candidateIds: selectedIds,
          modelUsed: 'gemini-1.5-flash',
        },
        token
      );
      await api.runSession(session._id, token);
      const nextSessions = await api.getSessions(token);
      setSessions(nextSessions.filter((item) => getJobId(item) === params.jobId));
      setBannerMessage(`Screening started for ${selectedCount} candidate${selectedCount > 1 ? 's' : ''}.`);
    } catch (err) {
      setBannerMessage(err instanceof ApiError ? err.message : 'Unable to start screening.');
    } finally {
      setIsRunning(false);
    }
  }

  if (!job && !error) {
    return (
      <PageSkeletonGate skeleton={<ApplicantsPageSkeleton />}>
        <div className="page-container applicants-page" />
      </PageSkeletonGate>
    );
  }

  return (
    <PageSkeletonGate skeleton={<ApplicantsPageSkeleton />}>
      <div className="page-container applicants-page">
        <DashboardTopBar breadcrumbs={['Jobs', 'Applicants']} />

        <section className="applicants-shell">
          <div className="applicants-header">
            <div>
              <p className="applicants-eyebrow">Applicants workspace</p>
              <h1 className="applicants-title">Candidate pipeline for {job?.title ?? 'Job'}</h1>
              <p className="applicants-subtitle">
                Select imported candidates, launch screening sessions, and review previous runs for this role.
              </p>
            </div>

            <div className="applicants-summary">
              <article className="applicants-summary-card">
                <span className="applicants-summary-card__label">Candidates</span>
                <strong className="applicants-summary-card__value">{allCandidates.length}</strong>
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
                placeholder="Search by name, email, headline, or location"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="applicants-toolbar__controls">
              <button
                className="applicants-action-btn applicants-action-btn--secondary"
                type="button"
                onClick={handleScreenSelected}
                disabled={selectedCount === 0 || isRunning}
              >
                <FileSearch size={16} />
                {isRunning ? 'Starting...' : 'Scan selected'}
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

          {error ? <div className="applicants-empty">{error}</div> : null}

          <div className="applicants-table-shell">
            <div className="applicants-table-meta">
              <span>
                Showing {filteredApplicants.length} of {allCandidates.length} candidate{allCandidates.length === 1 ? '' : 's'}
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
                        aria-label="Select all visible candidates"
                      />
                    </th>
                    <th>Name</th>
                    <th>Email address</th>
                    <th>Headline</th>
                    <th>Location</th>
                    <th className="applicants-table__action-col">CV</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplicants.map((candidate) => {
                    const isSelected = selectedIds.includes(candidate._id);
                    return (
                      <tr key={candidate._id} className={isSelected ? 'is-selected' : ''}>
                        <td className="applicants-table__checkbox-col">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleApplicantSelection(candidate._id)}
                            aria-label={`Select ${getCandidateName(candidate)}`}
                          />
                        </td>
                        <td className="applicant-name-cell">
                          <span className="applicant-name">{getCandidateName(candidate)}</span>
                        </td>
                        <td>
                          <a href={`mailto:${candidate.email}`} className="applicant-link">
                            {candidate.email}
                          </a>
                        </td>
                        <td>{candidate.headline}</td>
                        <td>{candidate.location}</td>
                        <td className="applicants-table__action-col">
                          <a
                            href={buildCandidateCvUrl(candidate)}
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
                      <td colSpan={6}>
                        <div className="applicants-empty">
                          No candidates have been imported yet.
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {hasApplicants && !hasFilteredApplicants ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="applicants-empty">
                          No candidates match your current search.
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
            {sessions.length === 0 ? (
              <div className="sessions-empty">
                No screening sessions have been run for this role yet.
              </div>
            ) : (
              sessions.map((session) => (
                <article className="session-card" key={session._id}>
                  <div className="session-card__top">
                    <div>
                      <p className="session-card__label">{session.name}</p>
                      <h3 className="session-card__date">{formatRelativeDate(session.createdAt)}</h3>
                    </div>
                    <span className={session.status === 'pending' ? 'status-badge-draft' : 'status-badge-active'}>
                      {formatSessionStatus(session.status)}
                    </span>
                  </div>

                  <div className="session-card__metrics">
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">Candidates</span>
                      <strong>{session.candidateIds.length}</strong>
                    </div>
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">Top score</span>
                      <strong>{session.rankedResults[0]?.finalScore ?? 0}%</strong>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/jobs/${params.jobId}/session/${session._id}`}
                    className={`session-link ${session.status === 'pending' ? 'is-pending' : ''}`}
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
