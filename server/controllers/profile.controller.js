import Profile from '../models/Profile.js';

// @desc    Get user profile
// @route   GET /api/profiles/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profiles/me
// @access  Private
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { bio, skills, resumeUrl, portfolio, github, linkedin } = req.body;

    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.skills = skills !== undefined ? skills : profile.skills;
    profile.resumeUrl = resumeUrl !== undefined ? resumeUrl : profile.resumeUrl;
    profile.portfolio = portfolio !== undefined ? portfolio : profile.portfolio;
    profile.github = github !== undefined ? github : profile.github;
    profile.linkedin = linkedin !== undefined ? linkedin : profile.linkedin;

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile by user id
// @route   GET /api/profiles/:userId
// @access  Private/HiringManager
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
