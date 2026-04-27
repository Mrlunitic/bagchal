const User = require('../models/User');

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      gamesPlayed: user.gamesPlayed,
      wins: user.wins,
      losses: user.losses,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/user/update
const updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      gamesPlayed: user.gamesPlayed,
      wins: user.wins,
      losses: user.losses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
