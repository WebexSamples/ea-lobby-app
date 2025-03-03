import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Link } from '@mui/material';

const LobbyDetails = ({ lobbyId, lobbyName, lobbyUrl }) => {
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
      </CardContent>
    </Card>
  );
};

// ✅ Define PropTypes for Type Safety
LobbyDetails.propTypes = {
  lobbyId: PropTypes.string.isRequired,
  lobbyName: PropTypes.string.isRequired,
  lobbyUrl: PropTypes.string.isRequired,
};

export default LobbyDetails;
