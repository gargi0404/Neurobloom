import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, useTheme, useMediaQuery } from '@mui/material';
import logo from '../logo.jpg';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import "@fontsource/raleway/600.css";

const Header: React.FC = () => {
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  const isAuthenticated = user && profile;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #e0e0e0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
        transition: 'all 0.2s',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Logo and Brand */}
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img 
            src={logo} 
            alt="Neuroblooming Logo" 
            style={{ 
              height: isMobile ? 32 : 40, 
              marginRight: isMobile ? 8 : 12, 
              borderRadius: 8 
            }} 
          />
          <Typography
            fontWeight={600}
            sx={{
              letterSpacing: 0.5,
              fontFamily: "'Inter', 'Roboto', sans-serif",
              color: "#1a237e",
              fontSize: { xs: 18, sm: 22, md: 26 },
              textShadow: "0 1px 2px rgba(26,35,126,0.1)",
            }}
          >
            Neuroblooming
          </Typography>
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
          {isAuthenticated && !isHomePage && (
            <Button 
              color="primary" 
              variant="contained" 
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontWeight: 600, 
                borderRadius: 2,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                px: isMobile ? 1.5 : 2,
                backgroundColor: '#3f51b5',
                '&:hover': {
                  backgroundColor: '#303f9f',
                },
              }} 
              onClick={() => navigate('/')}
            >
              Home
            </Button>
          )}
          
          {!isHomePage && (
            <Button 
              color="primary" 
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontWeight: 500, 
                borderRadius: 2,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                px: isMobile ? 1.5 : 2,
                color: '#3f51b5',
                '&:hover': {
                  backgroundColor: 'rgba(63, 81, 181, 0.08)',
                },
              }} 
              onClick={() => navigate('/about')}
            >
              About
            </Button>
          )}
          
          {isAuthenticated && (
            <Button 
              color="primary" 
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                fontWeight: 500, 
                borderRadius: 2,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                px: isMobile ? 1.5 : 2,
                ml: isMobile ? 0 : 1,
                borderColor: '#3f51b5',
                color: '#3f51b5',
                '&:hover': {
                  borderColor: '#303f9f',
                  backgroundColor: 'rgba(63, 81, 181, 0.04)',
                },
              }} 
              onClick={handleLogout}
            >
              {isMobile ? 'Logout' : 'Sign Out'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 