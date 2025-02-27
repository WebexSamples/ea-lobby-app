import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Webex Launchpad
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
