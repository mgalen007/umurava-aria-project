import mongoose, { Schema } from 'mongoose';
import { IUser } from './auth.types';

const UserPreferencesSchema = new Schema(
  {
    aiScreening: {
      defaultShortlistSize: {
        type: String,
        enum: ['5', '10', '20', 'all'],
        default: '10',
      },
      defaultScreeningMode: {
        type: String,
        enum: ['umurava', 'external', 'both'],
        default: 'both',
      },
      weights: {
        skills: { type: Number, default: 60, min: 0, max: 100 },
        experience: { type: Number, default: 30, min: 0, max: 100 },
        education: { type: Number, default: 10, min: 0, max: 100 },
      },
      showReasoning: { type: Boolean, default: true },
    },
    parsing: {
      fields: {
        name: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        skills: { type: Boolean, default: true },
        experience: { type: Boolean, default: true },
        education: { type: Boolean, default: true },
        location: { type: Boolean, default: true },
        certifications: { type: Boolean, default: true },
      },
      fallbackBehavior: {
        type: String,
        enum: ['blank', 'flag'],
        default: 'flag',
      },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    jobTitle: { type: String, default: 'Recruiter', trim: true },
    profilePhotoUrl: { type: String, default: null },
    role: {
      type: String,
      enum: ['admin', 'recruiter'],
      default: 'recruiter',
    },
    isActive: { type: Boolean, default: true },
    preferences: { type: UserPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
