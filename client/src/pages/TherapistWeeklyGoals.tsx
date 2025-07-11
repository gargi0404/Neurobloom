import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Dialog, DialogTitle, DialogContent, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import WeeklyGoals from './WeeklyGoals';
import { PageWrapper } from '../components/PageWrapper';
import Header from '../components/Header';

const DEFAULT_GOALS = [
  'Play at least 3 cognitive games',
  'Complete 1 screener',
  'Log in at least 4 days this week',
  'Review your progress',
  'Try a new game mode',
];

function getPatientLocalKey(uid: string) {
  // In a real app, this would be stored in the backend per patient
  return `weeklyGoalsStatus_${uid}`;
}

const TherapistWeeklyGoals: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedChecked, setSelectedChecked] = useState<boolean[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data.filter((p: any) => p.role !== 'therapist'));
        setLastUpdated(new Date());
      } catch {
        setPatients([]);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  // Listen for localStorage changes to update goals in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('weeklyGoalsStatus_')) {
        // Refresh the current view if we're viewing a patient's goals
        if (selectedPatient && e.key === getPatientLocalKey(selectedPatient.uid)) {
          setSelectedChecked(getCheckedForPatient(selectedPatient.uid));
          setLastUpdated(new Date());
        }
        // Force re-render of the patient list to update completion counts
        setPatients(prev => [...prev]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedPatient]);

  const getCheckedForPatient = (uid: string) => {
    const saved = localStorage.getItem(getPatientLocalKey(uid));
    if (saved) return JSON.parse(saved);
    return Array(DEFAULT_GOALS.length).fill(false);
  };

  const handleView = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedChecked(getCheckedForPatient(patient.uid));
    setLastUpdated(new Date());
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setSelectedChecked(null);
  };

  // Refresh the selected patient's goals data
  const refreshPatientGoals = () => {
    if (selectedPatient) {
      setSelectedChecked(getCheckedForPatient(selectedPatient.uid));
      setLastUpdated(new Date());
    }
  };

  // Refresh all patient data
  const refreshAllData = () => {
    setPatients(prev => [...prev]); // Force re-render
    if (selectedPatient) {
      setSelectedChecked(getCheckedForPatient(selectedPatient.uid));
    }
    setLastUpdated(new Date());
  };

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedPatient) {
        setSelectedChecked(getCheckedForPatient(selectedPatient.uid));
        setLastUpdated(new Date());
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedPatient]);

  if (selectedPatient && selectedChecked) {
    return (
      <PageWrapper variant="therapistHome">
        <Header />
        <Box minHeight="100vh" p={isMobile ? 1 : 6} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start">
          <Button variant="outlined" onClick={handleBack} sx={{ alignSelf: 'flex-start', mb: 2, fontWeight: 600 }}>&larr; Back to Patient List</Button>
          <Typography variant="h4" fontWeight={700} mb={3} color="primary" textAlign="center">
            Weekly Goals for {selectedPatient.name || selectedPatient.fullName || selectedPatient.email}
          </Typography>
          <Box width="100%" maxWidth={1200} mx="auto" p={isMobile ? 1 : 4}>
            <WeeklyGoals 
              checked={selectedChecked} 
              readOnly 
              horizontal 
              userId={selectedPatient.uid}
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={refreshPatientGoals} 
            sx={{ mt: 2, fontWeight: 600 }}
          >
            Refresh Goals
          </Button>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper variant="therapistHome">
      <Header />
      <Box p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" fontWeight={500} mb={3} color="#3a73b0" fontFamily="'Inter', sans-serif">Patient Weekly Goals</Typography>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" maxWidth={900} mx="auto">
          <Typography variant="body2" color="text.secondary" fontFamily="'Inter', sans-serif">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Button variant="contained" color="primary" onClick={refreshAllData} sx={{ fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Refresh All</Button>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 4, maxWidth: 900, mx: 'auto', boxShadow: 4, fontFamily: "'Inter', sans-serif" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Name</TableCell>
                  <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Goals Completed</TableCell>
                  <TableCell align="center" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>View Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((p: any) => {
                  const checked = getCheckedForPatient(p.uid);
                  const completed = checked.filter(Boolean).length;
                  return (
                    <TableRow key={p.uid} hover>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{p.name || p.fullName || p.email}</TableCell>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{p.email}</TableCell>
                      <TableCell align="center" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{completed} / {DEFAULT_GOALS.length}</TableCell>
                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleView(p)} sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </PageWrapper>
  );
};

export default TherapistWeeklyGoals; 