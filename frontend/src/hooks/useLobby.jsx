import { useState, useEffect } from 'react';
import api from '../utils/api';

const cache = {}; // In-memory cache

const useLobby = (lobbyId) => {
  const [lobby, setLobby] = useState(cache[lobbyId] || null);
  const [loading, setLoading] = useState(!cache[lobbyId]);
  const [error, setError] = useState(null);

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

  return { lobby, loading, error };
};

export default useLobby;
