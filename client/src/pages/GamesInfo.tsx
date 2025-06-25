import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const games = [
  {
    label: 'Emoji Rush',
    route: '/game/emoji',
    description: 'Match facial expression emojis to the correct emotion label. Helps with Autism Spectrum Disorder (ASD) by training emotion recognition and social interpretation.'
  },
  {
    label: 'Logic Zone',
    route: '/game/logic',
    description: 'Sort items by logic (e.g., Fruit vs. Not Fruit). Supports Depression/Anxiety by training categorization and logical reasoning.'
  },
  {
    label: 'Taskflex',
    route: '/game/taskflex',
    description: 'Rule-switching sorting game. First sort by color, then by shape. Designed for ADHD, it trains cognitive flexibility and attention.'
  },
  {
    label: 'Pattern Heist',
    route: '/game/pattern',
    description: 'Simon-style memory sequence puzzle. Repeat the color sequence. Supports Schizophrenia by training working memory and pattern recognition.'
  },
];

const GamesInfo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box p={4} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" mb={4}>Cognitive Games</Typography>
      <Grid container spacing={3}>
        {games.map(game => (
          <Grid item xs={12} md={6} key={game.route}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" mb={1}>{game.label}</Typography>
              <Typography mb={2}>{game.description}</Typography>
              <Button variant="contained" color="primary" onClick={() => navigate(game.route)}>
                Play {game.label}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GamesInfo; 