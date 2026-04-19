import React from 'react';
import './applicants.css';

export default function JobApplicantsPage() {
  const applicants = [
    { name: 'Alice Johnson', exp: 'Javascript', loc: 'Nyanza' },
    { name: 'John David', exp: 'Javascript', loc: 'Huye' },
    { name: 'Mark Robert', exp: 'Javascript', loc: 'Karongi' },
    { name: 'Peter Griffin', exp: 'Javascript', loc: 'Kigali' },
    { name: 'Peter Parker', exp: 'Javascript', loc: 'London' },
    { name: 'Bruce Wayne', exp: 'Javascript', loc: 'California' },
    { name: 'Dwayne Johnson', exp: 'Javascript', loc: 'USA' },
    { name: 'Mr Beast', exp: 'Javascript', loc: 'USA' },
  ];

  const sessions = [
    { date: 'Apr 12, 2023', status: 'Pending', candidates: 25, score: '92%' },
    { date: 'Apr 12, 2023', status: 'Completed', candidates: 25, score: '92%' },
    { date: 'Apr 12, 2023', status: 'Completed', candidates: 25, score: '92%' },
  ];

  return (
    <div className="page-container applicants-page">
      <header className="job-detail-header">
        <h1 className="text-h1">Job / Javascript Senior developer</h1>
        <button className="btn btn-secondary" type="button">
          Edit job
        </button>
      </header>

      <div className="applicants-layout">
        <div className="applicants-main surface">
          <div className="applicants-actions">
            <input type="text" className="input-field search-input-large" placeholder="Search" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="button">
                Upload files
              </button>
              <button className="btn btn-primary" type="button">
                View job
              </button>
            </div>
          </div>

          <h2 className="text-h2 applicants-title">Job applicants</h2>

          <div className="table-container applicants-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" />
                  </th>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => (
                  <tr key={applicant.name}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className="font-medium">{applicant.name}</td>
                    <td>{applicant.exp}</td>
                    <td>{applicant.loc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary screen-btn w-full" type="button">
            Screen candidates
          </button>
        </div>

        <aside className="sessions-sidebar surface">
          <h3 className="sessions-title">Previous sessions</h3>

          <div className="sessions-list">
            {sessions.map((session, index) => (
              <div className="session-card" key={session.date + index}>
                <div className="session-header">
                  <span className="session-date">{session.date}</span>
                  <span
                    className={
                      session.status === 'Pending' ? 'status-badge-draft' : 'status-badge-active'
                    }
                  >
                    {session.status}
                  </span>
                </div>
                <div className="session-stats">
                  <div className="stat-row">Candidates: {session.candidates}</div>
                  <div className="stat-row">Top score: {session.score}</div>
                </div>
                <button className="btn btn-primary w-full" type="button" style={{ marginTop: '1rem' }}>
                  View results
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
