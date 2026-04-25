'use client';

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { SettingsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { AiSettings, ParsingFields, ParsingSettings, SettingsProfile } from '@/lib/types';
import { BrainCircuit, FileText, ShieldAlert, UploadCloud, User } from 'lucide-react';
import './settings.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: User },
  { id: 'ai', label: 'AI Screening', icon: BrainCircuit },
  { id: 'parsing', label: 'Resume Parsing', icon: FileText },
  { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
] as const;

const DEFAULT_AI_SETTINGS: AiSettings = {
  defaultShortlistSize: '10',
  defaultScreeningMode: 'both',
  weights: { skills: 60, experience: 30, education: 10 },
  showReasoning: true,
};

const DEFAULT_PARSING_FIELDS: ParsingFields = {
  name: true,
  email: true,
  skills: true,
  experience: true,
  education: true,
  location: true,
  certifications: true,
};

const DEFAULT_PARSING_SETTINGS: ParsingSettings = {
  fields: DEFAULT_PARSING_FIELDS,
  fallbackBehavior: 'flag',
};

const DEFAULT_PROFILE: SettingsProfile = {
  fullName: '',
  email: '',
  jobTitle: '',
  profilePhotoUrl: null,
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read selected image'));
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, isLoading, replaceUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [aiForm, setAiForm] = useState(DEFAULT_AI_SETTINGS);
  const [parsingForm, setParsingForm] = useState(DEFAULT_PARSING_SETTINGS);

  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [aiStatus, setAiStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parsingStatus, setParsingStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dangerStatus, setDangerStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [isSavingParsing, setIsSavingParsing] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageLoading(false);
      return;
    }

    const activeToken: string = token;

    let cancelled = false;

    async function loadSettings() {
      setPageLoading(true);
      setPageError('');

      try {
        const settings = await api.getSettings(activeToken);
        if (cancelled) return;

        setProfileForm(settings.profile);
        setAiForm(settings.ai);
        setParsingForm(settings.parsing);
      } catch (error) {
        if (cancelled) return;
        setPageError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const totalWeight = useMemo(
    () => aiForm.weights.skills + aiForm.weights.experience + aiForm.weights.education,
    [aiForm.weights.education, aiForm.weights.experience, aiForm.weights.skills]
  );
  const isWeightValid = totalWeight === 100;
  const selectedParsingFields = useMemo(
    () => Object.values(parsingForm.fields).filter(Boolean).length,
    [parsingForm.fields]
  );

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please choose an image file.');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Profile photo must be 2MB or smaller.');
      }

      const photoDataUrl = await readFileAsDataUrl(file);
      setProfileForm((prev) => ({ ...prev, profilePhotoUrl: photoDataUrl }));
      setProfileStatus({ type: 'success', message: 'Photo selected. Save profile changes to persist it.' });
    } catch (error) {
      setProfileStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      event.target.value = '';
    }
  }

  function handleRemovePhoto() {
    setProfileForm((prev) => ({ ...prev, profilePhotoUrl: null }));
    setProfileStatus({ type: 'success', message: 'Photo removed locally. Save profile changes to persist it.' });
  }

  async function handleSaveProfile() {
    if (!token) return;

    const hasPasswordInput = Object.values(passwordForm).some((value) => value.trim().length > 0);
    setIsSavingProfile(true);
    setProfileStatus(null);

    try {
      const messages: string[] = [];

      const profileResult = await api.updateProfile(
        {
          fullName: profileForm.fullName,
          jobTitle: profileForm.jobTitle,
          profilePhotoUrl: profileForm.profilePhotoUrl,
        },
        token
      );

      await replaceUser(profileResult.user);
      setProfileForm(profileResult.profile);
      messages.push('Profile updated.');

      if (hasPasswordInput) {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
          throw new Error('Fill in all password fields to change your password.');
        }

        await api.changePassword(passwordForm, token);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        messages.push('Password updated.');
      }

      setProfileStatus({ type: 'success', message: messages.join(' ') });
    } catch (error) {
      setProfileStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveAi() {
    if (!token) return;
    setIsSavingAi(true);
    setAiStatus(null);

    try {
      const updated = await api.updateAiSettings(aiForm, token);
      setAiForm(updated);
      setAiStatus({ type: 'success', message: 'AI preferences saved.' });
    } catch (error) {
      setAiStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSavingAi(false);
    }
  }

  async function handleSaveParsing() {
    if (!token) return;
    setIsSavingParsing(true);
    setParsingStatus(null);

    try {
      const updated = await api.updateParsingSettings(parsingForm, token);
      setParsingForm(updated);
      setParsingStatus({ type: 'success', message: 'Parsing settings saved.' });
    } catch (error) {
      setParsingStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSavingParsing(false);
    }
  }

  async function handleClearData() {
    if (!token) return;
    const confirmed = window.confirm(
      'This will permanently remove all of your jobs, candidates, screening sessions, and notifications. Continue?'
    );

    if (!confirmed) return;

    setIsClearingData(true);
    setDangerStatus(null);

    try {
      const result = await api.clearSettingsData(token);
      setDangerStatus({
        type: 'success',
        message: `Data cleared. Removed ${result.deleted.jobs} jobs, ${result.deleted.candidates} candidates, ${result.deleted.sessions} sessions, and ${result.deleted.notifications} notifications.`,
      });
    } catch (error) {
      setDangerStatus({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsClearingData(false);
    }
  }

  async function handleDeleteAccount() {
    if (!token) return;
    const confirmed = window.confirm(
      'Deleting your account is permanent and will remove your profile and all associated data. Continue?'
    );

    if (!confirmed) return;

    setIsDeletingAccount(true);
    setDangerStatus(null);

    try {
      await api.deleteAccount(token);
      logout();
      router.replace('/login');
    } catch (error) {
      setDangerStatus({ type: 'error', message: getErrorMessage(error) });
      setIsDeletingAccount(false);
    }
  }

  const statusStyle = (status: { type: 'success' | 'error'; message: string } | null) => ({
    color: status?.type === 'error' ? '#b42318' : '#027a48',
    fontSize: '0.875rem',
    fontWeight: 500,
  });

  if (isLoading || pageLoading) {
    return (
      <PageSkeletonGate skeleton={<SettingsPageSkeleton />}>
        <div className="page-container" />
      </PageSkeletonGate>
    );
  }

  return (
    <PageSkeletonGate skeleton={<SettingsPageSkeleton />}>
      <div className="page-container">
        <DashboardTopBar breadcrumbs={['Settings']} />

        <div className="settings-layout">
          <aside className="settings-sidebar">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`settings-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </aside>

          <main className="settings-content">
            {pageError && (
              <section className="settings-section">
                <div className="settings-section-header" style={{ marginBottom: 0 }}>
                  <h2 className="settings-section-title">Couldn&apos;t Load Settings</h2>
                  <p className="settings-section-subtitle" style={{ color: '#b42318' }}>{pageError}</p>
                </div>
              </section>
            )}

            {activeSection === 'profile' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Profile & Account</h2>
                  <p className="settings-section-subtitle">Manage your personal information and security.</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelected}
                  hidden
                />

                <div className="photo-upload-container">
                  <div className="photo-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                    {profileForm.profilePhotoUrl ? (
                      <img
                        src={profileForm.profilePhotoUrl}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      profileForm.fullName.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="settings-form-group" style={{ flex: 1 }}>
                    <label className="settings-label">Profile Photo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud size={16} /> Upload new
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={handleRemovePhoto}
                        style={{ color: '#b42318', background: 'transparent', border: 'none' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="settings-divider" />

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">Full Name</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileForm.fullName}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Job Title / Role</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={profileForm.jobTitle}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Email Address (Read-only)</label>
                  <input type="email" className="settings-input" value={profileForm.email} disabled />
                </div>

                <hr className="settings-divider" />

                <h3 className="settings-section-title" style={{ fontSize: '1.1rem' }}>Change Password</h3>
                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="********"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  />
                </div>
                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      placeholder="********"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                    />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      placeholder="********"
                      value={passwordForm.confirmNewPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="settings-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {profileStatus && <span style={statusStyle(profileStatus)}>{profileStatus.message}</span>}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </section>
            )}

            {activeSection === 'ai' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">AI Screening Preferences</h2>
                  <p className="settings-section-subtitle">Fine-tune how the ARIA AI evaluates and shortlists your candidates.</p>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">Default Shortlist Size</label>
                    <select
                      className="settings-select"
                      value={aiForm.defaultShortlistSize}
                      onChange={(event) =>
                        setAiForm((prev) => ({ ...prev, defaultShortlistSize: event.target.value as AiSettings['defaultShortlistSize'] }))
                      }
                    >
                      <option value="5">Top 5 Candidates</option>
                      <option value="10">Top 10 Candidates</option>
                      <option value="20">Top 20 Candidates</option>
                      <option value="all">Rank All</option>
                    </select>
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Default Screening Mode</label>
                    <select
                      className="settings-select"
                      value={aiForm.defaultScreeningMode}
                      onChange={(event) =>
                        setAiForm((prev) => ({ ...prev, defaultScreeningMode: event.target.value as AiSettings['defaultScreeningMode'] }))
                      }
                    >
                      <option value="umurava">Umurava Profiles Only</option>
                      <option value="external">External Resumes Only</option>
                      <option value="both">Both (Mixed Pipeline)</option>
                    </select>
                  </div>
                </div>

                <hr className="settings-divider" />

                <h3 className="settings-section-title" style={{ fontSize: '1.1rem' }}>AI Scoring Weights</h3>
                <p className="settings-section-subtitle" style={{ marginBottom: '1.5rem' }}>Adjust what criteria matter most for your pipeline. Must add up to 100%.</p>

                {(['skills', 'experience', 'education'] as const).map((field) => (
                  <div key={field} className="settings-form-group" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="settings-label">
                        {field === 'skills' && 'Skills Match'}
                        {field === 'experience' && 'Experience'}
                        {field === 'education' && 'Education & Certifications'}
                      </label>
                      <span className="weight-value">{aiForm.weights[field]}%</span>
                    </div>
                    <div className="weight-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiForm.weights[field]}
                        onChange={(event) =>
                          setAiForm((prev) => ({
                            ...prev,
                            weights: {
                              ...prev.weights,
                              [field]: Number.parseInt(event.target.value, 10),
                            },
                          }))
                        }
                        className="weight-slider"
                      />
                    </div>
                  </div>
                ))}

                <hr className="settings-divider" />

                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Show AI Reasoning by Default</span>
                    <span className="toggle-desc">Automatically expand the AI thought process on candidate cards.</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={aiForm.showReasoning}
                      onChange={(event) => setAiForm((prev) => ({ ...prev, showReasoning: event.target.checked }))}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {!isWeightValid && (
                    <span style={{ color: '#b42318', fontSize: '0.875rem', fontWeight: 500 }}>
                      Weights must equal exactly 100% (currently {totalWeight}%).
                    </span>
                  )}
                  {aiStatus && <span style={statusStyle(aiStatus)}>{aiStatus.message}</span>}
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!isWeightValid || isSavingAi}
                    onClick={handleSaveAi}
                  >
                    {isSavingAi ? 'Saving...' : 'Save AI Preferences'}
                  </button>
                </div>
              </section>
            )}

            {activeSection === 'parsing' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Resume Parsing Preferences</h2>
                  <p className="settings-section-subtitle">Control exactly what data ARIA extracts from imported PDFs and CSVs.</p>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label" style={{ marginBottom: '0.5rem' }}>Fields to Extract</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f9f9fb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #eaecf0' }}>
                    {Object.keys(parsingForm.fields).map((field) => (
                      <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#344054', textTransform: 'capitalize' }}>
                        <input
                          type="checkbox"
                          checked={parsingForm.fields[field as keyof ParsingFields]}
                          onChange={(event) =>
                            setParsingForm((prev) => ({
                              ...prev,
                              fields: {
                                ...prev.fields,
                                [field]: event.target.checked,
                              },
                            }))
                          }
                        />
                        {field === 'experience' ? 'Experience Years' : field}
                      </label>
                    ))}
                  </div>
                  <p className="toggle-desc" style={{ marginTop: '0.5rem' }}>
                    Deselect fields that are irrelevant to your hiring context to speed up parsing.
                  </p>
                </div>

                <hr className="settings-divider" />

                <div className="settings-form-group">
                  <label className="settings-label">Fallback Behavior</label>
                  <select
                    className="settings-select"
                    value={parsingForm.fallbackBehavior}
                    onChange={(event) =>
                      setParsingForm((prev) => ({
                        ...prev,
                        fallbackBehavior: event.target.value as ParsingSettings['fallbackBehavior'],
                      }))
                    }
                  >
                    <option value="blank">Leave missing fields blank</option>
                    <option value="flag">Mark candidate as incomplete and flag for manual review</option>
                  </select>
                  <p className="toggle-desc">Determines what happens when a resume is missing a selected field (e.g., no education section found).</p>
                </div>

                <div className="settings-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {selectedParsingFields === 0 && (
                    <span style={{ color: '#b42318', fontSize: '0.875rem', fontWeight: 500 }}>
                      Select at least one field to extract.
                    </span>
                  )}
                  {parsingStatus && <span style={statusStyle(parsingStatus)}>{parsingStatus.message}</span>}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveParsing}
                    disabled={selectedParsingFields === 0 || isSavingParsing}
                  >
                    {isSavingParsing ? 'Saving...' : 'Save Parsing Settings'}
                  </button>
                </div>
              </section>
            )}

            {activeSection === 'danger' && (
              <section className="settings-section danger-zone">
                <div className="settings-section-header">
                  <h2 className="settings-section-title danger">Danger Zone</h2>
                  <p className="settings-section-subtitle">Destructive actions that cannot be undone.</p>
                </div>

                <div className="danger-action-row">
                  <div className="danger-action-text">
                    <h4>Clear all data</h4>
                    <p>Permanently removes all jobs, applicants, and screening results.</p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleClearData}
                    disabled={isClearingData || isDeletingAccount}
                    style={{ background: '#fff', color: '#b42318', border: '1px solid #fda29b', fontWeight: 600 }}
                  >
                    {isClearingData ? 'Clearing...' : 'Clear Data'}
                  </button>
                </div>

                <div className="danger-action-row">
                  <div className="danger-action-text">
                    <h4>Delete account</h4>
                    <p>Permanently deletes your recruiter profile and all associated data.</p>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || isClearingData}
                    style={{ background: '#b42318', color: '#fff', border: 'none', fontWeight: 600 }}
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>

                {dangerStatus && (
                  <div style={{ marginTop: '1rem' }}>
                    <span style={statusStyle(dangerStatus)}>{dangerStatus.message}</span>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </PageSkeletonGate>
  );
}
