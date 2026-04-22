'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { CreateJobPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import './create-job.css';

const seniorityLevels = ['Junior', 'Mid', 'Senior', 'Lead'] as const;
const employmentTypes = ['Full-time', 'Contract', 'Part time'] as const;
const educationLevels = ['High school', 'Diploma', 'Bachelors', 'Masters', 'PhD'] as const;
const draftStorageKey = 'aria-create-job-draft';

type FormState = {
  jobTitle: string;
  seniorityLevel: (typeof seniorityLevels)[number];
  employmentType: (typeof employmentTypes)[number];
  location: string;
  remote: boolean;
  skills: string[];
  skillInput: string;
  experienceYears: string;
  educationMinimum: (typeof educationLevels)[number];
  disqualifiers: string[];
  description: string;
};

const initialFormState: FormState = {
  jobTitle: '',
  seniorityLevel: 'Senior',
  employmentType: 'Full-time',
  location: '',
  remote: true,
  skills: [],
  skillInput: '',
  experienceYears: '3',
  educationMinimum: 'Bachelors',
  disqualifiers: ['', ''],
  description: '',
};

function sanitizeFormForStorage(form: FormState) {
  return {
    ...form,
    disqualifiers: form.disqualifiers.length > 0 ? form.disqualifiers : [''],
  };
}

