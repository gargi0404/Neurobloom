import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const EMOJIS = [
  { emoji: '😀', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😱', label: 'Scared' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😂', label: 'Laughing' },
  { emoji: '😭', label: 'Crying' },
];
const DIFFICULTY = 4; // Number of options per round
const ROUNDS = 10;
const TIME_PER_ROUND = 5000; // ms

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function playSound(type: 'correct' | 'wrong') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = type === 'correct' ? 880 : 220;
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.2);
}

const EmojiRush: React.FC = () => {
  const { user } = useAuth();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<{ emoji: string; label: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_ROUND);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start new round
  const startRound = () => {
    const emojiObj = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const labels = shuffle([
      emojiObj.label,
      ...shuffle(EMOJIS.filter(e => e.label !== emojiObj.label)).slice(0, DIFFICULTY - 1).map(e => e.label),
    ]);
    setCurrent(emojiObj);
    setOptions(labels);
    setSelected(null);
    setFeedback(null);
    setTimer(TIME_PER_ROUND);
  };

  // Timer logic
  useEffect(() => {
    if (gameOver || selected) return;
    if (timer <= 0) {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => {
        if (round + 1 === ROUNDS) setGameOver(true);
        else setRound(r => r + 1);
      }, 700);
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 100), 100);
    return () => clearTimeout(timerRef.current!);
  }, [timer, gameOver, selected, round]);

  // New round or end
  useEffect(() => {
    if (gameOver) return;
    if (round < ROUNDS) startRound();
  }, [round, gameOver]);

  // Handle answer
  const handleSelect = (label: string) => {
    if (selected || !current) return;
    setSelected(label);
    if (label === current.label) {
      setScore(s => s + 1);
      setFeedback('correct');
      playSound('correct');
    } else {
      setFeedback('wrong');
      playSound('wrong');
    }
    setTimeout(() => {
      if (round + 1 === ROUNDS) setGameOver(true);
      else setRound(r => r + 1);
    }, 700);
  };

  // Submit score
  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'emoji_rush', score, difficulty: DIFFICULTY },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setGameOver(false);
    setSubmitted(false);
    setTimer(TIME_PER_ROUND);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Emoji Rush</Typography>
      {gameOver ? (
        <Box>
          <Typography variant="h6">Game Over!</Typography>
          <Typography>Your Score: {score} / {ROUNDS}</Typography>
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
          <Typography mb={1}>Match the emoji to the correct emotion before time runs out!</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Paper elevation={3} sx={{ fontSize: 64, p: 2, minWidth: 100, textAlign: 'center' }}>
              {current?.emoji}
            </Paper>
          </Box>
          <LinearProgress variant="determinate" value={(timer / TIME_PER_ROUND) * 100} sx={{ mb: 2 }} />
          <Grid container spacing={2} justifyContent="center">
            {options.map(label => (
              <Grid item key={label} xs={6} sm={3}>
                <Button
                  variant={selected === label ? (feedback === 'correct' && label === current?.label ? 'contained' : 'outlined') : 'outlined'}
                  color={selected === label ? (feedback === 'correct' && label === current?.label ? 'success' : 'error') : 'primary'}
                  onClick={() => handleSelect(label)}
                  fullWidth
                  sx={{ fontSize: 18, mb: 1 }}
                  disabled={!!selected}
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography mt={2}>Round: {round + 1} / {ROUNDS} | Score: {score}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmojiRush; 