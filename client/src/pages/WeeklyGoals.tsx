import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Checkbox, FormControlLabel, Grid, Button, LinearProgress, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_GOALS = [
  'Play at least 3 cognitive games',
  'Complete 1 screener',
  'Log in at least 4 days this week',
  'Review your progress',
  'Try a new game mode',
];

const MOTIVATION_QUOTES = [
  'Small steps every day lead to big changes.',
  'Progress, not perfection!',
  'You are blooming, keep going!',
  'Every goal checked is a win for your mind.',
  'Consistency is the key to growth.',
];

function getRandomQuote() {
  return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
}

interface WeeklyGoalsProps {
  checked?: boolean[];
  readOnly?: boolean;
  horizontal?: boolean;
  userId?: string;
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ checked: externalChecked, readOnly, horizontal, userId }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<string[]>(DEFAULT_GOALS);
  const [checked, setChecked] = useState<boolean[]>(externalChecked || Array(DEFAULT_GOALS.length).fill(false));
  const [quote, setQuote] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Use userId if provided, otherwise use current user's UID
  const currentUserId = userId || user?.uid || 'default';
  const LOCAL_KEY = `weeklyGoalsStatus_${currentUserId}`;

  useEffect(() => {
    setQuote(getRandomQuote());
    if (externalChecked) {
      setChecked(externalChecked);
      setHasLoaded(true);
      return;
    }
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      setChecked(JSON.parse(saved));
    }
    setHasLoaded(true);
  }, [externalChecked, LOCAL_KEY]);

  useEffect(() => {
    if (!externalChecked && hasLoaded) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(checked));
    }
  }, [checked, hasLoaded, externalChecked, LOCAL_KEY]);

  const handleCheck = (idx: number) => {
    if (readOnly) return;
    setChecked(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleReset = () => {
    if (readOnly) return;
    setChecked(Array(goals.length).fill(false));
  };

  const completed = checked.filter(Boolean).length;
  const percent = Math.round((completed / goals.length) * 100);

  if (horizontal) {
    return (
      <PageWrapper variant="other">
        <Paper elevation={6} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', p: { xs: 2, md: 4 }, borderRadius: 5, maxWidth: 1200, mx: 'auto', width: '100%', minHeight: 400, boxShadow: 6, bgcolor: '#fff' }}>
          <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2} borderRight={{ md: '1px solid #f0f0f0' }}>
            <Avatar sx={{ bgcolor: '#ffe066', width: 72, height: 72, mb: 2 }}>
              <EmojiEventsIcon sx={{ color: '#fbc02d', fontSize: 44 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={700} color="primary" mb={1}>Weekly Goals</Typography>
            <Typography color="text.secondary" fontSize={18} mb={2} textAlign="center">{quote}</Typography>
            <LinearProgress variant="determinate" value={percent} sx={{ width: '80%', height: 10, borderRadius: 5, mb: 2 }} />
            <Typography color="primary" fontWeight={700} fontSize={18} mt={1}>{completed} of {goals.length} goals completed</Typography>
          </Box>
          <Box flex={2} display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={2}>
            <Grid container spacing={2} justifyContent="center">
              {goals.map((goal, idx) => (
                <Grid item xs={12} sm={6} md={6} key={goal}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 1, bgcolor: checked[idx] ? '#e8f5e9' : '#f9f9f9', display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={checked[idx]}
                      onChange={() => handleCheck(idx)}
                      sx={{
                        color: checked[idx] ? '#43a047' : '#bdbdbd',
                        '&.Mui-checked': { color: '#43a047' },
                        transform: 'scale(1.3)',
                      }}
                      disabled={readOnly}
                    />
                    <Typography fontSize={18} fontWeight={checked[idx] ? 700 : 500} color={checked[idx] ? 'success.main' : 'text.primary'}>
                      {goal}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {!readOnly && (
              <Button variant="outlined" color="secondary" onClick={handleReset} sx={{ borderRadius: 3, px: 4, fontWeight: 600, mt: 3 }}>
                Reset All
              </Button>
            )}
          </Box>
        </Paper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper variant="other">
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 5, bgcolor: '#ffffffcc', boxShadow: 6 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: '#ffd600', width: 64, height: 64, mb: 2 }}>
                <EmojiEventsIcon sx={{ color: '#ff9800', fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={800} color="primary.main" mb={1} letterSpacing={1} textAlign="center">
                Weekly Goals
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontStyle="italic" textAlign="center">
                {quote}
              </Typography>
            </Box>
            <Box mb={3}>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 12, borderRadius: 6, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: percent === 100 ? '#43a047' : '#1976d2' } }}
              />
              <Typography mt={1} textAlign="center" fontWeight={600} color={percent === 100 ? 'success.main' : 'primary.main'}>
                {percent === 100 ? 'All goals complete! 🎉' : `${completed} of ${goals.length} goals completed`}
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {goals.map((goal, idx) => (
                <Grid item xs={12} key={goal}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: checked[idx] ? '#e8f5e9' : '#f8f9fa', transition: '0.2s', boxShadow: checked[idx] ? 3 : 0 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked[idx]}
                          onChange={() => handleCheck(idx)}
                          sx={{
                            color: checked[idx] ? '#43a047' : '#bdbdbd',
                            '&.Mui-checked': { color: '#43a047' },
                            transform: 'scale(1.3)',
                          }}
                          disabled={readOnly}
                        />
                      }
                      label={<Typography fontSize={18} fontWeight={checked[idx] ? 700 : 500} color={checked[idx] ? 'success.main' : 'text.primary'}>{goal}</Typography>}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Box mt={5} textAlign="center">
              <Button variant="outlined" color="secondary" onClick={handleReset} sx={{ borderRadius: 3, px: 4, fontWeight: 600 }} disabled={readOnly}>
                Reset All
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </PageWrapper>
  );
};

export default WeeklyGoals; 