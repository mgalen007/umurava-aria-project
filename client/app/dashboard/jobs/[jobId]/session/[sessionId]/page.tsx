import React from 'react';
import { notFound } from 'next/navigation';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { getSessionResults } from '@/lib/mock-data';
import './results.css';

export default function ScreeningSessionPage({
  params,
}: {
  params: { jobId: string; sessionId: string };
}) {
  const data = getSessionResults(params.jobId, params.sessionId);
  if (!data) {
    notFound();
  }

  const { featured, topCandidates } = data;

  return (
    <div className="page-container screening-session-page">
      <DashboardTopBar breadcrumbs={['Screenings', `${data.sessionLabel} . ${data.jobTitle}`]} />

      <div className="session-results-heading">
        <h1 className="session-results-title">{data.pageTitle}</h1>
        <p className="session-results-summary">{data.summaryLine}</p>
      </div>

      <div className="session-results-grid">
        <aside className="session-results-sidebar">
          <h2 className="session-results-section-title">Top 10 Candidates</h2>

          <div className="session-results-candidate-list">
            {topCandidates.map((candidate, index) => (
              <button type="button" key={candidate.id} className="session-results-candidate-row">
                <span className="session-results-candidate-rank">{index + 1}.</span>
                <span className="session-results-candidate-name">{candidate.name}</span>
                <span className="session-results-candidate-score">{candidate.scorePercent}%</span>
              </button>
            ))}
          </div>

          <button type="button" className="session-results-load-more">
            Load more
          </button>
        </aside>

        <section className="session-results-main">
          <div className="session-results-profile">
            <div className="session-results-profile__identity">
              <div className="session-results-avatar" />
              <div>
                <h2 className="session-results-profile__name">{featured.name}</h2>
                <p className="session-results-profile__meta">
                  {featured.title}
                  <br />
                  {featured.location}
                </p>
              </div>
            </div>

            <div className="session-results-score-ring" style={{ ['--score' as string]: `${featured.scorePercent}` }}>
              <div className="session-results-score-ring__inner">{featured.scorePercent}%</div>
            </div>
          </div>

          <div className="session-results-skill-badges">
            {featured.skillBadges.map((badge) => (
              <span key={badge} className="session-results-skill-badge">
                {badge}
              </span>
            ))}
          </div>

          <div className="session-results-divider" />

          <section className="session-results-analysis">
            <h3 className="session-results-analysis__title">AI analysis</h3>
            <div className="session-results-analysis__box">
              <div className="session-results-analysis__group">
                <div className="session-results-analysis__label">Strengths</div>
                <ul className="session-results-analysis__list">
                  {featured.analysis.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="session-results-analysis__group">
                <div className="session-results-analysis__label">Gaps</div>
                <ul className="session-results-analysis__list">
                  {featured.analysis.gaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="session-results-divider" />

          <div className="session-results-cv-row">
            <h3 className="session-results-subheading">View candidate Cv</h3>
            <button type="button" className="session-results-file-pill">
              {featured.cvLabel}
            </button>
          </div>

          <div className="session-results-divider" />

          <section className="session-results-assessment">
            <h3 className="session-results-subheading">Your assessment</h3>
            <div className="session-results-assessment__box">
              <div className="session-results-assessment__score">Score</div>
              <textarea className="session-results-assessment__comment" placeholder="Comment (optional)" />
            </div>
            <button type="button" className="session-results-file-pill session-results-file-pill--submit">
              {featured.cvLabel}
            </button>
          </section>
        </section>
      </div>
    </div>
  );
}
