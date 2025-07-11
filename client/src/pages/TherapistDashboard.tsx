import React, { useEffect, useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Button, Avatar, Stack, Paper, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Fade, Slide, useMediaQuery, Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { deepPurple } from '@mui/material/colors';
import axios from 'axios';
import Header from '../components/Header';
import logo from '../logo.jpg';
import HistoryByDate from './HistoryByDate';
import UserProgress from './UserProgress';
import { useNavigate } from 'react-router-dom';
import '@fontsource/inter';
import "@fontsource/montserrat/700.css";
import "@fontsource/raleway/500.css";
import "@fontsource/raleway/600.css";
import { PageWrapper } from "../components/PageWrapper";

const COLORS = ['#43a047', '#e53935', '#ffd600', '#1e88e5'];
const SIDEBAR_WIDTH = 280;
const themeColors = {
  primary: '#3a73b0',
  background: '#d6f8f5',
};

const sidebarMenu = [
  { label: 'Home', icon: <HomeIcon />, key: 'home' },
  { label: 'Patient List', key: 'dashboard', icon: <PeopleIcon /> },
  { label: 'Progress Reports', key: 'progress' },
  { label: 'History by Date', key: 'history', icon: <CalendarTodayIcon /> },
];

const initialPatient = { fullName: '', disorder: '' };

const TherapistDashboard: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'progress' | 'history'>('dashboard');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState(initialPatient);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState(initialPatient);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [progressPatientId, setProgressPatientId] = useState<string | null>(null);
  const [progressScores, setProgressScores] = useState<any[]>([]);
  const [viewPatient, setViewPatient] = useState<any | null>(null);
  const [viewProgress, setViewProgress] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
        console.log('Fetched patients:', res.data);
        if (res.data.length > 0) setProgressPatientId(res.data[0].uid);
      } catch (err) {
        setPatients([]);
        console.error('Error fetching patients:', err);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  // Fetch progress for selected patient (for pie chart)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !progressPatientId) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/user/${progressPatientId}/scores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgressScores(res.data);
      } catch {
        setProgressScores([]);
      }
    };
    if (activeSection === 'progress' && progressPatientId) fetchProgress();
  }, [user, progressPatientId, activeSection]);

  // Fetch progress for selected patient in modal
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !viewPatient) return;
      setProgressLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/user/${viewPatient.uid || viewPatient._id}/scores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setViewProgress(res.data);
      } catch {
        setViewProgress([]);
      }
      setProgressLoading(false);
    };
    if (viewPatient) fetchProgress();
  }, [user, viewPatient]);

  // Add patient
  const handleAddPatient = async () => {
    if (!user || !newPatient.fullName || !newPatient.disorder) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/therapist/users`, newPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients([...patients, res.data]);
      setAddDialogOpen(false);
      setNewPatient(initialPatient);
    } catch {}
    setLoading(false);
  };

  // Edit patient
  const handleEditPatient = async (uid: string) => {
    if (!user || !editPatient.fullName || !editPatient.disorder) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/therapist/user/${uid}`, editPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.map(p => p.uid === uid ? { ...p, ...editPatient } : p));
      setEditId(null);
    } catch {}
    setLoading(false);
  };

  // Delete patient
  const handleDeletePatient = async (uid: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/therapist/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.filter(p => p.uid !== uid));
      setDeleteId(null);
    } catch {}
    setLoading(false);
  };

  // Animations
  const fadeProps = { in: true, timeout: 600 };
  const slideProps = { direction: 'left', in: true, timeout: 700 };

  // Helper to get latest screener result for a type
  function getLatestScreener(scores: any[], type: string) {
    return scores.filter(s => s.screenerType === type).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  return (
    <PageWrapper variant="therapistHome">
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
            <Typography variant="h3" fontWeight={500} color="#2d2d4b" mb={0.5} sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: 1, fontSize: { xs: 28, md: 36 } }}>
              Therapist Dashboard
            </Typography>
            <Box sx={{ width: 60, height: 5, bgcolor: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', borderRadius: 2, mb: 2, mx: 'auto', background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' }} />
            <Typography variant="body1" fontWeight={400} color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back, {profile?.name || 'Therapist'}! Here's your patient overview and tools.
            </Typography>
          </Box>
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
                  <ListItem button key="Patient List" onClick={() => navigate('/therapist/patients')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><PeopleIcon /></Box>
                    {!collapsed && <ListItemText primary="Patient List" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Progress Reports" onClick={() => navigate('/therapist/progress')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><BarChartIcon /></Box>
                    {!collapsed && <ListItemText primary="Progress Reports" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="History by Date" onClick={() => navigate('/therapist/history')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><CalendarTodayIcon /></Box>
                    {!collapsed && <ListItemText primary="History by Date" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Weekly Goals" onClick={() => navigate('/therapist/weekly-goals')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><FlagIcon /></Box>
                    {!collapsed && <ListItemText primary="Weekly Goals" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                  <ListItem button key="Screener Results" onClick={() => navigate('/therapist/screener-results')} sx={{ mb: 1, borderRadius: 2, pl: collapsed ? 1 : 2, pr: collapsed ? 1 : 2, justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 48, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18, transition: '0.2s' }}>
                    <Box mr={collapsed ? 0 : 2} display="flex" alignItems="center" justifyContent="center"><AssignmentIcon /></Box>
                    {!collapsed && <ListItemText primary="Screener Results" primaryTypographyProps={{ fontWeight: 500, fontSize: 18, fontFamily: 'Inter, sans-serif' }} />}
                  </ListItem>
                </List>
              </Box>
              {/* Therapist Profile at Bottom */}
              <Box px={collapsed ? 0 : 3} py={2} borderTop="1px solid #eee" display="flex" alignItems="center" justifyContent={collapsed ? 'center' : 'flex-start'}>
                <Avatar sx={{ width: 72, height: 72, mb: 2, bgcolor: deepPurple[500] }}>
                  {profile?.name ? profile.name[0].toUpperCase() : 'T'}
                </Avatar>
                {!collapsed && (
                  <Box>
                    <Typography fontWeight={600} fontSize={16} color="black">
                      {profile?.name || 'Therapist'}
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
              <Grid container spacing={4}>
                {/* Therapist Info Card */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 4, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f7fbff' }}>
                    <Avatar sx={{ width: 72, height: 72, mb: 2, bgcolor: deepPurple[500] }}>
                      {profile?.name ? profile.name[0].toUpperCase() : 'T'}
                    </Avatar>
                    <Typography variant="h6" fontWeight={500} mb={0.5}>{profile?.name || 'Therapist'}</Typography>
                    <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                  </Paper>
                </Grid>
                {/* Patient List Card - only show if activeSection is 'dashboard' */}
                {activeSection === 'dashboard' && (
                  <Grid item xs={12} md={8}>
                    <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 2, bgcolor: '#fff' }}>
                      <Typography variant="h6" fontWeight={500} mb={2}>Patient List</Typography>
                      {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                          <CircularProgress />
                        </Box>
                      ) : patients.filter(p => p.uid !== profile?.uid && p.email !== profile?.email).length === 0 ? (
                        <Typography color="text.secondary" textAlign="center">No patients found.</Typography>
                      ) : (
                        <Grid container spacing={2} direction="column">
                          {patients.filter(p => p.uid !== profile?.uid && p.email !== profile?.email).map((patient) => (
                            <Grid item xs={12} key={patient.uid || patient._id}>
                              <Paper elevation={2} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, minHeight: 90, minWidth: 320, maxWidth: 400, width: '100%' }}>
                                <Avatar sx={{ bgcolor: deepPurple[400], width: 56, height: 56, fontSize: 28, fontFamily: 'Inter, sans-serif' }}>
                                  {patient.name ? patient.name[0].toUpperCase() : (patient.fullName ? patient.fullName[0].toUpperCase() : 'U')}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography fontWeight={500} fontSize={18} fontFamily="'Inter', sans-serif">{patient.name || patient.fullName || 'Unnamed'}</Typography>
                                  <Typography color="text.secondary" fontSize={16} fontFamily="'Inter', sans-serif" sx={{ mt: 0.5, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.email}</Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Paper>
                  </Grid>
                )}
                {/* Progress Reports - only show if activeSection is 'progress' */}
                {activeSection === 'progress' && (
                  <Grid item xs={12} md={8}>
                    <UserProgress />
                  </Grid>
                )}
                {/* History by Date - only show if activeSection is 'history' */}
                {activeSection === 'history' && (
                  <Grid item xs={12} md={8}>
                    <HistoryByDate />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default TherapistDashboard; 