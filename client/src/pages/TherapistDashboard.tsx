import React, { useEffect, useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemText, AppBar, Toolbar, Typography, Button, Avatar, Stack, Paper, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Fade, Slide, useMediaQuery
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
import axios from 'axios';
import Header from '../components/Header';
import logo from '../logo.jpg';
import HistoryByDate from './HistoryByDate';

const COLORS = ['#43a047', '#e53935', '#ffd600', '#1e88e5'];
const SIDEBAR_WIDTH = 280;
const themeColors = {
  primary: '#3a73b0',
  background: '#d6f8f5',
};

const sidebarMenu = [
  { label: 'Patient List', key: 'dashboard', icon: <PeopleIcon /> },
  { label: 'Progress Reports', key: 'progress' },
  { label: 'History by Date', key: 'history', icon: <CalendarTodayIcon /> },
];

const initialPatient = { fullName: '', disorder: '' };

const TherapistDashboard: React.FC = () => {
  const { user, profile, logout } = useAuth();
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
    <>
      <Header />
      <Box p={4} bgcolor="#f5f5f5" minHeight="100vh" sx={{ pt: 10 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: themeColors.background, display: 'flex' }}>
          {/* Sidebar */}
          <Slide direction="left" in={true} timeout={700}>
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open
              sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: SIDEBAR_WIDTH,
                  bgcolor: '#f7fbff',
                  color: themeColors.primary,
                  boxSizing: 'border-box',
                  pt: 0,
                  borderRight: '1.5px solid #e3e8ee',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minHeight: '100vh',
                  overflowY: 'auto',
                },
              }}
            >
              {/* Logo and App Name */}
              <Box display="flex" flexDirection="column" alignItems="center" width="100%" pt={7} pb={4} sx={{ minHeight: 120 }}>
                <img src={logo} alt="Neuroblooming Logo" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 8, objectFit: 'cover', boxShadow: '0 2px 8px #b3c6e0' }} />
                <Typography fontWeight={800} fontSize={20} color={themeColors.primary} letterSpacing={1} mb={1} style={{ fontFamily: 'Montserrat, sans-serif' }}>Neuroblooming</Typography>
              </Box>
              <Box width="80%" mx="auto" mb={2}><hr style={{ border: 'none', borderTop: '1.5px solid #e3e8ee' }} /></Box>
              <List sx={{ width: '100%', px: 2 }}>
                {sidebarMenu.map(menu => (
                  <ListItem
                    button
                    key={menu.key}
                    selected={activeSection === menu.key}
                    onClick={() => setActiveSection(menu.key as any)}
                    sx={{
                      borderRadius: 999,
                      mb: 1.5,
                      px: 2.5,
                      py: 1.2,
                      bgcolor: activeSection === menu.key ? '#e3e8ee' : 'transparent',
                      color: activeSection === menu.key ? themeColors.primary : '#6b7a90',
                      fontWeight: 700,
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s, color 0.2s',
                      '&:hover': {
                        bgcolor: '#e3e8ee',
                        color: themeColors.primary,
                      },
                    }}
                  >
                    {menu.icon && <Box mr={2} fontSize={24}>{menu.icon}</Box>}
                    <ListItemText primary={menu.label} sx={{ fontWeight: 700, fontSize: 18 }} />
                  </ListItem>
                ))}
              </List>
              {/* Latest Screeners in Sidebar (for selected patient in progress) */}
              {activeSection === 'progress' && progressScores && (
                <Box mt={2} px={2}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
                    Latest Screeners
                  </Typography>
                  {(() => {
                    const phq9 = getLatestScreener(progressScores, 'phq9');
                    const asd = getLatestScreener(progressScores, 'asd');
                    if (!phq9 && !asd) return <Typography color="text.secondary" sx={{ fontSize: 13 }}>No results yet</Typography>;
                    return <>
                      {phq9 && (
                        <Box mb={0.5}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>PHQ-9: <span style={{ fontWeight: 400 }}>{phq9.screenerScore}</span></Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(phq9.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                      )}
                      {asd && (
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>ASD: <span style={{ fontWeight: 400 }}>{asd.screenerScore}</span></Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(asd.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                      )}
                    </>;
                  })()}
                </Box>
              )}
              <Box flex={1} /> {/* Pushes menu to top */}
            </Drawer>
          </Slide>
          {/* Main Content */}
          <Fade {...fadeProps}>
            <Box flex={1} p={isMobile ? 2 : 6}>
              {/* Profile and Logout at top right */}
              <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{profile?.name?.[0]?.toUpperCase() || 'T'}</Avatar>
                  <Typography fontWeight={600}>{profile?.name || 'Therapist'}</Typography>
                  <Typography color="text.secondary">{profile?.email}</Typography>
                  <Button variant="outlined" color="secondary" onClick={logout}>Logout</Button>
                </Stack>
              </Box>
              {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>}
              {!loading && activeSection === 'dashboard' && (
                <>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" color={themeColors.primary} fontWeight={700}>Patient Management</Typography>
                  </Box>
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    {patients
                      .filter(patient => patient.role !== 'therapist') // Exclude therapists from patient list
                      .map(patient => {
                        const initials = patient.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P';
                        return (
                          <Paper key={patient.uid || patient._id} elevation={4} sx={{ p: 3, minWidth: 260, maxWidth: 320, mb: 2, borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 8 }, cursor: 'pointer' }}
                            onClick={() => setViewPatient(patient)}
                          >
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <Avatar sx={{ bgcolor: themeColors.background, color: themeColors.primary, width: 48, height: 48, fontWeight: 700, fontSize: 22 }}>{initials}</Avatar>
                              {editId === patient.uid ? (
                                <Box>
                                  <TextField size="small" value={editPatient.fullName} onChange={e => setEditPatient({ ...editPatient, fullName: e.target.value })} sx={{ mb: 1 }} />
                                  <TextField size="small" value={editPatient.disorder} onChange={e => setEditPatient({ ...editPatient, disorder: e.target.value })} />
                                </Box>
                              ) : (
                                <Box>
                                  <Typography fontWeight={600} fontSize={18}>{patient.name}</Typography>
                                  <Typography color={themeColors.primary}>{patient.disorder || 'N/A'}</Typography>
                                </Box>
                              )}
                            </Box>
                            <Box display="flex" gap={1}>
                              {editId === patient.uid ? (
                                <>
                                  <IconButton color="success" onClick={() => handleEditPatient(patient.uid)}><SaveIcon /></IconButton>
                                  <IconButton color="inherit" onClick={() => setEditId(null)}><CancelIcon /></IconButton>
                                </>
                              ) : (
                                <>
                                  <IconButton color="primary" onClick={e => { e.stopPropagation(); setEditId(patient.uid); setEditPatient({ fullName: patient.name, disorder: patient.disorder }); }}><EditIcon /></IconButton>
                                  <IconButton color="error" onClick={e => { e.stopPropagation(); setDeleteId(patient.uid); }}><DeleteIcon /></IconButton>
                                </>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                  </Stack>
                  {/* Patient Info & Progress Modal */}
                  <Dialog open={!!viewPatient} onClose={() => setViewPatient(null)} maxWidth="md" fullWidth>
                    <DialogTitle>Patient Profile & Progress</DialogTitle>
                    <DialogContent dividers>
                      {viewPatient && (
                        <Box mb={3}>
                          <Typography variant="h6" gutterBottom>Profile</Typography>
                          <Stack spacing={1}>
                            <Typography><b>Name:</b> {viewPatient.name}</Typography>
                            {viewPatient.email && <Typography><b>Email:</b> {viewPatient.email}</Typography>}
                            {viewPatient.age && <Typography><b>Age:</b> {viewPatient.age}</Typography>}
                            {viewPatient.disorder && <Typography><b>Disorder:</b> {viewPatient.disorder}</Typography>}
                            {viewPatient.mentalHealthConditions && viewPatient.mentalHealthConditions.length > 0 && (
                              <Typography><b>Mental Health Conditions:</b> {viewPatient.mentalHealthConditions.join(', ')}</Typography>
                            )}
                            {viewPatient.experience && <Typography><b>Experience:</b> {viewPatient.experience}</Typography>}
                            {viewPatient.goals && <Typography><b>Goals:</b> {viewPatient.goals}</Typography>}
                          </Stack>
                        </Box>
                      )}
                      {/* Screener Results */}
                      <Typography variant="h6" gutterBottom>Screener Results</Typography>
                      {(() => {
                        const phq9 = getLatestScreener(viewProgress, 'phq9');
                        const asd = getLatestScreener(viewProgress, 'asd');
                        if (!phq9 && !asd) return <Typography color="text.secondary">No screener results available.</Typography>;
                        return <>
                          {phq9 && (
                            <Box mb={1}>
                              <Typography fontWeight={600}>PHQ-9 (Depression):</Typography>
                              <Typography>Date: {new Date(phq9.createdAt).toLocaleDateString()} | Score: {phq9.screenerScore}</Typography>
                              <Typography variant="body2" color="text.secondary">{phq9.screenerDetails}</Typography>
                            </Box>
                          )}
                          {asd && (
                            <Box mb={1}>
                              <Typography fontWeight={600}>ASD (RAADS-R):</Typography>
                              <Typography>Date: {new Date(asd.createdAt).toLocaleDateString()} | Score: {asd.screenerScore}</Typography>
                              <Typography variant="body2" color="text.secondary">{asd.screenerDetails}</Typography>
                            </Box>
                          )}
                        </>;
                      })()}
                      <Typography variant="h6" gutterBottom>Progress Report</Typography>
                      {progressLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}><CircularProgress /></Box>
                      ) : viewProgress.length === 0 ? (
                        <Typography color="text.secondary">No progress data available.</Typography>
                      ) : (
                        <Box>
                          {/* Group scores by game */}
                          {['pattern_heist', 'emoji_rush', 'logic_zone', 'taskflex'].map(gameKey => {
                            const gameScores = viewProgress.filter(s => s.game === gameKey);
                            if (gameScores.length === 0) return null;
                            return (
                              <Box key={gameKey} mb={2}>
                                <Typography fontWeight={600} color={themeColors.primary} mb={1}>{gameKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                                <Paper sx={{ p: 2, mb: 1 }}>
                                  {gameScores.map((score, idx) => (
                                    <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
                                      <Typography>Date: {new Date(score.createdAt).toLocaleDateString()}</Typography>
                                      <Typography>Score: {score.score}</Typography>
                                    </Box>
                                  ))}
                                </Paper>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setViewPatient(null)} color="secondary">Close</Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              {!loading && activeSection === 'progress' && (
                <Box maxWidth={480} mx="auto" bgcolor="#fff" borderRadius={3} boxShadow={3} p={4}>
                  <Typography variant="h4" color={themeColors.primary} fontWeight={700} mb={3}>Progress Reports</Typography>
                  <TextField
                    select
                    label="Select Patient"
                    value={progressPatientId || ''}
                    onChange={e => setProgressPatientId(e.target.value)}
                    SelectProps={{ native: true }}
                    fullWidth
                    sx={{ mb: 3 }}
                  >
                    {patients.filter(p => p.role !== 'therapist').map(p => <option key={p.uid} value={p.uid}>{p.name}</option>)}
                  </TextField>
                  {/* Aggregate latest score per game for pie chart */}
                  {(() => {
                    if (!progressScores || !Array.isArray(progressScores)) return <Typography color="text.secondary">No progress data available.</Typography>;
                    const gameKeys = [
                      { key: 'pattern_heist', label: 'Pattern Heist' },
                      { key: 'emoji_rush', label: 'Emoji Rush' },
                      { key: 'logic_zone', label: 'Logic Zone' },
                      { key: 'taskflex', label: 'Taskflex' },
                    ];
                    const gameScores = gameKeys.map(g => {
                      // Find the latest score for this game
                      const scores = progressScores.filter((s: any) => s.game === g.key);
                      if (scores.length === 0) return { name: g.label, value: 0 };
                      // Sort by createdAt descending
                      scores.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      return { name: g.label, value: scores[0].score || 0 };
                    });
                    const hasData = gameScores.some(g => g.value > 0);
                    if (!hasData) return <Typography color="text.secondary">No progress data available.</Typography>;
                    return (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={gameScores}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {gameScores.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(value: any, name: any, props: any) => [`${value}`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </Box>
              )}
              {!loading && activeSection === 'history' && (
                <HistoryByDate />
              )}
            </Box>
          </Fade>
          {/* Add Patient Dialog */}
          <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
              <TextField label="Full Name" value={newPatient.fullName} onChange={e => setNewPatient({ ...newPatient, fullName: e.target.value })} fullWidth required />
              <TextField label="Disorder Name" value={newPatient.disorder} onChange={e => setNewPatient({ ...newPatient, disorder: e.target.value })} fullWidth required />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPatient} variant="contained" disabled={loading}>Add</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogContent>Are you sure you want to delete this patient?</DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button color="error" onClick={() => deleteId && handleDeletePatient(deleteId)} disabled={loading}>Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
};

export default TherapistDashboard; 