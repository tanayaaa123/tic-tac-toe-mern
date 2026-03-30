
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBestMove, checkWinner, getWinningLine } from "../utils/minimax.jsx";
import { useScores } from '../context/ScoreContext.jsx';

// Confetti
const CONF_COLORS = ['#4f7fff', '#ff4d7d', '#00d4ff', '#ffd700', '#00e5a0'];

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: CONF_COLORS[i % CONF_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random()}s`,
  }));

  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti" style={{
          left: p.left,
          background: p.color,
          animationDelay: p.delay
        }} />
      ))}
    </>
  );
}

// Cell
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
        fontSize: 40,
        fontWeight: 900,
        border: `1.5px solid ${isWin ? 'var(--win)' : 'var(--border)'}`,
        borderRadius: 10,
        cursor: value ? 'default' : 'pointer',
        background: isWin
          ? 'color-mix(in srgb, var(--win) 15%, transparent)'
          : 'var(--card)',
        color: value === 'X' ? 'var(--x-col)' : 'var(--o-col)',
        boxShadow: value
          ? `0 0 12px ${value === 'X' ? 'var(--x-glow)' : 'var(--o-glow)'}`
          : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      {value}
    </div>
  );
}

// Score Row
function ScoreRow({ name, wins, losses, draws }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700 }}>{name}</div>
      <div>{wins}W - {losses}L - {draws}D</div>
    </div>
  );
}

// Winner Popup
function ResultOverlay({ msg, onAgain, onHome }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    }}>
      <Confetti />

      <div style={{
        background: 'var(--card)',
        padding: '30px 40px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        minWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          marginBottom: 10
        }}>
          {msg}
        </h2>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          marginTop: 15
        }}>
          <button className="btn btn-primary" onClick={onAgain}>
            Play Again
          </button>

          <button className="btn btn-outline" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { scores, updateScore } = useScores();

  const isAi = mode === 'ai';

  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState([]);
  const [over, setOver] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  // Winner check
  useEffect(() => {
    const result = checkWinner(board, 3, 3);
    if (!result) return;

    setWinner(result);
    setWinLine(getWinningLine(board, 3, 3) || []);
    setOver(true);

    if (result === 'X') {
      setResultMsg('Player 1 Wins!');
      updateScore('player1', 'wins');
    } else if (result === 'O') {
      setResultMsg(isAi ? 'AI Wins!' : 'Player 2 Wins!');
      updateScore(isAi ? 'ai' : 'player2', 'wins');
    } else {
      setResultMsg("It's a Draw!");
    }
  }, [board]);

  // AI Move
  useEffect(() => {
    if (!isAi || turn !== 'O' || over) return;

    const t = setTimeout(() => {
      const best = getBestMove([...board], 3, 3);
      if (best !== -1 && best !== undefined) {
        const next = [...board];
        next[best] = 'O';
        setBoard(next);
        setTurn('X');
      }
    }, 400);

    return () => clearTimeout(t);
  }, [turn, over]);

  const handleClick = (i) => {
    if (board[i] || over) return;

    const next = [...board];
    next[i] = turn;
    setBoard(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setWinLine([]);
    setOver(false);
  };

  const p1 = scores.player1;
  const p2 = isAi ? scores.ai : scores.player2;

  return (
    <div className="page">

      {over && (
        <ResultOverlay
          msg={resultMsg}
          onAgain={reset}
          onHome={() => navigate('/')}
        />
      )}

      {/* Scoreboard */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        <ScoreRow name="Player 1" {...p1} />
        <ScoreRow name={isAi ? "AI" : "Player 2"} {...p2} />
      </div>

      {/* Turn */}
      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>
        {turn}'s Turn
      </h2>

      {/* Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        gap: 8,
        justifyContent: 'center'
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

      {/* Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20
      }}>
        <button className="btn btn-outline" onClick={reset}>
          Reset
        </button>

        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}

