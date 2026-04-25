import { Notification } from './notification.model';
import { Job } from '../jobs/jobs.model';
import mongoose from 'mongoose';

export class NotificationService {
  async createNotification(data: {
    user: string;
    type: string;
    message: string;
    jobId?: string;
  }) {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(data.user),
      type: data.type,
      message: data.message,
      ...(data.jobId && { jobId: new mongoose.Types.ObjectId(data.jobId) }),
    });
    return notification.save();
  }

  async getUserNotifications(userId: string, limit = 10) {
    // Before fetching, check for stale jobs
    await this.checkStaleJobs(userId);

    const notifications = await Notification.find({ user: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    
    const unreadCount = await Notification.countDocuments({ user: new mongoose.Types.ObjectId(userId), read: false });

    return { notifications, unreadCount };
  }

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(notificationId), user: new mongoose.Types.ObjectId(userId) },
        { read: true }
      );
    } else {
      await Notification.updateMany(
        { user: new mongoose.Types.ObjectId(userId), read: false },
        { read: true }
      );
    }
    return { success: true };
  }

  // Check for jobs older than 7 days with 0 applicants and generate notifications
  private async checkStaleJobs(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleJobs = await Job.find({
      user: new mongoose.Types.ObjectId(userId),
      createdAt: { $lt: sevenDaysAgo },
      candidatesCount: 0,
      status: 'open'
    });

    for (const job of staleJobs) {
      // Check if a notification already exists for this job to prevent spam
      const existing = await Notification.findOne({
        user: new mongoose.Types.ObjectId(userId),
        jobId: job._id,
        type: 'stale_job'
      });

      if (!existing) {
        await this.createNotification({
          user: userId,
          type: 'stale_job',
          message: `Your job "${job.title}" has been open for 7 days with no applicants.`,
          jobId: job._id.toString()
        });
      }
    }
  }
}
