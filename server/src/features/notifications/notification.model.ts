import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'screening_completed' | 'applicants_added' | 'parsing_failed' | 'partial_parsing' | 'new_applicants_after_screening' | 'stale_job';
  message: string;
  jobId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for faster queries
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
