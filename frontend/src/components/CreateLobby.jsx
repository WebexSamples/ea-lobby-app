// src/components/CreateLobby.jsx
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateLobby = () => {
  const navigate = useNavigate();
  const userId = 'host_unique_id'; // Replace with authenticated user info if available

  const createLobby = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/lobby', { host_id: userId });
      const { lobby_id } = response.data;
      navigate(`/lobby/${lobby_id}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      alert('Failed to create lobby. Please check the console for details.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Create a Lobby</h2>
      <button onClick={createLobby}>Create Lobby</button>
    </div>
  );
};

export default CreateLobby;
