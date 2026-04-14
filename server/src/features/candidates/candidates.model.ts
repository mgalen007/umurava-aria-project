import mongoose, { Schema } from 'mongoose';
import { ICandidate } from './candidates.types';

const CandidateSchema = new Schema<ICandidate>(
  {
    source: {
      type:     String,
      enum:     ['umurava_json', 'pdf_resume', 'csv_upload', 'manual_entry'],
      required: true,
    },
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    headline:   { type: String, required: true },
    bio:        { type: String },
    location:   { type: String, required: true },
    skills:               [{ type: Schema.Types.Mixed }],
    languages:            [{ type: Schema.Types.Mixed }],
    experience:           [{ type: Schema.Types.Mixed }],
    education:            [{ type: Schema.Types.Mixed }],
    certifications:       [{ type: Schema.Types.Mixed }],
    projects:             [{ type: Schema.Types.Mixed }],
    availability:         { type: Schema.Types.Mixed, required: true },
    socialLinks:          { type: Schema.Types.Mixed },
    extractionConfidence: { type: Number, min: 0, max: 1, default: 1 },
    extractionWarnings:   [{ type: String }],
    evaluationHistory:    [{ type: Schema.Types.Mixed }],
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

export const Candidate = mongoose.model<ICandidate>('Candidate', CandidateSchema);