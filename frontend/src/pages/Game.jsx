import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBestMove, checkWinner, getWinningLine } from '../utils/minimax.jsx';
import { useScores } from '../context/ScoreContext.jsx';

/* Confetti pieces shown when someone wins */
const CONF_COLORS = ['#4f7fff', '#ff4d7d', '#00d4ff', '#ffd700', '#00e5a0', '#a78bfa'];

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONF_COLORS[i % CONF_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    dur: `${2 + Math.random() * 2}s`,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            top: '-16px',
            background: p.color,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

/* Single board cell */
function Cell({ value, onClick, isWin }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 100,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 42,
        fontWeight: 900,
        fontFamily: 'Orbitron, monospace',
        border: `1.5px solid ${isWin ? 'var(--win)' : value ? (value === 'X' ? 'rgba(255,77,125,0.3)' : 'rgba(79,127,255,0.3)') : 'var(--border)'}`,
        borderRadius: 10,
        cursor: value ? 'default' : 'pointer',
        background: isWin
          ? 'color-mix(in srgb, var(--win) 10%, transparent)'
          : 'var(--card)',
        color: value === 'X' ? 'var(--x-col)' : 'var(--o-col)',
        textShadow: value
          ? `0 0 16px ${value === 'X' ? 'var(--x-glow)' : 'var(--o-glow)'}`
          : 'none',
        boxShadow: isWin ? '0 0 20px var(--win-glow)' : 'none',
        animation: isWin ? 'winPulse 1.4s ease infinite' : 'none',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.3s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!value) {
          e.currentTarget.style.background = 'var(--card-hover)';
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.transition = 'all 0.15s ease';
        }
      }}
      onMouseLeave={(e) => {
        if (!value) {
          e.currentTarget.style.background = 'var(--card)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {value}
    </div>
  );
}

/* Score block shown for each player above the board */
function ScoreBlock({ name, symbol, wins, losses, draws, symColor, symGlow }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 110 }}>
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.4rem',
        fontWeight: 900,
        color: symColor,
        textShadow: `0 0 12px ${symGlow}`,
      }}>
        {symbol}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text2)', marginTop: 2 }}>
        {name}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4, fontSize: '0.8rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--success)' }}>{wins}W</span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--danger)' }}>{losses}L</span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>{draws}D</span>
      </div>
    </div>
  );
}

