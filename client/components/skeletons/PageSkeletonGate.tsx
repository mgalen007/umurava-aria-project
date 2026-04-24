"use client";

import React, { useEffect, useState } from "react";

type PageSkeletonGateProps = {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delayMs?: number;
  isLoading?: boolean;
};

export function PageSkeletonGate({
  children,
  skeleton,
  delayMs = 650,
  isLoading: controlledIsLoading,
}: PageSkeletonGateProps) {
  const [isLoading, setIsLoading] = useState(
    controlledIsLoading ?? true,
  );

  useEffect(() => {
    if (controlledIsLoading != null) {
      setIsLoading(controlledIsLoading);
      return;
    }

    const timeoutId = window.setTimeout(() => setIsLoading(false), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [controlledIsLoading, delayMs]);

  useEffect(() => {
    document.body.dataset.pageLoading = isLoading ? "true" : "false";
    return () => {
      delete document.body.dataset.pageLoading;
    };
  }, [isLoading]);

  return isLoading ? <>{skeleton}</> : <>{children}</>;
}
