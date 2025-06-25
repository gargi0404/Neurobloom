import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const TherapistDashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/therapist/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch {
        setUsers([]);
      }
      setFetching(false);
    };
    if (profile?.role === 'therapist') fetchUsers();
  }, [user, profile]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (profile?.role !== 'therapist') {
    navigate('/dashboard');
    return null;
  }

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box p={4} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" mb={4}>Therapist Dashboard</Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Patients</Typography>
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {fetching ? <CircularProgress /> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.uid}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => navigate(`/therapist/user/${u.uid}`)}>
                        View Progress
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default TherapistDashboard; 