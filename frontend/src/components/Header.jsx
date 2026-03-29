import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <header style={s.header}>
      {/* Logo */}
      <div style={s.logo} onClick={() => navigate('/')} title="Go Home">
        <span style={s.xMark}>✕</span>
        <span style={s.logoWord}>TicTac</span>
        <span style={{ ...s.logoWord, color: 'var(--cyan)' }}>Pro</span>
      </div>

      {/* Right side */}
      <div style={s.right}>
        {!isHome && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
            🏠 Home
          </button>
        )}
        <button className="btn btn-outline btn-sm" onClick={toggleTheme} title="Toggle theme">
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}

const s = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 200,
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  xMark: {
    fontFamily: 'Orbitron, monospace',
    fontWeight: 900,
    fontSize: '1.5rem',
    color: 'var(--x-col)',
    textShadow: '0 0 14px var(--x-glow)',
    lineHeight: 1,
  },
  logoWord: {
    fontFamily: 'Orbitron, monospace',
    fontWeight: 700,
    fontSize: '1.05rem',
    color: 'var(--text)',
    letterSpacing: '1px',
  },
  right: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
};
