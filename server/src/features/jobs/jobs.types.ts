import { Document, Types } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department?: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  minYearsExperience: number;
  maxYearsExperience?: number;
  location: string;
  remote: boolean;
  hardRequirements: string[];
  status: 'draft' | 'active' | 'closed';
  createdBy: Types.ObjectId;
}