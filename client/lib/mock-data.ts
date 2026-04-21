/**
 * In-memory mock data for the client UI (acts as a stand-in database).
 */

export type JobListStatus = 'Active' | 'Drafted' | 'Archived';

export interface DashboardJobRow {
  id: string;
  role: string;
  dept: string;
  status: JobListStatus;
  matchScoreAvg: number | null;
  highMatchedCandidate: string | null;
  candidatesCount: number;
  lastScreened: string;
}

export interface JobOpening {
  id: string;
  titleLine1: string;
  titleLine2: string;
  status: 'Active' | 'Draft';
  skillsSummary: string;
  level: string;
  workType: string;
  location: string;
  candidatesCount: number;
  lastScreened: string;
}

export interface JobApplicant {
  id: string;
  applicantId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  cvFile: string;
  headline: string;
  matchScore: number;
  yearsExperience: number;
  appliedAt: string;
  stage: 'New' | 'Reviewing' | 'Shortlisted' | 'Interviewing';
  source: 'LinkedIn' | 'Referral' | 'Careers page' | 'Recruiter';
  summary: string;
  skills: string[];
}

export interface JobSessionSummary {
  id: string;
  date: string;
  status: 'Pending' | 'Completed';
  candidates: number;
  score: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export interface JobDetail {
  id: string;
  title: string;
  applicants: JobApplicant[];
  sessions: JobSessionSummary[];
}

export interface ScreeningMetric {
  label: string;
  value: string;
}

export interface ScreeningTableRow {
  sessionId: string;
  jobId: string;
  sessionLabel: string;
  jobTitle: string;
  dateRun: string;
  candidates: number;
  topScore: number;
  topScoreClass: 'green' | 'blue' | 'orange';
  overrides: number;
  status: 'Completed' | 'Running' | 'Pending';
}

export interface ScreeningSelectOption {
  label: string;
  value: string;
}

export interface ScreeningPageFilters {
  searchPlaceholder: string;
  jobOptions: ScreeningSelectOption[];
  statusOptions: ScreeningSelectOption[];
}

export interface SessionTopCandidate {
  id: string;
  name: string;
  scorePercent: number;
}

export interface CandidateDirectoryEntry {
  id: string;
  applicantId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  headline: string;
  matchScore: number;
  yearsExperience: number;
  stage: JobApplicant['stage'];
  source: JobApplicant['source'];
  summary: string;
  skills: string[];
  cvFile: string;
  applications: Array<{
    jobId: string;
    jobTitle: string;
    appliedAt: string;
  }>;
}

export interface SessionResults {
  jobId: string;
  sessionId: string;
  sessionLabel: string;
  jobTitle: string;
  pageTitle: string;
  summaryLine: string;
  topCandidates: SessionTopCandidate[];
  featured: {
    name: string;
    title: string;
    location: string;
    scorePercent: number;
    skillBadges: string[];
    cvLabel: string;
    analysis: {
      strengths: string[];
      gaps: string[];
    };
  };
}

export interface MockCandidate {
  id: string;
  name: string;
  email: string;
  headline: string;
  location: string;
  matchScore: number;
  summary: string;
  skills: string[];
}

export interface MockDraftJob {
  jobId: string;
  titleLine1: string;
  titleLine2: string;
  skills: string[];
  experience: string;
  seniority: string;
  location: string;
  employmentType: string;
  disqualifiers: string[];
  description: string;
}

export const mockCurrentUser = {
  name: 'Admin',
  email: 'admin@gmail.com',
};

export const mockDashboardJobRows: DashboardJobRow[] = [
  {
    id: 'js-senior',
    role: 'Senior Node.js developer',
    dept: 'Engineering',
    status: 'Active',
    matchScoreAvg: 81,
    highMatchedCandidate: 'Alice Johnson',
    candidatesCount: 25,
    lastScreened: '2 min ago',
  },
  {
    id: 'designer-1',
    role: 'Product Designer',
    dept: 'Product',
    status: 'Drafted',
    matchScoreAvg: null,
    highMatchedCandidate: null,
    candidatesCount: 8,
    lastScreened: 'now',
  },
  {
    id: 'eng-2',
    role: 'Engineer developer',
    dept: 'Engineering',
    status: 'Archived',
    matchScoreAvg: 74,
    highMatchedCandidate: 'Mark Robert',
    candidatesCount: 13,
    lastScreened: '1 hr ago',
  },
  {
    id: 'analyst-1',
    role: 'Junior Data Analyst',
    dept: 'Data',
    status: 'Active',
    matchScoreAvg: 68,
    highMatchedCandidate: 'John David',
    candidatesCount: 42,
    lastScreened: '30 min ago',
  },
  {
    id: 'dev-product',
    role: 'Product Developer',
    dept: 'Product',
    status: 'Archived',
    matchScoreAvg: 71,
    highMatchedCandidate: 'Peter Griffin',
    candidatesCount: 19,
    lastScreened: '3 days ago',
  },
];

/** Dashboard: application volume (candidates screened per day) */
export type ApplicationVolumeRange = '7d' | '30d' | '90d';

export interface ApplicationVolumePoint {
  /** Short label for axis, e.g. "Apr 18" */
  label: string;
  candidates: number;
}

export const mockApplicationVolumeSeries: Record<ApplicationVolumeRange, ApplicationVolumePoint[]> = {
  '7d': [
    { label: 'Apr 14', candidates: 14 },
    { label: 'Apr 15', candidates: 18 },
    { label: 'Apr 16', candidates: 12 },
    { label: 'Apr 17', candidates: 20 },
    { label: 'Apr 18', candidates: 23 },
    { label: 'Apr 19', candidates: 19 },
    { label: 'Apr 20', candidates: 26 },
    { label: 'Apr 22', candidates: 21 },
  ],
  '30d': [
    { label: 'Mar 26', candidates: 8 },
    { label: 'Mar 30', candidates: 14 },
    { label: 'Apr 3', candidates: 11 },
    { label: 'Apr 7', candidates: 19 },
    { label: 'Apr 11', candidates: 16 },
    { label: 'Apr 15', candidates: 22 },
    { label: 'Apr 19', candidates: 24 },
    { label: 'Apr 22', candidates: 21 },
  ],
  '90d': [
    { label: 'Jan 26', candidates: 5 },
    { label: 'Feb 9', candidates: 9 },
    { label: 'Feb 23', candidates: 12 },
    { label: 'Mar 9', candidates: 10 },
    { label: 'Mar 23', candidates: 15 },
    { label: 'Apr 6', candidates: 18 },
    { label: 'Apr 22', candidates: 21 },
  ],
};

/** Dashboard: shortlist volume by role (abbrev + full title for tooltips) */
export interface ShortlistRolePoint {
  abbrev: string;
  roleTitle: string;
  shortlisted: number;
}

export const mockShortlistByRole: ShortlistRolePoint[] = [
  { abbrev: 'PM', roleTitle: 'Product Manager', shortlisted: 39 },
  { abbrev: 'MS', roleTitle: 'Marketing Specialist', shortlisted: 14 },
  { abbrev: 'DA', roleTitle: 'Data Analyst', shortlisted: 13 },
  { abbrev: 'SE', roleTitle: 'Software Engineer', shortlisted: 8 },
  { abbrev: 'UX', roleTitle: 'UX Designer', shortlisted: 22 },
  { abbrev: 'HR', roleTitle: 'HR Partner', shortlisted: 11 },
  { abbrev: 'FN', roleTitle: 'Finance Analyst', shortlisted: 17 },
  { abbrev: 'OP', roleTitle: 'Operations Lead', shortlisted: 28 },
];

export const mockJobOpenings: JobOpening[] = [
  {
    id: 'js-senior',
    titleLine1: 'Javascript',
    titleLine2: 'Senior developer',
    status: 'Active',
    skillsSummary: '3 skills',
    level: 'Mid-level',
    workType: 'Remote',
    location: 'Kigali',
    candidatesCount: 42,
    lastScreened: '2 days ago',
  },
  {
    id: 'designer-1',
    titleLine1: 'Product',
    titleLine2: 'Designer',
    status: 'Active',
    skillsSummary: '5 skills',
    level: 'Senior',
    workType: 'Hybrid',
    location: 'Kigali',
    candidatesCount: 18,
    lastScreened: '5 days ago',
  },
  {
    id: 'eng-2',
    titleLine1: 'Platform',
    titleLine2: 'Engineer',
    status: 'Draft',
    skillsSummary: '4 skills',
    level: 'Mid-level',
    workType: 'On-site',
    location: 'Nairobi',
    candidatesCount: 0,
    lastScreened: '—',
  },
  {
    id: 'analyst-1',
    titleLine1: 'Junior Data',
    titleLine2: 'Analyst',
    status: 'Active',
    skillsSummary: '2 skills',
    level: 'Junior',
    workType: 'Remote',
    location: 'Lagos',
    candidatesCount: 31,
    lastScreened: '1 day ago',
  },
  {
    id: 'dev-product',
    titleLine1: 'Product',
    titleLine2: 'Developer',
    status: 'Active',
    skillsSummary: '6 skills',
    level: 'Senior',
    workType: 'Remote',
    location: 'London',
    candidatesCount: 55,
    lastScreened: '3 days ago',
  },
  {
    id: 'mobile-1',
    titleLine1: 'Mobile',
    titleLine2: 'Engineer',
    status: 'Draft',
    skillsSummary: '4 skills',
    level: 'Mid-level',
    workType: 'Remote',
    location: 'Kigali',
    candidatesCount: 0,
    lastScreened: '—',
  },
];

const applicantsJsSenior: JobApplicant[] = [
  {
    id: 'c1',
    applicantId: 'APP-2026-001',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+250 788 102 341',
    city: 'Kigali',
    country: 'Rwanda',
    cvFile: 'alice-johnson-cv.pdf',
    headline: 'Senior Software Developer',
    matchScore: 96,
    yearsExperience: 7,
    appliedAt: 'April 18, 2026',
    stage: 'Shortlisted',
    source: 'Referral',
    summary:
      'Full-stack engineer focused on Node.js and cloud-native systems, with a strong history of mentoring and shipping hiring-critical platform work.',
    skills: ['Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
  },
  {
    id: 'c2',
    applicantId: 'APP-2026-002',
    fullName: 'John David',
    email: 'john.david@example.com',
    phone: '+250 784 222 119',
    city: 'Huye',
    country: 'Rwanda',
    cvFile: 'john-david-cv.pdf',
    headline: 'Backend Software Developer',
    matchScore: 91,
    yearsExperience: 5,
    appliedAt: 'April 17, 2026',
    stage: 'Reviewing',
    source: 'LinkedIn',
    summary: 'Backend-oriented engineer with strong API design, data pipeline, and deployment automation experience.',
    skills: ['Javascript', 'Python', 'REST', 'Docker'],
  },
  {
    id: 'c3',
    applicantId: 'APP-2026-003',
    fullName: 'Mark Robert',
    email: 'mark.robert@example.com',
    phone: '+250 782 918 214',
    city: 'Karongi',
    country: 'Rwanda',
    cvFile: 'mark-robert-cv.pdf',
    headline: 'Product Designer',
    matchScore: 84,
    yearsExperience: 6,
    appliedAt: 'April 16, 2026',
    stage: 'Interviewing',
    source: 'Careers page',
    summary: 'Design systems and user research specialist with strong B2B SaaS and product discovery experience.',
    skills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems'],
  },
  {
    id: 'c4',
    applicantId: 'APP-2026-004',
    fullName: 'Peter Griffin',
    email: 'peter.griffin@example.com',
    phone: '+250 783 390 512',
    city: 'Kigali',
    country: 'Rwanda',
    cvFile: 'peter-griffin-cv.pdf',
    headline: 'Frontend Engineer',
    matchScore: 79,
    yearsExperience: 4,
    appliedAt: 'April 15, 2026',
    stage: 'Reviewing',
    source: 'LinkedIn',
    summary: 'Frontend-focused engineer experienced with component systems, accessibility, and product-facing interface work.',
    skills: ['React', 'Next.js', 'TypeScript', 'Accessibility'],
  },
  {
    id: 'c5',
    applicantId: 'APP-2026-005',
    fullName: 'Peter Parker',
    email: 'peter.parker@example.com',
    phone: '+44 7700 900 125',
    city: 'London',
    country: 'United Kingdom',
    cvFile: 'peter-parker-cv.pdf',
    headline: 'Product Engineer',
    matchScore: 73,
    yearsExperience: 5,
    appliedAt: 'April 14, 2026',
    stage: 'New',
    source: 'Referral',
    summary: 'Product-minded software engineer comfortable across frontend implementation, QA, and collaboration with PMs.',
    skills: ['React', 'Node.js', 'Testing', 'Product Thinking'],
  },
  {
    id: 'c6',
    applicantId: 'APP-2026-006',
    fullName: 'Bruce Wayne',
    email: 'bruce.wayne@example.com',
    phone: '+1 415 555 1932',
    city: 'San Francisco',
    country: 'United States',
    cvFile: 'bruce-wayne-cv.pdf',
    headline: 'Platform Engineer',
    matchScore: 68,
    yearsExperience: 8,
    appliedAt: 'April 13, 2026',
    stage: 'Reviewing',
    source: 'Recruiter',
    summary: 'Infrastructure and systems engineer with experience across reliability, observability, and scalable delivery pipelines.',
    skills: ['Kubernetes', 'Go', 'AWS', 'Observability'],
  },
  {
    id: 'c7',
    applicantId: 'APP-2026-007',
    fullName: 'Dwayne Johnson',
    email: 'dwayne.johnson@example.com',
    phone: '+1 310 555 8742',
    city: 'Miami',
    country: 'United States',
    cvFile: 'dwayne-johnson-cv.pdf',
    headline: 'Operations and Program Lead',
    matchScore: 57,
    yearsExperience: 9,
    appliedAt: 'April 12, 2026',
    stage: 'New',
    source: 'Recruiter',
    summary: 'Cross-functional operator with strengths in hiring coordination, delivery rituals, and organizational planning.',
    skills: ['Program Management', 'Operations', 'Hiring Coordination', 'Stakeholder Management'],
  },
  {
    id: 'c8',
    applicantId: 'APP-2026-008',
    fullName: 'Jimmy Donaldson',
    email: 'jimmy.d@example.com',
    phone: '+1 919 555 0241',
    city: 'Greenville',
    country: 'United States',
    cvFile: 'jimmy-donaldson-cv.pdf',
    headline: 'Growth Product Marketer',
    matchScore: 46,
    yearsExperience: 4,
    appliedAt: 'April 11, 2026',
    stage: 'New',
    source: 'Careers page',
    summary: 'Growth-focused marketer with experimentation, content, and audience insights experience across digital channels.',
    skills: ['Growth', 'Campaigns', 'Analytics', 'Content Strategy'],
  },
  {
    id: 'c9',
    applicantId: 'APP-2026-009',
    fullName: 'Sam Wilson',
    email: 'sam.wilson@example.com',
    phone: '+254 712 888 511',
    city: 'Nairobi',
    country: 'Kenya',
    cvFile: 'sam-wilson-cv.pdf',
    headline: 'Data Analyst',
    matchScore: 34,
    yearsExperience: 3,
    appliedAt: 'April 10, 2026',
    stage: 'New',
    source: 'LinkedIn',
    summary: 'Analyst with strong dashboarding, SQL reporting, and stakeholder-facing reporting experience.',
    skills: ['SQL', 'Power BI', 'Excel', 'Python'],
  },
  {
    id: 'c10',
    applicantId: 'APP-2026-010',
    fullName: 'Natasha Romanoff',
    email: 'natasha.romanoff@example.com',
    phone: '+250 787 001 203',
    city: 'Musanze',
    country: 'Rwanda',
    cvFile: 'natasha-romanoff-cv.pdf',
    headline: 'QA Automation Engineer',
    matchScore: 12,
    yearsExperience: 6,
    appliedAt: 'April 9, 2026',
    stage: 'Reviewing',
    source: 'Referral',
    summary: 'Quality engineer with strong automation coverage, release confidence practices, and regression tooling experience.',
    skills: ['Playwright', 'Cypress', 'QA Strategy', 'CI/CD'],
  },
];

const sessionsJsSenior: JobSessionSummary[] = [
  {
    id: 's1',
    date: 'Apr 12, 2023',
    status: 'Pending',
    candidates: 25,
    score: '92%',
    stats: [
      { label: 'Candidates', value: '25 Candidates' },
      { label: 'Top score', value: 'Top score: 92%' },
    ],
  },
  {
    id: 's2',
    date: 'Apr 12, 2023',
    status: 'Completed',
    candidates: 25,
    score: '92%',
    stats: [
      { label: 'Candidates', value: '25 Candidates' },
      { label: 'Top score', value: 'Top score: 92%' },
    ],
  },
  {
    id: 's3',
    date: 'Apr 10, 2023',
    status: 'Completed',
    candidates: 18,
    score: '88%',
    stats: [
      { label: 'Candidates', value: '18 Candidates' },
      { label: 'Top score', value: 'Top score: 88%' },
    ],
  },
];

export const mockJobDetails: Record<string, JobDetail> = {
  'js-senior': {
    id: 'js-senior',
    title: 'Javascript Senior developer',
    applicants: applicantsJsSenior,
    sessions: sessionsJsSenior,
  },
  'designer-1': {
    id: 'designer-1',
    title: 'Product Designer',
    applicants: applicantsJsSenior.slice(0, 6),
    sessions: [
      {
        id: 's4',
        date: 'Mar 2, 2024',
        status: 'Completed',
        candidates: 12,
        score: '79%',
        stats: [
          { label: 'Candidates', value: '12 Candidates' },
          { label: 'Top score', value: 'Top score: 79%' },
        ],
      },
    ],
  },
  'analyst-1': {
    id: 'analyst-1',
    title: 'Junior Data Analyst',
    applicants: applicantsJsSenior.slice(2, 8),
    sessions: [],
  },
  'dev-product': {
    id: 'dev-product',
    title: 'Product Developer',
    applicants: applicantsJsSenior,
    sessions: [
      {
        id: 's-run',
        date: 'Apr 17, 2026',
        status: 'Pending',
        candidates: 25,
        score: '—',
        stats: [
          { label: 'Candidates', value: '25 Candidates' },
          { label: 'Top score', value: 'Top score: —' },
        ],
      },
    ],
  },
  'eng-2': {
    id: 'eng-2',
    title: 'Platform Engineer',
    applicants: [],
    sessions: [],
  },
  'mobile-1': {
    id: 'mobile-1',
    title: 'Mobile Engineer',
    applicants: [],
    sessions: [],
  },
};

export const mockScreeningMetrics: ScreeningMetric[] = [
  { label: 'Total sessions run', value: '14' },
  { label: 'Candidates screened', value: '235' },
  { label: 'Avg top score', value: '86%' },
  { label: 'Sessions with overrides', value: '5' },
];

export const mockScreeningFilters: ScreeningPageFilters = {
  searchPlaceholder: 'Search by job or candidate',
  jobOptions: [
    { label: 'Job', value: 'all' },
    { label: 'Javascript senior developer', value: 'js-senior' },
    { label: 'Product engineer', value: 'dev-product' },
    { label: 'Product Designer', value: 'designer-1' },
    { label: 'Junior data analyst', value: 'analyst-1' },
  ],
  statusOptions: [
    { label: 'All status', value: 'all' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Running', value: 'Running' },
    { label: 'Pending', value: 'Pending' },
  ],
};

export const mockScreeningTableRows: ScreeningTableRow[] = [
  {
    sessionId: 's1',
    jobId: 'js-senior',
    sessionLabel: '#14',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 18, 2026',
    candidates: 25,
    topScore: 89,
    topScoreClass: 'green',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's2',
    jobId: 'js-senior',
    sessionLabel: '#12',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 18, 2026',
    candidates: 25,
    topScore: 89,
    topScoreClass: 'green',
    overrides: 2,
    status: 'Completed',
  },
  {
    sessionId: 's-run',
    jobId: 'dev-product',
    sessionLabel: '#1',
    jobTitle: 'Product engineer',
    dateRun: 'April 17, 2026',
    candidates: 25,
    topScore: 0,
    topScoreClass: 'blue',
    overrides: 0,
    status: 'Running',
  },
  {
    sessionId: 's3',
    jobId: 'js-senior',
    sessionLabel: '#14',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 16, 2026',
    candidates: 25,
    topScore: 66,
    topScoreClass: 'orange',
    overrides: 3,
    status: 'Completed',
  },
  {
    sessionId: 's5',
    jobId: 'js-senior',
    sessionLabel: '#14',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 16, 2026',
    candidates: 25,
    topScore: 89,
    topScoreClass: 'green',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's6',
    jobId: 'js-senior',
    sessionLabel: '#14',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 16, 2026',
    candidates: 25,
    topScore: 89,
    topScoreClass: 'green',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's7',
    jobId: 'designer-1',
    sessionLabel: '#9',
    jobTitle: 'Product Designer',
    dateRun: 'April 14, 2026',
    candidates: 14,
    topScore: 78,
    topScoreClass: 'green',
    overrides: 1,
    status: 'Completed',
  },
  {
    sessionId: 's8',
    jobId: 'analyst-1',
    sessionLabel: '#5',
    jobTitle: 'Junior data analyst',
    dateRun: 'April 13, 2026',
    candidates: 19,
    topScore: 72,
    topScoreClass: 'orange',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's9',
    jobId: 'dev-product',
    sessionLabel: '#4',
    jobTitle: 'Product engineer',
    dateRun: 'April 12, 2026',
    candidates: 17,
    topScore: 61,
    topScoreClass: 'orange',
    overrides: 2,
    status: 'Pending',
  },
  {
    sessionId: 's10',
    jobId: 'mobile-1',
    sessionLabel: '#3',
    jobTitle: 'Mobile engineer',
    dateRun: 'April 11, 2026',
    candidates: 11,
    topScore: 0,
    topScoreClass: 'blue',
    overrides: 0,
    status: 'Running',
  },
  {
    sessionId: 's11',
    jobId: 'eng-2',
    sessionLabel: '#2',
    jobTitle: 'Platform engineer',
    dateRun: 'April 10, 2026',
    candidates: 22,
    topScore: 84,
    topScoreClass: 'green',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's12',
    jobId: 'designer-1',
    sessionLabel: '#1',
    jobTitle: 'Product Designer',
    dateRun: 'April 9, 2026',
    candidates: 12,
    topScore: 81,
    topScoreClass: 'green',
    overrides: 1,
    status: 'Completed',
  },
  {
    sessionId: 's13',
    jobId: 'analyst-1',
    sessionLabel: '#11',
    jobTitle: 'Junior data analyst',
    dateRun: 'April 8, 2026',
    candidates: 28,
    topScore: 74,
    topScoreClass: 'orange',
    overrides: 0,
    status: 'Completed',
  },
  {
    sessionId: 's14',
    jobId: 'js-senior',
    sessionLabel: '#10',
    jobTitle: 'Javascript senior developer',
    dateRun: 'April 7, 2026',
    candidates: 21,
    topScore: 88,
    topScoreClass: 'green',
    overrides: 0,
    status: 'Completed',
  },
];

const defaultTop: SessionTopCandidate[] = [
  { id: 'c1', name: 'Alice Johnson', scorePercent: 100 },
  { id: 'c2', name: 'John David', scorePercent: 96 },
  { id: 'c3', name: 'Mark Robert', scorePercent: 90 },
  { id: 'c4', name: 'Peter Griffin', scorePercent: 84 },
  { id: 'c5', name: 'Peter Parker', scorePercent: 78 },
  { id: 'c6', name: 'Bruce Wayne', scorePercent: 70 },
  { id: 'c7', name: 'Dwayne Johnson', scorePercent: 60 },
  { id: 'c8', name: 'Jimmy Donaldson', scorePercent: 50 },
  { id: 'c9', name: 'Sam Wilson', scorePercent: 25 },
  { id: 'c10', name: 'Natasha Romanoff', scorePercent: 0 },
];

export const mockSessionResults: SessionResults[] = [
  {
    jobId: 'js-senior',
    sessionId: 's1',
    sessionLabel: '#14',
    jobTitle: 'Javascript Senior developer',
    pageTitle: 'Software Developer Position',
    summaryLine: 'Screening session • screened 22 candidates on April 22, 2026',
    topCandidates: defaultTop,
    featured: {
      name: 'Alice Johnson',
      title: 'Senior Software Developer',
      location: 'Nyabihu, Rwanda',
      scorePercent: 89,
      skillBadges: ['Technical: 87', 'Communication: 85', 'Culture fit: 90', 'Problem solving: 88'],
      cvLabel: 'aliceJohnsonCv.pdf',
      analysis: {
        strengths: [
          'Strong technical skills in software development.',
          '7+ years of relevant experience.',
          'Degree in Computer Science.',
        ],
        gaps: ['Limited leadership experience.', 'Some concerns about cultural fit.'],
      },
    },
  },
  {
    jobId: 'js-senior',
    sessionId: 's2',
    sessionLabel: '#12',
    jobTitle: 'Javascript Senior developer',
    summaryLine: 'Screening session — screened 25 candidates on April 18, 2026',
    pageTitle: 'Software Developer Position',
    topCandidates: defaultTop.map((c, i) => ({ ...c, scorePercent: Math.max(60, 89 - i) })),
    featured: {
      name: 'Alice Johnson',
      title: 'Senior Software Developer',
      location: 'Kigali, Rwanda',
      scorePercent: 89,
      skillBadges: ['Technical: 88', 'Communication: 86', 'Culture fit: 91', 'Problem solving: 87'],
      cvLabel: 'aliceJohnsonCv.pdf',
      analysis: {
        strengths: ['Excellent coding depth.', 'Clear communication in interviews.', 'Strong product understanding.'],
        gaps: ['Needs mentoring support for leadership growth.', 'Limited multi-team coordination examples.'],
      },
    },
  },
  {
    jobId: 'js-senior',
    sessionId: 's3',
    sessionLabel: '#14',
    jobTitle: 'Javascript Senior developer',
    summaryLine: 'Screening session — screened 18 candidates on April 16, 2026',
    pageTitle: 'Software Developer Position',
    topCandidates: defaultTop.slice(0, 8),
    featured: {
      name: 'John David',
      title: 'Software Developer',
      location: 'Huye, Rwanda',
      scorePercent: 84,
      skillBadges: ['Technical: 82', 'Communication: 83', 'Culture fit: 86', 'Problem solving: 81'],
      cvLabel: 'johnDavidCv.pdf',
      analysis: {
        strengths: ['Strong backend fundamentals.', 'Good analytical thinking.', 'Reliable system design basics.'],
        gaps: ['Less evidence of mentoring experience.', 'Frontend depth is still growing.'],
      },
    },
  },
  {
    jobId: 'dev-product',
    sessionId: 's-run',
    sessionLabel: '#1',
    jobTitle: 'Product engineer',
    summaryLine: 'Screening session — in progress (25 candidates)',
    pageTitle: 'Product Engineer Position',
    topCandidates: defaultTop.slice(0, 3),
    featured: {
      name: 'Alice Johnson',
      title: 'Product Engineer',
      location: 'London, UK',
      scorePercent: 72,
      skillBadges: ['Product sense: 74', 'Communication: 70', 'Analytics: 71'],
      cvLabel: 'aliceJohnsonCv.pdf',
      analysis: {
        strengths: ['Strong collaboration with product teams.', 'Comfortable with experimentation.', 'Solid communication.'],
        gaps: ['Still under review for technical depth.', 'More examples needed on analytics ownership.'],
      },
    },
  },
  {
    jobId: 'designer-1',
    sessionId: 's4',
    sessionLabel: '#4',
    jobTitle: 'Product Designer',
    summaryLine: 'Screening session — screened 12 candidates on March 2, 2024',
    pageTitle: 'Product Designer Position',
    topCandidates: defaultTop.slice(0, 6),
    featured: {
      name: 'Mark Robert',
      title: 'Product Designer',
      location: 'Karongi, Rwanda',
      scorePercent: 79,
      skillBadges: ['Visual design: 80', 'UX: 78', 'Research: 77'],
      cvLabel: 'markRobertCv.pdf',
      analysis: {
        strengths: ['Strong visual craft.', 'Good research grounding.', 'Clear portfolio storytelling.'],
        gaps: ['Needs more systems-level examples.', 'Facilitation examples are limited.'],
      },
    },
  },
];

export const mockCandidates: MockCandidate[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    headline: 'Senior Software Developer',
    location: 'Kigali, Rwanda',
    matchScore: 89,
    summary:
      'Full-stack engineer with a focus on Node.js and cloud-native systems. Led hiring loops and mentored juniors.',
    skills: ['Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
  },
  {
    id: 'c2',
    name: 'John David',
    email: 'john@example.com',
    headline: 'Software Developer',
    location: 'Huye, Rwanda',
    matchScore: 84,
    summary: 'Backend-oriented developer with experience in APIs and data pipelines.',
    skills: ['Javascript', 'Python', 'REST', 'Docker'],
  },
  {
    id: 'c3',
    name: 'Mark Robert',
    email: 'mark@example.com',
    headline: 'Product Designer',
    location: 'Karongi, Rwanda',
    matchScore: 79,
    summary: 'Design systems and user research for B2B SaaS products.',
    skills: ['Figma', 'UX research', 'Prototyping', 'Design systems'],
  },
];

export function getApplicantCvUrl(applicant: Pick<JobApplicant, 'fullName' | 'applicantId' | 'email' | 'phone' | 'city' | 'country' | 'cvFile'>): string {
  const content = [
    applicant.cvFile,
    `${applicant.fullName}`,
    `Applicant ID: ${applicant.applicantId}`,
    `Email: ${applicant.email}`,
    `Phone: ${applicant.phone}`,
    `Location: ${applicant.city}, ${applicant.country}`,
    '',
    'This is a mock CV document generated for UI prototyping.',
  ].join('\n');

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}

export function getJobApplicant(jobId: string, candidateId: string): JobApplicant | undefined {
  return mockJobDetails[jobId]?.applicants.find((applicant) => applicant.id === candidateId);
}

export function getCandidateDirectoryEntries(): CandidateDirectoryEntry[] {
  const candidates = new Map<string, CandidateDirectoryEntry>();

  Object.values(mockJobDetails).forEach((job) => {
    job.applicants.forEach((applicant) => {
      const existing = candidates.get(applicant.id);
      const application = {
        jobId: job.id,
        jobTitle: job.title,
        appliedAt: applicant.appliedAt,
      };

      if (existing) {
        existing.applications.push(application);
        existing.matchScore = Math.max(existing.matchScore, applicant.matchScore);
        return;
      }

      candidates.set(applicant.id, {
        id: applicant.id,
        applicantId: applicant.applicantId,
        fullName: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        city: applicant.city,
        country: applicant.country,
        headline: applicant.headline,
        matchScore: applicant.matchScore,
        yearsExperience: applicant.yearsExperience,
        stage: applicant.stage,
        source: applicant.source,
        summary: applicant.summary,
        skills: applicant.skills,
        cvFile: applicant.cvFile,
        applications: [application],
      });
    });
  });

  return Array.from(candidates.values()).sort((a, b) => b.matchScore - a.matchScore);
}

export const mockDraftByJobId: Record<string, MockDraftJob> = {
  'js-senior': {
    jobId: 'js-senior',
    titleLine1: 'Javascript Senior',
    titleLine2: 'developer',
    skills: ['Javascript', 'Typescript', 'React.js'],
    experience: '5+ Years',
    seniority: 'Senior level',
    location: 'New York city',
    employmentType: 'Full time',
    disqualifiers: ['No remote', 'No visa sponsorship', 'No freelancers'],
    description:
      'We are looking for a senior JavaScript developer to lead the design and delivery of scalable web applications. You will work closely with product, design, and data teams to build reliable user-facing experiences and mentor engineers across the team.\n\nThe role requires strong experience with modern JavaScript frameworks, API design, testing, and performance optimization. You should be comfortable translating product requirements into technical solutions, reviewing code, and improving engineering standards across the team.\n\nSuccess in this role means shipping high-quality features, supporting hiring and onboarding, and helping shape the long-term architecture of our platform.',
  },
};

export function getJobDetail(jobId: string): JobDetail | undefined {
  return mockJobDetails[jobId];
}

export function getJobOpening(jobId: string): JobOpening | undefined {
  return mockJobOpenings.find((j) => j.id === jobId);
}

export function getSessionResults(jobId: string, sessionId: string): SessionResults | undefined {
  return mockSessionResults.find((s) => s.jobId === jobId && s.sessionId === sessionId);
}

export function getDraftJob(jobId: string): MockDraftJob | undefined {
  return mockDraftByJobId[jobId];
}
