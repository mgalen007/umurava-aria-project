'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, MapPin, Pencil, ShieldAlert, Sparkles } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { DraftPageSkeleton } from '@/components/skeletons/PageSkeletons';
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
    description: 'No job description has been added yet.',
  };
}

export default function JobDraftPage({ params }: { params: { jobId: string } }) {
  const draft = getDraftJob(params.jobId) ?? draftFallback(params.jobId);
  if (!draft) {
    notFound();
  }

  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(draft.description);

  return (
    <PageSkeletonGate skeleton={<DraftPageSkeleton />}>
      <div className="page-container draft-page">
        <DashboardTopBar breadcrumbs={['Jobs', 'Draft']} />

      <section className="draft-shell">
        <div className="draft-hero">
          <div>
            <p className="draft-eyebrow">Draft overview</p>
            <h1 className="draft-title">
              {draft.titleLine1} {draft.titleLine2}
            </h1>
            <p className="draft-subtitle">
              Review the saved job definition and update the job description before publishing or screening candidates.
            </p>
          </div>

          <div className="draft-hero__actions">
            <button type="button" className="draft-primary-btn" onClick={() => setIsEditing((value) => !value)}>
              <Pencil size={16} />
              {isEditing ? 'Close editor' : 'Edit job'}
            </button>
            <Link href={`/dashboard/jobs/${params.jobId}`} className="draft-secondary-btn">
              Back to job
            </Link>
          </div>
        </div>

        <div className="draft-layout">
          <aside className="draft-sidebar">
            <article className="draft-side-card">
              <h2 className="draft-side-card__title">Role summary</h2>
              <div className="draft-meta-list">
                <div className="draft-meta-item">
                  <Sparkles size={16} />
                  <span>{draft.seniority}</span>
                </div>
                <div className="draft-meta-item">
                  <FileText size={16} />
                  <span>{draft.employmentType}</span>
                </div>
                <div className="draft-meta-item">
                  <MapPin size={16} />
                  <span>{draft.location}</span>
                </div>
              </div>
            </article>

            <article className="draft-side-card">
              <h2 className="draft-side-card__title">Requirements</h2>
              <div className="draft-chip-list">
                {draft.skills.map((skill) => (
                  <span key={skill} className="draft-chip">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="draft-side-note">
                <strong>Experience:</strong> {draft.experience}
              </div>
            </article>

            <article className="draft-side-card">
              <h2 className="draft-side-card__title">Disqualifiers</h2>
              {draft.disqualifiers.length === 0 ? (
                <p className="draft-empty-copy">No disqualifiers listed for this draft.</p>
              ) : (
                <ul className="draft-flag-list">
                  {draft.disqualifiers.map((item) => (
                    <li key={item}>
                      <ShieldAlert size={15} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </aside>

          <section className="draft-main-card">
            <div className="draft-main-card__header">
              <div>
                <p className="draft-main-card__eyebrow">Job description</p>
                <h2 className="draft-main-card__title">Description editor</h2>
              </div>
              <button type="button" className="draft-inline-edit-btn" onClick={() => setIsEditing((value) => !value)}>
                <Pencil size={15} />
                {isEditing ? 'Preview mode' : 'Edit job'}
              </button>
            </div>

            {isEditing ? (
              <div className="draft-editor">
                <textarea
                  className="draft-editor__textarea"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-label="Job description editor"
                />
                <div className="draft-editor__actions">
                  <button type="button" className="draft-secondary-btn" onClick={() => setDescription(draft.description)}>
                    Reset
                  </button>
                  <button type="button" className="draft-primary-btn" onClick={() => setIsEditing(false)}>
                    Save changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="draft-description">
                {description.split('\n').map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
      </div>
    </PageSkeletonGate>
  );
}
