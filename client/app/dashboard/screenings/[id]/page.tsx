import React from 'react';
import './results.css';

export default function ScreeningResultsPage() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Software Developer Position</h1>
        <p className="text-body-sm">Screening session - screened 22 candidates on April 22, 2026</p>
      </div>

      <div className="results-grid">
        
        {/* Left Column: Top 10 Candidates */}
        <div className="candidates-list surface">
          <h3 className="section-title">Top 10 Candidates</h3>
          
          <div className="candidates-list-items">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="candidate-row">
                <span className="candidate-index">{i + 1}.</span>
                <span className="candidate-name">Alice Johnson</span>
                <span className="badge-score green" style={{ marginLeft: 'auto' }}>
                  {i === 0 ? '89%' : i === 1 ? '84%' : '80%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Dive */}
        <div className="candidate-deep-dive surface">
          <div className="deep-dive-header">
            <div className="candidate-identity">
               <div className="candidate-avatar"></div>
               <div className="candidate-info">
                 <h2 className="text-h2">Alice Johnson</h2>
                 <p className="text-body-sm">Senior Software Developer<br/>Kigali, Rwanda</p>
               </div>
            </div>
            
            <div className="score-ring-container">
              <div className="score-ring">
                <div className="score-value">89%</div>
              </div>
            </div>
          </div>

          <div className="skill-badges-belt">
            <span className="badge-purple">Technical: 87</span>
            <span className="badge-purple">Technical: 87</span>
            <span className="badge-purple">Technical: 87</span>
            <span className="badge-purple">Technical: 87</span>
          </div>

          <h3 className="section-title" style={{ marginTop: '2rem' }}>AI analysis</h3>
          <div className="analysis-panels">
            <div className="analysis-box"></div>
            <div className="analysis-box"></div>
          </div>

        </div>

      </div>
    </div>
  );
}
