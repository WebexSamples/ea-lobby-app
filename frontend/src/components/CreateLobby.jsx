// src/components/CreateLobby.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const CreateLobby = () => {
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleCreateLobby = async () => {
    if (!lobbyName.trim() || !displayName.trim()) {
      alert('Please enter both a lobby name and your display name.');
      return;
    }
    // Generate a UUID for the host user
    const hostId = uuidv4();
    try {
      const response = await axios.post('http://localhost:5000/api/lobby', {
        host_id: hostId,
        host_display_name: displayName,
        lobby_name: lobbyName,
      });
      const { lobby_id } = response.data;
      // Navigate to the lobby page, passing the host's user object in location state
      navigate(`/lobby/${lobby_id}`, {
        state: { user: { id: hostId, display_name: displayName } },
      });
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby. Please check the console for details.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Create a Lobby</h2>
      <input
        type="text"
        placeholder="Lobby Name"
        value={lobbyName}
        onChange={(e) => setLobbyName(e.target.value)}
        style={{ padding: '0.5rem', fontSize: '1rem', marginRight: '1rem' }}
      />
      <input
        type="text"
        placeholder="Your Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        style={{ padding: '0.5rem', fontSize: '1rem', marginRight: '1rem' }}
      />
      <button onClick={handleCreateLobby} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
        Create Lobby
      </button>
    </div>
  );
};

export default CreateLobby;
