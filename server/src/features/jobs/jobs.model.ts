import mongoose, { Schema } from 'mongoose';
import { IJob } from './jobs.types';

const JobSchema = new Schema<IJob>(
  {
    title:               { type: String, required: true },
    department:          { type: String },
    description:         { type: String, required: true },
    requiredSkills:      [{ type: String }],
    niceToHaveSkills:    [{ type: String }],
    experienceLevel: {
      type:     String,
      enum:     ['junior', 'mid', 'senior', 'lead', 'principal'],
      required: true,
    },
    minYearsExperience:  { type: Number, required: true },
    maxYearsExperience:  { type: Number },
    location:            { type: String, required: true },
    remote:              { type: Boolean, default: false },
    hardRequirements:    [{ type: String }],
    status: {
      type:    String,
      enum:    ['draft', 'active', 'closed'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);