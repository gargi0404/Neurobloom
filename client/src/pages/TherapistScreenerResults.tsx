import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';

const TherapistScreenerResults: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

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
    const fetchResults = async () => {
      if (!user || !selectedPatient) return;
      setFetching(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/user/${selectedPatient}/scores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data.filter((s: any) => s.screenerType));
      } catch {
        setResults([]);
      }
      setFetching(false);
    };
    if (selectedPatient) fetchResults();
  }, [user, selectedPatient]);

  return (
    <PageWrapper variant="progress">
      <Header />
      <Box p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" fontWeight={500} mb={3} color="#3a73b0" fontFamily="'Inter', sans-serif">Screener Results</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper sx={{ p: 4, borderRadius: 4, mb: 4, maxWidth: 900, mx: 'auto', fontFamily: "'Inter', sans-serif" }}>
            <FormControl sx={{ minWidth: 240, mb: 3 }}>
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
            {fetching ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3, fontFamily: "'Inter', sans-serif" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Screener</TableCell>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Score</TableCell>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Date</TableCell>
                      <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>No screener results found.</TableCell>
                      </TableRow>
                    ) : (
                      results.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{r.screenerType?.toUpperCase()}</TableCell>
                          <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{r.screenerScore ?? '-'}</TableCell>
                          <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>{r.screenerDetails || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>
    </PageWrapper>
  );
};

export default TherapistScreenerResults; 