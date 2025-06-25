import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];
const CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  color: COLORS[i % 4],
  shape: SHAPES[Math.floor(i / 2) % 4],
}));
const DIFFICULTY = 8;
const TIME_PER_CARD = 4000; // ms

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function playSound(type: 'correct' | 'wrong') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = type === 'correct' ? 700 : 150;
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

const Taskflex: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState(shuffle(CARDS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_CARD);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Rule switches halfway
  const rule = index < DIFFICULTY / 2 ? 'color' : 'shape';

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

  // New card or end
  useEffect(() => {
    if (gameOver) return;
    if (index < DIFFICULTY) {
      setSelected(null);
      setFeedback(null);
      setTimer(TIME_PER_CARD);
    }
  }, [index, gameOver]);

  const handleSelect = (bin: string) => {
    if (selected || gameOver) return;
    setSelected(bin);
    const card = cards[index];
    if ((rule === 'color' && card.color === bin) || (rule === 'shape' && card.shape === bin)) {
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
        { game: 'taskflex', score, difficulty: DIFFICULTY },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setCards(shuffle(CARDS));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
    setSubmitted(false);
    setTimer(TIME_PER_CARD);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Taskflex</Typography>
      <Typography mb={1}>Sort by <b>{rule}</b> {rule === 'color' ? '(first half)' : '(second half)'}</Typography>
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
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Paper elevation={3} sx={{ fontSize: 32, p: 2, minWidth: 100, textAlign: 'center', bgcolor: cards[index].color }}>
              {cards[index].shape}
            </Paper>
          </Box>
          <LinearProgress variant="determinate" value={(timer / TIME_PER_CARD) * 100} sx={{ mb: 2 }} />
          <Grid container spacing={2} justifyContent="center">
            {(rule === 'color' ? COLORS : SHAPES).map(bin => (
              <Grid item key={bin} xs={3}>
                <Button
                  variant={selected === bin ? (feedback === 'correct' && ((rule === 'color' && bin === cards[index].color) || (rule === 'shape' && bin === cards[index].shape)) ? 'contained' : 'outlined') : 'outlined'}
                  color={selected === bin ? (feedback === 'correct' && ((rule === 'color' && bin === cards[index].color) || (rule === 'shape' && bin === cards[index].shape)) ? 'success' : 'error') : 'primary'}
                  onClick={() => handleSelect(bin)}
                  fullWidth
                  sx={{ fontSize: 18, mb: 1 }}
                  disabled={!!selected}
                >
                  {bin}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography mt={2}>Card: {index + 1} / {DIFFICULTY} | Score: {score}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Taskflex; 