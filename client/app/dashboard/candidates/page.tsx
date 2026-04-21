'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { mockCandidates } from '@/lib/mock-data';
import type { MockCandidate } from '@/lib/mock-data';
import '../screenings/screenings.css';
import './candidates.css';

export default function CandidatesPage() {
  const [selected, setSelected] = useState<MockCandidate | null>(null);

  const closeDrawer = () => setSelected(null);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div className="page-container">
      <DashboardTopBar breadcrumbs={['Candidates']} />

      <header className="candidates-toolbar">
        <h1 className="candidates-heading">Candidates</h1>
        <div className="candidates-toolbar__controls">
          <Link href="/dashboard/jobs" className="candidates-action-btn">
            View jobs
          </Link>
        </div>
      </header>

      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Headline</th>
              <th>Location</th>
              <th>Match</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockCandidates.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">
                  <button
                    type="button"
                    className="candidate-row-button"
                    onClick={() => setSelected(c)}
                    aria-expanded={selected?.id === c.id}
                  >
                    {c.name}
                  </button>
                </td>
                <td>{c.headline}</td>
                <td>{c.location}</td>
                <td>
                  <span className="badge-score green">{c.matchScore}%</span>
                </td>
                <td>
                  <button type="button" className="btn btn-ghost" onClick={() => setSelected(c)}>
                    Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={`drawer-backdrop ${selected ? 'open' : ''}`}
        onClick={closeDrawer}
        onKeyDown={(e) => e.key === 'Escape' && closeDrawer()}
        role="presentation"
        aria-hidden={!selected}
      />

      <aside
        className={`candidate-drawer ${selected ? 'open' : ''}`}
        aria-hidden={!selected}
        aria-label="Candidate profile"
      >
        {selected && (
          <>
            <div className="drawer-header">
              <div>
                <h2 className="text-h2" style={{ marginBottom: '0.25rem' }}>
                  {selected.name}
                </h2>
                <p className="text-body-sm">{selected.email}</p>
              </div>
              <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close profile">
                ×
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-score">{selected.matchScore}% match</div>
              <p className="text-body-sm" style={{ marginBottom: '1rem' }}>
                {selected.headline} · {selected.location}
              </p>
              <p className="text-body-sm" style={{ marginBottom: '1.5rem' }}>
                {selected.summary}
              </p>
              <h3 className="section-title" style={{ fontSize: '0.875rem' }}>
                Skills
              </h3>
              <div className="skill-badges-belt" style={{ marginBottom: 0 }}>
                {selected.skills.map((s) => (
                  <span key={s} className="badge-purple">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
