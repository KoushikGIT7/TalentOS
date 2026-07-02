import Job from '../models/Job.js';
import { getExternalJobs } from '../services/externalJobProvider.js';

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/HiringManager
export const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      creator: req.user._id,
    });
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs (mixes internal and external)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const keywordQuery = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { company: { $regex: req.query.keyword, $options: 'i' } },
            { location: { $regex: req.query.keyword, $options: 'i' } },
            { skills: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    // Fetch internal and external jobs concurrently for maximum speed
    const [internalJobs, externalJobs] = await Promise.all([
      Job.find({ ...keywordQuery }).populate('creator', 'name'),
      getExternalJobs(req.query.keyword)
    ]);

    // Mix them
    const allJobs = [...internalJobs, ...externalJobs];
    res.json(allJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    // If it's an external job (from remotive, we shouldn't really hit this endpoint for it unless we cache them, 
    // but we can just handle internal jobs here since external jobs link out directly)
    if (req.params.id.startsWith('ext_')) {
       return res.status(404).json({ message: 'External jobs do not have internal details pages.' });
    }

    const job = await Job.findById(req.params.id).populate('creator', 'name');
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/HiringManager
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      // Check if user is the creator
      if (job.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this job' });
      }

      Object.assign(job, req.body);
      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/HiringManager
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this job' });
      }

      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
