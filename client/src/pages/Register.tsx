import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, Psychology, School, Person } from '@mui/icons-material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import '@fontsource/inter';
import logo from '../logo.jpg';

const MENTAL_HEALTH_CONDITIONS = [
  { id: 'adhd', label: 'ADHD', description: 'Attention Deficit Hyperactivity Disorder' },
  { id: 'anxiety', label: 'Anxiety', description: 'Generalized Anxiety Disorder' },
  { id: 'depression', label: 'Depression', description: 'Major Depressive Disorder' },
  { id: 'ocd', label: 'OCD', description: 'Obsessive-Compulsive Disorder' },
  { id: 'ptsd', label: 'PTSD', description: 'Post-Traumatic Stress Disorder' },
  { id: 'schizophrenia', label: 'Schizophrenia', description: 'Schizophrenia Spectrum Disorder' },
  { id: 'asd', label: 'ASD', description: 'Autism Spectrum Disorder' },
  { id: 'none', label: 'None', description: 'No specific condition' },
];

const Register: React.FC = () => {
  const { login, refetchProfile, profile } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Basic Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Profile Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<'user' | 'therapist'>('user');

  // Step 3: Mental Health & Preferences
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState('');
  const [experience, setExperience] = useState('beginner');

  const steps = ['Account Setup', 'Profile Information', 'Health & Goals'];

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) return false;
    if (password !== confirmPassword) return false;
    if (password.length < 6) return false;
    if (!email.includes('@')) return false;
    return true;
  };

  const validateStep2 = () => {
    if (!firstName || !lastName || !age) return false;
    if (parseInt(age) < 13 || parseInt(age) > 120) return false;
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) {
      setError('Please fill in all fields correctly. Password must be at least 6 characters.');
      return;
    }
    if (activeStep === 1 && !validateStep2()) {
      setError('Please fill in all fields correctly. Age must be between 13 and 120.');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => {
      if (conditionId === 'none') {
        return ['none'];
      }
      if (prev.includes(conditionId)) {
        return prev.filter(id => id !== conditionId);
      } else {
        const newConditions = prev.filter(id => id !== 'none');
        return [...newConditions, conditionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if Firebase is available
      const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                               import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                               import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                               import.meta.env.VITE_FIREBASE_APP_ID;

      if (hasFirebaseConfig) {
        // Create Firebase account
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get token for API calls
        const token = await user.getIdToken();

        // Create user profile
        await axios.post(
          `${import.meta.env.VITE_API_URL}/user/register`,
          {
            firstName,
            lastName,
            age: parseInt(age),
            role,
            mentalHealthConditions: selectedConditions.filter(c => c !== 'none'),
            goals,
            experience,
            email
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Development mode - mock registration
        console.log('Development mode: Mock registration completed');
        console.log('User data:', {
          firstName,
          lastName,
          age: parseInt(age),
          role,
          mentalHealthConditions: selectedConditions.filter(c => c !== 'none'),
          goals,
          experience,
          email
        });
      }

      // After registration, poll /me until role is 'therapist' or timeout
      const auth = getAuth();
      if (!auth.currentUser) {
        setError('Not authenticated after registration. Please log in.');
        setLoading(false);
        return;
      }
      const token = await auth.currentUser.getIdToken();
      let userProfile = null;
      for (let i = 0; i < 10; i++) { // Try for up to 2 seconds
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        userProfile = res.data;
        console.log('Polled profile after registration:', userProfile);
        if (userProfile.role === 'therapist') {
          navigate('/therapist');
          return;
        }
        await new Promise(res => setTimeout(res, 200));
      }
      // Fallback: navigate based on whatever role is present
      if (userProfile && userProfile.role === 'therapist') {
        navigate('/therapist');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" mb={2} display="flex" alignItems="center">
        <Person sx={{ mr: 1 }} />
        Create Your Account
      </Typography>
      <TextField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
        helperText="We'll use this for login and important updates"
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        helperText="Minimum 6 characters"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        error={password !== confirmPassword && confirmPassword !== ''}
        helperText={password !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" mb={2} display="flex" alignItems="center">
        <Person sx={{ mr: 1 }} />
        Tell Us About Yourself
      </Typography>
      <Box display="flex" gap={2}>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
      </Box>
      <TextField
        label="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        fullWidth
        margin="normal"
        required
        inputProps={{ min: 13, max: 120 }}
        helperText="Must be 13 or older"
      />
      <FormControl component="fieldset" margin="normal">
        <FormLabel component="legend">I am a:</FormLabel>
        <RadioGroup
          row
          value={role}
          onChange={(e) => setRole(e.target.value as 'user' | 'therapist')}
        >
          <FormControlLabel 
            value="user" 
            control={<Radio />} 
            label={
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1, fontSize: 20 }} />
                User (Seeking Support)
              </Box>
            } 
          />
          <FormControlLabel 
            value="therapist" 
            control={<Radio />} 
            label={
              <Box display="flex" alignItems="center">
                <Psychology sx={{ mr: 1, fontSize: 20 }} />
                Therapist (Providing Support)
              </Box>
            } 
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" mb={2} display="flex" alignItems="center">
        <Psychology sx={{ mr: 1 }} />
        Health & Goals
      </Typography>
      
      {role === 'user' && (
        <>
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend">
              Mental Health Conditions (Optional - helps us personalize your experience)
            </FormLabel>
            <FormGroup>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {MENTAL_HEALTH_CONDITIONS.map((condition) => (
                  <Chip
                    key={condition.id}
                    label={condition.label}
                    onClick={() => handleConditionToggle(condition.id)}
                    color={selectedConditions.includes(condition.id) ? 'primary' : 'default'}
                    variant={selectedConditions.includes(condition.id) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </FormGroup>
          </FormControl>

          <TextField
            label="What are your goals?"
            multiline
            rows={3}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., Improve focus, reduce anxiety, better emotional regulation..."
            helperText="This helps us recommend the right games and track your progress"
            onKeyDown={e => e.stopPropagation()}
          />

          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Experience Level</FormLabel>
            <RadioGroup
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <FormControlLabel value="beginner" control={<Radio />} label="Beginner - New to cognitive training" />
              <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate - Some experience" />
              <FormControlLabel value="advanced" control={<Radio />} label="Advanced - Regular practice" />
            </RadioGroup>
          </FormControl>
        </>
      )}

      {role === 'therapist' && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            As a therapist, you'll have access to patient progress tracking and specialized tools.
          </Alert>
          <TextField
            label="Professional Goals"
            multiline
            rows={3}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., Help patients with cognitive training, track progress, provide insights..."
            onKeyDown={e => e.stopPropagation()}
          />
        </Box>
      )}
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  // useEffect for navigation based on profile
  useEffect(() => {
    if (profile) {
      console.log('Profile in Register.tsx:', profile);
      if (profile.role === 'therapist') {
        navigate('/therapist');
      } else if (profile.role === 'user') {
        navigate('/dashboard');
      }
    }
  }, [profile, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
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
      {/* Centered Register Form (floating, no card) */}
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {/* Logo Placeholder */}
          <Box sx={{ mb: 2 }}>
            <Box component="img" src={logo} alt="NeuroBloom Logo" sx={{ width: 60, height: 60, borderRadius: 2, boxShadow: 2 }} />
          </Box>
          <Typography variant="h3" fontWeight={600} color="#2d2d4b" mb={0.5} sx={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', letterSpacing: 1, fontSize: { xs: 32, md: 38 } }}>
            Create Account
          </Typography>
          <Box sx={{ width: 60, height: 5, bgcolor: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', borderRadius: 2, mb: 2, background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)' }} />
          <Typography variant="body1" color="text.secondary" mb={1} sx={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            Join NeuroBlooming and start your journey!
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {renderStepContent()}
            <Box display="flex" justifyContent="space-between" mt={4}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ borderRadius: 3, fontFamily: 'Inter, sans-serif' }}
                >
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 140, fontWeight: 700, fontSize: 18, borderRadius: 3, fontFamily: 'Inter, sans-serif', background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', color: '#fff', boxShadow: 2, textTransform: 'none', '&:hover': { background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', opacity: 0.95 } }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ minWidth: 140, fontWeight: 700, fontSize: 18, borderRadius: 3, fontFamily: 'Inter, sans-serif', background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', color: '#fff', boxShadow: 2, textTransform: 'none', '&:hover': { background: 'linear-gradient(90deg, #ff7eb3 0%, #65e4ff 100%)', opacity: 0.95 } }}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#7b7b9d', fontFamily: 'Inter, sans-serif' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: '#65e4ff', fontWeight: 700, textDecoration: 'underline' }}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register; 