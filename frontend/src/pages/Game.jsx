import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBestMove, checkWinner, getWinLength, getWinningLine } from "../utils/minimax.jsx"
import { useScores } from '../context/ScoreContext.jsx';

// Confetti
const CONF_COLORS = ['#4f7fff', '#ff4d7d', '#00d4ff', '#ffd700', '#00e5a0', '#ff9f43', '#a78bfa'];

function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    color: CONF_COLORS[i % CONF_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    dur:   `${2.2 + Math.random() * 1.8}s`,
    size:  `${6 + Math.random() * 8}px`,
    round: Math.random() > 0.5 ? '50%' : '2px',
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
            width: p.size,
            height: p.size,
            borderRadius: p.round,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}
    </>
  );
}

//  Single Board Cell 
function Cell({ value, onClick, isWin, size }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value) { setAnimate(true); }
  }, [value]);

  const cellPx = size;
  const fontPx = Math.round(size * 0.44);
  const isX = value === 'X';
  const colVar  = isX ? 'var(--x-col)' : 'var(--o-col)';
  const glowVar = isX ? 'var(--x-glow)' : 'var(--o-glow)';

  return (
    <div
      onClick={onClick}
      style={{
        width: cellPx,
        height: cellPx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontPx,
        fontFamily: 'Orbitron, monospace',
        fontWeight: 900,
        cursor: value ? 'default' : 'pointer',
        border: `1.5px solid ${isWin ? 'var(--win)' : value ? (isX ? 'color-mix(in srgb,var(--x-col) 35%,transparent)' : 'color-mix(in srgb,var(--o-col) 35%,transparent)') : 'var(--border)'}`,
        borderRadius: 10,
        background: isWin ? 'color-mix(in srgb,var(--win) 10%,transparent)' : 'var(--card)',
        boxShadow: isWin
          ? '0 0 22px var(--win-glow), inset 0 0 14px color-mix(in srgb,var(--win) 8%,transparent)'
          : value ? `0 0 10px ${glowVar}` : 'none',
        color: colVar,
        textShadow: value ? `0 0 18px ${glowVar}` : 'none',
        animation: animate && value ? 'cellDrop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : (isWin ? 'winPulse 1.4s ease infinite' : 'none'),
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.3s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!value) {
          e.currentTarget.style.background = 'var(--card-hover)';
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.transition = 'all 0.18s ease';
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

// Score Row 
function ScoreRow({ name, sym, wins, losses, draws, symColor, symGlow }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 100 }}>
      <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.5rem', color: symColor, textShadow: `0 0 14px ${symGlow}` }}>{sym}</span>
      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text2)' }}>{name}</span>
      <div style={{ display: 'flex', gap: 7, fontSize: '0.78rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--success)' }}>{wins}W</span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--danger)' }}>{losses}L</span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>{draws}D</span>
      </div>
    </div>
  );
}

// Result Overlay 
function ResultOverlay({ emoji, msg, onAgain, onHome, isWin }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 500,
      animation: 'fadeIn 0.3s ease',
    }}>
      {isWin && <Confetti />}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-hi)',
        borderRadius: 'var(--radius-l)',
        padding: '48px 52px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        animation: 'resultPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        maxWidth: 340,
        width: '90vw',
      }}>
        <div style={{ fontSize: '4rem', lineHeight: 1, animation: 'float 2.5s ease-in-out infinite' }}>{emoji}</div>
        <h2 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(1.3rem,4vw,1.9rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {msg}
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onAgain}>↺ Play Again</button>
          <button className="btn btn-outline"  onClick={onHome}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}

// Calculate responsive cell size 
function calcCellSize(gridSize) {
  const available = Math.min(window.innerWidth - 64, 580);
  const maxGrid   = gridSize === 3 ? 340 : gridSize === 5 ? 460 : 530;
  const gridPx    = Math.min(available, maxGrid);
  return Math.floor((gridPx - (gridSize - 1) * 6) / gridSize);
}

