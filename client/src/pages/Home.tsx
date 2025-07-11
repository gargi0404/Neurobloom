import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Paper, Typography, TextField, Button, Link as MuiLink, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import Header from '../components/Header';
import logo from '../logo.jpg';
import '@fontsource/inter';
import { PageWrapper } from "../components/PageWrapper";
import "@fontsource/montserrat/700.css";
import "@fontsource/raleway/500.css";
import "@fontsource/raleway/600.css";

const themeColors = {
  primary: "#3674B5",
  secondary: "#578FCA",
  accent1: "#A1E3F9",
  accent2: "#D1F8EF",
  pastelBg: "#F3F8FF"
};

export default function Home(props) {
  const navigate = useNavigate();
  const { refetchProfile, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRole, setLoginRole] = useState<'user' | 'therapist'>('user');
  const [pendingRoleCheck, setPendingRoleCheck] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPendingRoleCheck(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      await refetchProfile();
    } catch (err: any) {
      setError(err.message || "Login failed");
      setPendingRoleCheck(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && pendingRoleCheck) {
      if (profile.role !== loginRole) {
        setError(`This account is not a ${loginRole}. Please select the correct role or use a different account.`);
        setPendingRoleCheck(false);
        return;
      }
      if (profile.role === 'therapist') {
        navigate('/therapist');
      } else if (profile.role === 'user') {
        navigate('/dashboard');
      }
      setPendingRoleCheck(false);
    }
  }, [profile, loginRole, navigate, pendingRoleCheck]);

  return (
    <PageWrapper variant="userHome">
      <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
        {/* Abstract colorful shapes */}
        <Box sx={{ position: 'absolute', top: '-120px', right: '-180px', zIndex: 0 }}>
          <svg width="500" height="350" viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="350" cy="120" rx="200" ry="120" fill="url(#paint0_linear)" fillOpacity="0.7" />
            <defs>
              <linearGradient id="paint0_linear" x1="150" y1="0" x2="500" y2="350" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff7eb3" />
                <stop offset="1" stopColor="#65e4ff" />
              </linearGradient>
            </defs>
          </svg>
        </Box>
        <Box sx={{ position: 'absolute', bottom: '-80px', right: '-60px', zIndex: 0 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="100" fill="#ffe066" fillOpacity="0.5" />
          </svg>
        </Box>
        {/* Centered Login Form (floating, no card) */}
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', boxShadow: 'none', borderRadius: 0 }}>
            {/* Logo Placeholder */}
            <Box sx={{ mb: 2 }}>
              <Box component="img" src={logo} alt="NeuroBloom Logo" sx={{ width: 60, height: 60, borderRadius: 2, boxShadow: 2 }} />
            </Box>
            <Typography
              fontWeight={600}
              sx={{
                letterSpacing: 1,
                fontFamily: "'Raleway', 'Inter', sans-serif",
                color: "#2d2d4b",
                fontSize: { xs: 22, sm: 26, md: 30 },
                textShadow: "0 1px 4px rgba(45,45,75,0.06)",
              }}
            >
              Neuroblooming
            </Typography>
            <Box sx={{ width: 60, height: 5, bgcolor: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', borderRadius: 2, mb: 2, background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' }} />
            <Typography variant="body1" color="text.secondary" mb={1} sx={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              Welcome back! Login to access NeuroBlooming.
            </Typography>
            <Typography variant="body2" color="#ff7eb3" mb={2} sx={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
              Did you <MuiLink component={Link} to="/forgot-password" underline="hover" color="#ff7eb3">forget your password?</MuiLink>
            </Typography>
            {/* Role Toggle */}
            <ToggleButtonGroup
              value={loginRole}
              exclusive
              onChange={(_, newRole) => { if (newRole) setLoginRole(newRole); }}
              sx={{ mb: 2, width: '100%', background: 'rgba(245,248,255,0.7)', borderRadius: 3, boxShadow: 1 }}
              fullWidth
            >
              <ToggleButton value="user" sx={{ flex: 1, fontWeight: 600, fontSize: 16, fontFamily: 'Inter, sans-serif', border: 'none', color: loginRole === 'user' ? '#fff' : '#3674B5', background: loginRole === 'user' ? 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' : 'none', transition: '0.2s', borderRadius: 3, '&:hover': { background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', color: '#fff' } }}>
                User
              </ToggleButton>
              <ToggleButton value="therapist" sx={{ flex: 1, fontWeight: 600, fontSize: 16, fontFamily: 'Inter, sans-serif', border: 'none', color: loginRole === 'therapist' ? '#fff' : '#3674B5', background: loginRole === 'therapist' ? 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' : 'none', transition: '0.2s', borderRadius: 3, '&:hover': { background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', color: '#fff' } }}>
                Therapist
              </ToggleButton>
            </ToggleButtonGroup>
            <form onSubmit={handleLogin} style={{ width: '100%' }}>
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
                InputProps={{ sx: { borderRadius: 3, fontFamily: 'Inter, sans-serif' } }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                InputProps={{ sx: { borderRadius: 3, fontFamily: 'Inter, sans-serif' } }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  mb: 1,
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 3,
                  fontFamily: 'Inter, sans-serif',
                  background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)',
                  color: '#fff',
                  boxShadow: 2,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)',
                    opacity: 0.95,
                  },
                }}
                disabled={loading}
                startIcon={<span style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>→</span>}
              >
                {loading ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </form>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#7b7b9d', fontFamily: 'Inter, sans-serif' }}>
              Don&apos;t have an account?{' '}
              <MuiLink component={Link} to="/register" underline="hover" sx={{ color: '#65e4ff', fontWeight: 700 }}>
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
} 