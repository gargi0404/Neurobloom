import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, TextField, Typography, Paper, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import axios from 'axios';

const Register: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'therapist'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        { name, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>Complete Your Registration</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Typography variant="subtitle1" mt={2}>Role</Typography>
          <RadioGroup
            row
            value={role}
            onChange={e => setRole(e.target.value as 'user' | 'therapist')}
          >
            <FormControlLabel value="user" control={<Radio />} label="User" />
            <FormControlLabel value="therapist" control={<Radio />} label="Therapist" />
          </RadioGroup>
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 