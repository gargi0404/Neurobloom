import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './pages/Register';
import EmojiRush from './games/EmojiRush';
import LogicZone from './games/LogicZone';
import Taskflex from './games/Taskflex';
import PatternHeist from './games/PatternHeist';
import GamesInfo from './pages/GamesInfo';
import TherapistDashboard from './pages/TherapistDashboard';
import UserProgress from './pages/UserProgress';
import Home from './pages/Home';
import { Grid } from '@mui/material';
import { Button } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ScreenerPage from './pages/ScreenerPage';
import HistoryByDate from './pages/HistoryByDate';
import About from './pages/About';
import ScreenerResults from './pages/ScreenerResults';
import TherapistProgress from './pages/TherapistProgress';
import TherapistHistory from './pages/TherapistHistory';
import WeeklyGoals from './pages/WeeklyGoals';
import TherapistWeeklyGoals from './pages/TherapistWeeklyGoals';
import TherapistScreenerResults from './pages/TherapistScreenerResults';
import TherapistPatientList from './pages/TherapistPatientList';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading, needsProfile } = useAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" state={{ from: location }} />;
  if (needsProfile) return <Navigate to="/register" state={{ from: location }} />;
  return children;
}

function RegistrationRoute({ children }: { children: JSX.Element }) {
  const { user, loading, needsProfile } = useAuth();
  if (loading) return <div>Loading...</div>;
  // Allow guests to access /register. Only redirect if logged in and already have a profile.
  if (user && !needsProfile) return <Navigate to="/dashboard" />;
  return children;
}

function TherapistRoute({ children }: { children: JSX.Element }) {
  const { user, loading, needsProfile, profile } = useAuth();
  const location = useLocation();
  if (loading || !profile) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" state={{ from: location }} />;
  if (needsProfile) return <Navigate to="/register" state={{ from: location }} />;
  if (profile.role !== 'therapist') return <Navigate to="/dashboard" state={{ from: location }} />;
  return children;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationRoute><Register /></RegistrationRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/games" element={<PrivateRoute><GamesInfo /></PrivateRoute>} />
          <Route path="/therapist" element={<TherapistRoute><TherapistDashboard /></TherapistRoute>} />
          <Route path="/therapist/patients" element={<TherapistRoute><TherapistPatientList /></TherapistRoute>} />
          <Route path="/therapist/progress" element={<TherapistRoute><TherapistProgress /></TherapistRoute>} />
          <Route path="/therapist/history" element={<TherapistRoute><TherapistHistory /></TherapistRoute>} />
          <Route path="/therapist/user/:uid" element={<TherapistRoute><UserProgress /></TherapistRoute>} />
          <Route path="/progress" element={<PrivateRoute><UserProgress /></PrivateRoute>} />
          <Route path="/game/emoji" element={<PrivateRoute><EmojiRush /></PrivateRoute>} />
          <Route path="/game/logic" element={<PrivateRoute><LogicZone /></PrivateRoute>} />
          <Route path="/game/taskflex" element={<PrivateRoute><Taskflex /></PrivateRoute>} />
          <Route path="/game/pattern" element={<PrivateRoute><PatternHeist /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/screener" element={<PrivateRoute><ScreenerPage /></PrivateRoute>} />
          <Route path="/history-by-date" element={<PrivateRoute><HistoryByDate /></PrivateRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/screeners/results" element={<PrivateRoute><ScreenerResults /></PrivateRoute>} />
          <Route path="/weekly-goals" element={<PrivateRoute><WeeklyGoals /></PrivateRoute>} />
          <Route path="/therapist/weekly-goals" element={<TherapistRoute><TherapistWeeklyGoals /></TherapistRoute>} />
          <Route path="/therapist/screener-results" element={<TherapistRoute><TherapistScreenerResults /></TherapistRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App; 