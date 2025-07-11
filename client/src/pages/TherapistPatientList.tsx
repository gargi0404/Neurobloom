import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, CircularProgress, Grid } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '@fontsource/inter';
import Header from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';

const TherapistPatientList: React.FC = () => {
  const { user, profile } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch {
        setPatients([]);
      }
      setLoading(false);
    };
    fetchPatients();
  }, [user]);

  return (
    <PageWrapper variant="therapistHome">
      <Header />
      <Box p={4} sx={{ pt: 10 }}>
        <Paper sx={{ maxWidth: 500, mx: 'auto', p: 4, borderRadius: 4, boxShadow: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={3} color="primary" fontFamily="'Inter', sans-serif">
            Patient List
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : patients.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">No patients found.</Typography>
          ) : (
            <Grid container direction="column" spacing={2}>
              {patients.map((patient) => (
                <Grid item key={patient.uid || patient._id}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, minHeight: 90 }}>
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
      </Box>
    </PageWrapper>
  );
};

export default TherapistPatientList; 