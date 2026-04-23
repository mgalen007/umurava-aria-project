import mongoose, { Schema } from 'mongoose';
import { ISession } from './sessions.types';

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
    rankedResults:   [{ type: Schema.Types.Mixed }],
    batchSummary:    { type: Schema.Types.Mixed },
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
