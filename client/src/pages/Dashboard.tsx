import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const gameButtons = [
  { label: 'Emoji Rush', route: '/game/emoji' },
  { label: 'Logic Zone', route: '/game/logic' },
  { label: 'Taskflex', route: '/game/taskflex' },
  { label: 'Pattern Heist', route: '/game/pattern' },
];

const GAME_KEYS = [
  { key: 'emoji_rush', label: 'Emoji Rush' },
  { key: 'logic_zone', label: 'Logic Zone' },
  { key: 'taskflex', label: 'Taskflex' },
  { key: 'pattern_heist', label: 'Pattern Heist' },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57', '#8dd1e1', '#d88884'];

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/score/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(res.data);
      } catch {
        setScores([]);
      }
      setLoading(false);
    };
    fetchScores();
  }, [user]);

  // Aggregate scores by game
  const gameData = GAME_KEYS.map(game => {
    const gameScores = scores.filter(s => s.game === game.key);
    return {
      name: game.label,
      value: gameScores.reduce((acc, s) => acc + (s.score || 0), 0),
      count: gameScores.length,
    };
  });

  return (
    <Box p={4} bgcolor="#f5f5f5" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Welcome, {user?.email || 'User'}!</Typography>
          <Button variant="outlined" color="primary" onClick={() => navigate('/games')}>
            About the Games
          </Button>
        </Box>
        <Button variant="outlined" color="secondary" onClick={logout} sx={{ mb: 2 }}>
          Logout
        </Button>
        <Typography variant="h6" mt={4}>Your Progress</Typography>
        <Box mt={4}>
          <Grid container spacing={4}>
            {gameData.map((data, idx) => (
              <Grid item xs={12} sm={6} md={3} key={data.name}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" mb={1}>{data.name}</Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[{ name: 'Score', value: data.value }, { name: 'Missed', value: Math.max(data.count * 10 - data.value, 0) }]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        label
                      >
                        <Cell key="score" fill={COLORS[idx % COLORS.length]} />
                        <Cell key="missed" fill="#eee" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Typography variant="body2" mt={1}>Games Played: {data.count}</Typography>
                  <Typography variant="body2">Total Score: {data.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box mt={4}>
          <Typography variant="h6" mb={2}>Cognitive Games</Typography>
          <Grid container spacing={2}>
            {gameButtons.map(game => (
              <Grid item xs={12} sm={6} md={3} key={game.route}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ height: 60, fontSize: 18 }}
                  onClick={() => navigate(game.route)}
                >
                  {game.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard; 