import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED'],
      default: 'APPLIED',
    },
    notes: {
      type: String, // For hiring managers to add notes
    },
    coverLetter: {
      type: String, // From candidate
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only apply to a job once
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
