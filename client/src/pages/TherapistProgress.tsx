import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import UserProgress from './UserProgress';
import { PageWrapper } from "../components/PageWrapper";
import Header from '../components/Header';

const TherapistProgress: React.FC = () => {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [patientScores, setPatientScores] = useState<any[]>([]);
  const [fetchingScores, setFetchingScores] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter((p: any) => p.role !== 'therapist');
        setPatients(filtered);
        if (filtered.length > 0) setSelectedPatient(filtered[0].uid);
      } catch {
        setPatients([]);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!user || !selectedPatient) return;
      setFetchingScores(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/user/${selectedPatient}/scores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatientScores(res.data);
      } catch {
        setPatientScores([]);
      }
      setFetchingScores(false);
    };
    if (selectedPatient) fetchScores();
  }, [user, selectedPatient]);

  return (
    <PageWrapper variant="progress">
      <Header />
      <Box p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" fontWeight={500} mb={3} color="#3a73b0" fontFamily="'Inter', sans-serif">Progress Reports</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper sx={{ p: 4, borderRadius: 4, mb: 4, fontFamily: "'Inter', sans-serif" }}>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel id="patient-select-label" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>Select Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                value={selectedPatient}
                label="Select Patient"
                onChange={e => setSelectedPatient(e.target.value)}
                sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
              >
                {patients.map((p: any) => (
                  <MenuItem key={p.uid} value={p.uid} sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{p.name || p.fullName || p.email}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}
        {fetchingScores ? (
          <CircularProgress />
        ) : (
          <Box>
            {patientScores.length === 0 ? (
              <Typography color="text.secondary" fontFamily="'Inter', sans-serif" fontWeight={400}>No progress data found for this patient.</Typography>
            ) : (
              <UserProgress scores={patientScores} hideHeader />
            )}
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
};

export default TherapistProgress; 