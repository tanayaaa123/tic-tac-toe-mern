const mongoose = require('mongoose');

/* Schema for storing each player's game stats.
   One record per player + mode combination. */
const ScoreSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true, trim: true },
    wins:       { type: Number, default: 0 },
    losses:     { type: Number, default: 0 },
    draws:      { type: Number, default: 0 },
    gameMode:   { type: String, enum: ['ai', 'friend'], required: true },
    gridSize:   { type: Number, default: 3 }, // always 3 for 3x3
  },
  { timestamps: true }
);

/* Unique index — one document per player + mode */
ScoreSchema.index({ playerName: 1, gameMode: 1 }, { unique: true });

module.exports = mongoose.model('Score', ScoreSchema);
