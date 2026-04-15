import React from 'react';
import './draft.css';

export default function JobDraftPage() {
  return (
    <div className="page-container draft-container">
      <div className="draft-card surface">
        
        {/* Header Section */}
        <div className="draft-header">
          <h1 className="text-h1 job-title-large">
            Javascript Senior<br/>
            developer
          </h1>
          <button className="btn btn-ghost edit-btn">Edit</button>
        </div>

        {/* Skills Section */}
        <div className="draft-section">
          <h3 className="section-heading">Skills required</h3>
          <div className="badges-list">
            <span className="badge-gray">Javascript</span>
            <span className="badge-gray">Typescript</span>
            <span className="badge-gray">React.js</span>
          </div>
        </div>

        <hr className="divider-line" />

        {/* Details Section */}
        <div className="draft-section details-list">
          <p><strong>Experience:</strong> 5+ Years</p>
          <p><strong>Seniority:</strong> Senior level</p>
          <p><strong>Location:</strong> New York city</p>
          <p><strong>Type:</strong> Full time</p>
        </div>

        <hr className="divider-line" />

        {/* Disqualifies Section */}
        <div className="draft-section">
          <h3 className="section-heading">Disqualifies</h3>
          <div className="badges-list">
            <span className="badge-gray">No remote</span>
            <span className="badge-gray">No visa sponsorship</span>
            <span className="badge-gray">No freelancers</span>
          </div>
        </div>

      </div>
    </div>
  );
}
