// src/components/CreateLobby.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateLobby = () => {
  const navigate = useNavigate();
  const [hostId] = useState('host_unique_id'); // Replace with your actual auth/user info
  const [lobbyName, setLobbyName] = useState('');

  const createLobby = async () => {
    if (!lobbyName.trim()) {
      alert('Please enter a lobby name.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/lobby', {
        host_id: hostId,
        lobby_name: lobbyName,
      });
      const { lobby_id } = response.data;
      navigate(`/lobby/${lobby_id}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby. Check the console for details.');
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
        style={{ padding: '0.5rem', fontSize: '1rem' }}
      />
      <button
        onClick={createLobby}
        style={{ padding: '0.5rem 1rem', marginLeft: '1rem', fontSize: '1rem' }}
      >
        Create Lobby
      </button>
    </div>
  );
};

export default CreateLobby;
