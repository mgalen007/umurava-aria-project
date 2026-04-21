'use client';

import React, { useEffect, useState } from 'react';

type PageSkeletonGateProps = {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delayMs?: number;
};

export function PageSkeletonGate({
  children,
  skeleton,
  delayMs = 650,
}: PageSkeletonGateProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs]);

  useEffect(() => {
    document.body.dataset.pageLoading = isLoading ? 'true' : 'false';
    return () => {
      delete document.body.dataset.pageLoading;
    };
  }, [isLoading]);

  return isLoading ? <>{skeleton}</> : <>{children}</>;
}
