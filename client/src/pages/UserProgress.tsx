import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Header from '../components/Header';
import { PageWrapper } from "../components/PageWrapper";

const gameLabels = [
  { key: 'pattern_heist', label: 'Pattern Heist' },
  { key: 'emoji_rush', label: 'Emotion Rush' },
  { key: 'logic_zone', label: 'Logic Zone' },
  { key: 'taskflex', label: 'TaskFlex' },
];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57', '#8dd1e1', '#d88884'];

interface UserProgressProps {
  scores?: any[];
  hideHeader?: boolean;
}

const UserProgress: React.FC<UserProgressProps> = ({ scores: propScores, hideHeader }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>(propScores || []);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (propScores) {
      setScores(propScores);
      return;
    }
    const fetchScores = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/score/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(res.data);
      } catch {
        setScores([]);
      }
      setFetching(false);
    };
    fetchScores();
  }, [user, propScores]);

  // Aggregate scores by game
  const gameData = gameLabels.map(game => {
    const gameScores = scores.filter(s => s.game === game.key);
    return {
      name: game.label,
      value: gameScores.reduce((acc, s) => acc + (s.score || 0), 0),
      count: gameScores.length,
    };
  });

  if (loading || fetching) return <Box p={4}><CircularProgress /></Box>;

  return (
    <PageWrapper variant="progress">
      {!hideHeader && <Header />}
      <Box p={4} sx={{ pt: 10 }}>
        {!hideHeader && (
          <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        )}
        {!hideHeader && <Typography variant="h4" mb={2}>Your Progress</Typography>}
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
    </PageWrapper>
  );
};

export default UserProgress; 