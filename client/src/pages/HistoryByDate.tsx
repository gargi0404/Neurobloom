import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, Paper, TextField, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';

const HistoryByDate: React.FC = () => {
  const { user, profile } = useAuth();
  const [date, setDate] = useState<string>('');
  const [scores, setScores] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const isTherapist = profile?.role === 'therapist';

  // Fetch patients for therapist
  useEffect(() => {
    if (!isTherapist || !user) return;
    const fetchPatients = async () => {
      const token = await user.getIdToken();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data.filter((p: any) => p.role !== 'therapist'));
      if (res.data.length > 0) setSelectedPatient(res.data[0].uid);
    };
    fetchPatients();
  }, [isTherapist, user]);

  // Fetch scores for user or selected patient
  useEffect(() => {
    if (!user || !date) return;
    const fetchScores = async () => {
      setLoading(true);
      const token = await user.getIdToken();
      let url = '';
      if (isTherapist && selectedPatient) {
        url = `${import.meta.env.VITE_API_URL}/therapist/user/${selectedPatient}/scores`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/score/my`;
      }
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setScores(res.data);
      setLoading(false);
    };
    fetchScores();
  }, [user, date, isTherapist, selectedPatient]);

  // Filter scores by selected date
  const filteredScores = scores.filter(s => {
    const d = new Date(s.createdAt);
    return d.toISOString().slice(0, 10) === date;
  });

  return (
    <PageWrapper variant="progress">
      <Header />
      <Box maxWidth={700} mx="auto" p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={3}>History by Date</Typography>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Select Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {isTherapist && (
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="patient-select-label">Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                value={selectedPatient}
                label="Patient"
                onChange={e => setSelectedPatient(e.target.value)}
              >
                {patients.map((p: any) => (
                  <MenuItem key={p.uid} value={p.uid}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {filteredScores.length === 0 ? (
              <Typography color="text.secondary">No games or screeners found for this date.</Typography>
            ) : (
              <List>
                {filteredScores.map((s, idx) => (
                  <ListItem key={idx} divider>
                    <ListItemText
                      primary={s.game ? `${s.game.replace('_', ' ').toUpperCase()} (Game)` : `${s.screenerType?.toUpperCase()} (Screener)`}
                      secondary={`Score: ${s.score ?? s.screenerScore} | ${new Date(s.createdAt).toLocaleTimeString()}${s.screenerDetails ? ' | ' + s.screenerDetails : ''}`}
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

export default HistoryByDate; 