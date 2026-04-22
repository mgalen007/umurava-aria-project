import type { Candidate, CandidateExperience, Job, JobStatus, Session, SessionStatus } from './types';

export function getCandidateName(candidate: Pick<Candidate, 'firstName' | 'lastName'>) {
  return `${candidate.firstName} ${candidate.lastName}`.trim();
}

export function getCandidateInitials(candidate: Pick<Candidate, 'firstName' | 'lastName'>) {
  return `${candidate.firstName?.[0] ?? ''}${candidate.lastName?.[0] ?? ''}`.trim().toUpperCase() || '?';
}

export function getYear(value?: string) {
  if (!value) return null;
  const match = value.match(/\b(19|20)\d{2}\b/);
  if (match) return Number(match[0]);

  const parsed = new Date(value);
  const year = parsed.getFullYear();
  return Number.isNaN(year) ? null : year;
}

export function getCandidateYearsExperience(experience: CandidateExperience[]) {
  return experience.reduce((total, item) => {
    const startYear = getYear(item.startDate);
    if (!startYear) return total;

    const endYear = item.isCurrent ? new Date().getFullYear() : (getYear(item.endDate) ?? new Date().getFullYear());
    return total + Math.max(0, endYear - startYear);
  }, 0);
}

export function formatJobStatus(status: JobStatus) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Active';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

export function formatSessionStatus(status: SessionStatus) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

export function formatExperienceLevel(level: Job['experienceLevel']) {
  switch (level) {
    case 'junior':
      return 'Junior';
    case 'mid':
      return 'Mid';
    case 'senior':
      return 'Senior';
    case 'lead':
      return 'Lead';
    case 'principal':
      return 'Principal';
    default:
      return level;
  }
}

export function getJobId(session: Session) {
  return typeof session.jobId === 'string' ? session.jobId : (session.jobId._id ?? '');
}

export function getJobTitle(session: Session) {
  return typeof session.jobId === 'string' ? 'Unknown job' : session.jobId.title;
}

export function getSessionCandidateCount(session: Session) {
  return session.candidateIds.length;
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function buildCandidateCvUrl(candidate: Candidate) {
  const content = [
    `${getCandidateName(candidate)} CV`,
    `Email: ${candidate.email}`,
    `Headline: ${candidate.headline}`,
    `Location: ${candidate.location}`,
    '',
    candidate.bio ?? 'No summary available.',
    '',
    `Skills: ${candidate.skills.map((skill) => skill.name).join(', ') || 'None listed'}`,
  ].join('\n');

  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}
