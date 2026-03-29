const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const scoreRoutes = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tictactoe';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => console.error('❌  MongoDB error:', err.message));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/scores', scoreRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server listening on http://localhost:${PORT}`);
});
