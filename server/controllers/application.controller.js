import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Student
export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applicationExists = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (applicationExists) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const { coverLetter } = req.body;

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      coverLetter,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private/Student
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location status')
      .sort('-createdAt');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a job (Manager only)
// @route   GET /api/applications/job/:jobId
// @access  Private/HiringManager
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate({
        path: 'applicant',
        select: 'name email',
      })
      .sort('-createdAt');

    // Fetch profiles for each applicant
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await import('../models/Profile.js').then((module) =>
          module.default.findOne({ user: app.applicant._id })
        );
        return {
          ...app.toObject(),
          profile: profile || null,
        };
      })
    );

    res.json(applicationsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/HiringManager
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status || application.status;
    application.notes = notes || application.notes;

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
