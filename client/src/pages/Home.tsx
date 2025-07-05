import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Paper, Typography, TextField, Button, Link as MuiLink, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import Header from '../components/Header';
import logo from '../logo.jpg';

const themeColors = {
  primary: "#3674B5",
  secondary: "#578FCA",
  accent1: "#A1E3F9",
  accent2: "#D1F8EF",
  pastelBg: "#F3F8FF"
};

export default function Home() {
  const navigate = useNavigate();
  const { refetchProfile, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRole, setLoginRole] = useState<'user' | 'therapist'>('user');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      await refetchProfile();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      if (profile.role === 'therapist') {
        navigate('/therapist');
      } else if (profile.role === 'user') {
        navigate('/dashboard');
      }
    }
  }, [profile, navigate]);

  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh', bgcolor: themeColors.pastelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 8 }}>
        <Container maxWidth="md">
          <Grid container>
            {/* Left: Logo and Info */}
            <Grid item xs={12} md={6} sx={{ color: themeColors.primary, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', p: { xs: 4, md: 6 }, minHeight: { md: 480 } }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box component="img" src={logo} alt="NeuroBlooming Logo" sx={{ width: 60, height: 60, mr: 2, borderRadius: 2, bgcolor: '#fff', boxShadow: 2 }} />
                <Typography variant="h4" fontWeight={900} letterSpacing={2}>
                  NEUROBLOOMING
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} mb={2}>
                We make digital tools that help you bloom.
              </Typography>
              <Typography variant="body1" fontWeight={400}>
                Cognitive games, progress tracking, and therapist support for your mental wellness journey. Built by MMIT Pune students for IEEE EMBS.
              </Typography>
            </Grid>
            {/* Right: Login Card */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 4, md: 6 }, minHeight: { md: 480 } }}>
              <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', bgcolor: '#fff', borderRadius: 4, boxShadow: 4, p: 4 }}>
                {/* Role Selection Buttons */}
                <ToggleButtonGroup
                  value={loginRole}
                  exclusive
                  onChange={(_, newRole) => { if (newRole) setLoginRole(newRole); }}
                  sx={{ mb: 3, width: '100%' }}
                  fullWidth
                >
                  <ToggleButton value="user" sx={{ flex: 1, fontWeight: 700, fontSize: 16 }}>
                    User
                  </ToggleButton>
                  <ToggleButton value="therapist" sx={{ flex: 1, fontWeight: 700, fontSize: 16 }}>
                    Therapist
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="h5" fontWeight={700} mb={1} color="text.primary">
                  Sign in as {loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Don&apos;t have an account?{' '}
                  <MuiLink component={Link} to="/register" underline="hover" color="primary.main">
                    Sign up
                  </MuiLink>
                </Typography>
                <form onSubmit={handleLogin}>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                    autoFocus
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2, mb: 1, fontWeight: 700, fontSize: 16 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Log in now'}
                  </Button>
                </form>
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <MuiLink component={Link} to="/forgot-password" underline="hover" color="primary.main">
                    Forgot password
                  </MuiLink>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
} 