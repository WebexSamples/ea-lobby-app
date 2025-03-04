import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardContent, Typography, Link } from '@mui/material';

import useWebex from '../hooks/useWebex';

const LobbyDetails = ({ lobbyId, lobbyName, lobbyUrl, onSetShare }) => {
  const { webexData } = useWebex();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          {lobbyName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Lobby ID: {lobbyId}
        </Typography>
        <Typography variant="body2">
          Lobby URL:{' '}
          <Link href={lobbyUrl} target="_blank">
            {lobbyUrl}
          </Link>
        </Typography>
        <Button
          variant="contained"
          disabled={!webexData}
          onClick={onSetShare}
          sx={{ mt: 2 }}
        >
          Share Lobby in Webex
        </Button>
      </CardContent>
    </Card>
  );
};

// ✅ Define PropTypes for Type Safety
LobbyDetails.propTypes = {
  lobbyId: PropTypes.string.isRequired,
  lobbyName: PropTypes.string.isRequired,
  lobbyUrl: PropTypes.string.isRequired,
  onSetShare: PropTypes.func.isRequired,
};

export default LobbyDetails;
