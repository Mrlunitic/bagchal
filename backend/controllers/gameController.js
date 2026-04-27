const Game = require('../models/Game');
const User = require('../models/User');

// POST /api/game/save-result
const saveResult = async (req, res) => {
  const { result, mode, side, capturedGoats, duration } = req.body;

  if (!result || !['win', 'loss', 'draw'].includes(result)) {
    return res.status(400).json({ message: 'Invalid result. Must be win, loss, or draw.' });
  }

  try {
    const game = await Game.create({
      userId: req.user._id,
      result,
      mode: mode || 'pvp',
      side: side || 'goat',
      capturedGoats: capturedGoats || 0,
      duration: duration || 0,
    });

    // Update user stats
    const update = { $inc: { gamesPlayed: 1 } };
    if (result === 'win') update.$inc.wins = 1;
    else if (result === 'loss') update.$inc.losses = 1;

    await User.findByIdAndUpdate(req.user._id, update);

    res.status(201).json({ message: 'Game saved successfully', game });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/game/history
const getHistory = async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/game/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const topPlayers = await User.find()
      .select('name wins losses gamesPlayed')
      .sort({ wins: -1 })
      .limit(10);
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { saveResult, getHistory, getLeaderboard };