// Main Game Component
export default function Game() {
  const { mode, gridSize } = useParams();
  const navigate = useNavigate();
  const { scores, updateScore, syncBackend } = useScores();

  const N      = parseInt(gridSize);
  const winLen = getWinLength(N);
  const isAi   = mode === 'ai';
  const TOTAL  = N * N;

  const P1 = 'Player 1';
  const P2 = isAi ? 'AI' : 'Player 2';

  //  State
  const [board,       setBoard]       = useState(() => Array(TOTAL).fill(null));
  const [turn,        setTurn]        = useState('X');   // 'X' or 'O'
  const [winner,      setWinner]      = useState(null);  // 'X' | 'O' | 'draw'
  const [winLine,     setWinLine]     = useState([]);
  const [over,        setOver]        = useState(false);
  const [thinking,    setThinking]    = useState(false);
  const [resultMsg,   setResultMsg]   = useState('');
  const [resultEmoji, setResultEmoji] = useState('');
  const [cellPx,      setCellPx]      = useState(() => calcCellSize(N));
  const scoreRecorded = useRef(false);

  //  Resize handler
  useEffect(() => {
    const handle = () => setCellPx(calcCellSize(N));
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [N]);

  // Detect winner after board changes 
  useEffect(() => {
    if (scoreRecorded.current) return;

    const result = checkWinner(board, N, winLen);
    if (!result) return;

    const line = getWinningLine(board, N, winLen) || [];
    setWinLine(line);
    setWinner(result);
    setOver(true);
    scoreRecorded.current = true;

    if (result === 'draw') {
      setResultEmoji('🤝');
      setResultMsg("It's a Draw!");
      updateScore('player1', 'draws');
      if (isAi) {
        updateScore('ai', 'draws');
        syncBackend(P1, 'draw', 'ai', N);
      } else {
        updateScore('player2', 'draws');
        syncBackend(P1, 'draw', 'friend', N);
        syncBackend(P2, 'draw', 'friend', N);
      }
    } else if (result === 'X') {
      setResultEmoji(isAi ? '🎉' : '🏆');
      setResultMsg(isAi ? 'You Win!' : 'Player 1 Wins!');
      updateScore('player1', 'wins');
      if (isAi) {
        updateScore('ai', 'losses');
        syncBackend(P1, 'win', 'ai', N);
      } else {
        updateScore('player2', 'losses');
        syncBackend(P1, 'win', 'friend', N);
        syncBackend(P2, 'loss', 'friend', N);
      }
    } else {
      // 'O' wins
      setResultEmoji(isAi ? '🤖' : '🏆');
      setResultMsg(isAi ? 'AI Wins!' : 'Player 2 Wins!');
      updateScore('player1', 'losses');
      if (isAi) {
        updateScore('ai', 'wins');
        syncBackend(P1, 'loss', 'ai', N);
      } else {
        updateScore('player2', 'wins');
        syncBackend(P1, 'loss', 'friend', N);
        syncBackend(P2, 'win', 'friend', N);
      }
    }
  }, [board]);

  // AI move trigger 
  useEffect(() => {
    if (!isAi || turn !== 'O' || over) return;

    setThinking(true);
    const delay = N === 3 ? 420 : N === 5 ? 650 : 900;

    const t = setTimeout(() => {
      const copy = [...board];
      const best = getBestMove(copy, N, winLen);
      if (best !== -1 && best !== undefined) {
        const next = [...board];
        next[best] = 'O';
        setBoard(next);
        setTurn('X');
      }
      setThinking(false);
    }, delay);

    return () => clearTimeout(t);
  }, [turn, over]);

  //Click handler 
  const handleClick = useCallback((idx) => {
    if (board[idx] || over || thinking) return;
    if (isAi && turn === 'O') return;

    const next = [...board];
    next[idx]  = turn;
    setBoard(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  }, [board, over, thinking, turn, isAi]);

  // Reset 
  const reset = useCallback(() => {
    setBoard(Array(TOTAL).fill(null));
    setTurn('X');
    setWinner(null);
    setWinLine([]);
    setOver(false);
    setResultMsg('');
    setResultEmoji('');
    setThinking(false);
    scoreRecorded.current = false;
  }, [TOTAL]);

  //  Derived 
  const p1Scores = scores.player1;
  const p2Scores = isAi ? scores.ai : scores.player2;
  const turnCol  = turn === 'X' ? 'var(--x-col)' : 'var(--o-col)';
  const turnGlow = turn === 'X' ? 'var(--x-glow)' : 'var(--o-glow)';

  const turnLabel = isAi
    ? (turn === 'X' ? `Your Turn  (${P1})` : 'AI is thinking...')
    : (turn === 'X' ? `${P1}'s Turn` : `${P2}'s Turn`);

  return (
    <div className="page" style={{ paddingTop: 28, gap: 20 }}>
      {/* Result overlay */}
      {over && (
        <ResultOverlay
          emoji={resultEmoji}
          msg={resultMsg}
          isWin={winner !== 'draw'}
          onAgain={reset}
          onHome={() => navigate('/')}
        />
      )}

      {/*  Scoreboard  */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-m)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        flexWrap: 'wrap',
        justifyContent: 'center',
        animation: 'fadeUp 0.4s ease both',
      }}>
        <ScoreRow
          name={P1}
          sym="X"
          wins={p1Scores.wins}
          losses={p1Scores.losses}
          draws={p1Scores.draws}
          symColor="var(--x-col)"
          symGlow="var(--x-glow)"
        />
        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '2px' }}>VS</div>
        <ScoreRow
          name={P2}
          sym="O"
          wins={p2Scores.wins}
          losses={p2Scores.losses}
          draws={p2Scores.draws}
          symColor="var(--o-col)"
          symGlow="var(--o-glow)"
        />
      </div>

      {/* Turn Indicator */}
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        {thinking ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: 'var(--o-col)', fontWeight: 700, fontSize: '0.95rem' }}>AI thinking</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.2rem', color: turnCol, textShadow: `0 0 14px ${turnGlow}` }}>
              {turn}
            </span>
            <span style={{ color: 'var(--text2)', fontSize: '0.9rem', fontWeight: 600 }}>{turnLabel}</span>
          </div>
        )}
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4, letterSpacing: '0.5px' }}>
          {N}×{N} grid · {winLen} in a row to win
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, ${cellPx}px)`,
          gap: '6px',
          padding: '14px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-m)',
          boxShadow: 'var(--shadow-m)',
          animation: 'fadeUp 0.45s ease 0.15s both',
        }}
      >
        {board.map((cell, idx) => (
          <Cell
            key={idx}
            value={cell}
            onClick={() => handleClick(idx)}
            isWin={winLine.includes(idx)}
            size={cellPx}
          />
        ))}
      </div>

      {/* Action Buttons  */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.45s ease 0.2s both' }}>
        <button className="btn btn-outline btn-sm" onClick={reset}>
          ↺ Reset Board
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/select/${mode}`)}>
          ⊞ Change Grid
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
           Home
        </button>
      </div>
    </div>
  );
}
