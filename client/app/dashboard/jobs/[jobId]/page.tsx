"use client";

import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Eye,
  FileSearch,
  PanelRightOpen,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { PageSkeletonGate } from "@/components/skeletons/PageSkeletonGate";
import { ApplicantsPageSkeleton } from "@/components/skeletons/PageSkeletons";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  buildCandidateCvUrl,
  formatRelativeDate,
  formatSessionStatus,
  getCandidateName,
  getJobId,
} from "@/lib/helpers";
import type { Candidate, Job, Session, SessionStatus } from "@/lib/types";
import "./applicants.css";

export default function JobApplicantsPage({
}: {
  params: Promise<{ jobId: string }>;
}) {
  const routeParams = useParams<{ jobId: string }>();
  const jobId = typeof routeParams?.jobId === "string" ? routeParams.jobId : "";
  const { token } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerFailures, setBannerFailures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState(0);
  const [screeningProgressLabel, setScreeningProgressLabel] = useState("");
  const [screeningTargetCount, setScreeningTargetCount] = useState(0);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [screeningState, setScreeningState] = useState<
    "idle" | "starting" | "running" | "success" | "failed"
  >("idle");
  const [screeningStatus, setScreeningStatus] = useState<SessionStatus | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const screeningProgressTimerRef = useRef<number | null>(
    null,
  );
  const screeningResetTimerRef = useRef<number | null>(
    null,
  );
  const isMountedRef = useRef(true);

  function clearScreeningProgressTimer() {
    if (screeningProgressTimerRef.current) {
      clearInterval(screeningProgressTimerRef.current);
      screeningProgressTimerRef.current = null;
    }
  }

  function clearScreeningResetTimer() {
    if (screeningResetTimerRef.current) {
      clearTimeout(screeningResetTimerRef.current);
      screeningResetTimerRef.current = null;
    }
  }

  useEffect(
    () => () => {
      isMountedRef.current = false;
      clearScreeningProgressTimer();
      clearScreeningResetTimer();
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!token || !jobId) {
      setIsPageLoading(true);
      return;
    }
    let isActive = true;
    setIsPageLoading(true);
    setError(null);

    Promise.all([
      api.getJob(jobId, token),
      api.getCandidates(token),
      api.getSessions(token),
    ])
      .then(([jobResult, candidatesResult, sessionsResult]) => {
        if (!isActive) return;
        setJob(jobResult);
        setAllCandidates(candidatesResult);
        setSessions(
          sessionsResult.filter(
            (session) => getJobId(session) === jobId,
          ),
        );
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load job workspace.",
        );
      })
      .finally(() => {
        if (!isActive) return;
        setIsPageLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [jobId, token]);

  async function refreshWorkspace() {
    if (!token || !jobId) return;
    setError(null);

    const [candidatesResult, sessionsResult] = await Promise.all([
      api.getCandidates(token),
      api.getSessions(token),
    ]);
    setAllCandidates(candidatesResult);
    setSessions(
      sessionsResult.filter((session) => getJobId(session) === jobId),
    );
  }

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allCandidates;

    return allCandidates.filter((candidate) =>
      [
        getCandidateName(candidate),
        candidate.email,
        candidate.location,
        candidate.headline,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [allCandidates, searchQuery]);

  const candidateIdSet = useMemo(
    () => new Set(allCandidates.map((candidate) => candidate._id)),
    [allCandidates],
  );

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => candidateIdSet.has(id)),
    );
  }, [candidateIdSet]);

  const selectedCount = selectedIds.length;
  const validSelectedIds = useMemo(
    () =>
      selectedIds.filter(
        (id): id is string =>
          typeof id === "string" &&
          id.trim().length > 0 &&
          candidateIdSet.has(id),
      ),
    [candidateIdSet, selectedIds],
  );
  const validSelectedCount = validSelectedIds.length;
  const hasApplicants = allCandidates.length > 0;
  const hasFilteredApplicants = filteredApplicants.length > 0;
  const allVisibleSelected =
    hasFilteredApplicants &&
    filteredApplicants.every((candidate) =>
      selectedIds.includes(candidate._id),
    );

  function toggleApplicantSelection(candidateId: string) {
    setSelectedIds((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = new Set(
        filteredApplicants.map((candidate) => candidate._id),
      );
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)));
      return;
    }

    const merged = new Set([
      ...selectedIds,
      ...filteredApplicants.map((candidate) => candidate._id),
    ]);
    setSelectedIds(Array.from(merged));
  }

  async function waitForScreeningCompletion(sessionId: string, authToken: string) {
    let attempts = 0;

    while (isMountedRef.current && attempts < 240) {
      const nextSession = await api.getSession(sessionId, authToken);
      if (!isMountedRef.current) return null;

      setScreeningStatus(nextSession.status);

      if (nextSession.status === "completed" || nextSession.status === "failed") {
        return nextSession;
      }

      await new Promise<void>((resolve) => {
        screeningResetTimerRef.current = window.setTimeout(() => resolve(), 2500);
      });
      clearScreeningResetTimer();
      attempts += 1;
    }

    return null;
  }

  async function handleScreenSelected() {
    if (validSelectedCount === 0 || !token) return;

    if (validSelectedIds.length === 0) {
      setBannerFailures([]);
      setBannerMessage(
        "No valid candidates are currently selected. Refresh the workspace and try again.",
      );
      return;
    }

    setIsRunning(true);
    setScreeningState("starting");
    setCompletedSessionId(null);
    setScreeningStatus("pending");
    setScreeningTargetCount(validSelectedIds.length);
    setScreeningProgress(8);
    setScreeningProgressLabel("Preparing candidates for screening");
    setError(null);
    setBannerMessage(null);
    setBannerFailures([]);
    clearScreeningProgressTimer();
    clearScreeningResetTimer();
    screeningProgressTimerRef.current = window.setInterval(() => {
      setScreeningProgress((current) => {
        if (current >= 94) {
          return current;
        }

        if (current < 24) {
          setScreeningProgressLabel("Creating screening session");
          return current + 8;
        }

        if (current < 52) {
          setScreeningProgressLabel("Submitting selected candidates");
          return current + 6;
        }

        setScreeningState("running");
        setScreeningProgressLabel("Screening candidates");
        return current + (current < 78 ? 3 : 1);
      });
    }, 700);

    try {
      const session = await api.createSession(
        {
          jobId,
          name: `Session ${new Date().toLocaleString()}`,
          candidateIds: validSelectedIds,
          modelUsed: "gemini-2.5-flash-lite",
        },
        token,
      );
      await api.runSession(session._id, token);
      setScreeningState("running");
      setScreeningStatus("processing");
      setScreeningProgressLabel("Screening candidates");
      const completedSession = await waitForScreeningCompletion(session._id, token);
      const nextSessions = await api.getSessions(token);
      setSessions(nextSessions.filter((item) => getJobId(item) === jobId));
      clearScreeningProgressTimer();

      if (completedSession?.status === "completed") {
        setScreeningProgress(100);
        setScreeningStatus("completed");
        setScreeningState("success");
        setCompletedSessionId(completedSession._id);
        setScreeningProgressLabel("Screening complete");
      } else if (completedSession?.status === "failed") {
        setScreeningProgress(100);
        setScreeningStatus("failed");
        setScreeningState("failed");
        setScreeningProgressLabel("Screening failed");
        setBannerMessage(completedSession.error ?? "Screening failed.");
      } else {
        setScreeningState("failed");
        setScreeningStatus(null);
        setScreeningProgressLabel("Screening status unavailable");
        setBannerMessage(
          "Screening is still running, but live completion tracking was unavailable.",
        );
      }
    } catch (err) {
      clearScreeningProgressTimer();
      setScreeningProgress(0);
      setScreeningProgressLabel("");
      setScreeningTargetCount(0);
      setScreeningStatus(null);
      setScreeningState("idle");
      setBannerMessage(
        err instanceof ApiError ? err.message : "Unable to start screening.",
      );
    } finally {
      clearScreeningProgressTimer();
      clearScreeningResetTimer();
      setIsRunning(false);
    }
  }

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setError(null);
    setBannerMessage(null);
    setBannerFailures([]);
    try {
      const result = await api.ingestCandidateCsv(file, token);
      await refreshWorkspace();
      if (result.succeeded.length > 0) {
        setSelectedIds((current) => {
          const merged = new Set([
            ...current,
            ...result.succeeded.map((candidate) => candidate._id),
          ]);
          return Array.from(merged);
        });
      }
      setBannerMessage(
        `Imported ${result.succeeded.length} candidate${result.succeeded.length === 1 ? "" : "s"} for ${job?.title ?? "this role"}. Newly imported candidates were selected automatically.`,
      );
      setBannerFailures(result.failed);
    } catch (err) {
      setBannerMessage(
        err instanceof ApiError
          ? err.message
          : "Unable to import CSV candidates for this job.",
      );
      setBannerFailures([]);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length || !token) return;

    setIsUploading(true);
    setError(null);
    setBannerMessage(null);
    setBannerFailures([]);
    try {
      const result = await api.ingestCandidatePdfs(files, token);
      await refreshWorkspace();
      if (result.succeeded.length > 0) {
        setSelectedIds((current) => {
          const merged = new Set([
            ...current,
            ...result.succeeded.map((candidate) => candidate._id),
          ]);
          return Array.from(merged);
        });
      }
      setBannerMessage(
        `Imported ${result.succeeded.length} resume${result.succeeded.length === 1 ? "" : "s"} for ${job?.title ?? "this role"}. Newly imported candidates were selected automatically.`,
      );
      setBannerFailures(result.failed);
    } catch (err) {
      setBannerMessage(
        err instanceof ApiError
          ? err.message
          : "Unable to import resumes for this job.",
      );
      setBannerFailures([]);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteCandidate(candidate: Candidate) {
    if (!token) return;

    const confirmed = window.confirm(
      `Delete ${getCandidateName(candidate)} from your workspace?`
    );
    if (!confirmed) return;

    setDeletingCandidateId(candidate._id);
    setError(null);
    setBannerMessage(null);
    setBannerFailures([]);

    try {
      await api.deleteCandidate(candidate._id, token);
      setAllCandidates((current) => current.filter((item) => item._id !== candidate._id));
      setSelectedIds((current) => current.filter((id) => id !== candidate._id));
      setBannerMessage(`${getCandidateName(candidate)} was deleted from your workspace.`);
    } catch (err) {
      setBannerMessage(
        err instanceof ApiError ? err.message : "Unable to delete this applicant.",
      );
    } finally {
      setDeletingCandidateId(null);
    }
  }

  return (
    <PageSkeletonGate
      skeleton={<ApplicantsPageSkeleton />}
      isLoading={isPageLoading || !token || !jobId}
    >
      <div className="page-container applicants-page">
        <DashboardTopBar breadcrumbs={["Jobs", "Applicants"]} />

        <section className="applicants-shell">
          <div className="applicants-header">
            <div>
              <p className="applicants-eyebrow">Applicants workspace</p>
              <h1 className="applicants-title">
                Candidate pipeline for {job?.title ?? "Job"}
              </h1>
              <p className="applicants-subtitle">
                Import candidates for this role, select who should be screened,
                and review previous runs for this job.
              </p>
            </div>

            <div className="applicants-summary">
              <article className="applicants-summary-card">
                <span className="applicants-summary-card__label">
                  Candidates
                </span>
                <strong className="applicants-summary-card__value">
                  {allCandidates.length}
                </strong>
              </article>
              <article className="applicants-summary-card">
                <span className="applicants-summary-card__label">Selected</span>
                <strong className="applicants-summary-card__value">
                  {selectedCount}
                </strong>
              </article>
            </div>
          </div>

          <div className="applicants-toolbar">
            <label className="applicants-search">
              <Search
                size={18}
                className="applicants-search__icon"
                aria-hidden
              />
              <input
                type="search"
                className="applicants-search__input"
                placeholder="Search by name, email, headline, or location"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="applicants-toolbar__controls">
              <button
                id="tour-upload-pdf-btn"
                className="applicants-action-btn applicants-action-btn--ghost"
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isUploading}
              >
                <UploadCloud size={16} />
                {isUploading ? "Uploading..." : "Upload PDFs"}
              </button>

              <button
                className="applicants-action-btn applicants-action-btn--ghost"
                type="button"
                onClick={() => csvInputRef.current?.click()}
                disabled={isUploading}
              >
                <UploadCloud size={16} />
                {isUploading ? "Uploading..." : "Import CSV"}
              </button>

              <button
                id="tour-scan-btn"
                className="applicants-action-btn applicants-action-btn--secondary"
                type="button"
                onClick={handleScreenSelected}
                disabled={validSelectedCount === 0 || isRunning}
              >
                <FileSearch size={16} />
                {isRunning ? "Starting..." : "Scan selected"}
              </button>

              <button
                id="tour-results-section"
                className="applicants-action-btn applicants-action-btn--primary"
                type="button"
                onClick={() => setIsSessionsOpen(true)}
              >
                <PanelRightOpen size={16} />
                Previous sessions
              </button>

              <Link
                href={`/dashboard/jobs/${jobId}/draft`}
                className="applicants-action-btn applicants-action-btn--ghost"
              >
                View job
              </Link>
            </div>
          </div>

          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            hidden
            onChange={handlePdfUpload}
          />
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={handleCsvUpload}
          />

          {bannerMessage ? (
            <div className="applicants-banner" role="status">
              <div>
                <div>{bannerMessage}</div>
                {bannerFailures.length > 0 ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    {bannerFailures.map((failure, index) => (
                      <div key={`${failure}-${index}`}>{failure}</div>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="applicants-banner__close"
                onClick={() => setBannerMessage(null)}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}

          {error ? <div className="applicants-empty">{error}</div> : null}

          {!error ? (
          <div className="applicants-table-shell">
            {screeningState !== "idle" ? (
              <div className="applicants-progress" role="status" aria-live="polite">
                <div className="applicants-progress__header">
                  <div>
                    <p className="applicants-progress__eyebrow">
                      {screeningState === "success"
                        ? "Screening complete"
                        : screeningState === "failed"
                          ? "Screening update"
                          : "Screening in progress"}
                    </p>
                    <strong className="applicants-progress__title">
                      {screeningProgressLabel ||
                        "Starting candidate screening"}
                    </strong>
                  </div>
                  <span className="applicants-progress__value">
                    {Math.round(screeningProgress)}%
                  </span>
                </div>
                <div
                  className="applicants-progress__track"
                  aria-hidden="true"
                >
                  <div
                    className="applicants-progress__fill"
                    style={{ width: `${Math.max(screeningProgress, 6)}%` }}
                  />
                </div>
                <p className="applicants-progress__meta">
                  {screeningState === "success" && completedSessionId ? (
                    <>
                      Results are ready for {screeningTargetCount} candidate
                      {screeningTargetCount === 1 ? "" : "s"}.
                    </>
                  ) : screeningState === "failed" ? (
                    <>
                      {screeningStatus === "failed"
                        ? "The screening run ended with an error."
                        : "We could not confirm the final screening state yet."}
                    </>
                  ) : (
                    <>
                      Screening {screeningTargetCount} selected candidate
                      {screeningTargetCount === 1 ? "" : "s"} for this role.
                      {screeningStatus
                        ? ` Status: ${formatSessionStatus(screeningStatus)}.`
                        : ""}
                    </>
                  )}
                </p>
                {screeningState === "success" && completedSessionId ? (
                  <div className="applicants-progress__actions">
                    <span className="applicants-progress__success">
                      Screening finished successfully.
                    </span>
                    <Link
                      href={`/dashboard/jobs/${jobId}/session/${completedSessionId}`}
                      className="applicants-action-btn applicants-action-btn--ghost"
                    >
                      View results
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="applicants-table-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span>
                  Showing {filteredApplicants.length} of {allCandidates.length}{" "}
                  candidate{allCandidates.length === 1 ? "" : "s"}
                </span>
                <span style={{ marginLeft: '1rem' }}>{selectedCount} selected</span>
              </div>
              
              {hasApplicants && sessions.length === 0 ? (
                <div style={{ backgroundColor: '#f9f5ff', color: '#6941c6', padding: '0.5rem 1rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Step 2: Check the boxes below and click "Scan selected" above
                </div>
              ) : null}
            </div>

            <div className="table-container applicants-table-container">
              <table className="applicants-table">
                <thead>
                  <tr>
                    <th className="applicants-table__checkbox-col">
                      <input
                        id="tour-select-all-candidates"
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        aria-label="Select all visible candidates"
                      />
                    </th>
                    <th>Name</th>
                    <th>Email address</th>
                    <th>Headline</th>
                    <th>Location</th>
                    <th className="applicants-table__action-col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplicants.map((candidate) => {
                    const isSelected = selectedIds.includes(candidate._id);
                    return (
                      <tr
                        key={candidate._id}
                        className={isSelected ? "is-selected" : ""}
                      >
                        <td className="applicants-table__checkbox-col">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleApplicantSelection(candidate._id)
                            }
                            aria-label={`Select ${getCandidateName(candidate)}`}
                          />
                        </td>
                        <td className="applicant-name-cell">
                          <span className="applicant-name">
                            {getCandidateName(candidate)}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`mailto:${candidate.email}`}
                            className="applicant-link"
                          >
                            {candidate.email}
                          </a>
                        </td>
                        <td>{candidate.headline}</td>
                        <td>{candidate.location}</td>
                        <td className="applicants-table__action-col">
                          <a
                            href={buildCandidateCvUrl(candidate, token)}
                            target="_blank"
                            rel="noreferrer"
                            className="cv-view-btn"
                          >
                            <Eye size={16} />
                            View
                          </a>
                          <button
                            type="button"
                            className="cv-delete-btn"
                            onClick={() => handleDeleteCandidate(candidate)}
                            disabled={deletingCandidateId === candidate._id}
                          >
                            <Trash2 size={16} />
                            {deletingCandidateId === candidate._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!hasApplicants ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="applicants-empty" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <h3 style={{ fontSize: '1.25rem', color: '#101828', margin: 0 }}>Step 1: Add Candidates</h3>
                          <p style={{ color: '#475467', maxWidth: '400px', textAlign: 'center', margin: 0 }}>
                            Use the <strong>Upload PDFs</strong> or <strong>Import CSV</strong> buttons above to add candidate resumes to this workspace.
                          </p>
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            style={{ marginTop: '1rem' }}
                          >
                            Upload PDFs now
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  {hasApplicants && !hasFilteredApplicants ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="applicants-empty">
                          No candidates match your current search.
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
          ) : null}
        </section>

        <div
          className={`sessions-drawer-backdrop ${isSessionsOpen ? "is-open" : ""}`}
          onClick={() => setIsSessionsOpen(false)}
          aria-hidden={!isSessionsOpen}
        />

        <aside
          className={`sessions-drawer ${isSessionsOpen ? "is-open" : ""}`}
          aria-hidden={!isSessionsOpen}
        >
          <div className="sessions-drawer__header">
            <div>
              <p className="sessions-drawer__eyebrow">History</p>
              <h2 className="sessions-drawer__title">Previous sessions</h2>
            </div>
            <button
              type="button"
              className="sessions-drawer__close"
              onClick={() => setIsSessionsOpen(false)}
              aria-label="Close previous sessions"
            >
              <X size={18} />
            </button>
          </div>

          <div className="sessions-list">
            {!error && sessions.length === 0 ? (
              <div className="sessions-empty">
                No screening sessions have been run for this role yet.
              </div>
            ) : !error ? (
              sessions.map((session) => (
                <article className="session-card" key={session._id}>
                  <div className="session-card__top">
                    <div>
                      <p className="session-card__label">{session.name}</p>
                      <h3 className="session-card__date">
                        {formatRelativeDate(session.createdAt)}
                      </h3>
                    </div>
                    <span
                      className={
                        session.status === "pending"
                          ? "status-badge-draft"
                          : "status-badge-active"
                      }
                    >
                      {formatSessionStatus(session.status)}
                    </span>
                  </div>

                  <div className="session-card__metrics">
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">
                        Candidates
                      </span>
                      <strong>{session.candidateIds.length}</strong>
                    </div>
                    <div className="session-card__metric">
                      <span className="session-card__metric-label">
                        Top score
                      </span>
                      <strong>
                        {session.rankedResults[0]?.finalScore ?? 0}%
                      </strong>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/jobs/${jobId}/session/${session._id}`}
                    className={`session-link ${session.status === "pending" ? "is-pending" : ""}`}
                    onClick={() => setIsSessionsOpen(false)}
                  >
                    View results
                  </Link>
                </article>
              ))
            ) : null}
          </div>
        </aside>
      </div>
    </PageSkeletonGate>
  );
}
