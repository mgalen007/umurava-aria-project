import mongoose, { Schema } from 'mongoose';
import { ISession } from './sessions.types';

const CitationSchema = new Schema(
  {
    dimension: { type: String, required: true },
    evidence: { type: String, required: true },
    source_section: { type: String, required: true },
    impact: { type: String, required: true },
  },
  { _id: false }
);

const RankedResultSchema = new Schema(
  {
    rank: { type: Number, required: true, min: 1 },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    aiScore: { type: Number, required: true, min: 0, max: 100 },
    finalScore: { type: Number, required: true, min: 0, max: 100 },
    verdict: { type: String, required: true },
    strengths: [{ type: String }],
    gaps: [{ type: String }],
    citations: { type: [CitationSchema], default: [] },
    recruiterNote: { type: String, required: true },
    hardDisqualificationReason: { type: String, default: null },
    feedbackStatus: {
      type: String,
      enum: ['pending', 'approved', 'overridden', 'disqualified'],
      required: true,
      default: 'pending',
    },
  },
  { _id: false }
);

const BatchSummarySchema = new Schema(
  {
    recommended_for_interview: [{ type: String }],
    hold_pool: [{ type: String }],
    not_advancing: [{ type: String }],
    top_differentiator: { type: String, required: true },
    talent_pool_quality: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    jobId: {
      type:     Schema.Types.ObjectId,
      ref:      'Job',
      required: true,
      index:    true,
    },
    name:         { type: String, required: true },
    status: {
      type:    String,
      enum:    ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    candidateIds: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }],
    rankedResults:   { type: [RankedResultSchema], default: [] },
    batchSummary:    { type: BatchSummarySchema },
    modelUsed: {
      type: String,
      enum: ['gemini-2.5-flash', 'gemini-1.5-pro'],
      default: 'gemini-2.5-flash',
    },
    promptVersion:    { type: String, default: 'v1.0' },
    processingTimeMs: { type: Number },
    error:            { type: String },
    createdBy: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
