'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, X } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { CandidatesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { getApplicantCvUrl, getCandidateDirectoryEntries, type CandidateDirectoryEntry } from '@/lib/mock-data';
import './candidates.css';

export default function CandidatesPage() {
  const [selected, setSelected] = useState<CandidateDirectoryEntry | null>(null);
  const [query, setQuery] = useState('');

  const candidates = useMemo(() => getCandidateDirectoryEntries(), []);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return candidates;

    return candidates.filter((candidate) =>
      [
        candidate.applicantId,
        candidate.fullName,
        candidate.email,
        candidate.phone,
        candidate.city,
        candidate.country,
        candidate.headline,
        candidate.stage,
        candidate.source,
        ...candidate.applications.map((application) => application.jobTitle),
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [candidates, query]);

  const closeDrawer = () => setSelected(null);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <PageSkeletonGate skeleton={<CandidatesPageSkeleton />}>
      <div className="page-container candidates-page">
        <DashboardTopBar breadcrumbs={['Candidates']} />

        <section className="candidates-shell">
          <div className="candidates-header">
            <div>
              <p className="candidates-eyebrow">Candidate directory</p>
              <h1 className="candidates-heading">Candidates across all job applications</h1>
              <p className="candidates-subtitle">
                Monitor who applied, where they applied, their current stage, and the strongest profiles ready for screening or follow-up.
              </p>
            </div>

            <div className="candidates-summary-card">
              <span className="candidates-summary-card__label">Total candidates</span>
              <strong className="candidates-summary-card__value">{candidates.length}</strong>
            </div>
          </div>

          <div className="candidates-toolbar">
            <label className="candidates-search">
              <Search size={18} className="candidates-search__icon" aria-hidden />
              <input
                type="search"
                className="candidates-search__input"
                placeholder="Search by name, applicant ID, email, source, stage, or job"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="candidates-toolbar__controls">
              <span className="candidates-toolbar__meta">
                Showing {filteredCandidates.length} of {candidates.length}
              </span>
              <Link href="/dashboard/jobs" className="candidates-action-btn">
                View jobs
              </Link>
            </div>
          </div>

          <div className="candidates-table-shell">
            <div className="candidates-table-meta">
              <span>Use this view to compare talent across all active and draft roles.</span>
            </div>

            <div className="candidates-table-container">
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>Applicant ID</th>
                    <th>Candidate</th>
                    <th>Applied jobs</th>
                    <th>Location</th>
                    <th>Stage</th>
                    <th>Match</th>
                    <th>Source</th>
                    <th className="candidates-table__action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <span className="candidate-applicant-id">{candidate.applicantId}</span>
                      </td>
                      <td>
                        <div className="candidate-cell">
                          <div>
                            <div className="candidate-name">{candidate.fullName}</div>
                            <div className="candidate-subline">{candidate.headline}</div>
                            <a href={`mailto:${candidate.email}`} className="candidate-link">
                              {candidate.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="candidate-job-badges">
                          {candidate.applications.map((application) => (
                            <span key={`${candidate.id}-${application.jobId}`} className="candidate-job-badge">
                              {application.jobTitle}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {candidate.city}, {candidate.country}
                      </td>
                      <td>
                        <span className={`candidate-stage candidate-stage--${candidate.stage.toLowerCase()}`}>
                          {candidate.stage}
                        </span>
                      </td>
                      <td>
                        <span className="candidate-score-pill">{candidate.matchScore}%</span>
                      </td>
                      <td>{candidate.source}</td>
                      <td className="candidates-table__action-col">
                        <div className="candidate-actions">
                          <a
                            href={getApplicantCvUrl(candidate)}
                            target="_blank"
                            rel="noreferrer"
                            className="candidate-secondary-btn"
                          >
                            <Eye size={15} />
                            CV
                          </a>
                          <button
                            type="button"
                            className="candidate-primary-btn"
                            onClick={() => setSelected(candidate)}
                            aria-expanded={selected?.id === candidate.id}
                          >
                            Full details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="candidates-empty">No candidates match your current search.</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div
          className={`drawer-backdrop ${selected ? 'open' : ''}`}
          onClick={closeDrawer}
          onKeyDown={(event) => event.key === 'Escape' && closeDrawer()}
          role="presentation"
          aria-hidden={!selected}
        />

        <aside
          className={`candidate-drawer ${selected ? 'open' : ''}`}
          aria-hidden={!selected}
          aria-label="Candidate profile"
        >
          {selected ? (
            <>
              <div className="drawer-header">
                <div>
                  <p className="drawer-eyebrow">Candidate details</p>
                  <h2 className="drawer-title">{selected.fullName}</h2>
                  <p className="drawer-subtitle">
                    {selected.headline} · {selected.city}, {selected.country}
                  </p>
                </div>
                <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close profile">
                  <X size={18} />
                </button>
              </div>

              <div className="drawer-body">
                <div className="drawer-overview">
                  <div className="drawer-score">{selected.matchScore}% match</div>
                  <div className="drawer-overview__meta">
                    <span>{selected.yearsExperience} yrs experience</span>
                    <span>{selected.source}</span>
                    <span>{selected.stage}</span>
                  </div>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Contact</h3>
                  <div className="drawer-contact-list">
                    <a href={`mailto:${selected.email}`} className="candidate-link">
                      {selected.email}
                    </a>
                    <a href={`tel:${selected.phone.replace(/\s+/g, '')}`} className="candidate-link">
                      {selected.phone}
                    </a>
                    <span>
                      {selected.city}, {selected.country}
                    </span>
                  </div>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Applied roles</h3>
                  <div className="drawer-applied-jobs">
                    {selected.applications.map((application) => (
                      <div key={`${selected.id}-${application.jobId}`} className="drawer-job-card">
                        <strong>{application.jobTitle}</strong>
                        <span>Applied on {application.appliedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Summary</h3>
                  <p className="drawer-summary">{selected.summary}</p>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Skills</h3>
                  <div className="skill-badges-belt">
                    {selected.skills.map((skill) => (
                      <span key={skill} className="badge-purple">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={getApplicantCvUrl(selected)}
                  target="_blank"
                  rel="noreferrer"
                  className="drawer-cv-btn"
                >
                  <Eye size={16} />
                  Open CV
                </a>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </PageSkeletonGate>
  );
}
