// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateLobby from './components/CreateLobby';
import Lobby from './components/Lobby';

function App() {
  return (
    <Routes>
      <Route path="/create-lobby" element={<CreateLobby />} />
      <Route path="/lobby/:lobbyId" element={<Lobby />} />
      {/* Default route */}
      <Route path="*" element={<CreateLobby />} />
    </Routes>
  );
}

export default App;
