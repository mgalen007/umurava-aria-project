'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Eye, PencilLine } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { SessionResultsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { buildCandidateCvUrl, formatSessionStatus, getCandidateName, getJobTitle } from '@/lib/helpers';
import type { RankedResult, Session, SessionCandidate } from '@/lib/types';
import './results.css';

function scoreTone(scorePercent: number): 'green' | 'orange' | 'red' {
  if (scorePercent >= 80) return 'green';
  if (scorePercent >= 50) return 'orange';
  return 'red';
}

export default function ScreeningSessionPage({
  params: _params,
}: {
  params: Promise<{ jobId: string; sessionId: string }>;
}) {
  const routeParams = useParams<{ jobId: string; sessionId: string }>();
  const jobId = typeof routeParams?.jobId === 'string' ? routeParams.jobId : '';
  const sessionId = typeof routeParams?.sessionId === 'string' ? routeParams.sessionId : '';
  const { token } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [isOverrideMode, setIsOverrideMode] = useState(false);
  const [manualScore, setManualScore] = useState('');
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !sessionId) return;
    let isActive = true;
    setError(null);

    api.getSession(sessionId, token)
      .then((result) => {
        if (!isActive) return;
        setSession(result);
        setSelectedCandidateId(result.rankedResults[0]?.candidateId ?? '');
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err instanceof ApiError ? err.message : 'Unable to load session results.');
      });

    return () => {
      isActive = false;
    };
  }, [sessionId, token]);

  const candidates = useMemo(() => {
    return (session?.candidateIds ?? []).filter((item): item is SessionCandidate => typeof item !== 'string');
  }, [session]);

  const rankedResults = useMemo(() => {
    return [...(session?.rankedResults ?? [])].sort((a, b) => a.rank - b.rank);
  }, [session]);

  const activeResult = rankedResults.find((result) => result.candidateId === selectedCandidateId) ?? rankedResults[0];
  const activeCandidate = candidates.find((candidate) => candidate._id === activeResult?.candidateId) ?? candidates[0];

  async function submitFeedback(action: 'approved' | 'overridden') {
    if (!token || !activeResult) return;

    try {
      setError(null);
      const updatedSession = await api.submitSessionFeedback(
        sessionId,
        {
          candidateId: activeResult.candidateId,
          action,
          adjustedScore: action === 'overridden' ? Number(manualScore || activeResult.finalScore) : undefined,
          reason: comment.trim() || undefined,
        },
        token
      );

      setSession(updatedSession);
      setSelectedCandidateId(activeResult.candidateId);
      setStatusMessage(
        action === 'overridden'
          ? `Manual review saved for ${activeCandidate ? getCandidateName(activeCandidate) : 'candidate'}.`
          : `AI screening result confirmed for ${activeCandidate ? getCandidateName(activeCandidate) : 'candidate'}.`
      );
    } catch (err) {
      setError(null);
      setStatusMessage(err instanceof ApiError ? err.message : 'Unable to save feedback.');
    }
  }

  if (!session) {
    return (
      <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
        <div className="page-container screening-session-page">
          {error ? <p>{error}</p> : null}
        </div>
      </PageSkeletonGate>
    );
  }

  if (error) {
    return (
      <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
        <div className="page-container screening-session-page">
          <div className="screenings-empty">{error}</div>
        </div>
      </PageSkeletonGate>
    );
  }

  if (session.status === 'failed') {
    return (
      <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
        <div className="page-container screening-session-page">
          <DashboardTopBar breadcrumbs={['Screenings', session.name]} />
          <div className="screenings-empty">
            <div>Screening failed for this session.</div>
            <div style={{ marginTop: '0.5rem' }}>{session.error ?? 'No error details were returned.'}</div>
          </div>
        </div>
      </PageSkeletonGate>
    );
  }

  if (session.status === 'pending' || session.status === 'processing') {
    return (
      <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
        <div className="page-container screening-session-page">
          <DashboardTopBar breadcrumbs={['Screenings', session.name]} />
          <div className="screenings-empty">
            Screening is still running. Refresh this page in a moment to see ranked results.
          </div>
        </div>
      </PageSkeletonGate>
    );
  }

  if (!activeResult || !activeCandidate) {
    return (
      <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
        <div className="page-container screening-session-page">
          <DashboardTopBar breadcrumbs={['Screenings', session.name]} />
          <div className="screenings-empty">
            This session completed, but the candidate detail needed for the results view was not available.
          </div>
        </div>
      </PageSkeletonGate>
    );
  }

  const featuredScore = activeResult.finalScore;
  const jobTitle = getJobTitle(session);
  const activeCandidateSkills = activeCandidate.skills ?? [];

  return (
    <PageSkeletonGate skeleton={<SessionResultsPageSkeleton />}>
      <div className="page-container screening-session-page">
        <DashboardTopBar breadcrumbs={['Screenings', `${session.name} / ${jobTitle}`]} />

        <div className="session-results-heading">
          <h1 className="session-results-title">{jobTitle}</h1>
          <p className="session-results-summary">
            {formatSessionStatus(session.status)} session • {session.candidateIds.length} candidates • {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(session.createdAt))}
          </p>
        </div>

        <div className="session-results-grid">
          <aside className="session-results-sidebar">
            <div className="session-results-sidebar__header">
              <h2 className="session-results-section-title">Ranked candidates</h2>
              <p className="session-results-sidebar__hint">Review the latest AI rankings and recruiter feedback.</p>
            </div>

            <div className="session-results-candidate-list">
              {rankedResults.map((result, index) => {
                const candidate = candidates.find((item) => item._id === result.candidateId);
                const tone = scoreTone(result.finalScore);
                const isActive = result.candidateId === selectedCandidateId;

                return (
                  <button
                    type="button"
                    key={result.candidateId}
                    className={`session-results-candidate-row ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedCandidateId(result.candidateId);
                      setStatusMessage(null);
                    }}
                  >
                    <span className="session-results-candidate-rank">{index + 1}.</span>
                    <span className="session-results-candidate-name">{candidate ? getCandidateName(candidate) : 'Candidate'}</span>
                    <span className={`session-results-candidate-score session-results-candidate-score--${tone}`}>
                      {result.finalScore}%
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="session-results-main">
            <div className="session-results-profile">
              <div className="session-results-profile__identity">
                <div className="session-results-avatar">{getCandidateName(activeCandidate).charAt(0)}</div>
                <div>
                  <h2 className="session-results-profile__name">{getCandidateName(activeCandidate)}</h2>
                  <p className="session-results-profile__meta">
                    {activeCandidate.headline}
                    <br />
                    {activeCandidate.location}
                  </p>
                </div>
              </div>

              <div className="session-results-score-ring" style={{ ['--score' as string]: `${featuredScore}` }}>
                <div className="session-results-score-ring__inner">{featuredScore}%</div>
              </div>
            </div>

            <div className="session-results-skill-badges">
              {activeCandidateSkills.length > 0 ? (
                activeCandidateSkills.map((badge) => (
                  <span key={badge.name} className="session-results-skill-badge">
                    {badge.name}
                  </span>
                ))
              ) : (
                <span className="session-results-skill-badge">Skills not loaded in this session view</span>
              )}
            </div>

            <div className="session-results-divider" />

            <section className="session-results-analysis">
              <div className="session-results-analysis__header">
                <h3 className="session-results-analysis__title">AI analysis</h3>
                <a
                  href={buildCandidateCvUrl(activeCandidate)}
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
                    {activeResult.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="session-results-analysis__group">
                  <div className="session-results-analysis__label">Gaps</div>
                  <ul className="session-results-analysis__list">
                    {activeResult.gaps.map((item) => (
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
                      setManualScore(String(activeResult.finalScore));
                    }}
                  >
                    <PencilLine size={15} />
                    Override results
                  </button>

                  <button
                    type="button"
                    className="session-results-file-pill session-results-file-pill--confirm"
                    onClick={() => submitFeedback(isOverrideMode ? 'overridden' : 'approved')}
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
