const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true },
    wins:       { type: Number, default: 0 },
    losses:     { type: Number, default: 0 },
    draws:      { type: Number, default: 0 },
    gameMode:   { type: String, enum: ['ai', 'friend'], required: true },
    gridSize:   { type: Number, enum: [3, 5, 7], required: true },
  },
  { timestamps: true }
);

// One document per player + mode + grid combination
ScoreSchema.index({ playerName: 1, gameMode: 1, gridSize: 1 }, { unique: true });

module.exports = mongoose.model('Score', ScoreSchema);
