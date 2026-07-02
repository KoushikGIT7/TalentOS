import User from '../models/User.js';
import Profile from '../models/Profile.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcrypt';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'STUDENT',
    });

    if (user) {
      // Create empty profile for the user
      await Profile.create({ user: user._id });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's saved jobs
// @route   GET /api/auth/saved-jobs
// @access  Private
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a job
// @route   POST /api/auth/saved-jobs/:jobId
// @access  Private
export const saveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedJobs.includes(req.params.jobId)) {
      user.savedJobs.push(req.params.jobId);
      await user.save();
    }
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsave a job
// @route   DELETE /api/auth/saved-jobs/:jobId
// @access  Private
export const unsaveJob = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedJobs = user.savedJobs.filter(
      (id) => id.toString() !== req.params.jobId
    );
    await user.save();
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
