import { Request, Response } from 'express';
import { Job } from './jobs.model';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching jobs' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const newJob = await Job.create(req.body);
    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid job data' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching job details' });
  }
};
