import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import patternImg from '../pattern.jpeg';
import emojiImg from '../emoji.jpeg';
import logicImg from '../logic.jpeg';
import taskImg from '../task.jpeg';
import { PageWrapper } from "../components/PageWrapper";

const games = [
  {
    key: 'pattern_heist',
    label: 'Pattern Heist',
    description: 'Test your pattern recognition and memory skills with this engaging game.',
    image: patternImg,
    route: '/game/pattern'
  },
  {
    key: 'emoji_rush',
    label: 'Emotion Rush',
    description: 'Improve your emotional recognition and processing speed.',
    image: emojiImg,
    route: '/game/emoji'
  },
  {
    key: 'logic_zone',
    label: 'Logic Zone',
    description: 'Challenge your logical thinking and problem-solving abilities.',
    image: logicImg,
    route: '/game/logic'
  },
  {
    key: 'taskflex',
    label: 'TaskFlex',
    description: 'Enhance your attention and task-switching capabilities.',
    image: taskImg,
    route: '/game/taskflex'
  }
];

const GamesInfo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PageWrapper variant="games">
      <Header />
      <Box p={4} sx={{ pt: 10 }}>
        <Typography variant="h4" mb={4} fontWeight={500} letterSpacing={1}>Cognitive Games</Typography>
        <Grid container spacing={4}>
          {games.map(game => (
            <Grid item xs={12} sm={6} md={6} key={game.route}>
              <Paper elevation={4} sx={{ p: 0, borderRadius: 4, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <Box sx={{ width: '100%', height: 180, bgcolor: '#e3f0fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={game.image} alt={game.label} style={{ maxHeight: 140, maxWidth: '90%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 2px 8px #b3c6e0' }} />
                </Box>
                <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="h5" fontWeight={500} mb={1} color="primary.main">{game.label}</Typography>
                  <Typography mb={2} color="text.secondary">{game.description}</Typography>
                  <Button variant="contained" color="primary" onClick={() => navigate(game.route)} sx={{ alignSelf: 'flex-start', mt: 'auto', fontWeight: 500, borderRadius: 2 }}>
                    Play {game.label}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </PageWrapper>
  );
};

export default GamesInfo; 