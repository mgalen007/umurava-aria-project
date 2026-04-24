"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { PageSkeletonGate } from "@/components/skeletons/PageSkeletonGate";
import { JobsPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatExperienceLevel, formatJobStatus } from "@/lib/helpers";
import type { Job } from "@/lib/types";
import "./jobs.css";

export default function JobsPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"status" | "date">("status");
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

    api
      .getJobs(token)
      .then((result) => {
        if (!isActive) return;
        setJobs(result);
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "We couldn't load your jobs right now. Please check your connection and try again.",
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

  const sortedJobs = useMemo(() => {
    const next = [...jobs];
    if (sortBy === "status") {
      const order = { active: 0, draft: 1, closed: 2 };
      next.sort((a, b) => order[a.status] - order[b.status]);
      return next;
    }

    next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return next;
  }, [jobs, sortBy]);

  return (
    <PageSkeletonGate
      skeleton={<JobsPageSkeleton />}
      isLoading={isAuthLoading || isPageLoading}
    >
      <div className="page-container">
        <DashboardTopBar breadcrumbs={["Jobs"]} />

        <section className="jobs-page-shell">
          <div className="jobs-toolbar">
            <h1 className="jobs-heading">Openings</h1>

            <div className="jobs-toolbar__controls">
              <div className="jobs-sort-group">
                <button
                  className="jobs-sort-btn jobs-sort-btn--primary"
                  type="button"
                  onClick={() => setSortBy("status")}
                >
                  Sort by Status <ArrowDown size={14} />
                </button>
                <button
                  className="jobs-sort-btn"
                  type="button"
                  onClick={() => setSortBy("date")}
                >
                  Sort by Date <ArrowDown size={14} />
                </button>
              </div>

              <Link href="/dashboard/jobs/new" className="jobs-create-btn">
                Create new job
              </Link>
            </div>
          </div>

          {error ? <p>{error}</p> : null}

          <div className="jobs-grid">
            {!error && !isPageLoading && sortedJobs.length === 0 ? (
              <div className="jobs-empty-state">
                No jobs yet. Create your first job to begin the screening
                process.
              </div>
            ) : null}
            {!error
              ? sortedJobs.map((job) => (
                  <article className="job-card" key={job._id}>
                    <div className="job-card-header">
                      <h2 className="job-title">{job.title}</h2>
                      <span
                        className={
                          job.status === "draft"
                            ? "status-badge-draft"
                            : "status-badge-active"
                        }
                      >
                        {formatJobStatus(job.status)}
                      </span>
                    </div>

                    <p className="job-meta">
                      {job.requiredSkills.length} skills •{" "}
                      {formatExperienceLevel(job.experienceLevel)} •{" "}
                      {job.remote ? "Remote" : "On-site"} • {job.location}
                    </p>

                    <div className="job-card-footnote">
                      <span className="badge-outline">
                        {job.niceToHaveSkills.length} nice-to-have
                      </span>
                      <span className="screened-time">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="job-card-divider" />

                    <div className="job-footer">
                      <Link
                        href={`/dashboard/jobs/${job._id}`}
                        className="link-btn"
                      >
                        View job <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))
              : null}
          </div>
        </section>
      </div>
    </PageSkeletonGate>
  );
}
