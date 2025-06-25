import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const ITEMS = [
  { label: 'Apple', type: 'fruit' },
  { label: 'Banana', type: 'fruit' },
  { label: 'Car', type: 'not_fruit' },
  { label: 'Dog', type: 'not_fruit' },
  { label: 'Orange', type: 'fruit' },
  { label: 'Chair', type: 'not_fruit' },
  { label: 'Grape', type: 'fruit' },
  { label: 'Book', type: 'not_fruit' },
];
const DIFFICULTY = 8;
const TIME_PER_ITEM = 4000; // ms

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function playSound(type: 'correct' | 'wrong') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = type === 'correct' ? 660 : 180;
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

const LogicZone: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState(shuffle(ITEMS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_ITEM);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (gameOver || selected) return;
    if (timer <= 0) {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => {
        if (index + 1 === DIFFICULTY) setGameOver(true);
        else setIndex(i => i + 1);
      }, 700);
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 100), 100);
    return () => clearTimeout(timerRef.current!);
  }, [timer, gameOver, selected, index]);

  // New item or end
  useEffect(() => {
    if (gameOver) return;
    if (index < DIFFICULTY) {
      setSelected(null);
      setFeedback(null);
      setTimer(TIME_PER_ITEM);
    }
  }, [index, gameOver]);

  const handleSelect = (zone: 'fruit' | 'not_fruit') => {
    if (selected || gameOver) return;
    setSelected(zone);
    if (items[index].type === zone) {
      setScore(s => s + 1);
      setFeedback('correct');
      playSound('correct');
    } else {
      setFeedback('wrong');
      playSound('wrong');
    }
    setTimeout(() => {
      if (index + 1 === DIFFICULTY) setGameOver(true);
      else setIndex(i => i + 1);
    }, 700);
  };

  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'logic_zone', score, difficulty: DIFFICULTY },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setItems(shuffle(ITEMS));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
    setSubmitted(false);
    setTimer(TIME_PER_ITEM);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Logic Zone</Typography>
      {gameOver ? (
        <Box>
          <Typography variant="h6">Game Over!</Typography>
          <Typography>Your Score: {score} / {DIFFICULTY}</Typography>
          {!submitted ? (
            <Button variant="contained" onClick={handleSubmitScore} disabled={submitting} sx={{ mt: 1 }}>
              {submitting ? 'Submitting...' : 'Submit Score'}
            </Button>
          ) : (
            <Typography color="success.main" mt={1}>Score submitted!</Typography>
          )}
          <Button variant="outlined" onClick={handleRestart} sx={{ mt: 1, ml: 2 }}>
            Play Again
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography mb={1}>Sort the item into the correct category before time runs out!</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Paper elevation={3} sx={{ fontSize: 32, p: 2, minWidth: 100, textAlign: 'center' }}>
              {items[index].label}
            </Paper>
          </Box>
          <LinearProgress variant="determinate" value={(timer / TIME_PER_ITEM) * 100} sx={{ mb: 2 }} />
          <Grid container spacing={2} justifyContent="center">
            {['fruit', 'not_fruit'].map(zone => (
              <Grid item key={zone} xs={6}>
                <Button
                  variant={selected === zone ? (feedback === 'correct' && zone === items[index].type ? 'contained' : 'outlined') : 'outlined'}
                  color={selected === zone ? (feedback === 'correct' && zone === items[index].type ? 'success' : 'error') : 'primary'}
                  onClick={() => handleSelect(zone as 'fruit' | 'not_fruit')}
                  fullWidth
                  sx={{ fontSize: 18, mb: 1 }}
                  disabled={!!selected}
                >
                  {zone === 'fruit' ? 'Fruit' : 'Not Fruit'}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography mt={2}>Item: {index + 1} / {DIFFICULTY} | Score: {score}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default LogicZone; 