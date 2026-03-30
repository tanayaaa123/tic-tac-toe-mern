
const express = require('express');
const router  = express.Router();
const Score   = require('../models/Score');

// GET all scores
router.get('/', async (_req, res) => {
  try {
    const data = await Score.find().sort({ wins: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET scores for one player
router.get('/player/:name', async (req, res) => {
  try {
    const data = await Score.find({ playerName: req.params.name });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET leaderboard (3x3 only)
router.get('/leaderboard/:gameMode', async (req, res) => {
  try {
    const { gameMode } = req.params;

    const data = await Score.find({
      gameMode,
      gridSize: 3, 
    })
      .sort({ wins: -1 })
      .limit(10);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST update score
router.post('/update', async (req, res) => {
  try {
    const { playerName, result, gameMode } = req.body;

    if (!playerName || !result || !gameMode) {
      return res.status(400).json({
        success: false,
        error: 'playerName, result, gameMode are required',
      });
    }

    if (!['win', 'loss', 'draw'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: 'result must be win | loss | draw',
      });
    }

    const field =
      result === 'win' ? 'wins' :
      result === 'loss' ? 'losses' :
      'draws';

    const score = await Score.findOneAndUpdate(
      { playerName, gameMode, gridSize: 3 }, 
      { $inc: { [field]: 1 } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE reset scores
router.delete('/reset/:name', async (req, res) => {
  try {
    await Score.deleteMany({ playerName: req.params.name });
    res.json({ success: true, message: 'Scores reset' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
