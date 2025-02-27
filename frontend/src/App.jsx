// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import CreateLobby from './components/CreateLobby';
import Lobby from './components/Lobby';

const theme = createTheme({});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/create-lobby" element={<CreateLobby />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="*" element={<CreateLobby />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
