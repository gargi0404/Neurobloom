import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import EmojiRush from './games/EmojiRush';
import LogicZone from './games/LogicZone';
import Taskflex from './games/Taskflex';
import PatternHeist from './games/PatternHeist';
import GamesInfo from './pages/GamesInfo';
import TherapistDashboard from './pages/TherapistDashboard';
import UserProgress from './pages/UserProgress';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading, needsProfile } = useAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} />;
  if (needsProfile) return <Navigate to="/register" state={{ from: location }} />;
  return children;
}

function RegistrationRoute({ children }: { children: JSX.Element }) {
  const { user, loading, needsProfile } = useAuth();
  const location = useLocation();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} />;
  if (!needsProfile) return <Navigate to="/dashboard" state={{ from: location }} />;
  return children;
}

const App: React.FC = () => (
  <AuthProvider>
    <CssBaseline />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationRoute><Register /></RegistrationRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/games" element={<PrivateRoute><GamesInfo /></PrivateRoute>} />
        <Route path="/therapist" element={<PrivateRoute><TherapistDashboard /></PrivateRoute>} />
        <Route path="/therapist/user/:uid" element={<PrivateRoute><UserProgress /></PrivateRoute>} />
        <Route path="/game/emoji" element={<PrivateRoute><EmojiRush /></PrivateRoute>} />
        <Route path="/game/logic" element={<PrivateRoute><LogicZone /></PrivateRoute>} />
        <Route path="/game/taskflex" element={<PrivateRoute><Taskflex /></PrivateRoute>} />
        <Route path="/game/pattern" element={<PrivateRoute><PatternHeist /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App; 