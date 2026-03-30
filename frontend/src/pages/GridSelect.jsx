
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GRIDS = [
  {
    size: 3,
    label: '3 × 3',
    winLen: 3,
    winMsg: '3 in a row to win',
    desc: 'Classic Tic Tac Toe. Fast, intense and familiar.',
    badge: 'Classic',
    accent: 'var(--success)',
    glow: 'rgba(0,229,160,0.30)',
    icon: '⚡',
  },
];

// Mini Grid Preview 
function MiniGrid({ size, active, accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 2, width: 84, height: 84 }}>
      {Array(size * size).fill(null).map((_, i) => (
        <div
          key={i}
          style={{
            background: active ? `color-mix(in srgb, ${accent} 14%, transparent)` : 'var(--bg2)',
            border: `1px solid ${active ? `color-mix(in srgb, ${accent} 40%, transparent)` : 'var(--border)'}`,
            borderRadius: 3,
            transition: `all 0.2s ease ${i * 8}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Grid Card
function GridCard({ g, delay, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${hov ? g.accent : 'var(--border)'}`,
        borderRadius: 'var(--radius-l)',
        padding: '26px 22px',
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: hov ? `0 12px 40px ${g.glow}, 0 0 0 1px ${g.accent}` : 'var(--shadow-m)',
        transform: hov ? 'translateY(-10px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      <div style={{ fontSize: '2rem' }}>{g.icon}</div>

      <span style={{
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        padding: '3px 10px',
        borderRadius: 20,
        color: g.accent,
        border: `1px solid ${g.accent}`,
        background: `color-mix(in srgb, ${g.accent} 10%, transparent)`
      }}>
        {g.badge}
      </span>

      <h2 style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: '1.5rem',
        fontWeight: 900,
        color: hov ? g.accent : 'var(--text)',
        transition: 'color 0.25s',
        letterSpacing: '2px'
      }}>
        {g.label}
      </h2>

      <MiniGrid size={g.size} active={hov} accent={g.accent} />

      <p style={{ color: 'var(--text2)', fontSize: '0.8rem', lineHeight: 1.55 }}>
        {g.desc}
      </p>

      <div style={{
        background: `color-mix(in srgb, ${g.accent} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${g.accent} 30%, transparent)`,
        borderRadius: 8,
        padding: '7px 14px',
        width: '100%'
      }}>
        <span style={{ color: g.accent, fontWeight: 700, fontSize: '0.8rem' }}>
          {g.winMsg}
        </span>
      </div>
    </div>
  );
}

// Page
export default function GridSelect() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const isAi = mode === 'ai';

  const handlePick = (size) => {
    navigate(`/game/${mode}/${size}`);
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.45s ease both' }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 30,
          padding: '5px 18px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text2)',
          marginBottom: 14
        }}>
          {isAi ? 'Player vs AI' : 'Player vs Player'}
        </div>

        <h1 style={{
          fontSize: 'clamp(1.4rem,4vw,2.1rem)',
          fontWeight: 900,
          letterSpacing: '1px',
          color: 'var(--text)'
        }}>
          Choose Your Arena
        </h1>

        <p style={{
          color: 'var(--text2)',
          fontSize: '0.92rem',
          marginTop: 8,
          maxWidth: 380
        }}>
          {isAi
            ? 'Play against AI on a classic 3×3 grid.'
            : 'Play against a friend on a 3×3 grid.'}
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {GRIDS.map((g, i) => (
          <GridCard
            key={g.size}
            g={g}
            delay={0.15 + i * 0.1}
            onClick={() => handlePick(g.size)}
          />
        ))}
      </div>

      {/* Rules */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-m)',
        padding: '18px 28px',
        animation: 'fadeUp 0.5s ease 0.55s both'
      }}>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--muted)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Win Conditions
        </div>

        <div style={{
          display: 'flex',
          gap: '16px 30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {GRIDS.map((g) => (
            <div key={g.size} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'Orbitron, monospace',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: 'var(--text)'
              }}>
                {g.label}
              </span>
              <span style={{ color: 'var(--muted)' }}>→</span>
              <span style={{ color: g.accent, fontWeight: 700, fontSize: '0.82rem' }}>
                {g.winMsg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
