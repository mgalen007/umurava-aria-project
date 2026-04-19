import React from 'react';
import { mockCurrentUser } from '@/lib/mock-data';

export default function SettingsPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="text-h1">Account settings</h1>
      </header>

      <div className="surface" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h2 className="text-h2" style={{ marginBottom: '1rem' }}>
          Profile
        </h2>
        <p className="text-body-sm" style={{ marginBottom: '0.5rem' }}>
          <strong>Name:</strong> {mockCurrentUser.name}
        </p>
        <p className="text-body-sm">
          <strong>Email:</strong> {mockCurrentUser.email}
        </p>
      </div>
    </div>
  );
}
