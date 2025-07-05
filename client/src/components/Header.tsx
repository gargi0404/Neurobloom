import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import logo from '../logo.jpg';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #eee',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        transition: 'all 0.2s',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Neuroblooming Logo" style={{ height: 40, marginRight: 12, borderRadius: 8 }} />
          <Typography variant="h5" fontWeight={700} color="black" sx={{ letterSpacing: 1 }}>
            Neuroblooming
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button color="primary" variant="contained" sx={{ fontWeight: 600, borderRadius: 2 }}>Home</Button>
          <Button color="primary" sx={{ fontWeight: 600, borderRadius: 2 }}>About</Button>
          {user && (
            <Button color="primary" variant="contained" sx={{ fontWeight: 600, borderRadius: 2, ml: 2 }} onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 