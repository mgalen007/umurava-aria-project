'use client';

import React, { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { CheckCircle2, Eye, PencilLine } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { SessionResultsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { getApplicantCvUrl, getJobApplicant, getSessionResults } from '@/lib/mock-data';
import './results.css';

function scoreTone(scorePercent: number): 'green' | 'orange' | 'red' {
  if (scorePercent >= 80) return 'green';
  if (scorePercent >= 50) return 'orange';
  return 'red';
}

export default function ScreeningSessionPage({
  params,
}: {
  params: { jobId: string; sessionId: string };
}) {
  const data = getSessionResults(params.jobId, params.sessionId);
  if (!data) {
    notFound();
  }

  const [selectedCandidateId, setSelectedCandidateId] = useState(data.topCandidates[0]?.id ?? '');
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [manualScore, setManualScore] = useState('');
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeCandidate = useMemo(() => {
    const applicant = getJobApplicant(params.jobId, selectedCandidateId);
    return applicant;
  }, [params.jobId, selectedCandidateId]);

  const featuredScore = data.topCandidates.find((candidate) => candidate.id === selectedCandidateId)?.scorePercent ?? data.featured.scorePercent;

  if (!activeCandidate) {
    notFound();
  }

  const currentCandidate = activeCandidate;

  const activeAnalysis = useMemo(() => {
    const strengths = [
      `${currentCandidate.yearsExperience}+ years of relevant experience for ${data.jobTitle}.`,
      `Strong skill alignment across ${currentCandidate.skills.slice(0, 2).join(' and ')}.`,
      `${currentCandidate.stage} candidate with a current system score of ${featuredScore}%.`,
    ];

    const gaps = [
      currentCandidate.matchScore < 80
        ? 'Needs closer manual review before moving deeper into the process.'
        : 'Still needs a recruiter sanity-check before final advancement.',
      currentCandidate.source === 'Careers page'
        ? 'Limited referral context available from the source pipeline.'
        : 'Additional reference context could improve confidence in the profile.',
    ];

    return { strengths, gaps };
  }, [currentCandidate, data.jobTitle, featuredScore]);

  function handleConfirm() {
    if (isOverrideMode) {
      const nextScore = manualScore.trim() || String(featuredScore);
      setStatusMessage(
        `Manual review saved for ${currentCandidate.fullName} with score ${nextScore}%${comment.trim() ? ' and admin notes.' : '.'}`
      );
      return;
    }

    setStatusMessage(`AI screening result confirmed for ${currentCandidate.fullName}.`);
  }

  return (
    <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
      <div className="page-container screening-session-page">
        <DashboardTopBar breadcrumbs={['Screenings', `${data.sessionLabel} / ${data.jobTitle}`]} />

        <div className="session-results-heading">
          <h1 className="session-results-title">{data.pageTitle}</h1>
          <p className="session-results-summary">{data.summaryLine}</p>
        </div>

        <div className="session-results-grid">
          <aside className="session-results-sidebar">
            <div className="session-results-sidebar__header">
              <h2 className="session-results-section-title">Top 10 candidates</h2>
              <p className="session-results-sidebar__hint">Ranked from strongest fit to weakest fit in the scanned batch.</p>
            </div>

            <div className="session-results-candidate-list">
              {data.topCandidates.map((candidate, index) => {
                const tone = scoreTone(candidate.scorePercent);
                const isActive = candidate.id === selectedCandidateId;

                return (
                  <button
                    type="button"
                    key={candidate.id}
                    className={`session-results-candidate-row ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedCandidateId(candidate.id);
                      setStatusMessage(null);
                    }}
                  >
                    <span className="session-results-candidate-rank">{index + 1}.</span>
                    <span className="session-results-candidate-name">{candidate.name}</span>
                    <span className={`session-results-candidate-score session-results-candidate-score--${tone}`}>
                      {candidate.scorePercent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="session-results-main">
            <div className="session-results-profile">
              <div className="session-results-profile__identity">
                <div className="session-results-avatar">{currentCandidate.fullName.charAt(0)}</div>
                <div>
                  <h2 className="session-results-profile__name">{currentCandidate.fullName}</h2>
                  <p className="session-results-profile__meta">
                    {currentCandidate.headline}
                    <br />
                    {currentCandidate.city}, {currentCandidate.country}
                  </p>
                </div>
              </div>

              <div className="session-results-score-ring" style={{ ['--score' as string]: `${featuredScore}` }}>
                <div className="session-results-score-ring__inner">{featuredScore}%</div>
              </div>
            </div>

            <div className="session-results-skill-badges">
              {currentCandidate.skills.map((badge) => (
                <span key={badge} className="session-results-skill-badge">
                  {badge}
                </span>
              ))}
            </div>

            <div className="session-results-divider" />

            <section className="session-results-analysis">
              <div className="session-results-analysis__header">
                <h3 className="session-results-analysis__title">AI analysis</h3>
                <a
                  href={getApplicantCvUrl(currentCandidate)}
                  target="_blank"
                  rel="noreferrer"
                  className="session-results-file-pill session-results-file-pill--ghost"
                >
                  <Eye size={15} />
                  View CV
                </a>
              </div>

              <div className="session-results-analysis__box">
                <div className="session-results-analysis__group">
                  <div className="session-results-analysis__label">Strengths</div>
                  <ul className="session-results-analysis__list">
                    {activeAnalysis.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="session-results-analysis__group">
                  <div className="session-results-analysis__label">Gaps</div>
                  <ul className="session-results-analysis__list">
                    {activeAnalysis.gaps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <div className="session-results-divider" />

            <section className="session-results-assessment">
              <div className="session-results-assessment__header">
                <div>
                  <h3 className="session-results-subheading">Your assessment</h3>
                  <p className="session-results-assessment__help">
                    Confirm the system output directly, or choose override to enter a manual score and notes.
                  </p>
                </div>

                <div className="session-results-assessment__actions">
                  <button
                    type="button"
                    className="session-results-file-pill session-results-file-pill--ghost"
                    onClick={() => {
                      setIsOverrideMode(true);
                      setStatusMessage(null);
                    }}
                  >
                    <PencilLine size={15} />
                    Override results
                  </button>

                  <button
                    type="button"
                    className="session-results-file-pill session-results-file-pill--confirm"
                    onClick={handleConfirm}
                  >
                    <CheckCircle2 size={15} />
                    Confirm
                  </button>
                </div>
              </div>

              {statusMessage ? <div className="session-results-assessment__status">{statusMessage}</div> : null}

              {isOverrideMode ? (
                <div className="session-results-assessment__box">
                  <label className="session-results-assessment__field">
                    <span className="session-results-assessment__field-label">Score</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore}
                      onChange={(event) => setManualScore(event.target.value)}
                      className="session-results-assessment__input"
                      placeholder="Enter score"
                    />
                  </label>

                  <label className="session-results-assessment__field">
                    <span className="session-results-assessment__field-label">Comment</span>
                    <textarea
                      className="session-results-assessment__comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Comment (optional)"
                    />
                  </label>
                </div>
              ) : (
                <div className="session-results-assessment__placeholder">
                  Manual assessment is hidden until you choose <strong>Override results</strong>.
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </PageSkeletonGate>
  );
}
