"use client";

import React, { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step, EVENTS, ACTIONS } from "react-joyride";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function TourGuide() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // 1. Group steps by route
  const activeSteps = React.useMemo(() => {
    const dashboardSteps: Step[] = [
      {
        target: "body",
        placement: "center",
        content: (
          <div>
            <h3 style={{ marginBottom: "10px", fontWeight: 700 }}>Welcome to ARIA!</h3>
            <p style={{ color: "#475467" }}>Click Accept to start a quick tour, or Reject to skip.</p>
          </div>
        ),
        disableBeacon: true,
        hideCloseButton: true,
      },
      {
        target: "#tour-create-job-btn",
        content: "First, you'll need to create a new job position.",
        disableBeacon: true,
      }
    ];

    const createJobSteps: Step[] = [
      {
        target: "#tour-save-job-btn",
        content: "Fill in the job details here and click to save the job.",
        disableBeacon: true,
      }
    ];

    const jobDetailsSteps: Step[] = [
      {
        target: "#tour-upload-pdf-btn",
        content: "First, click here to upload candidate resumes (PDFs).",
        disableBeacon: true,
      },
      {
        target: "#tour-select-all-candidates",
        content: "Once uploaded, check this box to select the candidates you want to screen.",
        disableBeacon: true,
      },
      {
        target: "#tour-scan-btn",
        content: "Click 'Scan selected' to start the AI screening session.",
        disableBeacon: true,
      },
      {
        target: "#tour-results-section",
        content: "After screening finishes, click 'Previous sessions' to view detailed match scores and an overview of the results!",
        disableBeacon: true,
      }
    ];

    if (pathname === "/dashboard") return dashboardSteps;
    if (pathname === "/dashboard/jobs/new") return createJobSteps;
    if (pathname.includes("/dashboard/jobs/") && pathname !== "/dashboard/jobs/new") return jobDetailsSteps;
    return [];
  }, [pathname]);

  useEffect(() => {
    setIsMounted(true);
    if (!user) return;

    const handleStartTour = () => {
      setRun(true);
      setStepIndex(0);
      localStorage.setItem(`aria_tour_running_${user.email}`, "true");
      // Reset local index when starting
      localStorage.setItem(`aria_tour_step_${user.email}`, "0");
    };

    window.addEventListener("start-aria-tour", handleStartTour);
    return () => window.removeEventListener("start-aria-tour", handleStartTour);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const isRunning = localStorage.getItem(`aria_tour_running_${user.email}`) === "true";
    if (isRunning) {
      // Pause Joyride first so that setRun(true) later actually triggers an update!
      setRun(false);
      // Whenever pathname changes, reset stepIndex to 0 for the new page's steps
      setStepIndex(0);
      
      // Wait for the first target of the current page to be present in the DOM
      if (activeSteps.length > 0) {
        const checkTarget = () => {
           const el = document.querySelector(activeSteps[0].target as string);
           if (el) {
             setRun(true);
             return true;
           }
           return false;
        };
        
        if (!checkTarget()) {
          const interval = setInterval(() => {
            if (checkTarget()) clearInterval(interval);
          }, 300);
          return () => clearInterval(interval);
        }
      }
    }
  }, [pathname, user]); // Removed activeSteps to prevent any accidental loops

  const handleCallback = (data: CallBackProps) => {
    const { status, type, action, index } = data;
    if (!user) return;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (pathname.includes("/dashboard/jobs/") && pathname !== "/dashboard/jobs/new") {
        // If we finished on the last page, completely end the tour
        setRun(false);
        localStorage.setItem(`aria_onboarded_${user.email}`, "true");
        localStorage.removeItem(`aria_tour_running_${user.email}`);
      } else if (status === STATUS.SKIPPED) {
        // If they explicitly skipped, end the tour early
        setRun(false);
        localStorage.setItem(`aria_onboarded_${user.email}`, "true");
        localStorage.removeItem(`aria_tour_running_${user.email}`);
      }
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      if (action === ACTIONS.NEXT) {
        // If there are more steps on the CURRENT page, advance
        if (index < activeSteps.length - 1) {
          setStepIndex(index + 1);
        } else {
          // End of steps for this page. Let the user navigate naturally.
          // Keep Joyride dormant on this page by not incrementing index,
          // or just wait for them to navigate which resets index to 0 for the new page.
        }
      } else if (action === ACTIONS.PREV) {
        if (index > 0) {
          setStepIndex(index - 1);
        }
      }
    }
  };

  if (!isMounted || activeSteps.length === 0) return null;

  return (
    <Joyride
      key={pathname} // Force remount on route change to clear bad DOM refs
      steps={activeSteps}
      run={run}
      stepIndex={stepIndex}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "#7268ef",
          zIndex: 10000,
        },
      }}
      locale={{
        last: pathname === "/dashboard" || pathname === "/dashboard/jobs/new" ? "Got it" : "Finish",
        skip: pathname === "/dashboard" && stepIndex === 0 ? "Reject" : "Skip",
        next: pathname === "/dashboard" && stepIndex === 0 ? "Accept" : "Next",
      }}
    />
  );
}
