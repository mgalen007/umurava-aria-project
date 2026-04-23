import mongoose from 'mongoose';
import { Session } from './sessions.model';
import { Candidate } from '../candidates/candidates.model';
import { Job } from '../jobs/jobs.model';
import { CreateSessionDto, FeedbackDto } from './sessions.dto';
import { AppError } from '../../middleware/error';
import { AIService } from '../../ai/ai.service';

const aiService = new AIService();

export class SessionsService {
  private populateSessionQuery<T>(query: T) {
    // Return the same lightweight session shape the frontend expects after initial load.
    return (query as any)
      .populate('jobId', 'title experienceLevel location remote status')
      .populate('candidateIds', 'firstName lastName email headline location');
  }

  private parseObjectId(value: string, label: string) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new AppError(`${label} is invalid`, 400);
    }

    return new mongoose.Types.ObjectId(value);
  }

  async create(data: CreateSessionDto, createdBy: string) {
    const jobId = this.parseObjectId(data.jobId, 'Job ID');
    const job = await Job.findOne({ _id: data.jobId, createdBy });
    if (!job) throw new AppError('Job not found', 404);

    const uniqueCandidateIds = Array.from(new Set(data.candidateIds));
    const candidateIds = uniqueCandidateIds.map(
      (id) => this.parseObjectId(id, 'Candidate ID')
    );

    const candidates = await Candidate.find({
      _id:        { $in: candidateIds },
      uploadedBy: createdBy,
    });

    if (candidates.length === 0) {
      throw new AppError('No valid candidates found', 404);
    }

    const candidatesById = new Map(
      candidates.map((candidate) => [candidate._id.toString(), candidate]),
    );
    const orderedCandidates = uniqueCandidateIds
      .map((id) => candidatesById.get(id))
      .filter((candidate): candidate is (typeof candidates)[number] => Boolean(candidate));

    if (orderedCandidates.length === 0) {
      throw new AppError('No valid candidates found', 404);
    }

    const session = await Session.create({
      jobId,
      name:         data.name,
      candidateIds: orderedCandidates.map((candidate) => candidate._id),
      modelUsed:    data.modelUsed,
      createdBy,
    });

    return session;
  }

  async run(sessionId: string, createdBy: string) {
    const parsedSessionId = this.parseObjectId(sessionId, 'Session ID');
    const session = await Session.findOneAndUpdate(
      {
        _id: parsedSessionId,
        createdBy,
        status: { $ne: 'processing' },
      },
      {
        $set: {
          status: 'processing',
          error: undefined,
          processingTimeMs: undefined,
        },
      },
      { new: true }
    );

    if (!session) {
      const existingSession = await Session.findOne({ _id: parsedSessionId, createdBy }).select('status');
      if (!existingSession) throw new AppError('Session not found', 404);
      if (existingSession.status === 'processing') {
        throw new AppError('Session is already running', 409);
      }
      throw new AppError('Unable to start screening session', 409);
    }

    const [job, candidates] = await Promise.all([
      Job.findById(session.jobId),
      Candidate.find({ _id: { $in: session.candidateIds } }),
    ]);

    if (!job) throw new AppError('Job not found', 404);

    this.runInBackground(session.id, job, candidates);

    return { message: 'Screening started', sessionId: session.id };
  }

  private async runInBackground(
    sessionId: string,
    job: any,
    candidates: any[]
  ) {
    const start = Date.now();
    try {
      const result = await aiService.evaluate({ sessionId, job, candidates });

      const rankedResults = result.rankings.map((r) => ({
        rank:                       r.rank,
        candidateId:                r.candidate_id,
        aiScore:                    r.total_score,
        finalScore:                 r.total_score,
        verdict:                    r.verdict,
        strengths:                  r.strengths,
        gaps:                       r.gaps,
        citations:                  r.citations,
        recruiterNote:              r.recruiter_note,
        hardDisqualificationReason: r.hard_disqualification_reason,
        feedbackStatus:             'pending',
      }));

      await Session.findByIdAndUpdate(sessionId, {
        status:           'completed',
        rankedResults,
        batchSummary:     result.batch_summary,
        processingTimeMs: Date.now() - start,
      });

      await Promise.all(
        result.rankings.map((r) =>
          Candidate.findByIdAndUpdate(r.candidate_id, {
            $push: {
              evaluationHistory: {
                sessionId:   new mongoose.Types.ObjectId(sessionId),
                jobId:       job._id,
                aiScore:     r.total_score,
                finalScore:  r.total_score,
                verdict:     r.verdict,
                strengths:   r.strengths,
                gaps:        r.gaps,
                evaluatedAt: new Date(),
              },
            },
          })
        )
      );
    } catch (err) {
      await Session.findByIdAndUpdate(sessionId, {
        status: 'failed',
        error:  String(err),
      });
    }
  }

  async findAll(createdBy: string) {
    const sessions = await this.populateSessionQuery(Session.find({ createdBy }))
      .sort({ createdAt: -1 });
    return sessions;
  }

  async findOne(sessionId: string, createdBy: string) {
    const parsedSessionId = this.parseObjectId(sessionId, 'Session ID');
    const session = await this.populateSessionQuery(
      Session.findOne({ _id: parsedSessionId, createdBy })
    );
    if (!session) throw new AppError('Session not found', 404);
    return session;
  }

  async submitFeedback(
    sessionId: string,
    data: FeedbackDto,
    createdBy: string
  ) {
    const parsedSessionId = this.parseObjectId(sessionId, 'Session ID');
    const candidateId = this.parseObjectId(data.candidateId, 'Candidate ID');
    const session = await Session.findOne({ _id: parsedSessionId, createdBy });
    if (!session) throw new AppError('Session not found', 404);
    if (session.status !== 'completed') {
      throw new AppError('Session has not completed yet', 400);
    }

    const result = session.rankedResults.find(
      (r) => r.candidateId.toString() === candidateId.toString()
    );
    if (!result) throw new AppError('Candidate not found in this session', 404);

    result.feedbackStatus = data.action;
    if (data.action === 'overridden' && data.adjustedScore !== undefined) {
      result.finalScore = data.adjustedScore;
    }

    await session.save();

    await Candidate.findOneAndUpdate(
      {
        _id:                          candidateId,
        'evaluationHistory.sessionId': parsedSessionId,
      },
      {
        $set: {
          'evaluationHistory.$.finalScore': result.finalScore,
        },
      }
    );

    return this.findOne(sessionId, createdBy);
  }
}
