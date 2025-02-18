// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

// Initialize the socket (ensure the URL matches your backend)
const socket = io('http://localhost:5000');

const Lobby = () => {
  const { lobbyId } = useParams();
  const [lobby, setLobby] = useState(null);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  // Listen for lobby updates only after joining
  useEffect(() => {
    if (joined) {
      socket.on('lobby_update', (data) => {
        setLobby(data);
      });
    }
    // Cleanup when the component unmounts or if joined changes
    return () => {
      if (joined) {
        socket.off('lobby_update');
      }
    };
  }, [joined]);

  // Handle the join button click
  const handleJoin = () => {
    if (!username.trim()) {
      alert('Please enter a username.');
      return;
    }
    // Emit the join_lobby event to the backend
    socket.emit('join_lobby', { lobby_id: lobbyId, user_id: username });
    setJoined(true);

    // Fetch the initial lobby state after joining
    axios.get(`http://localhost:5000/api/lobby/${lobbyId}`)
      .then(response => setLobby(response.data))
      .catch(error => {
        console.error('Error fetching lobby:', error);
        alert('Lobby not found.');
      });
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

  // After joining, if the lobby state hasn't loaded yet
  if (!lobby) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading lobby...</div>;
  }

  // Once joined and lobby state is available, show the lobby details
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Lobby ID: {lobbyId}</h2>
      <h3>Participants:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lobby.participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
