import mongoose from 'mongoose';
import { Session } from '../features/sessions/sessions.model';

interface FeedbackSignals {
  totalFeedback:      number;
  aiApprovalRate:     number;
  overriddenUpCount:  number;
  overriddenDownCount: number;
  avgScoreDelta:      number;
  calibrationContext: string;
}

export class FeedbackService {

  async getSignals(jobId: string): Promise<FeedbackSignals> {
    const sessions = await Session.find({
      jobId:  new mongoose.Types.ObjectId(jobId),
      status: 'completed',
    });

    if (sessions.length === 0) {
      return this.emptySignals();
    }

    const allResults = sessions.flatMap((s) => s.rankedResults);
    const reviewed   = allResults.filter((r) => r.feedbackStatus !== 'pending');

    if (reviewed.length === 0) {
      return this.emptySignals();
    }

    const approved        = reviewed.filter((r) => r.feedbackStatus === 'approved').length;
    const overridden      = reviewed.filter((r) => r.feedbackStatus === 'overridden');
    const overriddenUp    = overridden.filter((r) => r.finalScore > r.aiScore).length;
    const overriddenDown  = overridden.filter((r) => r.finalScore < r.aiScore).length;

    const avgScoreDelta = overridden.length > 0
      ? overridden.reduce((sum, r) => sum + (r.finalScore - r.aiScore), 0) / overridden.length
      : 0;

    return {
      totalFeedback:       reviewed.length,
      aiApprovalRate:      approved / reviewed.length,
      overriddenUpCount:   overriddenUp,
      overriddenDownCount: overriddenDown,
      avgScoreDelta,
      calibrationContext:  this.buildCalibrationContext(avgScoreDelta, overridden.length),
    };
  }

  private buildCalibrationContext(
    avgDelta:       number,
    overrideCount:  number
  ): string {
    if (overrideCount < 3) return '';

    const lines: string[] = [
      `## RECRUITER CALIBRATION (from ${overrideCount} previous overrides)`,
    ];

    if (avgDelta > 2) {
      lines.push(
        `Recruiters have scored candidates higher than AI by an average of +${avgDelta.toFixed(1)} points.`,
        `Be more generous when project evidence is strong.`
      );
    } else if (avgDelta < -2) {
      lines.push(
        `Recruiters have scored candidates lower than AI by an average of ${avgDelta.toFixed(1)} points.`,
        `Apply stricter standards, especially for unverified experience claims.`
      );
    } else {
      lines.push(`AI scores are well aligned with recruiter expectations.`);
    }

    return lines.join('\n');
  }

  private emptySignals(): FeedbackSignals {
    return {
      totalFeedback:       0,
      aiApprovalRate:      1,
      overriddenUpCount:   0,
      overriddenDownCount: 0,
      avgScoreDelta:       0,
      calibrationContext:  '',
    };
  }
}