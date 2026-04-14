import { Document, Types } from 'mongoose';

export interface RankedResult {
  rank: number;
  candidateId: Types.ObjectId;
  aiScore: number;
  finalScore: number;
  verdict: 'STRONG_MATCH' | 'GOOD_MATCH' | 'BORDERLINE' | 'WEAK_MATCH' | 'DISQUALIFIED';
  strengths: string[];
  gaps: string[];
  citations: Citation[];
  recruiterNote: string;
  hardDisqualificationReason: string | null;
  feedbackStatus: 'pending' | 'approved' | 'overridden' | 'disqualified';
}

export interface Citation {
  dimension: 'technical_skills' | 'relevant_experience' | 'education_certifications' | 'cultural_relevance_fit';
  evidence: string;
  sourceSection: string;
  impact: string;
}

export interface ScoreBreakdown {
  technicalSkills:        number;
  relevantExperience:     number;
  educationCertifications: number;
  culturalRelevanceFit:   number;
}

export interface BatchSummary {
  recommendedForInterview: string[];
  holdPool:                string[];
  notAdvancing:            string[];
  topDifferentiator:       string;
  talentPoolQuality:       'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ISession extends Document {
  jobId:            Types.ObjectId;
  name:             string;
  status:           'pending' | 'processing' | 'completed' | 'failed';
  candidateIds:     Types.ObjectId[];
  rankedResults:    RankedResult[];
  batchSummary?:    BatchSummary;
  modelUsed:        'gemini-1.5-flash' | 'gemini-1.5-pro';
  promptVersion:    string;
  processingTimeMs?: number;
  error?:           string;
  createdBy:        Types.ObjectId;
}