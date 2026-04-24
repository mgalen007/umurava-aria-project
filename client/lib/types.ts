export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "recruiter";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type JobStatus = "draft" | "active" | "closed";

export type Job = {
  _id: string;
  title: string;
  department?: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: "junior" | "mid" | "senior" | "lead" | "principal";
  minYearsExperience: number;
  maxYearsExperience?: number;
  location: string;
  remote: boolean;
  hardRequirements: string[];
  status: JobStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateSkill = {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
};

export type CandidateLanguage = {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
};

export type CandidateExperience = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
};

export type CandidateEducation = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
};

export type CandidateCertification = {
  name: string;
  issuer: string;
  issueDate: string;
};

export type CandidateProject = {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate?: string;
};

export type CandidateAvailability = {
  status: "Available" | "Open to Opportunities" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate?: string;
};

export type Candidate = {
  _id: string;
  source: "pdf_resume" | "csv_upload" | "manual_entry" | "umurava_json";
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications: CandidateCertification[];
  projects: CandidateProject[];
  availability: CandidateAvailability;
  socialLinks?: Record<string, string | undefined>;
  extractionConfidence: number;
  extractionWarnings?: string[];
  globalStatus: "available" | "interviewing" | "hired" | "rejected";
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionCandidate = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  location: string;
  bio?: string;
  skills?: CandidateSkill[];
};

export type SessionJobRef = {
  _id?: string;
  title: string;
  experienceLevel?: string;
  location?: string;
  remote?: boolean;
  status?: JobStatus;
} | null;

export type RankedCitation = {
  dimension: string;
  evidence: string;
  source_section: string;
  impact: string;
};

export type RankedResult = {
  rank: number;
  candidateId: string;
  aiScore: number;
  finalScore: number;
  verdict:
    | "STRONG_MATCH"
    | "GOOD_MATCH"
    | "BORDERLINE"
    | "WEAK_MATCH"
    | "DISQUALIFIED";
  strengths: string[];
  gaps: string[];
  citations: RankedCitation[];
  recruiterNote: string;
  hardDisqualificationReason: string | null;
  feedbackStatus: "pending" | "approved" | "overridden" | "disqualified";
};

export type BatchSummary = {
  recommended_for_interview?: string[];
  hold_pool?: string[];
  not_advancing?: string[];
  top_differentiator?: string;
  talent_pool_quality?: "HIGH" | "MEDIUM" | "LOW";
};

export type SessionStatus = "pending" | "processing" | "completed" | "failed";

export type Session = {
  _id: string;
  jobId: string | SessionJobRef;
  name: string;
  status: SessionStatus;
  candidateIds: Array<
    | string
    | SessionCandidate
  >;
  rankedResults: RankedResult[];
  batchSummary?: BatchSummary;
  modelUsed: "gemini-2.5-flash-lite" | "gemini-1.5-pro";
  promptVersion: string;
  processingTimeMs?: number;
  error?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackAction = "approved" | "overridden" | "disqualified";
