import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../constants';
import useWebex from '../hooks/useWebex';
import useLobby from '../hooks/useLobby';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Link,
  Grid2
} from '@mui/material';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const { webexData } = useWebex();

  // Generate a default user if none exists
  const [user, setUser] = useState(
    location.state?.user || { id: uuidv4(), display_name: `Guest-${Math.floor(Math.random() * 1000)}` }
  );

  const { lobby, loading, joined, joinLobby, leaveLobby, toggleReady, updateDisplayName } = useLobby(lobbyId, user);

  const [displayName, setDisplayName] = useState(user.display_name);
  const [newDisplayName, setNewDisplayName] = useState('');
  const lobbyUrl = `${window.location.origin}${ROUTES.LOBBY_WITH_ID(lobbyId)}`;

  useEffect(() => {
    if (webexData) {
      setDisplayName(webexData.user.displayName);
      setUser((prevUser) => ({ ...prevUser, display_name: webexData.user.displayName }));
    }
  }, [webexData]);

  const handleJoin = () => {
    const result = joinLobby(displayName);
    if (result.error) alert(result.error);
  };

  const handleSetShareURL = async () => {
    if (webexData) {
      try {
        await webexData.app.setShareUrl(lobbyUrl, lobbyUrl, 'Lobby');
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <Typography textAlign="center">Loading lobby...</Typography>;

  if (!joined) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Join Lobby</Typography>
        <TextField
          fullWidth
          label="Enter your display name"
          variant="outlined"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleJoin}>
          Join Lobby
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>
      {/* Lobby Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold">{lobby.lobby_name}</Typography>
          <Typography variant="body2" color="textSecondary">
            Lobby ID: {lobbyId}
          </Typography>
          <Typography variant="body2">
            Lobby URL:{' '}
            <Link href={lobbyUrl} target="_blank">{lobbyUrl}</Link>
          </Typography>
          <Button
            variant="contained"
            disabled={!webexData}
            onClick={handleSetShareURL}
            sx={{ mt: 2 }}
          >
            Share Lobby in Webex
          </Button>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Participants</Typography>
          {lobby.participants.map((participant) => (
            <Typography key={participant.id} sx={{ mt: 1 }}>
              {participant.display_name} {participant.ready ? '(✅ Ready)' : '(❌ Not Ready)'}
            </Typography>
          ))}
        </CardContent>
      </Card>

      {/* Participant Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6">Your Actions</Typography>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 xs={12} sm={6}>
              <Button fullWidth variant="contained" onClick={toggleReady}>
                Toggle Ready
              </Button>
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <Button fullWidth variant="outlined" onClick={leaveLobby}>
                Leave Lobby
              </Button>
            </Grid2>
            <Grid2 xs={8}>
              <TextField
                fullWidth
                label="New Display Name"
                variant="outlined"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
            </Grid2>
            <Grid2 xs={4}>
              <Button fullWidth variant="contained" onClick={() => updateDisplayName(newDisplayName)}>
                Update Name
              </Button>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Lobby;
