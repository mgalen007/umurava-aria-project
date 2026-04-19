import React from 'react';
import { notFound } from 'next/navigation';
import { getSessionResults } from '@/lib/mock-data';
import '../../../../screenings/screenings.css';
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
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">{data.jobTitle}</h1>
        <p className="text-body-sm">{data.summaryLine}</p>
      </div>

      <div className="results-grid">
        <div className="candidates-list surface">
          <h3 className="section-title">Top 10 Candidates</h3>

          <div className="candidates-list-items">
            {topCandidates.map((c, i) => (
              <div key={c.id} className="candidate-row">
                <span className="candidate-index">{i + 1}.</span>
                <span className="candidate-name">{c.name}</span>
                <span className="badge-score green" style={{ marginLeft: 'auto' }}>
                  {c.scorePercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="candidate-deep-dive surface">
          <div className="deep-dive-header">
            <div className="candidate-identity">
              <div className="candidate-avatar" />
              <div className="candidate-info">
                <h2 className="text-h2">{featured.name}</h2>
                <p className="text-body-sm">
                  {featured.title}
                  <br />
                  {featured.location}
                </p>
              </div>
            </div>

            <div className="score-ring-container">
              <div
                className="score-ring"
                style={{
                  background: `conic-gradient(var(--accent-color) ${featured.scorePercent}%, #E5E7EB 0)`,
                }}
              >
                <div className="score-value">{featured.scorePercent}%</div>
              </div>
            </div>
          </div>

          <div className="skill-badges-belt">
            {featured.skillBadges.map((label) => (
              <span key={label} className="badge-purple">
                {label}
              </span>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: '2rem' }}>
            AI analysis
          </h3>
          <div className="analysis-panels">
            <div className="analysis-box" />
            <div className="analysis-box" />
          </div>
        </div>
      </div>
    </div>
  );
}
