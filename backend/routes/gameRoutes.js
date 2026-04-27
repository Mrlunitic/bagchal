const express = require('express');
const router = express.Router();
const { saveResult, getHistory, getLeaderboard } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.post('/save-result', protect, saveResult);
router.get('/history', protect, getHistory);
router.get('/leaderboard', getLeaderboard); // public

module.exports = router;