export default function CreateJobPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(draftStorageKey);
    if (!savedDraft) {
      setHasLoadedDraft(true);
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as Partial<FormState>;
      setForm({
        ...initialFormState,
        ...parsedDraft,
        skills: Array.isArray(parsedDraft.skills) ? parsedDraft.skills : [],
        disqualifiers:
          Array.isArray(parsedDraft.disqualifiers) && parsedDraft.disqualifiers.length > 0
            ? parsedDraft.disqualifiers
            : ['', ''],
      });
      setStatusMessage('Draft restored from your last session.');
      setStatusTone('success');
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    } finally {
      setHasLoadedDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;
    window.localStorage.setItem(draftStorageKey, JSON.stringify(sanitizeFormForStorage(form)));
  }, [form, hasLoadedDraft]);

  const filledDisqualifiers = useMemo(
    () => form.disqualifiers.map((item) => item.trim()).filter(Boolean),
    [form.disqualifiers],
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function addSkill(rawValue?: string) {
    const candidate = (rawValue ?? form.skillInput).trim().replace(/,$/, '');
    if (!candidate) return;

    const alreadyExists = form.skills.some((skill) => skill.toLowerCase() === candidate.toLowerCase());
    if (alreadyExists) {
      setStatusMessage(`"${candidate}" is already in the skills list.`);
      setStatusTone('error');
      return;
    }

    setForm((current) => ({
      ...current,
      skills: [...current.skills, candidate],
      skillInput: '',
    }));
    setErrors((current) => ({ ...current, skills: undefined }));
    setStatusMessage('');
  }

  function removeSkill(skillToRemove: string) {
    setForm((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove),
    }));
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill();
    }
  }

  function updateDisqualifier(index: number, value: string) {
    setForm((current) => ({
      ...current,
      disqualifiers: current.disqualifiers.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addDisqualifier() {
    setForm((current) => ({
      ...current,
      disqualifiers: [...current.disqualifiers, ''],
    }));
  }

  function removeDisqualifier(index: number) {
    setForm((current) => {
      const next = current.disqualifiers.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        disqualifiers: next.length > 0 ? next : [''],
      };
    });
  }

  function validateForm(snapshot: FormState = form) {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!snapshot.jobTitle.trim()) nextErrors.jobTitle = 'Job title is required.';
    if (!snapshot.remote && !snapshot.location.trim()) {
      nextErrors.location = 'Location is required for non-remote roles.';
    }
    if (snapshot.skills.length === 0) nextErrors.skills = 'Add at least one skill.';
    if (!snapshot.description.trim()) nextErrors.description = 'Job description is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSaveDraft() {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(sanitizeFormForStorage(form)));
    setStatusMessage('Draft saved on this browser.');
    setStatusTone('success');
  }

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addSkill();

    const nextSkills = form.skillInput.trim()
      ? [...form.skills, form.skillInput.trim().replace(/,$/, '')]
      : form.skills;

    const nextForm = {
      ...form,
      skills: nextSkills,
      skillInput: '',
    };

    if (form.skillInput.trim()) {
      setForm(nextForm);
    }

    if (
      !nextForm.jobTitle.trim() ||
      (!nextForm.remote && !nextForm.location.trim()) ||
      nextSkills.length === 0 ||
      !nextForm.description.trim()
    ) {
      validateForm(nextForm);
      setStatusMessage('Please fix the highlighted fields before creating the job.');
      setStatusTone('error');
      return;
    }

    if (!token) {
      setStatusMessage('You must be signed in to create a job.');
      setStatusTone('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const experienceLevel = nextForm.seniorityLevel.toLowerCase() === 'mid'
        ? 'mid'
        : nextForm.seniorityLevel.toLowerCase();

      const job = await api.createJob(
        {
          title: nextForm.jobTitle.trim(),
          department: 'General',
          description: nextForm.description.trim(),
          requiredSkills: nextSkills,
          niceToHaveSkills: [],
          experienceLevel,
          minYearsExperience: Number(nextForm.experienceYears),
          maxYearsExperience: undefined,
          location: nextForm.location.trim() || 'Remote',
          remote: nextForm.remote,
          hardRequirements: filledDisqualifiers,
        },
        token
      );

      window.localStorage.removeItem(draftStorageKey);
      setForm(initialFormState);
      setErrors({});
      setStatusMessage('Job created successfully.');
      setStatusTone('success');
      router.push(`/dashboard/jobs/${job._id}`);
    } catch (err) {
      setStatusMessage(err instanceof ApiError ? err.message : 'Unable to create job.');
      setStatusTone('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageSkeletonGate skeleton={<CreateJobPageSkeleton />}>
      <div className="page-container flex-col" style={{ alignItems: 'center', paddingTop: '2rem' }}>
        <div className="create-job-card surface">
          <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Create Job
          </h2>

          <form className="create-job-form" onSubmit={handleCreateJob}>
            <div className="form-section">
              <h3 className="section-subtitle">Role</h3>

            <div className="input-row input-row--stack-mobile">
              <label htmlFor="job-title">Job title</label>
              <div className="input-main">
                <input
                  id="job-title"
                  type="text"
                  className={`form-input ${errors.jobTitle ? 'form-input--error' : ''}`}
                  value={form.jobTitle}
                  onChange={(event) => updateField('jobTitle', event.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                />
                {errors.jobTitle ? <p className="field-error">{errors.jobTitle}</p> : null}
              </div>
            </div>

            <div className="input-row input-row--stack-mobile">
              <label>Seniority level</label>
              <div className="button-group">
                {seniorityLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`btn-toggle ${form.seniorityLevel === level ? 'active' : ''}`}
                    onClick={() => updateField('seniorityLevel', level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-row input-row--stack-mobile">
              <label>Employment type</label>
              <div className="button-group">
                {employmentTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`btn-toggle ${form.employmentType === type ? 'active' : ''}`}
                    onClick={() => updateField('employmentType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-row input-row--stack-mobile">
              <label htmlFor="job-location">Location</label>
              <div className="input-main">
                <div className="location-inputs">
                  <input
                    id="job-location"
                    type="text"
                    className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                    style={{ flex: 1 }}
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    placeholder={form.remote ? 'e.g. Kigali, Rwanda or Anywhere' : 'e.g. Kigali, Rwanda'}
                  />
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={form.remote}
                      onChange={(event) => updateField('remote', event.target.checked)}
                    />
                    <span className="slider" />
                    <span className="toggle-label">Remote</span>
                  </label>
                </div>
                {errors.location ? <p className="field-error">{errors.location}</p> : null}
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3 className="section-subtitle">Requirements</h3>

            <div className="input-row input-row--stack-mobile">
              <label htmlFor="job-skills">Skills</label>
              <div className="input-main">
                <div className="skills-editor">
                  <div className="skills-chip-list">
                    {form.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="skills-input-row">
                    <input
                      id="job-skills"
                      type="text"
                      className={`form-input ${errors.skills ? 'form-input--error' : ''}`}
                      value={form.skillInput}
                      onChange={(event) => updateField('skillInput', event.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill and press Enter"
                    />
                    <button type="button" className="btn btn-secondary" onClick={() => addSkill()}>
                      Add skill
                    </button>
                  </div>
                </div>
                {errors.skills ? <p className="field-error">{errors.skills}</p> : null}
              </div>
            </div>

            <div className="input-row input-row--split">
              <div className="input-inline-group">
                <label htmlFor="experience-years">Min years experience</label>
                <select
                  id="experience-years"
                  className="form-input"
                  value={form.experienceYears}
                  onChange={(event) => updateField('experienceYears', event.target.value)}
                >
                  {Array.from({ length: 16 }, (_, index) => (
                    <option key={index} value={String(index)}>
                      {index}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-inline-group">
                <label htmlFor="education-minimum">Education minimum</label>
                <select
                  id="education-minimum"
                  className="form-input"
                  value={form.educationMinimum}
                  onChange={(event) =>
                    updateField('educationMinimum', event.target.value as FormState['educationMinimum'])
                  }
                >
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
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
              Add knockout criteria that should immediately flag weak applications.
            </p>

            <div className="disqualifier-list">
              {form.disqualifiers.map((criterion, index) => (
                <div className="disqualifier-row" key={`criterion-${index}`}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Criteria ${index + 1}`}
                    value={criterion}
                    onChange={(event) => updateDisqualifier(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-remove"
                    onClick={() => removeDisqualifier(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
              onClick={addDisqualifier}
            >
              + Add new criteria
            </button>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3 className="section-subtitle">Job description</h3>
            <div className="input-main">
              <textarea
                className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
                rows={6}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe the role, responsibilities, and what success looks like."
              />
              {errors.description ? <p className="field-error">{errors.description}</p> : null}
            </div>
          </div>

          {statusMessage ? (
            <div className={`form-status form-status--${statusTone}`}>
              {statusMessage}
            </div>
          ) : null}

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
                Save as draft
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create new job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageSkeletonGate>
  );
}
