import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import api from '../utils/api';
import { SOCKET_EVENTS } from '../constants';

const socket = io(import.meta.env.VITE_SOCKET_URL);
const cache = {}; // In-memory cache

const useLobby = (lobbyId, user) => {
  const [lobby, setLobby] = useState(cache[lobbyId] || null);
  const [loading, setLoading] = useState(!cache[lobbyId]);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    if (cache[lobbyId]) {
      setLobby(cache[lobbyId]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getLobby(lobbyId)
      .then((data) => {
        cache[lobbyId] = data; // Store in cache
        setLobby(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching lobby:', err);
        setError('Failed to load lobby');
        setLoading(false);
      });
  }, [lobbyId]);

  // Socket event listeners
  useEffect(() => {
    if (!joined) return;

    socket.on(SOCKET_EVENTS.LOBBY_UPDATE, (data) => {
      setLobby(data);
      cache[lobbyId] = data;
    });

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATE);
    };
  }, [joined, lobbyId]);

  // Join Lobby
  const joinLobby = (displayName) => {
    if (!displayName.trim()) return { error: 'Display name required' };
    const userObj = user || { id: uuidv4(), display_name: displayName };
    socket.emit(SOCKET_EVENTS.LOBBY_JOIN, { lobby_id: lobbyId, user: userObj });
    setJoined(true);
    return { user: userObj };
  };

  // Leave Lobby
  const leaveLobby = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_LEAVE, { lobby_id: lobbyId, user_id: user.id });
      setJoined(false);
    }
  };

  // Toggle Ready
  const toggleReady = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_TOGGLE_READY, { lobby_id: lobbyId, user_id: user.id });
    }
  };

  // Update Display Name
  const updateDisplayName = (newDisplayName) => {
    if (!newDisplayName.trim()) return;
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_UPDATE_DISPLAY_NAME, {
        lobby_id: lobbyId,
        user_id: user.id,
        new_display_name: newDisplayName,
      });
    }
  };

  return {
    lobby,
    loading,
    error,
    joined,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateDisplayName,
  };
};

export default useLobby;
