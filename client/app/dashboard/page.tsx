"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { CheckCircle2, Circle } from "lucide-react";
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
        // We removed the automatic tour trigger based on user request.
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
          <div className="screenings-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '4rem 2rem', backgroundColor: '#f9f9fb', borderRadius: '12px', border: '1px dashed #d0d5dd', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#101828' }}>Welcome to ARIA!</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: '#475467', textAlign: 'center' }}>
              Your AI-powered candidate screening workspace is ready. Step 1 is to create your first job position.
            </p>
            <Link 
              href="/dashboard/jobs/new"
              className="btn btn-primary" 
              style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem' }}
            >
              Create your first job
            </Link>
          </div>
        ) : null}

        {!error && !isPageLoading && jobs.length > 0 && sessions.length === 0 ? (
          <div className="getting-started-panel" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #eaecf0', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#101828', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Getting Started Checklist
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#027a48' }}>
                <CheckCircle2 size={20} />
                <span style={{ textDecoration: 'line-through', opacity: 0.8 }}>Create your first job position</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#101828', fontWeight: 500 }}>
                <Circle size={20} color="#7268ef" />
                <span>Upload candidates to your job workspace</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#667085' }}>
                <Circle size={20} />
                <span>Run an AI screening session</span>
              </li>
            </ul>
          </div>
        ) : null}
        {!error ? <DashboardOverviewSection rows={overviewRows} /> : null}
        {!error ? (
          <DashboardCharts
            volumeSeries={volumeSeries}
            shortlistByRole={shortlistByRole}
          />
        ) : null}
      </div>
    </PageSkeletonGate>
  );
}
