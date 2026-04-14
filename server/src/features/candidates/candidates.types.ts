import { Document, Types } from 'mongoose';

export interface Skill {
  name:              string;
  level:             'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface Language {
  name:        string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface Experience {
  company:      string;
  role:         string;
  startDate:    string;
  endDate?:     string;
  description:  string;
  technologies: string[];
  isCurrent:    boolean;
}

export interface Education {
  institution:  string;
  degree:       string;
  fieldOfStudy: string;
  startYear:    number;
  endYear?:     number;
}

export interface Certification {
  name:       string;
  issuer:     string;
  issueDate:  string;
}

export interface Project {
  name:         string;
  description:  string;
  technologies: string[];
  role:         string;
  link?:        string;
  startDate:    string;
  endDate?:     string;
}

export interface Availability {
  status:     'Available' | 'Open to Opportunities' | 'Not Available';
  type:       'Full-time' | 'Part-time' | 'Contract';
  startDate?: string;
}

export interface SocialLinks {
  linkedin?:  string;
  github?:    string;
  portfolio?: string;
  [key: string]: string | undefined;
}

export interface EvaluationHistory {
  sessionId:   Types.ObjectId;
  jobId:       Types.ObjectId;
  aiScore:     number;
  finalScore:  number;
  verdict:     string;
  strengths:   string[];
  gaps:        string[];
  evaluatedAt: Date;
}

export interface ICandidate extends Document {
  source:       'umurava_json' | 'pdf_resume' | 'csv_upload' | 'manual_entry';
  firstName:    string;
  lastName:     string;
  email:        string;
  headline:     string;
  bio?:         string;
  location:     string;
  skills:       Skill[];
  languages:    Language[];
  experience:   Experience[];
  education:    Education[];
  certifications: Certification[];
  projects:     Project[];
  availability: Availability;
  socialLinks?: SocialLinks;
  extractionConfidence:  number;
  extractionWarnings?:   string[];
  evaluationHistory:     EvaluationHistory[];
  globalStatus: 'available' | 'interviewing' | 'hired' | 'rejected';
  uploadedBy:   Types.ObjectId;
}