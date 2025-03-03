import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import useWebex from '../hooks/useWebex';
import useLobby from '../hooks/useLobby';
import LobbyDetails from './LobbyDetails';
import LobbyParticipants from './LobbyParticipants';
import LobbyActions from './LobbyActions';
import { Typography, Box } from '@mui/material';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const { webexData } = useWebex();

  // Load user from localStorage or generate a guest user
  const storedUser = JSON.parse(localStorage.getItem(`lobbyUser-${lobbyId}`));
  const [user, setUser] = useState(storedUser || location.state?.user || { id: uuidv4(), display_name: `Guest-${Math.floor(Math.random() * 1000)}` });

  const { lobby, loading, joined, joinLobby, leaveLobby, toggleReady, updateDisplayName, lobbyUrl } = useLobby(lobbyId, user);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (webexData) {
      setUser((prevUser) => ({ ...prevUser, display_name: webexData.user.displayName }));
    }
  }, [webexData]);

  useEffect(() => {
    // Auto-rejoin if user was previously in the lobby
    if (!joined && user) {
      joinLobby(user.display_name);
    }
  }, [joined, user, joinLobby]);

  if (loading) return <Typography textAlign="center">Loading lobby...</Typography>;

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>
      {/* Lobby Information */}
      <LobbyDetails 
        lobbyId={lobbyId}
        lobbyName={lobby.lobby_name}
        lobbyUrl={lobbyUrl}
      />

      {/* Participants Table */}
      <LobbyParticipants participants={lobby.participants} currentUser={user} toggleReady={toggleReady} />

      {/* Participant Actions */}
      <LobbyActions 
        newDisplayName={newDisplayName}
        setNewDisplayName={setNewDisplayName}
        updateDisplayName={updateDisplayName}
        leaveLobby={leaveLobby}
      />
    </Box>
  );
};

export default Lobby;
