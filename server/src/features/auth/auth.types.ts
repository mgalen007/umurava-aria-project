import { Document } from 'mongoose';

export type UserRole = 'admin' | 'recruiter';

export type ShortlistSize = '5' | '10' | '20' | 'all';
export type ScreeningMode = 'umurava' | 'external' | 'both';
export type ParsingFallbackBehavior = 'blank' | 'flag';

export interface IAiWeights {
  skills: number;
  experience: number;
  education: number;
}

export interface IAiScreeningPreferences {
  defaultShortlistSize: ShortlistSize;
  defaultScreeningMode: ScreeningMode;
  weights: IAiWeights;
  showReasoning: boolean;
}

export interface IParsingFields {
  name: boolean;
  email: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  location: boolean;
  certifications: boolean;
}

export interface IParsingPreferences {
  fields: IParsingFields;
  fallbackBehavior: ParsingFallbackBehavior;
}

export interface IUserPreferences {
  aiScreening: IAiScreeningPreferences;
  parsing: IParsingPreferences;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  jobTitle: string;
  profilePhotoUrl: string | null;
  role: UserRole;
  isActive: boolean;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
