'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, MapPin, Pencil, ShieldAlert, Sparkles } from 'lucide-react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { DraftPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatExperienceLevel } from '@/lib/helpers';
import type { Job } from '@/lib/types';
import './draft.css';

export default function JobDraftPage({
  params: _params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const routeParams = useParams<{ jobId: string }>();
  const jobId = typeof routeParams?.jobId === 'string' ? routeParams.jobId : '';
  const { token } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!token || !jobId) return;
    let isActive = true;
    setStatusMessage(null);

    api.getJob(jobId, token)
      .then((result) => {
        if (!isActive) return;
        setJob(result);
        setDescription(result.description);
        setStatusMessage(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setStatusTone('error');
        setStatusMessage(err instanceof ApiError ? err.message : 'Unable to load job.');
      });

    return () => {
      isActive = false;
    };
  }, [jobId, token]);

  async function saveChanges() {
    if (!token || !job) return;

    try {
      const updatedJob = await api.updateJob(job._id, { description }, token);
      setJob(updatedJob);
      setStatusTone('success');
      setStatusMessage('Job description updated.');
      setIsEditing(false);
    } catch (err) {
      setStatusTone('error');
      setStatusMessage(err instanceof ApiError ? err.message : 'Unable to update job.');
    }
  }

  if (!job) {
    return (
      <PageSkeletonGate skeleton={<DraftPageSkeleton />}>
        <div className="page-container draft-page">
          {statusMessage ? <div className="draft-empty-copy">{statusMessage}</div> : null}
        </div>
      </PageSkeletonGate>
    );
  }

  return (
    <PageSkeletonGate skeleton={<DraftPageSkeleton />}>
      <div className="page-container draft-page">
        <DashboardTopBar breadcrumbs={['Jobs', 'Draft']} />

        <section className="draft-shell">
          <div className="draft-hero">
            <div>
              <p className="draft-eyebrow">Draft overview</p>
              <h1 className="draft-title">{job.title}</h1>
              <p className="draft-subtitle">
                Review the saved job definition and update the job description before publishing or screening candidates.
              </p>
            </div>

            <div className="draft-hero__actions">
              <button type="button" className="draft-primary-btn" onClick={() => setIsEditing((value) => !value)}>
                <Pencil size={16} />
                {isEditing ? 'Close editor' : 'Edit job'}
              </button>
              <Link href={`/dashboard/jobs/${jobId}`} className="draft-secondary-btn">
                Back to job
              </Link>
            </div>
          </div>

          {statusMessage ? (
            <div className="draft-empty-copy" role={statusTone === 'error' ? 'alert' : 'status'}>
              {statusMessage}
            </div>
          ) : null}

          <div className="draft-layout">
            <aside className="draft-sidebar">
              <article className="draft-side-card">
                <h2 className="draft-side-card__title">Role summary</h2>
                <div className="draft-meta-list">
                  <div className="draft-meta-item">
                    <Sparkles size={16} />
                    <span>{formatExperienceLevel(job.experienceLevel)}</span>
                  </div>
                  <div className="draft-meta-item">
                    <FileText size={16} />
                    <span>{job.remote ? 'Remote' : 'On-site'}</span>
                  </div>
                  <div className="draft-meta-item">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                </div>
              </article>

              <article className="draft-side-card">
                <h2 className="draft-side-card__title">Requirements</h2>
                <div className="draft-chip-list">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="draft-chip">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="draft-side-note">
                  <strong>Experience:</strong> {job.minYearsExperience}+ years
                </div>
              </article>

              <article className="draft-side-card">
                <h2 className="draft-side-card__title">Disqualifiers</h2>
                {job.hardRequirements.length === 0 ? (
                  <p className="draft-empty-copy">No disqualifiers listed for this draft.</p>
                ) : (
                  <ul className="draft-flag-list">
                    {job.hardRequirements.map((item) => (
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
                    <button type="button" className="draft-secondary-btn" onClick={() => setDescription(job.description)}>
                      Reset
                    </button>
                    <button type="button" className="draft-primary-btn" onClick={saveChanges}>
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
