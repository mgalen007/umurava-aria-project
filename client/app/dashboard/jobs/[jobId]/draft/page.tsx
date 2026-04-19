import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDraftJob, getJobOpening } from '@/lib/mock-data';
import type { MockDraftJob } from '@/lib/mock-data';
import './draft.css';

function draftFallback(jobId: string): MockDraftJob | null {
  const opening = getJobOpening(jobId);
  if (!opening) return null;
  return {
    jobId: opening.id,
    titleLine1: opening.titleLine1,
    titleLine2: opening.titleLine2,
    skills: ['Add skills in editor'],
    experience: '—',
    seniority: opening.level,
    location: opening.location,
    employmentType: opening.workType,
    disqualifiers: [],
  };
}

export default function JobDraftPage({ params }: { params: { jobId: string } }) {
  const draft = getDraftJob(params.jobId) ?? draftFallback(params.jobId);
  if (!draft) {
    notFound();
  }

  return (
    <div className="page-container draft-container">
      <div className="draft-card surface">
        <div className="draft-header">
          <h1 className="text-h1 job-title-large">
            {draft.titleLine1}
            <br />
            {draft.titleLine2}
          </h1>
          <Link href={`/dashboard/jobs/${params.jobId}`} className="btn btn-ghost edit-btn" style={{ textDecoration: 'none' }}>
            Back to job
          </Link>
        </div>

        <div className="draft-section">
          <h3 className="section-heading">Skills required</h3>
          <div className="badges-list">
            {draft.skills.map((skill) => (
              <span key={skill} className="badge-gray">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <hr className="divider-line" />

        <div className="draft-section details-list">
          <p>
            <strong>Experience:</strong> {draft.experience}
          </p>
          <p>
            <strong>Seniority:</strong> {draft.seniority}
          </p>
          <p>
            <strong>Location:</strong> {draft.location}
          </p>
          <p>
            <strong>Type:</strong> {draft.employmentType}
          </p>
        </div>

        <hr className="divider-line" />

        <div className="draft-section">
          <h3 className="section-heading">Disqualifies</h3>
          <div className="badges-list">
            {draft.disqualifiers.length === 0 ? (
              <span className="badge-gray">None listed</span>
            ) : (
              draft.disqualifiers.map((d) => (
                <span key={d} className="badge-gray">
                  {d}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
