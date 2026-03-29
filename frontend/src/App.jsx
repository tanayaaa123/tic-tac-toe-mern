import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ScoreProvider } from './context/ScoreContext.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import GridSelect from './pages/GridSelect.jsx';
import Game from './pages/Game.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ScoreProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select/:mode" element={<GridSelect />} />
            <Route path="/game/:mode/:gridSize" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </ScoreProvider>
    </ThemeProvider>
  );
}