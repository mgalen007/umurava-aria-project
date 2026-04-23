import { Job } from './jobs.model';
import { CreateJobDto, UpdateJobDto } from './jobs.dto';
import { AppError } from '../../middleware/error';

export class JobsService {

  async create(data: CreateJobDto, createdBy: string) {
    const job = await Job.create({ ...data, createdBy });
    return job;
  }

  async findAll(createdBy: string) {
    const jobs = await Job.find({ createdBy }).sort({ createdAt: -1 });
    return jobs;
  }

  async findOne(id: string, createdBy: string) {
    const job = await Job.findOne({ _id: id, createdBy });
    if (!job) throw new AppError('Job not found', 404);
    return job;
  }

  async update(id: string, data: UpdateJobDto, createdBy: string) {
    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy },
      data,
      { returnDocument: 'after' }
    );
    if (!job) throw new AppError('Job not found', 404);
    return job;
  }

  async remove(id: string, createdBy: string) {
    const job = await Job.findOneAndDelete({ _id: id, createdBy });
    if (!job) throw new AppError('Job not found', 404);
  }
}
