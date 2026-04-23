'use client';

import React from 'react';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import { PageSkeletonGate } from '@/components/skeletons/PageSkeletonGate';
import { SettingsPageSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

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

        <div className="surface" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 className="text-h2" style={{ marginBottom: '1rem' }}>
            Profile
          </h2>
          {user ? (
            <>
              <p className="text-body-sm" style={{ marginBottom: '0.5rem' }}>
                <strong>Name:</strong> {user.name}
              </p>
              <p className="text-body-sm">
                <strong>Email:</strong> {user.email}
              </p>
            </>
          ) : (
            <p className="text-body-sm">Your account details are not available right now.</p>
          )}
        </div>
      </div>
    </PageSkeletonGate>
  );
}
