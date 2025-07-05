import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, TextField, CircularProgress, Alert, Grid, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const Profile: React.FC = () => {
  const { user, profile, refetchProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(profile?.name || '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editDisorder, setEditDisorder] = useState((profile as any)?.disorder || '');
  const [editTherapistName, setEditTherapistName] = useState((profile as any)?.therapistName || '');

  const handleEdit = () => {
    setEditName(profile?.name || '');
    setEditDisorder((profile as any)?.disorder || '');
    setEditTherapistName((profile as any)?.therapistName || '');
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = await user?.getIdToken();
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/me`,
        {
          name: editName,
          disorder: editDisorder,
          therapistName: editTherapistName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Profile updated!');
      setEditing(false);
      await refetchProfile();
    } catch (err: any) {
      setError('Failed to update profile.');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditName(profile?.name || '');
    setEditDisorder((profile as any)?.disorder || '');
    setEditTherapistName((profile as any)?.therapistName || '');
    setEditing(false);
    setError('');
    setSuccess('');
  };

  // Calculate overall progress (sum of all scores if available)
  // If you have scores in profile or context, use them; otherwise, show '-'
  const overallProgress = (profile as any)?.overallProgress || '-';
  const disorder = (profile as any)?.disorder || '-';
  const therapistName = (profile as any)?.therapistName || '-';

  if (loading || !profile) return <Box p={4}><CircularProgress /></Box>;

  return (
    <>
      <Header />
      <Box p={4} bgcolor="#f5f5f5" minHeight="100vh" sx={{ pt: 10 }}>
        <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" mb={4} fontWeight={700} letterSpacing={1} textAlign="center">
          Your Profile
        </Typography>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 4 }}>
              <Grid container spacing={4} alignItems="center">
                {/* Avatar and Name Section */}
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 110, height: 110, mx: 'auto', mb: 2, bgcolor: '#1976d2', fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>
                    {profile.name ? profile.name[0].toUpperCase() : (profile.email ? profile.email[0].toUpperCase() : 'U')}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    {editing ? (
                      <TextField
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        size="small"
                        sx={{ mt: 1, mb: 1, width: '90%' }}
                        inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: 22 } }}
                      />
                    ) : (
                      profile.name
                    )}
                  </Typography>
                  {editing ? (
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Button variant="contained" color="primary" onClick={handleSave} disabled={saving || !editName}>
                        {saving ? <CircularProgress size={20} /> : 'Save'}
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={saving}>
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Button variant="outlined" size="small" onClick={handleEdit} sx={{ mt: 1 }}>
                      Edit Profile
                    </Button>
                  )}
                  {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                </Grid>
                {/* Divider for desktop */}
                <Grid item md={1} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
                </Grid>
                {/* Profile Details Section */}
                <Grid item xs={12} md={7}>
                  <Box sx={{ px: { xs: 0, md: 2 } }}>
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Email</Typography>
                    <Typography mb={2} fontSize={18}>{profile.email}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Role</Typography>
                    <Typography mb={2} fontSize={18} textTransform="capitalize">{profile.role}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Disorder</Typography>
                    {editing ? (
                      <TextField
                        value={editDisorder}
                        onChange={e => setEditDisorder(e.target.value)}
                        size="small"
                        sx={{ mb: 2, width: '100%' }}
                      />
                    ) : (
                      <Typography mb={2} fontSize={18}>{disorder}</Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Therapist Name</Typography>
                    {editing ? (
                      <TextField
                        value={editTherapistName}
                        onChange={e => setEditTherapistName(e.target.value)}
                        size="small"
                        sx={{ mb: 2, width: '100%' }}
                      />
                    ) : (
                      <Typography mb={2} fontSize={18}>{therapistName}</Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Overall Progress</Typography>
                    <Typography mb={2} fontSize={18}>{overallProgress}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5} fontWeight={600}>Joined</Typography>
                    <Typography mb={2} fontSize={18}>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Profile; 