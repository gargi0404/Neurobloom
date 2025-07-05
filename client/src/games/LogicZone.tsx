import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import logicImg from '../logic.jpeg';

const THOUGHTS = [
  // Healthy thoughts
  { text: "I can handle this challenge", category: 'healthy', explanation: "Shows confidence and resilience" },
  { text: "Mistakes help me learn and grow", category: 'healthy', explanation: "Growth mindset perspective" },
  { text: "I am doing my best right now", category: 'healthy', explanation: "Self-compassion and acceptance" },
  { text: "This feeling will pass", category: 'healthy', explanation: "Temporal perspective on emotions" },
  { text: "I have overcome difficulties before", category: 'healthy', explanation: "Evidence of past resilience" },
  { text: "I can ask for help when needed", category: 'healthy', explanation: "Healthy support-seeking behavior" },
  { text: "Progress, not perfection", category: 'healthy', explanation: "Realistic expectations" },
  { text: "I am worthy of love and respect", category: 'healthy', explanation: "Positive self-worth" },
  
  // Unhelpful thoughts
  { text: "I'm a complete failure", category: 'unhelpful', explanation: "All-or-nothing thinking" },
  { text: "Everyone is judging me", category: 'unhelpful', explanation: "Mind reading assumption" },
  { text: "This will never get better", category: 'unhelpful', explanation: "Catastrophic thinking" },
  { text: "I should be perfect at everything", category: 'unhelpful', explanation: "Unrealistic standards" },
  { text: "I'm worthless", category: 'unhelpful', explanation: "Negative self-labeling" },
  { text: "Everything is my fault", category: 'unhelpful', explanation: "Excessive self-blame" },
  { text: "I can't trust anyone", category: 'unhelpful', explanation: "Overgeneralization" },
  { text: "I'm going crazy", category: 'unhelpful', explanation: "Catastrophic labeling" },
];

const ROUNDS = 12;
const TIME_PER_ROUND = 15000; // ms - longer time for cognitive processing

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function playSound(type: 'correct' | 'wrong' | 'drop') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  
  if (type === 'correct') {
    // Gentle success sound
    o.frequency.value = 523;
    o.frequency.exponentialRampToValueAtTime(659, ctx.currentTime + 0.2);
  } else if (type === 'wrong') {
    // Soft error sound
    o.frequency.value = 440;
    o.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.2);
  } else {
    // Drop sound
    o.frequency.value = 220;
  }
  
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + (type === 'drop' ? 0.1 : 0.2));
}

const LogicZone: React.FC = () => {
  const { user } = useAuth();
  const [round, setRound] = useState(0);
  const [currentThought, setCurrentThought] = useState<{ text: string; category: string; explanation: string } | null>(null);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_ROUND);
  const [showExplanation, setShowExplanation] = useState(false);
  const [thoughts, setThoughts] = useState(shuffle(THOUGHTS));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start new round
  const startRound = () => {
    if (round < thoughts.length) {
      setCurrentThought(thoughts[round]);
      setSelected(null);
      setFeedback(null);
      setTimer(TIME_PER_ROUND);
      setShowExplanation(false);
    }
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
      }, 1000);
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

  const handleSelect = (category: 'healthy' | 'unhelpful') => {
    if (selected || !currentThought) return;
    setSelected(category);
    if (currentThought.category === category) {
      setScore(s => s + 1);
      setFeedback('correct');
      playSound('correct');
    } else {
      setFeedback('wrong');
      playSound('wrong');
    }
    
    // Show explanation after selection
    setTimeout(() => {
      setShowExplanation(true);
      setTimeout(() => {
        if (round + 1 === ROUNDS) setGameOver(true);
        else setRound(r => r + 1);
      }, 2000);
    }, 500);
  };

  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'logic_zone', score, difficulty: ROUNDS },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setThoughts(shuffle(THOUGHTS));
    setRound(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
    setSubmitted(false);
    setTimer(TIME_PER_ROUND);
    setShowExplanation(false);
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="center" mb={2}>
        <img src={logicImg} alt="Logic" style={{ maxWidth: 120, borderRadius: 8 }} />
      </Box>
      <Typography variant="h5" mb={2}>Logic Zone: Thought Sorting</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Helps with: Depression, Anxiety, OCD, PTSD, Schizophrenia | Trains: Thought Organization, Cognitive Restructuring
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
          <Typography mb={2}>Sort this thought into the correct category:</Typography>
          
          <Card elevation={3} sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" textAlign="center" sx={{ fontStyle: 'italic' }}>
                "{currentThought?.text}"
              </Typography>
            </CardContent>
          </Card>
          
          <LinearProgress 
            variant="determinate" 
            value={(timer / TIME_PER_ROUND) * 100} 
            sx={{ mb: 3, height: 8, borderRadius: 4 }}
            color={timer < 3000 ? 'error' : timer < 7000 ? 'warning' : 'primary'}
          />
          
          <Grid container spacing={3} justifyContent="center" mb={3}>
            <Grid item xs={12} sm={5}>
              <Paper
                elevation={selected === 'healthy' ? 8 : 2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: selected === 'healthy' ? (feedback === 'correct' ? 'success.light' : 'error.light') : 'success.50',
                  border: selected === 'healthy' ? '3px solid' : '1px solid',
                  borderColor: selected === 'healthy' ? (feedback === 'correct' ? 'success.main' : 'error.main') : 'success.main',
                  cursor: selected ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: selected ? 'none' : 'scale(1.02)',
                    elevation: selected ? 8 : 4,
                  }
                }}
                onClick={() => handleSelect('healthy')}
              >
                <Typography variant="h6" color="success.dark" mb={1}>
                  🌱 Healthy Thoughts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Constructive, balanced, and helpful perspectives
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <Paper
                elevation={selected === 'unhelpful' ? 8 : 2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: selected === 'unhelpful' ? (feedback === 'correct' ? 'success.light' : 'error.light') : 'error.50',
                  border: selected === 'unhelpful' ? '3px solid' : '1px solid',
                  borderColor: selected === 'unhelpful' ? (feedback === 'correct' ? 'success.main' : 'error.main') : 'error.main',
                  cursor: selected ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: selected ? 'none' : 'scale(1.02)',
                    elevation: selected ? 8 : 4,
                  }
                }}
                onClick={() => handleSelect('unhelpful')}
              >
                <Typography variant="h6" color="error.dark" mb={1}>
                  ⚠️ Unhelpful Thoughts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Distorted, extreme, or unconstructive thinking
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {showExplanation && currentThought && (
            <Box p={2} bgcolor="info.light" borderRadius={2} mb={2}>
              <Typography variant="h6" color="info.contrastText" mb={1}>
                💡 Why this is {currentThought.category}:
              </Typography>
              <Typography variant="body2" color="info.contrastText">
                {currentThought.explanation}
              </Typography>
            </Box>
          )}
          
          <Typography textAlign="center">
            Round: {round + 1} / {ROUNDS} | Score: {score} | Time: {Math.ceil(timer / 1000)}s
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LogicZone; 