/// <reference types="vite/client" />

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Grid, Drawer, List, ListItem, ListItemText, Avatar, useMediaQuery, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import patternImg from '../pattern.jpeg';
import emojiImg from '../emoji.jpeg';
import logicImg from '../logic.jpeg';
import taskImg from '../task.jpeg';
import HomeIcon from '@mui/icons-material/Home';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import { deepPurple } from '@mui/material/colors';
import Header from '../components/Header';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isSameDay, isAfter, parseISO } from 'date-fns';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import '@fontsource/inter';
import logo from '../logo.jpg';
import { PageWrapper } from "../components/PageWrapper";
import "@fontsource/raleway/600.css";

const GAME_KEYS = ['pattern_heist', 'emoji_rush', 'logic_zone', 'taskflex'];

const COLORS = ['#6EC6FF', '#FF8A80', '#81C784', '#FFD54F']; // Slightly darker, more saturated pastels

const gameCards = [
  { key: 'emoji_rush', name: 'Emotion Rush', route: '/game/emoji', img: emojiImg },
  { key: 'pattern_heist', name: 'Pattern Heist', route: '/game/pattern', img: patternImg },
  { key: 'logic_zone', name: 'Logic Zone', route: '/game/logic', img: logicImg },
  { key: 'taskflex', name: 'TaskFlex', route: '/game/taskflex', img: taskImg },
];

