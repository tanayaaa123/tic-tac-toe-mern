const express = require('express');
const router  = express.Router();
const Score   = require('../models/Score');

// GET  /api/scores  — all scores sorted by wins
router.get('/', async (_req, res) => {
  try {
    const data = await Score.find().sort({ wins: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET  /api/scores/player/:name  — scores for one player
router.get('/player/:name', async (req, res) => {
  try {
    const data = await Score.find({ playerName: req.params.name });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET  /api/scores/leaderboard/:gameMode/:gridSize
router.get('/leaderboard/:gameMode/:gridSize', async (req, res) => {
  try {
    const { gameMode, gridSize } = req.params;
    const data = await Score.find({
      gameMode,
      gridSize: parseInt(gridSize),
    })
      .sort({ wins: -1 })
      .limit(10);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scores/update
// body: { playerName, result ('win'|'loss'|'draw'), gameMode, gridSize }
router.post('/update', async (req, res) => {
  try {
    const { playerName, result, gameMode, gridSize } = req.body;

    if (!playerName || !result || !gameMode || !gridSize) {
      return res
        .status(400)
        .json({ success: false, error: 'playerName, result, gameMode and gridSize are required' });
    }

    if (!['win', 'loss', 'draw'].includes(result)) {
      return res.status(400).json({ success: false, error: 'result must be win | loss | draw' });
    }

    const field = result === 'win' ? 'wins' : result === 'loss' ? 'losses' : 'draws';

    const score = await Score.findOneAndUpdate(
      { playerName, gameMode, gridSize: parseInt(gridSize) },
      { $inc: { [field]: 1 } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/scores/reset/:name
router.delete('/reset/:name', async (req, res) => {
  try {
    await Score.deleteMany({ playerName: req.params.name });
    res.json({ success: true, message: 'Scores reset' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
