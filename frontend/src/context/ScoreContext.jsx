import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ScoreContext = createContext(null);

/* Default score state for all three players */
const INIT = {
  player1: { wins: 0, losses: 0, draws: 0 },
  player2: { wins: 0, losses: 0, draws: 0 },
  ai:      { wins: 0, losses: 0, draws: 0 },
};

export function ScoreProvider({ children }) {
  const [scores, setScores] = useState(() => {
    // Load saved scores from localStorage on first load
    try {
      const saved = localStorage.getItem('ttt_scores');
      return saved ? JSON.parse(saved) : INIT;
    } catch {
      return INIT;
    }
  });

  /* Save scores to localStorage every time they change */
  useEffect(() => {
    localStorage.setItem('ttt_scores', JSON.stringify(scores));
  }, [scores]);

  /* Add 1 to a player's wins/losses/draws */
  const updateScore = useCallback((player, result) => {
    setScores((prev) => ({
      ...prev,
      [player]: {
        ...prev[player],
        [result]: (prev[player]?.[result] ?? 0) + 1,
      },
    }));
  }, []);

  /* Try to save to MongoDB backend — works silently if backend is offline */
  const syncBackend = useCallback(async (playerName, result, gameMode) => {
    try {
      await fetch('/api/scores/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // gridSize is always 3 since we only have 3x3
        body: JSON.stringify({ playerName, result, gameMode }),
      });
    } catch {
      // Backend not running — localStorage already saved the data
    }
  }, []);

  /* Wipe all scores (button on home page) */
  const resetScores = useCallback(() => {
    setScores(INIT);
    localStorage.removeItem('ttt_scores');
  }, []);

  return (
    <ScoreContext.Provider value={{ scores, updateScore, syncBackend, resetScores }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScores() {
  return useContext(ScoreContext);
}
