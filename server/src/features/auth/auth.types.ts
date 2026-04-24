import { Document } from 'mongoose';

export type UserRole = 'admin' | 'recruiter';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
