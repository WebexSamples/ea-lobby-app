// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // Adjust URL if needed

const Lobby = () => {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState(null);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [joined, setJoined] = useState(false);

  // Listen for lobby updates only after joining
  useEffect(() => {
    if (joined) {
      socket.on('lobby_update', (data) => {
        setLobby(data);
      });
    }
    // Cleanup on component unmount or when joined changes
    return () => {
      if (joined) {
        socket.off('lobby_update');
      }
    };
  }, [joined]);

  // Handle join lobby event
  const handleJoin = () => {
    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }
    socket.emit('join_lobby', { lobby_id: lobbyId, user_id: username });
    setJoined(true);
    axios.get(`http://localhost:5000/api/lobby/${lobbyId}`)
      .then(response => setLobby(response.data))
      .catch(error => {
        console.error('Error fetching lobby:', error);
        alert('Lobby not found.');
      });
  };

  // Handle leaving the lobby
  const handleLeave = () => {
    socket.emit('leave_lobby', { lobby_id: lobbyId, user_id: username });
    setLobby(null);
    setJoined(false);
    navigate('/create-lobby');
  };

  // Handle updating the username
  const handleUpdateUsername = () => {
    if (!newUsername.trim()) {
      alert('Please enter a new username.');
      return;
    }
    socket.emit('update_username', { 
      lobby_id: lobbyId, 
      old_user_id: username, 
      new_user_id: newUsername 
    });
    // Update the local username state
    setUsername(newUsername);
    setNewUsername('');
  };

  // Before joining, display the join form
  if (!joined) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Lobby ID: {lobbyId}</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleJoin}
          style={{ padding: '0.5rem 1rem', marginLeft: '1rem', fontSize: '1rem' }}
        >
          Join Lobby
        </button>
      </div>
    );
  }

  if (!lobby) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading lobby...</div>;

  // Once joined, display the lobby details along with options to update the username or leave
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Lobby Name: {lobby.lobby_name}</h2>
      <h3>Lobby ID: {lobbyId}</h3>
      <h3>Participants:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lobby.participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Enter new username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleUpdateUsername}
          style={{ padding: '0.5rem 1rem', marginLeft: '1rem', fontSize: '1rem' }}
        >
          Update Name
        </button>
      </div>
      <button 
        onClick={handleLeave}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', marginTop: '1rem' }}
      >
        Leave Lobby
      </button>
    </div>
  );
};

export default Lobby;
