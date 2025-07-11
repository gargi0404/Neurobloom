import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { PageWrapper } from "../components/PageWrapper";

const screenerTypes = [
  { key: 'all', label: 'All Screeners' },
  { key: 'phq9', label: 'PHQ-9' },
  { key: 'asd', label: 'ASD (RAADS-R)' },
];

const ScreenerResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/score/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data.filter((s: any) => s.screenerType));
      } catch {
        setResults([]);
      }
    };
    fetchResults();
  }, [user]);

  const filteredResults = filter === 'all' ? results : results.filter(r => r.screenerType === filter);

  return (
    <PageWrapper variant="other">
      <Box px={{ xs: 2, sm: 6 }} py={6}>
        <Paper elevation={4} sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={500} letterSpacing={1} mb={3} color="primary.main">Screener Results</Typography>
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel id="screener-filter-label">Filter by Screener</InputLabel>
            <Select
              labelId="screener-filter-label"
              value={filter}
              label="Filter by Screener"
              onChange={e => setFilter(e.target.value)}
            >
              {screenerTypes.map(opt => (
                <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Screener</b></TableCell>
                  <TableCell><b>Score</b></TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell><b>Details</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>No screener results found.</TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.screenerType?.toUpperCase()}</TableCell>
                      <TableCell>{r.screenerScore ?? '-'}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{r.screenerDetails || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </PageWrapper>
  );
};

export default ScreenerResults; 