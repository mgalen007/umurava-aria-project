import React from 'react';
import './create-job.css';

export default function CreateJobPage() {
  return (
    <div className="page-container flex-col" style={{ alignItems: 'center', paddingTop: '2rem' }}>
      <div className="create-job-card surface">
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Create Job
        </h2>

        <form className="create-job-form">
          <div className="form-section">
            <h3 className="section-subtitle">Role</h3>

            <div className="input-row">
              <label htmlFor="job-title">Job title</label>
              <input id="job-title" type="text" className="form-input" />
            </div>

            <div className="input-row">
              <label>Seniority level</label>
              <div className="button-group">
                <button type="button" className="btn-toggle">
                  Junior
                </button>
                <button type="button" className="btn-toggle">
                  Mid
                </button>
                <button type="button" className="btn-toggle active">
                  Senior
                </button>
                <button type="button" className="btn-toggle">
                  Lead
                </button>
              </div>
            </div>

            <div className="input-row">
              <label>Employment type</label>
              <div className="button-group">
                <button type="button" className="btn-toggle active">
                  Full-time
                </button>
                <button type="button" className="btn-toggle">
                  Contract
                </button>
                <button type="button" className="btn-toggle">
                  Part time
                </button>
              </div>
            </div>

            <div className="input-row">
              <label htmlFor="job-location">Location</label>
              <div className="location-inputs">
                <input id="job-location" type="text" className="form-input" style={{ flex: 1 }} />
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider" />
                  <span className="toggle-label">Remote</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3 className="section-subtitle">Requirements</h3>

            <div className="input-row">
              <label htmlFor="job-skills">Skills</label>
              <input id="job-skills" type="text" className="form-input" />
            </div>

            <div className="input-row" style={{ gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label htmlFor="experience-years">Min years experience</label>
                <select id="experience-years" className="form-input" style={{ width: '80px' }}>
                  <option>3</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label htmlFor="education-minimum">Education minimum</label>
                <select id="education-minimum" className="form-input">
                  <option>Bachelors</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3 className="section-subtitle" style={{ marginBottom: '0.25rem' }}>
              Disqualifiers
            </h3>
            <p className="text-body-sm" style={{ marginBottom: '1rem' }}>
              Auto-rejects in off caps limit factor
            </p>

            <div className="input-row" style={{ gap: '1rem' }}>
              <input type="text" className="form-input" placeholder="Criteria 1" style={{ flex: 1 }} />
              <input type="text" className="form-input" placeholder="Criteria 2" style={{ flex: 1 }} />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
            >
              + Add new criteria
            </button>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3 className="section-subtitle">Job description</h3>
            <textarea className="form-input" rows={6} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-primary">
              Save as draft
            </button>
            <button type="button" className="btn btn-primary">
              Create new job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