const screenerList = [
  { key: 'phq9', name: 'Depression (PHQ-9)' },
  { key: 'asd', name: 'Autism Spectrum (RAADS-R)' },
  { key: 'adhd', name: 'ADHD (ASRS v1.1)', route: '/adhd-screener' },
  // Future: add more screeners here
];

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>([]);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [collapsed, setCollapsed] = useState(false);
  const playedDates = new Set(["2025-07-06"]); // Replace with actual played dates from your data

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

  function CustomDay(props: any) {
    const { day, ...other } = props;
    const dateString = format(day, 'yyyy-MM-dd');
    const isPlayed = playedDates.has(dateString);
    return (
      <PickersDay
        {...other}
        day={day}
        sx={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          bgcolor: isPlayed ? '#43a047' : 'transparent',
          color: isPlayed ? '#fff' : '#222',
          borderRadius: '50%',
        }}
      />
    );
  }

  return (
    <PageWrapper variant="userHome">
      <Header />
      <Box sx={{ position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
        {/* Abstract colorful shapes */}
        <Box sx={{ position: 'absolute', top: '-120px', right: '-180px', zIndex: 0 }}>
          <svg width="500" height="350" viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="350" cy="120" rx="200" ry="120" fill="url(#paint0_linear)" fillOpacity="0.7" />
            <defs>
              <linearGradient id="paint0_linear" x1="150" y1="0" x2="500" y2="350" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff7eb3" />
                <stop offset="1" stopColor="#65e4ff" />
              </linearGradient>
            </defs>
          </svg>
        </Box>
        <Box sx={{ position: 'absolute', bottom: '-80px', right: '-60px', zIndex: 0 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="100" fill="#ffe066" fillOpacity="0.5" />
          </svg>
        </Box>
        {/* Dashboard Content */}
        <Box sx={{ position: 'relative', zIndex: 1, pt: 8, px: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto' }}>
          <Box textAlign="center" mb={5}>
            <Typography
              fontWeight={600}
              sx={{
                letterSpacing: 1,
                fontFamily: "'Raleway', 'Inter', sans-serif",
                color: "#2d2d4b",
                fontSize: { xs: 22, sm: 26, md: 30 },
                textShadow: "0 1px 4px rgba(45,45,75,0.06)",
              }}
            >
              Neuroblooming
            </Typography>
            <Box sx={{ width: 60, height: 5, bgcolor: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', borderRadius: 2, mb: 2, mx: 'auto', background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back, {user?.email?.split('@')[0] || 'User'}! Here's your progress and activities.
            </Typography>
          </Box>
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
                    <img src={logo} alt="Neuroblooming Logo" style={{ width: 36, height: 36, borderRadius: 8, marginRight: collapsed ? 0 : 8 }} />
                    {!collapsed && (
                      <Typography
                        fontWeight={600}
                        sx={{
                          letterSpacing: 1,
                          fontFamily: "'Raleway', 'Inter', sans-serif",
                          color: "#2d2d4b",
                          fontSize: { xs: 22, sm: 26, md: 30 },
                          textShadow: "0 1px 4px rgba(45,45,75,0.06)",
                        }}
                      >
                        Neuroblooming
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={() => setCollapsed(c => !c)} sx={{ ml: collapsed ? 0 : 1 }}>
                    <HomeIcon />
                  </IconButton>
                </Box>
                <List>
                  <ListItem button key="Home" onClick={() => navigate('/dashboard')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><HomeIcon /></Box>
                    {!collapsed && <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Games" onClick={() => navigate('/games')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><SportsEsportsIcon /></Box>
                    {!collapsed && <ListItemText primary="Games" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Progress" onClick={() => navigate('/progress')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><BarChartIcon /></Box>
                    {!collapsed && <ListItemText primary="Progress" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Screeners" onClick={() => navigate('/screener')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><AssignmentIcon /></Box>
                    {!collapsed && <ListItemText primary="Screeners" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Weekly Goals" onClick={() => navigate('/weekly-goals')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><FlagIcon /></Box>
                    {!collapsed && <ListItemText primary="Weekly Goals" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="History by Date" onClick={() => navigate('/history-by-date')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><CalendarTodayIcon /></Box>
                    {!collapsed && <ListItemText primary="History by Date" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Profile" onClick={() => navigate('/profile')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><PersonIcon /></Box>
                    {!collapsed && <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                </List>
              </Box>
              {/* User Profile at Bottom */}
              <Box px={collapsed ? 0 : 3} py={2} borderTop="1px solid #eee" display="flex" alignItems="center" justifyContent={collapsed ? 'center' : 'flex-start'}>
                <Avatar sx={{ width: 72, height: 72, mb: 2, bgcolor: deepPurple[500] }} src={user?.photoURL || undefined}>
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
            <Box flex={1} sx={{ transition: 'margin-left 0.2s', ml: collapsed ? '64px' : '260px', maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 } }}>
              <Grid container spacing={4} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 4, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f7fbff' }}>
                    <Avatar sx={{ width: 72, height: 72, mb: 2, bgcolor: deepPurple[500] }} src={user?.photoURL || undefined}>
                      {user?.email ? user.email[0].toUpperCase() : 'U'}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} mb={0.5} fontFamily="'Inter', sans-serif">{user?.email?.split('@')[0] || 'User'}</Typography>
                    <Typography variant="body2" color="text.secondary" fontFamily="'Inter', sans-serif">{user?.email}</Typography>
                  </Paper>
                  <Box display="flex" gap={2} mt={2} justifyContent="center">
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 3, minWidth: 90, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                      <Typography fontWeight={700} fontSize={18} color="#3674B5">PHQ-9</Typography>
                      <Typography fontWeight={700} fontSize={22} color="#3674B5">{latestPHQ9?.screenerScore ?? '-'}</Typography>
                      <Typography fontSize={12} color="text.secondary">{latestPHQ9 ? format(new Date(latestPHQ9.createdAt), 'MMM d, yyyy') : 'No result'}</Typography>
                    </Paper>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 3, minWidth: 90, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                      <Typography fontWeight={700} fontSize={18} color="#3674B5">ASD</Typography>
                      <Typography fontWeight={700} fontSize={22} color="#3674B5">{latestASD?.screenerScore ?? '-'}</Typography>
                      <Typography fontSize={12} color="text.secondary">{latestASD ? format(new Date(latestASD.createdAt), 'MMM d, yyyy') : 'No result'}</Typography>
                    </Paper>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 4, fontFamily: "'Inter', sans-serif", minWidth: 420, maxWidth: 480, minHeight: 420 }}>
                    <Typography fontFamily="'Inter', sans-serif" fontWeight={500} fontSize={18} mb={2}>Game Scores Distribution</Typography>
                    <ResponsiveContainer width="90%" height={360}>
                      <PieChart margin={{ left: 40, right: 40, top: 24, bottom: 80 }}>
                        <Pie data={gameData} dataKey="value" nameKey="name" cx="50%" cy="40%" outerRadius={90} fill="#8884d8" label>
                          {gameData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, marginTop: 32 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
              <Grid container spacing={4} mt={2} justifyContent="flex-end">
                <Grid item xs={12} md={6}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minHeight: 220, maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f7fbff', mx: 'auto' }}>
                    <Typography fontWeight={600} fontSize={20} mb={2} fontFamily="'Inter', sans-serif">Activity Calendar</Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateCalendar
                        value={null}
                        views={["day"]}
                        sx={{ width: '100%', '& .MuiPickersDay-root': { fontFamily: 'Inter, sans-serif' } }}
                        slots={{ day: CustomDay }}
                      />
                    </LocalizationProvider>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;