import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ScoreContext = createContext(null);

const INIT = {
  player1: { wins: 0, losses: 0, draws: 0 },
  player2: { wins: 0, losses: 0, draws: 0 },
  ai:      { wins: 0, losses: 0, draws: 0 },
};

export function ScoreProvider({ children }) {
  const [scores, setScores] = useState(() => {
    try {
      const raw = localStorage.getItem('ttt_scores');
      return raw ? JSON.parse(raw) : INIT;
    } catch {
      return INIT;
    }
  });

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem('ttt_scores', JSON.stringify(scores));
  }, [scores]);

  // Update a player's score locally
  const updateScore = useCallback((player, result) => {
    setScores((prev) => ({
      ...prev,
      [player]: {
        ...prev[player],
        [result]: (prev[player]?.[result] ?? 0) + 1,
      },
    }));
  }, []);

  // Fire-and-forget backend sync (game works fine if backend is offline)
  const syncBackend = useCallback(async (playerName, result, gameMode, gridSize) => {
    try {
      await fetch('/api/scores/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, result, gameMode, gridSize }),
      });
    } catch {
      // Backend offline — localStorage already has the data
    }
  }, []);

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
