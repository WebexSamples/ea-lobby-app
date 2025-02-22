// src/components/Lobby.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { SOCKET_EVENTS } from '../constants';
import useWebex from '../hooks/useWebex';

const socket = io(import.meta.env.VITE_SOCKET_URL); // Adjust URL if needed

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const [lobby, setLobby] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [lobbyUrl, setLobbyUrl] = useState('');
  // User object: { id: uuid, display_name: string }
  const [user, setUser] = useState(null);

  const { webexData } = useWebex();

  // If the user object is passed from CreateLobby, use it to auto-join
  useEffect(() => {
    if (location.state && location.state.user && !user) {
      setUser(location.state.user);
      setDisplayName(location.state.user.display_name);
      setJoined(true);
      setLobbyUrl(`${window.location.origin}/lobby/${lobbyId}`);
      socket.emit(SOCKET_EVENTS.LOBBY_JOIN, {
        lobby_id: lobbyId,
        user: location.state.user,
      });
      axios
        .get(`${import.meta.env.VITE_API_URL}/lobby/${lobbyId}`)
        .then((response) => setLobby(response.data))
        .catch((error) => {
          console.error('Error fetching lobby:', error);
          alert('Lobby not found.');
        });
    }
  }, [location.state, lobbyId, user]);

  useEffect(() => {
    if (webexData) {
      setDisplayName(webexData.user.displayName);
    }
  }, [webexData]);

  // Listen for lobby updates only after joining
  useEffect(() => {
    if (joined) {
      socket.on(SOCKET_EVENTS.LOBBY_UPDATE, (data) => {
        setLobby(data);
      });
    }
    return () => {
      if (joined) {
        socket.off(SOCKET_EVENTS.LOBBY_UPDATE);
      }
    };
  }, [joined]);

  // Handle manual join for users who did not come from CreateLobby
  const handleJoin = () => {
    if (!displayName.trim()) {
      alert('Please enter a display name.');
      return;
    }
    // Generate a UUID for this user if one hasn't been generated
    const userId = uuidv4();
    const userObj = { id: userId, display_name: displayName };
    setUser(userObj);
    socket.emit(SOCKET_EVENTS.LOBBY_JOIN, { lobby_id: lobbyId, user: userObj });
    setJoined(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/lobby/${lobbyId}`)
      .then((response) => setLobby(response.data))
      .catch((error) => {
        console.error('Error fetching lobby:', error);
        alert('Lobby not found.');
      });
  };

  // Handle leaving the lobby (stay on the same page)
  const handleLeave = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_LEAVE, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
      setJoined(false);
      // Optionally, clear lobby info or let it persist
    }
  };

  // Handle updating the display name
  const handleUpdateDisplayName = () => {
    if (!newDisplayName.trim()) {
      alert('Please enter a new display name.');
      return;
    }
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_UPDATE_DISPLAY_NAME, {
        lobby_id: lobbyId,
        user_id: user.id,
        new_display_name: newDisplayName,
      });
      setUser({ ...user, display_name: newDisplayName });
      setNewDisplayName('');
    }
  };

  // Handle toggling ready status
  const handleToggleReady = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_TOGGLE_READY, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
    }
  };

  // If not joined, display join form
  if (!joined) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Lobby ID: {lobbyId}</h2>
        <input
          type="text"
          placeholder="Enter your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleJoin}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '1rem',
            fontSize: '1rem',
          }}
        >
          Join Lobby
        </button>
      </div>
    );
  }

  const handleSetShareURL = async () => {
    if (webexData) {
      try {
        await webexData.app.setShareUrl(lobbyUrl, lobbyUrl, 'Lobby');
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (!lobby) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        Loading lobby...
      </div>
    );
  }

  // Display lobby details and controls for joined users
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Lobby Name: {lobby.lobby_name}</h2>
      <h3>Lobby ID: {lobbyId}</h3>
      <h3>
        Lobby URL: <a href={lobbyUrl}>{lobbyUrl}</a>
      </h3>
      <button
        disabled={!webexData}
        onClick={handleSetShareURL}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
      >
        Open Lobby
      </button>
      <h3>Your Display Name: {user && user.display_name}</h3>
      <h3>Participants:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lobby.participants.map((participant, index) => (
          <li key={index}>
            {participant.display_name} (
            {participant.ready ? 'Ready' : 'Not Ready'})
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleToggleReady}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            marginRight: '1rem',
          }}
        >
          Toggle Ready
        </button>
        <input
          type="text"
          placeholder="Enter new display name"
          value={newDisplayName}
          onChange={(e) => setNewDisplayName(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleUpdateDisplayName}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '1rem',
            fontSize: '1rem',
          }}
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
