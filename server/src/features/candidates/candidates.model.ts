import mongoose, { Schema } from 'mongoose';
import { ICandidate } from './candidates.types';

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
    yearsOfExperience: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const LanguageSchema = new Schema(
  {
    name: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
      required: true,
    },
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    isCurrent: { type: Boolean, required: true },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    role: { type: String, required: true },
    link: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['Available', 'Open to Opportunities', 'Not Available'],
      required: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract'],
      required: true,
    },
    startDate: { type: String },
  },
  { _id: false }
);

const EvaluationHistorySchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    aiScore: { type: Number, required: true, min: 0, max: 100 },
    finalScore: { type: Number, required: true, min: 0, max: 100 },
    verdict: { type: String, required: true },
    strengths: [{ type: String }],
    gaps: [{ type: String }],
    evaluatedAt: { type: Date, required: true },
  },
  { _id: false }
);

const CandidateSchema = new Schema<ICandidate>(
  {
    source: {
      type:     String,
      enum:     ['umurava_json', 'pdf_resume', 'csv_upload', 'manual_entry'],
      required: true,
    },
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true, lowercase: true, trim: true },
    headline:   { type: String, required: true },
    bio:        { type: String },
    location:   { type: String, required: true },
    skills:               { type: [SkillSchema], default: [] },
    languages:            { type: [LanguageSchema], default: [] },
    experience:           { type: [ExperienceSchema], default: [] },
    education:            { type: [EducationSchema], default: [] },
    certifications:       { type: [CertificationSchema], default: [] },
    projects:             { type: [ProjectSchema], default: [] },
    availability:         { type: AvailabilitySchema, required: true },
    socialLinks:          { type: Map, of: String },
    extractionConfidence: { type: Number, min: 0, max: 1, default: 1 },
    extractionWarnings:   [{ type: String }],
    evaluationHistory:    { type: [EvaluationHistorySchema], default: [] },
    globalStatus: {
      type:    String,
      enum:    ['available', 'interviewing', 'hired', 'rejected'],
      default: 'available',
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

CandidateSchema.index({ firstName: 'text', lastName: 'text', headline: 'text' });
CandidateSchema.index({ uploadedBy: 1, email: 1 }, { unique: true });

export const Candidate = mongoose.model<ICandidate>('Candidate', CandidateSchema);
