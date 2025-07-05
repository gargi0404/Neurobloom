/// <reference types="vite/client" />

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Grid, Drawer, List, ListItem, ListItemText, Avatar, useMediaQuery, AppBar, Toolbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import patternImg from '../pattern.jpeg';
import emojiImg from '../emoji.jpeg';
import logicImg from '../logic.jpeg';
import taskImg from '../task.jpeg';
import AdbIcon from '@mui/icons-material/Adb';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { deepPurple } from '@mui/material/colors';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Header from '../components/Header';
import PHQ9Screener from '../components/PHQ9Screener';
import ASDScreener from '../components/ASDScreener';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const GAME_KEYS = ['pattern_heist', 'emoji_rush', 'logic_zone', 'taskflex'];

// Define sidebarNav type to allow 'action' as an optional property
interface SidebarNavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: string;
}

const sidebarNav: SidebarNavItem[] = [
  { label: 'Home', icon: <HomeIcon />, path: '/dashboard' },
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Games', icon: <SportsEsportsIcon />, path: '/games' },
  { label: 'Progress', icon: <BarChartIcon />, path: '/progress' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
  { label: 'Screeners', icon: <AssignmentIcon />, path: '/screener' },
  { label: 'History by Date', icon: <CalendarTodayIcon />, path: '/history-by-date' },
];

const COLORS = ['red', 'blue', 'green', 'yellow'];

const gameCards = [
  { key: 'pattern_heist', name: 'Pattern Heist', route: '/game/pattern', img: patternImg },
  { key: 'emoji_rush', name: 'Emoji Rush', route: '/game/emoji', img: emojiImg },
  { key: 'logic_zone', name: 'Logic Zone', route: '/game/logic', img: logicImg },
  { key: 'taskflex', name: 'TaskFlex', route: '/game/taskflex', img: taskImg },
];

const screenerList = [
  { key: 'phq9', name: 'Depression (PHQ-9)' },
  { key: 'asd', name: 'Autism Spectrum (RAADS-R)' },
  // Future: add more screeners here
];

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/score/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(res.data);
      } catch {
        setScores([]);
      }
    };
    fetchScores();
  }, [user]);

  const gameData = gameCards.map(card => {
    const gameScores = scores.filter(s => s.game === card.key);
    return {
      name: card.name,
      img: card.img,
      value: gameScores.reduce((acc, s) => acc + (s.score || 0), 0),
      count: gameScores.length,
    };
  });

  // Extract screener results
  const screenerResults = scores.filter(s => s.screenerType);
  const latestPHQ9 = screenerResults.filter(s => s.screenerType === 'phq9').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const latestASD = screenerResults.filter(s => s.screenerType === 'asd').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return (
    <>
      <Header />
      <Box minHeight="100vh" bgcolor="#f5f5f5" sx={{ pt: 10 }}>
        {/* Sidebar + Main Content Layout */}
        <Box sx={{ display: 'flex', pt: 8 }}>
          <Drawer
            variant="permanent"
            sx={{
              width: collapsed ? 64 : 260,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: collapsed ? 64 : 260,
                boxSizing: 'border-box',
                bgcolor: '#fafbfc',
                borderRight: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'width 0.2s',
                overflowX: 'hidden',
              },
            }}
            open
          >
            <Box>
              <Box display="flex" alignItems="center" px={collapsed ? 1 : 3} py={3} justifyContent={collapsed ? 'center' : 'space-between'}>
                <Box display="flex" alignItems="center">
                  <AdbIcon sx={{ fontSize: 36, color: 'black', mr: collapsed ? 0 : 1 }} />
                  {!collapsed && (
                    <Typography variant="h5" fontWeight={700} color="black" sx={{ letterSpacing: 1, transition: '0.2s' }}>
                      Neuroblooming
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={() => setCollapsed(c => !c)} sx={{ ml: collapsed ? 0 : 1 }}>
                  {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </Box>
              <Box px={collapsed ? 0 : 2}>
                <List>
                  {sidebarNav.map((item, idx) => (
                    <ListItem
                      button
                      key={item.label}
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                        }
                      }}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: window.location.pathname === item.path ? '#1976d2' : 'transparent',
                        color: window.location.pathname === item.path ? 'white' : 'black',
                        '&:hover': {
                          bgcolor: window.location.pathname === item.path ? '#1565c0' : '#f0f0f0',
                        },
                        pl: collapsed ? 1 : 2,
                        pr: collapsed ? 1 : 2,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        minHeight: 48,
                        transition: '0.2s',
                      }}
                    >
                      <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center">
                        {item.icon}
                      </Box>
                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: window.location.pathname === item.path ? 700 : 500,
                            fontSize: 18,
                          }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
                {/* Latest Screeners in Sidebar - moved here for visibility */}
                <Box mt={2} px={collapsed ? 0 : 2}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
                    Latest Screeners
                  </Typography>
                  {(!latestPHQ9 && !latestASD) && <Typography color="text.secondary" sx={{ fontSize: 13 }}>No results yet</Typography>}
                  {latestPHQ9 && (
                    <Box mb={0.5}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>PHQ-9: <span style={{ fontWeight: 400 }}>{latestPHQ9.screenerScore}</span></Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(latestPHQ9.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                  {latestASD && (
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>ASD: <span style={{ fontWeight: 400 }}>{latestASD.screenerScore}</span></Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(latestASD.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            {/* User Profile at Bottom */}
            <Box px={collapsed ? 0 : 3} py={2} borderTop="1px solid #eee" display="flex" alignItems="center" justifyContent={collapsed ? 'center' : 'flex-start'}>
              <Avatar sx={{ bgcolor: deepPurple[500], width: 40, height: 40, mr: collapsed ? 0 : 2 }} src={user?.photoURL || undefined}>
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </Avatar>
              {!collapsed && (
                <Box>
                  <Typography fontWeight={600} fontSize={16} color="black">
                    {user?.email?.split('@')[0] || 'User'}
                  </Typography>
                  <Button size="small" color="secondary" onClick={logout} sx={{ textTransform: 'none', fontWeight: 500, p: 0, minWidth: 0 }}>
                    Logout
                  </Button>
                </Box>
              )}
            </Box>
          </Drawer>
          {/* Main Content */}
          <Box
            flex={1}
            sx={{
              transition: 'margin-left 0.2s',
              ml: collapsed ? '64px' : '260px',
              maxWidth: '1200px',
              mx: 'auto',
              p: isMobile ? 2 : 4,
            }}
          >
            <Grid container spacing={4} justifyContent="center">
              {gameData.map((data, idx) => {
                const card = gameCards[idx];
                return (
                  <Grid item xs={12} sm={6} md={3} key={data.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper
                      elevation={4}
                      sx={{
                        width: { xs: '100%', sm: 200 },
                        height: { xs: '100vw', sm: 200 },
                        maxWidth: 240,
                        maxHeight: 240,
                        minWidth: 160,
                        minHeight: 160,
                        aspectRatio: '1 / 1',
                        position: 'relative',
                        overflow: 'hidden',
                        p: 0,
                        borderRadius: 4,
                        boxShadow: 3,
                        mb: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 8, bgcolor: '#e3f0fb' },
                      }}
                      onClick={() => navigate(card.route)}
                    >
                      <img
                        src={data.img}
                        alt={data.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Paper>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 20, mb: 1, textAlign: 'center' }}>{data.name}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="medium"
                      sx={{ width: { xs: '100%', sm: 200 }, maxWidth: 240 }}
                      onClick={() => navigate(card.route)}
                    >
                      Play
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;