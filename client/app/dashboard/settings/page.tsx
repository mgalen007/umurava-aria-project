'use client';

import React, { useState, useEffect } from 'react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { SettingsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/lib/auth';
import { User, BrainCircuit, FileText, ShieldAlert, UploadCloud } from 'lucide-react';
import './settings.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile & Account', icon: User },
  { id: 'ai', label: 'AI Screening', icon: BrainCircuit },
  { id: 'parsing', label: 'Resume Parsing', icon: FileText },
  { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
];

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  // AI State
  const [weights, setWeights] = useState({ skills: 60, experience: 30, education: 10 });
  
  const handleWeightChange = (field: 'skills' | 'experience' | 'education', value: number) => {
    setWeights(prev => ({ ...prev, [field]: value }));
  };

  const totalWeight = weights.skills + weights.experience + weights.education;
  const isWeightValid = totalWeight === 100;

  // Parsing State
  const [parsingFields, setParsingFields] = useState({
    name: true,
    email: true,
    skills: true,
    experience: true,
    education: true,
    location: true,
    certifications: true,
  });

  if (isLoading) {
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
            {activeSection === 'profile' && (
              <section className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Profile & Account</h2>
                  <p className="settings-section-subtitle">Manage your personal information and security.</p>
                </div>

                <div className="photo-upload-container">
                  <div className="photo-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="settings-form-group" style={{ flex: 1 }}>
                    <label className="settings-label">Profile Photo</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button className="btn btn-secondary">
                        <UploadCloud size={16} /> Upload new
                      </button>
                      <button className="btn" style={{ color: '#b42318', background: 'transparent', border: 'none' }}>Remove</button>
                    </div>
                  </div>
                </div>

                <hr className="settings-divider" />

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">Full Name</label>
                    <input type="text" className="settings-input" defaultValue={user?.name || ''} />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Job Title / Role</label>
                    <input type="text" className="settings-input" defaultValue="Senior Recruiter" />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Email Address (Read-only)</label>
                  <input type="email" className="settings-input" value={user?.email || ''} disabled />
                </div>

                <hr className="settings-divider" />
                
                <h3 className="settings-section-title" style={{ fontSize: '1.1rem' }}>Change Password</h3>
                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <input type="password" className="settings-input" placeholder="••••••••" />
                </div>
                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label className="settings-label">New Password</label>
                    <input type="password" className="settings-input" placeholder="••••••••" />
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Confirm New Password</label>
                    <input type="password" className="settings-input" placeholder="••••••••" />
                  </div>
                </div>

                <div className="settings-footer">
                  <button className="btn btn-primary">Save Profile Changes</button>
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
                    <select className="settings-select" defaultValue="10">
                      <option value="5">Top 5 Candidates</option>
                      <option value="10">Top 10 Candidates</option>
                      <option value="20">Top 20 Candidates</option>
                      <option value="all">Rank All</option>
                    </select>
                  </div>
                  <div className="settings-form-group">
                    <label className="settings-label">Default Screening Mode</label>
                    <select className="settings-select" defaultValue="both">
                      <option value="umurava">Umurava Profiles Only</option>
                      <option value="external">External Resumes Only</option>
                      <option value="both">Both (Mixed Pipeline)</option>
                    </select>
                  </div>
                </div>

                <hr className="settings-divider" />

                <h3 className="settings-section-title" style={{ fontSize: '1.1rem' }}>AI Scoring Weights</h3>
                <p className="settings-section-subtitle" style={{ marginBottom: '1.5rem' }}>Adjust what criteria matter most for your pipeline. Must add up to 100%.</p>

                <div className="settings-form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="settings-label">Skills Match</label>
                    <span className="weight-value">{weights.skills}%</span>
                  </div>
                  <div className="weight-slider-container">
                    <input type="range" min="0" max="100" value={weights.skills} onChange={(e) => handleWeightChange('skills', parseInt(e.target.value))} className="weight-slider" />
                  </div>
                </div>

                <div className="settings-form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="settings-label">Experience</label>
                    <span className="weight-value">{weights.experience}%</span>
                  </div>
                  <div className="weight-slider-container">
                    <input type="range" min="0" max="100" value={weights.experience} onChange={(e) => handleWeightChange('experience', parseInt(e.target.value))} className="weight-slider" />
                  </div>
                </div>

                <div className="settings-form-group" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="settings-label">Education & Certifications</label>
                    <span className="weight-value">{weights.education}%</span>
                  </div>
                  <div className="weight-slider-container">
                    <input type="range" min="0" max="100" value={weights.education} onChange={(e) => handleWeightChange('education', parseInt(e.target.value))} className="weight-slider" />
                  </div>
                </div>

                <hr className="settings-divider" />

                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Show AI Reasoning by Default</span>
                    <span className="toggle-desc">Automatically expand the AI thought process on candidate cards.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {!isWeightValid && (
                    <span style={{ color: '#b42318', fontSize: '0.875rem', fontWeight: 500 }}>
                      Weights must equal exactly 100% (currently {totalWeight}%).
                    </span>
                  )}
                  <button className="btn btn-primary" disabled={!isWeightValid}>
                    Save AI Preferences
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
                    {Object.keys(parsingFields).map((field) => (
                      <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#344054', textTransform: 'capitalize' }}>
                        <input 
                          type="checkbox" 
                          checked={parsingFields[field as keyof typeof parsingFields]} 
                          onChange={(e) => setParsingFields(prev => ({ ...prev, [field]: e.target.checked }))} 
                        />
                        {field === 'experience' ? 'Experience Years' : field}
                      </label>
                    ))}
                  </div>
                  <p className="toggle-desc" style={{ marginTop: '0.5rem' }}>Deselect fields that are irrelevant to your hiring context to speed up parsing.</p>
                </div>

                <hr className="settings-divider" />

                <div className="settings-form-group">
                  <label className="settings-label">Fallback Behavior</label>
                  <select className="settings-select" defaultValue="flag">
                    <option value="blank">Leave missing fields blank</option>
                    <option value="flag">Mark candidate as incomplete and flag for manual review</option>
                  </select>
                  <p className="toggle-desc">Determines what happens when a resume is missing a selected field (e.g., no education section found).</p>
                </div>

                <div className="settings-footer">
                  <button className="btn btn-primary">Save Parsing Settings</button>
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
                  <button className="btn" style={{ background: '#fff', color: '#b42318', border: '1px solid #fda29b', fontWeight: 600 }}>
                    Clear Data
                  </button>
                </div>

                <div className="danger-action-row">
                  <div className="danger-action-text">
                    <h4>Delete account</h4>
                    <p>Permanently deletes your recruiter profile and all associated data.</p>
                  </div>
                  <button className="btn" style={{ background: '#b42318', color: '#fff', border: 'none', fontWeight: 600 }}>
                    Delete Account
                  </button>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </PageSkeletonGate>
  );
}
