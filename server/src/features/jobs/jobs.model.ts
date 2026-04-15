import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department: string;
  status: 'Drafted' | 'Active' | 'Archived';
  skillsRequired: string[];
  experienceYears: number;
  seniority: string;
  location: string;
  workType: string;
  disqualifiers: string[];
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  department: { type: String, default: 'General' },
  status: { type: String, enum: ['Drafted', 'Active', 'Archived'], default: 'Drafted' },
  skillsRequired: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0 },
  seniority: { type: String, default: 'Mid-level' },
  location: { type: String, required: true },
  workType: { type: String, required: true },
  disqualifiers: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Job = model<IJob>('JobPosting', JobSchema);
