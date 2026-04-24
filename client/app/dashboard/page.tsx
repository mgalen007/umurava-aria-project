"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DashboardCharts,
  type ApplicationVolumePoint,
  type ApplicationVolumeRange,
  type ShortlistRolePoint,
} from "@/components/dashboard/DashboardCharts";
import {
  DashboardOverviewSection,
  type DashboardJobRow,
} from "@/components/dashboard/DashboardOverviewSection";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { PageSkeletonGate } from "@/components/skeletons/PageSkeletonGate";
import { DashboardPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  formatJobStatus,
  getCandidateName,
  getJobId,
  getJobTitle,
} from "@/lib/helpers";
import type { Job, Session } from "@/lib/types";
import "./dashboard-page.css";

function buildOverviewRows(
  jobs: Job[],
  sessions: Session[],
): DashboardJobRow[] {
  return jobs.map((job) => {
    const jobSessions = sessions
      .filter((session) => getJobId(session) === job._id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const latestSession = jobSessions[0];
    const latestCompletedSession = jobSessions.find(
      (session) => session.status === "completed",
    );
    const scores =
      latestCompletedSession?.rankedResults.map(
        (result) => result.finalScore,
      ) ?? [];
    const avgScore = scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : null;
    const topCandidate = latestCompletedSession?.rankedResults.find(
      (result) => result.rank === 1,
    );

    let highMatchedCandidate: string | null = null;
    if (topCandidate) {
      const candidate = latestCompletedSession?.candidateIds.find((item) => {
        if (typeof item === "string") return item === topCandidate.candidateId;
        return (item._id ?? "") === topCandidate.candidateId;
      });

      if (candidate && typeof candidate !== "string") {
        highMatchedCandidate = getCandidateName(candidate);
      }
    }

    return {
      id: job._id,
      role: job.title,
      dept: job.department ?? "General",
      status: formatJobStatus(job.status) as DashboardJobRow["status"],
      matchScoreAvg: avgScore,
      highMatchedCandidate,
      candidatesCount: latestSession?.candidateIds.length ?? 0,
      lastScreened: latestSession
        ? new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(latestSession.createdAt))
        : "Never",
    };
  });
}

function buildVolumeSeries(
  sessions: Session[],
): Record<ApplicationVolumeRange, ApplicationVolumePoint[]> {
  const now = new Date();

  const buildSeries = (days: number) => {
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    const buckets = new Map<string, number>();

    sessions
      .filter((session) => new Date(session.createdAt) >= start)
      .forEach((session) => {
        const label = new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
        }).format(new Date(session.createdAt));
        buckets.set(
          label,
          (buckets.get(label) ?? 0) + session.candidateIds.length,
        );
      });

    return Array.from(buckets.entries()).map(([label, candidates]) => ({
      label,
      candidates,
    }));
  };

  return {
    "7d": buildSeries(7),
    "30d": buildSeries(30),
    "90d": buildSeries(90),
  };
}

function buildShortlistByRole(
  jobs: Job[],
  sessions: Session[],
): ShortlistRolePoint[] {
  return jobs
    .map((job) => {
      const shortlisted = sessions
        .filter((session) => getJobId(session) === job._id)
        .reduce(
          (total, session) =>
            total +
            (session.batchSummary?.recommended_for_interview?.length ?? 0),
          0,
        );

      return {
        abbrev: job.title.slice(0, 2).toUpperCase(),
        roleTitle: job.title,
        shortlisted,
      };
    })
    .filter((item) => item.shortlisted > 0);
}

export default function DashboardPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      setIsPageLoading(false);
      return;
    }

    let isActive = true;
    setIsPageLoading(true);
    setError(null);

    Promise.all([api.getJobs(token), api.getSessions(token)])
      .then(([jobsResult, sessionsResult]) => {
        if (!isActive) return;
        setJobs(jobsResult);
        setSessions(sessionsResult);
        setError(null);
        // Check if first time
        if (
          jobsResult.length === 0 &&
          sessionsResult.length === 0 &&
          !localStorage.getItem("aria_onboarded")
        ) {
          setShowOnboarding(true);
        }
      })
      .catch((err) => {
        if (!isActive) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "We couldn't load your dashboard right now. Please check your connection and try refreshing the page.",
        );
      })
      .finally(() => {
        if (!isActive) return;
        setIsPageLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, token]);

  const overviewRows = useMemo(
    () => buildOverviewRows(jobs, sessions),
    [jobs, sessions],
  );
  const volumeSeries = useMemo(() => buildVolumeSeries(sessions), [sessions]);
  const shortlistByRole = useMemo(
    () => buildShortlistByRole(jobs, sessions),
    [jobs, sessions],
  );

  return (
    <PageSkeletonGate
      skeleton={<DashboardPageSkeleton />}
      isLoading={isAuthLoading || isPageLoading}
    >
      <div className="page-container">
        <DashboardTopBar
          breadcrumbs={["Dashboard"]}
          showSearch
          showCreateJobButton
        />
        {error ? <p role="alert">{error}</p> : null}
        {!error && !isPageLoading && jobs.length === 0 && sessions.length === 0 ? (
          <div className="screenings-empty">
            Welcome to ARIA! Your workspace is ready. Start by creating your
            first job to begin screening candidates with AI-powered insights.
          </div>
        ) : null}
        {!error ? <DashboardOverviewSection rows={overviewRows} /> : null}
        {!error ? (
          <DashboardCharts
            volumeSeries={volumeSeries}
            shortlistByRole={shortlistByRole}
          />
        ) : null}
        {showOnboarding && (
          <div
            className="onboarding-modal-overlay"
            onClick={() => setShowOnboarding(false)}
          >
            <div
              className="onboarding-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Welcome to ARIA!</h2>
              <p>Get started with these quick steps:</p>
              <ol>
                <li>Create your first job posting</li>
                <li>Upload candidate resumes</li>
                <li>Run an AI-powered screening session</li>
                <li>Review top matches and insights</li>
              </ol>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowOnboarding(false);
                  localStorage.setItem("aria_onboarded", "true");
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </PageSkeletonGate>
  );
}
