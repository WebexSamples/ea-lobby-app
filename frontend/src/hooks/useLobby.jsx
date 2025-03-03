import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import api from '../utils/api';
import { SOCKET_EVENTS, ROUTES } from '../constants';

const socket = io(import.meta.env.VITE_SOCKET_URL);
const cache = {}; // In-memory cache

/**
 * Custom hook to manage lobby state, user actions, and socket communication.
 *
 * @param {string} lobbyId - The unique ID of the lobby.
 * @param {Object} [initialUser] - The user object, if available.
 * @param {string} initialUser.id - The user's unique ID.
 * @param {string} initialUser.display_name - The user's display name.
 *
 * @returns {Object} Lobby state and actions.
 * @returns {Object|null} return.lobby - The lobby data.
 * @returns {string} return.lobbyUrl - The generated URL for the lobby.
 * @returns {boolean} return.loading - Indicates if the lobby data is loading.
 * @returns {boolean} return.joined - Whether the user has joined the lobby.
 * @returns {string|null} return.error - Error message if fetching fails.
 * @returns {Function} return.joinLobby - Function to join the lobby.
 * @returns {Function} return.leaveLobby - Function to leave the lobby.
 * @returns {Function} return.toggleReady - Function to toggle ready status.
 * @returns {Function} return.updateDisplayName - Function to update display name.
 * @returns {Object} return.user - The current user object.
 */
const useLobby = (lobbyId, initialUser) => {
  const [lobby, setLobby] = useState(cache[lobbyId] || null);
  const [loading, setLoading] = useState(!cache[lobbyId]);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem(`lobbyUser-${lobbyId}`));
    return (
      savedUser ||
      initialUser || {
        id: uuidv4(),
        display_name: `Guest-${Math.floor(Math.random() * 1000)}`,
      }
    );
  });

  // Generate lobby URL
  const lobbyUrl = `${window.location.origin}${ROUTES.LOBBY_WITH_ID(lobbyId)}`;

  useEffect(() => {
    if (!lobbyId) return;

    if (cache[lobbyId]) {
      setLobby(cache[lobbyId]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .getLobby(lobbyId)
      .then((data) => {
        cache[lobbyId] = data;
        setLobby(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching lobby:', err);
        setError('Failed to load lobby');
        setLoading(false);
      });
  }, [lobbyId]);

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

  /**
   * Joins the lobby with a given display name.
   * @param {string} displayName - The display name for the user.
   * @returns {Object} The user object or an error.
   */
  const joinLobby = (displayName) => {
    if (!displayName.trim()) return { error: 'Display name required' };
    const userObj = { ...user, display_name: displayName };

    socket.emit(SOCKET_EVENTS.LOBBY_JOIN, { lobby_id: lobbyId, user: userObj });
    setJoined(true);
    setUser(userObj);

    localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(userObj));

    return { user: userObj };
  };

  /**
   * Leaves the lobby and removes the user from localStorage.
   */
  const leaveLobby = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_LEAVE, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
      setJoined(false);
      localStorage.removeItem(`lobbyUser-${lobbyId}`);
    }
  };

  /**
   * Toggles the user's ready status.
   */
  const toggleReady = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_TOGGLE_READY, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
    }
  };

  /**
   * Updates the user's display name and persists it.
   * @param {string} newDisplayName - The new display name.
   */
  const updateDisplayName = (newDisplayName) => {
    if (!newDisplayName.trim()) return;
    if (user) {
      const updatedUser = { ...user, display_name: newDisplayName };
      socket.emit(SOCKET_EVENTS.LOBBY_UPDATE_DISPLAY_NAME, {
        lobby_id: lobbyId,
        user_id: user.id,
        new_display_name: newDisplayName,
      });

      setUser(updatedUser);
      localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(updatedUser));
    }
  };

  return {
    lobby,
    lobbyUrl,
    loading,
    error,
    joined,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateDisplayName,
    user,
  };
};

export default useLobby;
