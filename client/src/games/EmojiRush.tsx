import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import angryImg from '../angry.jpeg';
import tiredImg from '../tired.jpeg';
import sadImg from '../sad.jpeg';
import happyImg from '../happy.jpeg';
import excitedImg from '../excited.jpeg';
import surprisedImg from '../surprised.jpeg';
import determinedImg from '../determined.jpeg';
import neutralImg from '../neutral.jpeg';
import pleadingImg from '../pleading.jpeg';
import cryingImg from '../crying.jpeg';
import disgustedImg from '../disgusted.jpeg';

const FACES = [
  { img: angryImg, label: 'angry', description: 'Angry expression' },
  { img: tiredImg, label: 'tired', description: 'Tired expression' },
  { img: sadImg, label: 'sad', description: 'Sad expression' },
  { img: happyImg, label: 'happy', description: 'Happy expression' },
  { img: excitedImg, label: 'excited', description: 'Excited expression' },
  { img: surprisedImg, label: 'surprised', description: 'Surprised expression' },
  { img: determinedImg, label: 'determined', description: 'Determined expression' },
  { img: neutralImg, label: 'neutral', description: 'Neutral expression' },
  { img: pleadingImg, label: 'pleading', description: 'Pleading expression' },
  { img: cryingImg, label: 'crying', description: 'Crying expression' },
  { img: disgustedImg, label: 'disgusted', description: 'Disgusted expression' },
];
const EMOTION_LABELS = FACES.map(f => f.label);
const DIFFICULTY = 4; // Number of options per round
const ROUNDS = 15;
const TIME_PER_ROUND = 8000; // ms - longer time for ASD support

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function playSound(type: 'correct' | 'wrong' | 'tick') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  
  if (type === 'correct') {
    // Happy ascending sound
    o.frequency.value = 880;
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.3);
  } else if (type === 'wrong') {
    // Sad descending sound
    o.frequency.value = 440;
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
  } else {
    // Tick sound
    o.frequency.value = 660;
  }
  
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + (type === 'tick' ? 0.1 : 0.3));
}

const EmojiRush: React.FC = () => {
  const { user } = useAuth();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<{ img: string; label: string; description: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_ROUND);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start new round
  const startRound = () => {
    const faceObj = FACES[Math.floor(Math.random() * FACES.length)];
    const labels = shuffle([
      faceObj.label,
      ...shuffle(FACES.filter(f => f.label !== faceObj.label)).slice(0, DIFFICULTY - 1).map(f => f.label),
    ]);
    setCurrent(faceObj);
    setOptions(labels);
    setSelected(null);
    setFeedback(null);
    setTimer(TIME_PER_ROUND);
    setShowHint(false);
  };

  // Timer logic with sound feedback
  useEffect(() => {
    if (gameOver || selected) return;
    if (timer <= 0) {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => {
        if (round + 1 === ROUNDS) setGameOver(true);
        else setRound(r => r + 1);
      }, 1000);
      return;
    }
    
    // Play tick sound every 2 seconds
    if (timer % 2000 === 0 && timer > 0) {
      playSound('tick');
    }
    
    timerRef.current = setTimeout(() => setTimer(t => t - 100), 100);
    return () => clearTimeout(timerRef.current!);
  }, [timer, gameOver, selected, round]);

  // Show hint after 4 seconds
  useEffect(() => {
    if (timer <= TIME_PER_ROUND - 4000 && !showHint && !selected && !gameOver) {
      setShowHint(true);
    }
  }, [timer, showHint, selected, gameOver]);

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
    }, 1000);
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
    setShowHint(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Emotion Rush</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Helps with: Autism Spectrum Disorder (ASD) | Trains: Emotion Recognition, Social Interpretation
      </Typography>
      
      {gameOver ? (
        <Box>
          <Typography variant="h6">Game Over!</Typography>
          <Typography>Your Score: {score} / {ROUNDS}</Typography>
          <Typography>Accuracy: {Math.round((score / ROUNDS) * 100)}%</Typography>
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
          <Typography mb={1}>Match the emotion to the correct face before time runs out!</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Paper elevation={3} sx={{ p: 2, minWidth: 220, minHeight: 220, textAlign: 'center', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {current && <img src={current.img} alt={current.label} style={{ maxHeight: 200, maxWidth: 200, borderRadius: 12 }} />}
            </Paper>
          </Box>
          
          {showHint && current && (
            <Box mb={2} p={2} bgcolor="info.light" borderRadius={1}>
              <Typography variant="body2" color="info.contrastText">
                💡 Hint: {current.description}
              </Typography>
            </Box>
          )}
          
          <LinearProgress 
            variant="determinate" 
            value={(timer / TIME_PER_ROUND) * 100} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
            color={timer < 2000 ? 'error' : timer < 4000 ? 'warning' : 'primary'}
          />
          
          <Grid container spacing={2} justifyContent="center" mb={2}>
            {options.map(option => (
              <Grid item key={option} xs={6} sm={3}>
                <Button
                  variant={selected ? (option === current?.label ? (feedback === 'correct' ? 'contained' : 'outlined') : 'outlined') : 'outlined'}
                  color={selected ? (option === current?.label && feedback === 'correct' ? 'success' : option === selected ? 'error' : 'primary') : 'primary'}
                  onClick={() => handleSelect(option)}
                  fullWidth
                  sx={{ fontWeight: 600, textTransform: 'capitalize', borderRadius: 2, py: 1.5 }}
                  disabled={!!selected}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography mt={2} textAlign="center">
            Round: {round + 1} / {ROUNDS} | Score: {score} | Time: {Math.ceil(timer / 1000)}s
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmojiRush; 
  