import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/error';
import { User } from '../auth/auth.model';
import { AuthService } from '../auth/auth.service';
import { Candidate } from '../candidates/candidates.model';
import { Job } from '../jobs/jobs.model';
import { Notification } from '../notifications/notification.model';
import { Session } from '../sessions/sessions.model';
import {
  ChangePasswordDto,
  UpdateAiPreferencesDto,
  UpdateParsingPreferencesDto,
  UpdateProfileDto,
} from './settings.dto';

export class SettingsService {
  private authService = new AuthService();

  async getSettings(userId: string) {
    const user = await this.requireUser(userId);

    return {
      profile: this.serializeProfile(user),
      ai: user.preferences.aiScreening,
      parsing: user.preferences.parsing,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.requireUser(userId);
    const { firstName, lastName } = this.splitFullName(data.fullName);

    user.firstName = firstName;
    user.lastName = lastName;
    user.jobTitle = data.jobTitle.trim();

    if (data.profilePhotoUrl !== undefined) {
      user.profilePhotoUrl = data.profilePhotoUrl;
    }

    await user.save();

    return {
      user: this.authService.serializeUser(user),
      profile: this.serializeProfile(user),
    };
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user || !user.isActive) throw new AppError('User not found', 404);

    const passwordMatches = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!passwordMatches) throw new AppError('Current password is incorrect', 401);

    const newPasswordMatchesCurrent = await bcrypt.compare(data.newPassword, user.passwordHash);
    if (newPasswordMatchesCurrent) {
      throw new AppError('New password must be different from the current password', 422);
    }

    const saltRounds = this.getSaltRounds();
    user.passwordHash = await bcrypt.hash(data.newPassword, saltRounds);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async updateAiPreferences(userId: string, data: UpdateAiPreferencesDto) {
    const user = await this.requireUser(userId);
    user.preferences.aiScreening = data;
    await user.save();
    return user.preferences.aiScreening;
  }

  async updateParsingPreferences(userId: string, data: UpdateParsingPreferencesDto) {
    const user = await this.requireUser(userId);
    user.preferences.parsing = data;
    await user.save();
    return user.preferences.parsing;
  }

  async clearData(userId: string) {
    await this.requireUser(userId);

    const [jobsResult, sessionsResult, candidatesResult, notificationsResult] = await Promise.all([
      Job.deleteMany({ createdBy: userId }),
      Session.deleteMany({ createdBy: userId }),
      Candidate.deleteMany({ uploadedBy: userId }),
      Notification.deleteMany({ user: userId }),
    ]);

    return {
      deleted: {
        jobs: jobsResult.deletedCount ?? 0,
        sessions: sessionsResult.deletedCount ?? 0,
        candidates: candidatesResult.deletedCount ?? 0,
        notifications: notificationsResult.deletedCount ?? 0,
      },
    };
  }

  async deleteAccount(userId: string) {
    const clearSummary = await this.clearData(userId);
    const result = await User.deleteOne({ _id: userId });

    if (!result.deletedCount) {
      throw new AppError('User not found', 404);
    }

    return {
      ...clearSummary,
      deletedAccount: true,
    };
  }

  private async requireUser(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) throw new AppError('User not found', 404);
    return user;
  }

  private splitFullName(fullName: string) {
    const trimmed = fullName.trim().replace(/\s+/g, ' ');
    const parts = trimmed.split(' ');

    if (parts.length < 2) {
      return { firstName: trimmed, lastName: 'User' };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }

  private serializeProfile(user: Awaited<ReturnType<SettingsService['requireUser']>>) {
    return {
      fullName: `${user.firstName} ${user.lastName}`.replace(/\s+/g, ' ').trim(),
      email: user.email,
      jobTitle: user.jobTitle,
      profilePhotoUrl: user.profilePhotoUrl,
    };
  }

  private getSaltRounds(): number {
    const parsed = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
  }
}
