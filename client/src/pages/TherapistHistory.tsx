import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, Paper, TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';

const TherapistHistory: React.FC = () => {
  const { user, profile } = useAuth();
  const [date, setDate] = useState<string>('');
  const [scores, setScores] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [fetchingScores, setFetchingScores] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPatients = async () => {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = res.data.filter((p: any) => p.role !== 'therapist');
      setPatients(filtered);
      if (filtered.length > 0) setSelectedPatient(filtered[0].uid);
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  useEffect(() => {
    if (!user || !date || !selectedPatient) return;
    const fetchScores = async () => {
      setFetchingScores(true);
      const token = await user.getIdToken();
      const url = `${import.meta.env.VITE_API_URL}/therapist/user/${selectedPatient}/scores`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setScores(res.data);
      setFetchingScores(false);
    };
    fetchScores();
  }, [user, date, selectedPatient]);

  // Filter scores by selected date
  const filteredScores = scores.filter(s => {
    const d = new Date(s.createdAt);
    return d.toISOString().slice(0, 10) === date;
  });

  return (
    <PageWrapper variant="progress">
      <Header />
      <Box maxWidth={700} mx="auto" p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" fontWeight={500} color="#3a73b0" mb={3} fontFamily="'Inter', sans-serif">History by Date</Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Select Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="patient-select-label" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              value={selectedPatient}
              label="Patient"
              onChange={e => setSelectedPatient(e.target.value)}
              sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              {patients.map((p: any) => (
                <MenuItem key={p.uid} value={p.uid} sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{p.name || p.fullName || p.email}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {loading || fetchingScores ? (
          <CircularProgress />
        ) : (
          <Paper sx={{ p: 4, borderRadius: 4, fontFamily: "'Inter', sans-serif" }}>
            {filteredScores.length === 0 ? (
              <Typography color="text.secondary" fontFamily="'Inter', sans-serif" fontWeight={400}>No games or screeners found for this date.</Typography>
            ) : (
              <List>
                {filteredScores.map((s, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={s.game ? `${s.game.replace('_', ' ').toUpperCase()} (Game)` : `${s.screenerType?.toUpperCase()} (Screener)`}
                      secondary={`Score: ${s.score ?? s.screenerScore} | ${new Date(s.createdAt).toLocaleTimeString()}${s.screenerDetails ? ' | ' + s.screenerDetails : ''}`}
                      sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </PageWrapper>
  );
};

export default TherapistHistory; 