/* Popup overlay shown when the game ends */
function ResultOverlay({ emoji, message, isWin, onPlayAgain, onHome }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.70)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Only show confetti when someone wins (not for draw) */}
      {isWin && <Confetti />}

      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hi)',
        borderRadius: 22,
        padding: '44px 50px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'resultPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        maxWidth: 320,
        width: '90vw',
      }}>
        <div style={{ fontSize: '3.5rem', lineHeight: 1, animation: 'float 2.5s ease-in-out infinite' }}>
          {emoji}
        </div>
        <h2 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(1.2rem,4vw,1.7rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {message}
        </h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={onPlayAgain}>
            ↺ Play Again
          </button>
          <button className="btn btn-outline" onClick={onHome}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Game Component ─────────────────────────────────────── */
export default function Game() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { scores, updateScore, syncBackend } = useScores();

  const isAi = mode === 'ai';

  // Board state: 9 cells, each null | 'X' | 'O'
  const [board, setBoard]       = useState(Array(9).fill(null));
  const [turn, setTurn]         = useState('X');       // whose turn
  const [winLine, setWinLine]   = useState([]);        // winning cell indexes
  const [over, setOver]         = useState(false);     // game finished
  const [resultMsg, setResultMsg] = useState('');
  const [resultEmoji, setResultEmoji] = useState('');
  const [isWin, setIsWin]       = useState(false);     // true = someone won (not draw)
  const [aiThinking, setAiThinking] = useState(false);

  // Ref to avoid recording the score twice
  const scoreRecorded = useRef(false);

  /* Check for a winner every time the board changes */
  useEffect(() => {
    if (scoreRecorded.current) return;

    const result = checkWinner(board);
    if (!result) return;

    // Game is over — lock it
    setOver(true);
    scoreRecorded.current = true;
    setWinLine(getWinningLine(board) || []);

    if (result === 'X') {
      // Player 1 wins
      setIsWin(true);
      setResultEmoji(isAi ? '🎉' : '🏆');
      setResultMsg(isAi ? 'You Win!' : 'Player 1 Wins!');
      updateScore('player1', 'wins');
      if (isAi) {
        updateScore('ai', 'losses');
        syncBackend('Player 1', 'win', 'ai');
      } else {
        updateScore('player2', 'losses');
        syncBackend('Player 1', 'win', 'friend');
        syncBackend('Player 2', 'loss', 'friend');
      }

    } else if (result === 'O') {
      // O wins (AI or Player 2)
      setIsWin(true);
      setResultEmoji(isAi ? '🤖' : '🏆');
      setResultMsg(isAi ? 'AI Wins!' : 'Player 2 Wins!');
      updateScore('player1', 'losses');
      if (isAi) {
        updateScore('ai', 'wins');
        syncBackend('Player 1', 'loss', 'ai');
      } else {
        updateScore('player2', 'wins');
        syncBackend('Player 1', 'loss', 'friend');
        syncBackend('Player 2', 'win', 'friend');
      }

    } else {
      // Draw
      setIsWin(false);
      setResultEmoji('🤝');
      setResultMsg("It's a Draw!");
      updateScore('player1', 'draws');
      if (isAi) {
        updateScore('ai', 'draws');
        syncBackend('Player 1', 'draw', 'ai');
      } else {
        updateScore('player2', 'draws');
        syncBackend('Player 1', 'draw', 'friend');
        syncBackend('Player 2', 'draw', 'friend');
      }
    }
  }, [board]);

  /* AI makes its move after a short delay */
  useEffect(() => {
    if (!isAi || turn !== 'O' || over) return;

    setAiThinking(true);

    const timer = setTimeout(() => {
      const bestCell = getBestMove([...board]);
      if (bestCell !== -1) {
        const newBoard = [...board];
        newBoard[bestCell] = 'O';
        setBoard(newBoard);
        setTurn('X');
      }
      setAiThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [turn, over]);

  /* Handle player clicking a cell */
  function handleClick(index) {
    if (board[index] || over || aiThinking) return;
    if (isAi && turn === 'O') return; // wait for AI

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    setTurn(turn === 'X' ? 'O' : 'X');
  }

  /* Reset everything for a new game */
  function resetGame() {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinLine([]);
    setOver(false);
    setResultMsg('');
    setResultEmoji('');
    setIsWin(false);
    setAiThinking(false);
    scoreRecorded.current = false;
  }

  // Get score data for display
  const p1Scores = scores.player1;
  const p2Scores = isAi ? scores.ai : scores.player2;

  // Turn indicator colors
  const turnColor = turn === 'X' ? 'var(--x-col)' : 'var(--o-col)';
  const turnGlow  = turn === 'X' ? 'var(--x-glow)' : 'var(--o-glow)';

  return (
    <div className="page" style={{ paddingTop: 28, gap: 22 }}>

      {/* Result overlay — only visible when game is over */}
      {over && (
        <ResultOverlay
          emoji={resultEmoji}
          message={resultMsg}
          isWin={isWin}
          onPlayAgain={resetGame}
          onHome={() => navigate('/')}
        />
      )}

      {/* ── Scoreboard ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <ScoreBlock
          name="Player 1"
          symbol="X"
          wins={p1Scores.wins}
          losses={p1Scores.losses}
          draws={p1Scores.draws}
          symColor="var(--x-col)"
          symGlow="var(--x-glow)"
        />
        <div style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '0.7rem',
          fontWeight: 900,
          color: 'var(--muted)',
          letterSpacing: '2px',
        }}>
          VS
        </div>
        <ScoreBlock
          name={isAi ? 'AI' : 'Player 2'}
          symbol="O"
          wins={p2Scores.wins}
          losses={p2Scores.losses}
          draws={p2Scores.draws}
          symColor="var(--o-col)"
          symGlow="var(--o-glow)"
        />
      </div>

      {/* ── Turn Indicator ── */}
      <div style={{ textAlign: 'center' }}>
        {aiThinking ? (
          /* AI thinking animation */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: 'var(--o-col)', fontWeight: 700, fontSize: '0.95rem' }}>
              AI is thinking
            </span>
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'Orbitron, monospace',
              fontWeight: 900,
              fontSize: '1.2rem',
              color: turnColor,
              textShadow: `0 0 12px ${turnGlow}`,
            }}>
              {turn}
            </span>
            <span style={{ color: 'var(--text2)', fontSize: '0.9rem', fontWeight: 600 }}>
              {isAi
                ? (turn === 'X' ? "'s Turn (You)" : "'s Turn (AI)")
                : (turn === 'X' ? "'s Turn (Player 1)" : "'s Turn (Player 2)")}
            </span>
          </div>
        )}
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
          3 in a row to win
        </div>
      </div>

      {/* ── Game Board (3×3 grid) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gap: 8,
        padding: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-m)',
      }}>
        {board.map((cell, i) => (
          <Cell
            key={i}
            value={cell}
            onClick={() => handleClick(i)}
            isWin={winLine.includes(i)}
          />
        ))}
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-outline btn-sm" onClick={resetGame}>
          ↺ Reset Board
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
          🏠 Home
        </button>
      </div>

    </div>
  );
}
