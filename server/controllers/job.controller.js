import Job from '../models/Job.js';
import axios from 'axios';

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
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { company: { $regex: req.query.keyword, $options: 'i' } },
            { location: { $regex: req.query.keyword, $options: 'i' } },
            { skills: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const internalJobs = await Job.find({ ...keyword }).populate('creator', 'name');
    
    // Fetch external jobs from Remotive API as a simple scraper
    let externalJobs = [];
    try {
      const response = await axios.get('https://remotive.com/api/remote-jobs?limit=10');
      
      externalJobs = response.data.jobs.map(job => ({
        _id: `ext_${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: job.description,
        salary: job.salary,
        type: job.job_type,
        isExternal: true,
        externalUrl: job.url,
        createdAt: job.publication_date,
      }));

      // Basic filtering for external jobs if keyword exists
      if (req.query.keyword) {
        const kw = req.query.keyword.toLowerCase();
        externalJobs = externalJobs.filter(job => 
          job.title.toLowerCase().includes(kw) ||
          job.company.toLowerCase().includes(kw) ||
          job.location.toLowerCase().includes(kw)
        );
      }
    } catch (err) {
      console.error('Error fetching external jobs:', err.message);
      // Fail silently for external API so internal jobs still load
    }

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
