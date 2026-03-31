const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

/* GET /api/scores — get all scores sorted by wins */
router.get('/', async (_req, res) => {
  try {
    const data = await Score.find().sort({ wins: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* GET /api/scores/player/:name — get scores for a specific player */
router.get('/player/:name', async (req, res) => {
  try {
    const data = await Score.find({ playerName: req.params.name });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* GET /api/scores/leaderboard/:gameMode — top 10 for ai or friend mode */
router.get('/leaderboard/:gameMode', async (req, res) => {
  try {
    const data = await Score.find({ gameMode: req.params.gameMode, gridSize: 3 })
      .sort({ wins: -1 })
      .limit(10);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* POST /api/scores/update — save a game result
   Body: { playerName, result ('win'|'loss'|'draw'), gameMode ('ai'|'friend') } */
router.post('/update', async (req, res) => {
  try {
    const { playerName, result, gameMode } = req.body;

    // Validate required fields
    if (!playerName || !result || !gameMode) {
      return res.status(400).json({
        success: false,
        error: 'playerName, result, and gameMode are required',
      });
    }

    if (!['win', 'loss', 'draw'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: 'result must be win, loss, or draw',
      });
    }

    // Map result to the correct field name
    const field = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws';

    // Find existing record or create a new one (upsert)
    const score = await Score.findOneAndUpdate(
      { playerName, gameMode, gridSize: 3 }, // always 3x3
      { $inc: { [field]: 1 } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* DELETE /api/scores/reset/:name — delete all scores for a player */
router.delete('/reset/:name', async (req, res) => {
  try {
    await Score.deleteMany({ playerName: req.params.name });
    res.json({ success: true, message: 'Scores reset' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
