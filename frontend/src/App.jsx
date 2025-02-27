import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CreateLobby from './components/CreateLobby';
import Lobby from './components/Lobby';
import Navbar from './components/Navbar';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        <Route path="/create-lobby" element={<CreateLobby />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="*" element={<CreateLobby />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
