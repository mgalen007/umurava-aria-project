'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, UploadCloud, X } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { CandidatesPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { buildCandidateCvUrl, getCandidateName, getCandidateYearsExperience } from '@/lib/helpers';
import type { Candidate } from '@/lib/types';
import './candidates.css';

export default function CandidatesPage() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token) return;

    api.getCandidates(token)
      .then(setCandidates)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load candidates.'));
  }, [token]);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return candidates;

    return candidates.filter((candidate) =>
      [
        getCandidateName(candidate),
        candidate.email,
        candidate.location,
        candidate.headline,
        candidate.globalStatus,
        candidate.source,
        ...candidate.skills.map((skill) => skill.name),
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

  async function refreshCandidates() {
    if (!token) return;
    const next = await api.getCandidates(token);
    setCandidates(next);
  }

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const result = await api.ingestCandidateCsv(file, token);
      await refreshCandidates();
      setUploadStatus(`Imported ${result.succeeded.length} candidate(s). ${result.failed.length} failed.`);
    } catch (err) {
      setUploadStatus(err instanceof ApiError ? err.message : 'Unable to import CSV.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length || !token) return;

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const result = await api.ingestCandidatePdfs(files, token);
      await refreshCandidates();
      setUploadStatus(`Imported ${result.succeeded.length} resume(s). ${result.failed.length} failed.`);
    } catch (err) {
      setUploadStatus(err instanceof ApiError ? err.message : 'Unable to import resumes.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <PageSkeletonGate skeleton={<CandidatesPageSkeleton />}>
      <div className="page-container candidates-page">
        <DashboardTopBar breadcrumbs={['Candidates']} />

        <section className="candidates-shell">
          <div className="candidates-header">
            <div>
              <p className="candidates-eyebrow">Candidate directory</p>
              <h1 className="candidates-heading">Candidates across your workspace</h1>
              <p className="candidates-subtitle">
                Browse imported talent, upload fresh resumes, and review profiles ready for screening.
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
                placeholder="Search by name, email, location, source, status, or skill"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="candidates-toolbar__controls">
              <span className="candidates-toolbar__meta">
                Showing {filteredCandidates.length} of {candidates.length}
              </span>
              <button type="button" className="candidates-action-btn" onClick={() => pdfInputRef.current?.click()} disabled={isUploading}>
                <UploadCloud size={16} />
                Upload PDFs
              </button>
              <button type="button" className="candidates-action-btn" onClick={() => csvInputRef.current?.click()} disabled={isUploading}>
                <UploadCloud size={16} />
                Import CSV
              </button>
              <Link href="/dashboard/jobs" className="candidates-action-btn">
                View jobs
              </Link>
            </div>
          </div>

          <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" multiple hidden onChange={handlePdfUpload} />
          <input ref={csvInputRef} type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={handleCsvUpload} />

          {error ? <div className="candidates-empty">{error}</div> : null}
          {uploadStatus ? <div className="candidates-empty">{uploadStatus}</div> : null}

          <div className="candidates-table-shell">
            <div className="candidates-table-meta">
              <span>Use this view to compare talent across all active and draft roles.</span>
            </div>

            <div className="candidates-table-container">
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Experience</th>
                    <th>Source</th>
                    <th>Top skills</th>
                    <th className="candidates-table__action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate._id}>
                      <td>
                        <div className="candidate-cell">
                          <div>
                            <div className="candidate-name">{getCandidateName(candidate)}</div>
                            <div className="candidate-subline">{candidate.headline}</div>
                            <a href={`mailto:${candidate.email}`} className="candidate-link">
                              {candidate.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>{candidate.location}</td>
                      <td>
                        <span className={`candidate-stage candidate-stage--${candidate.globalStatus.toLowerCase()}`}>
                          {candidate.globalStatus}
                        </span>
                      </td>
                      <td>
                        <span className="candidate-score-pill">{getCandidateYearsExperience(candidate.experience)} yrs</span>
                      </td>
                      <td>{candidate.source}</td>
                      <td>
                        <div className="candidate-job-badges">
                          {candidate.skills.slice(0, 3).map((skill) => (
                            <span key={`${candidate._id}-${skill.name}`} className="candidate-job-badge">
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="candidates-table__action-col">
                        <div className="candidate-actions">
                          <a
                            href={buildCandidateCvUrl(candidate)}
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
                            aria-expanded={selected?._id === candidate._id}
                          >
                            Full details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
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
                  <h2 className="drawer-title">{getCandidateName(selected)}</h2>
                  <p className="drawer-subtitle">
                    {selected.headline} • {selected.location}
                  </p>
                </div>
                <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close profile">
                  <X size={18} />
                </button>
              </div>

              <div className="drawer-body">
                <div className="drawer-overview">
                  <div className="drawer-score">{getCandidateYearsExperience(selected.experience)} yrs</div>
                  <div className="drawer-overview__meta">
                    <span>{selected.source}</span>
                    <span>{selected.globalStatus}</span>
                    <span>{selected.availability.status}</span>
                  </div>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Contact</h3>
                  <div className="drawer-contact-list">
                    <a href={`mailto:${selected.email}`} className="candidate-link">
                      {selected.email}
                    </a>
                    <span>{selected.location}</span>
                  </div>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Summary</h3>
                  <p className="drawer-summary">{selected.bio ?? 'No summary available for this candidate yet.'}</p>
                </div>

                <div className="drawer-section">
                  <h3 className="drawer-section__title">Skills</h3>
                  <div className="skill-badges-belt">
                    {selected.skills.map((skill) => (
                      <span key={skill.name} className="badge-purple">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={buildCandidateCvUrl(selected)}
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
