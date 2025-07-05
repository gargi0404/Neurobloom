import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Grid, LinearProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import taskImg from '../task.jpeg';

const ROUNDS = 20;
const TIME_PER_CARD = 15000; // ms

const COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'teal'];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'pentagon', 'hexagon'];
const SIZES = ['small', 'medium', 'large'];

const BASE_CARDS = [
  // Small cards
  { id: 1, color: 'red', shape: 'circle', size: 'small' },
  { id: 2, color: 'blue', shape: 'square', size: 'small' },
  { id: 3, color: 'green', shape: 'triangle', size: 'small' },
  { id: 4, color: 'yellow', shape: 'star', size: 'small' },
  { id: 5, color: 'orange', shape: 'heart', size: 'small' },
  { id: 6, color: 'purple', shape: 'diamond', size: 'small' },
  { id: 7, color: 'pink', shape: 'pentagon', size: 'small' },
  { id: 8, color: 'teal', shape: 'hexagon', size: 'small' },
  // Medium cards
  { id: 9, color: 'red', shape: 'square', size: 'medium' },
  { id: 10, color: 'blue', shape: 'triangle', size: 'medium' },
  { id: 11, color: 'green', shape: 'star', size: 'medium' },
  { id: 12, color: 'yellow', shape: 'circle', size: 'medium' },
  { id: 13, color: 'orange', shape: 'heart', size: 'medium' },
  { id: 14, color: 'purple', shape: 'diamond', size: 'medium' },
  { id: 15, color: 'pink', shape: 'pentagon', size: 'medium' },
  { id: 16, color: 'teal', shape: 'hexagon', size: 'medium' },
  // Large cards
  { id: 17, color: 'red', shape: 'triangle', size: 'large' },
  { id: 18, color: 'blue', shape: 'star', size: 'large' },
  { id: 19, color: 'green', shape: 'circle', size: 'large' },
  { id: 20, color: 'yellow', shape: 'square', size: 'large' },
  { id: 21, color: 'orange', shape: 'heart', size: 'large' },
  { id: 22, color: 'purple', shape: 'diamond', size: 'large' },
  { id: 23, color: 'pink', shape: 'pentagon', size: 'large' },
  { id: 24, color: 'teal', shape: 'hexagon', size: 'large' },
];

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function getDeck(rounds: number) {
  // Repeat and shuffle the base cards to get at least 'rounds' cards
  let deck: any[] = [];
  while (deck.length < rounds) {
    deck = deck.concat(shuffle(BASE_CARDS));
  }
  return deck.slice(0, rounds);
}

function playSound(type: 'correct' | 'wrong' | 'rule_change') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  
  if (type === 'correct') {
    // Success sound
    o.frequency.value = 523;
    o.frequency.exponentialRampToValueAtTime(659, ctx.currentTime + 0.2);
  } else if (type === 'wrong') {
    // Error sound
    o.frequency.value = 440;
    o.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.2);
  } else {
    // Rule change sound - attention grabbing
    o.frequency.value = 880;
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
  }
  
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + (type === 'rule_change' ? 0.3 : 0.2));
}

const Taskflex: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState(getDeck(ROUNDS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(TIME_PER_CARD);
  const [currentRule, setCurrentRule] = useState<'color' | 'shape' | 'size'>('color');
  const [showRuleChange, setShowRuleChange] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const RULE_CHANGE_INTERVAL = 15000; // 15 seconds
  const [gameTime, setGameTime] = useState(0);

  useEffect(() => {
    if (gameOver) return;
    gameTimerRef.current = setTimeout(() => setGameTime(t => t + 1), 1000);
    return () => clearTimeout(gameTimerRef.current!);
  }, [gameTime, gameOver]);

  useEffect(() => {
    const ruleIndex = Math.floor(gameTime / (RULE_CHANGE_INTERVAL / 1000)) % 3;
    const rules: ('color' | 'shape' | 'size')[] = ['color', 'shape', 'size'];
    const newRule = rules[ruleIndex];
    if (newRule !== currentRule) {
      setCurrentRule(newRule);
      setShowRuleChange(true);
      playSound('rule_change');
      setTimeout(() => setShowRuleChange(false), 2000);
    }
  }, [gameTime, currentRule]);

  // Card timer
  useEffect(() => {
    if (gameOver || selected) return;
    if (timer <= 0) {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => {
        if (index + 1 === ROUNDS) setGameOver(true);
        else setIndex(i => i + 1);
      }, 1000);
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 100), 100);
    return () => clearTimeout(timerRef.current!);
  }, [timer, gameOver, selected, index]);

  // New card or end
  useEffect(() => {
    if (gameOver) return;
    if (index < ROUNDS) {
      setSelected(null);
      setFeedback(null);
      setTimer(TIME_PER_CARD);
    }
  }, [index, gameOver]);

  const handleSelect = (bin: string) => {
    if (selected || gameOver) return;
    setSelected(bin);
    const card = cards[index];
    let isCorrect = false;
    if (currentRule === 'color') isCorrect = card?.color === bin;
    else if (currentRule === 'shape') isCorrect = card?.shape === bin;
    else if (currentRule === 'size') isCorrect = card?.size === bin;

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      playSound('correct');
    } else {
      setFeedback('wrong');
      playSound('wrong');
    }
    setTimeout(() => {
      if (index + 1 === ROUNDS) setGameOver(true);
      else setIndex(i => i + 1);
    }, 1000);
  };

  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'taskflex', score, difficulty: ROUNDS },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setCards(getDeck(ROUNDS));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
    setSubmitted(false);
    setTimer(TIME_PER_CARD);
    setCurrentRule('color');
    setShowRuleChange(false);
  };

  const getRuleOptions = () => {
    switch (currentRule) {
      case 'color': return COLORS;
      case 'shape': return SHAPES;
      case 'size': return SIZES;
      default: return COLORS;
    }
  };

  const getCardDisplay = (card: any) => {
    const sizeMultiplier = card.size === 'small' ? 0.7 : card.size === 'medium' ? 1 : 1.3;
    let shapeContent = null;
    switch (card.shape) {
      case 'star': shapeContent = '★'; break;
      case 'square': shapeContent = '■'; break;
      case 'circle': shapeContent = ''; break;
      case 'triangle': shapeContent = ''; break;
      case 'heart': shapeContent = '♥'; break;
      case 'diamond': shapeContent = '◆'; break;
      case 'pentagon': shapeContent = '⬟'; break;
      case 'hexagon': shapeContent = '⬢'; break;
      default: shapeContent = ''; break;
    }
    return (
      <Box
        sx={{
          width: 80 * sizeMultiplier,
          height: 80 * sizeMultiplier,
          bgcolor: card.color,
          borderRadius: card.shape === 'circle' ? '50%' : card.shape === 'triangle' ? '0' : card.shape === 'heart' ? '50% 50% 40% 40%/60% 60% 40% 40%' : '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24 * sizeMultiplier,
          fontWeight: 'bold',
          color: 'white',
          border: card.shape === 'triangle' ? 'none' : (currentRule === 'shape' ? '4px solid #1976d2' : '2px solid white'),
          position: 'relative',
          '&::before': card.shape === 'triangle' ? {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: `${40 * sizeMultiplier}px solid transparent`,
            borderRight: `${40 * sizeMultiplier}px solid transparent`,
            borderBottom: `${70 * sizeMultiplier}px solid ${card.color}`,
          } : {},
        }}
      >
        {shapeContent}
      </Box>
    );
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="center" mb={2}>
        <img src={taskImg} alt="Task" style={{ maxWidth: 120, borderRadius: 8 }} />
      </Box>
      <Typography variant="h5" mb={2}>TaskFlex</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Helps with: ADHD, OCD, Schizophrenia | Trains: Cognitive Flexibility, Attention Shifting
      </Typography>
      
      {showRuleChange && (
        <Alert severity="warning" sx={{ mb: 2, animation: 'pulse 1s' }}>
          ⚠️ Rule Changed! Now sort by <strong>{currentRule}</strong>
        </Alert>
      )}
      
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
          <Box mb={2}>
            <Typography variant="h6" color="primary.main" textAlign="center">
              Current Rule: Sort by <strong>{currentRule.toUpperCase()}</strong>
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Rules change every 15 seconds
            </Typography>
            {/* Debug info for troubleshooting */}
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">
                <b>DEBUG:</b> Rule: {currentRule} | Card index: {index}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Card data: {JSON.stringify(cards[index])}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Options: {JSON.stringify(getRuleOptions())}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
            <Paper elevation={4} sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              {cards[index] ? getCardDisplay(cards[index]) : (
                <Typography color="error">No card data</Typography>
              )}
            </Paper>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={(timer / TIME_PER_CARD) * 100} 
            sx={{ mb: 3, height: 8, borderRadius: 4 }}
            color={timer < 1000 ? 'error' : timer < 3000 ? 'warning' : 'primary'}
          />
          
          <Grid container spacing={2} justifyContent="center" mb={3}>
            {getRuleOptions().map(option => (
              <Grid item key={option}>
                <Button
                  variant={selected === option ? (feedback === 'correct' && 
                    ((currentRule === 'color' && option === cards[index]?.color) || 
                     (currentRule === 'shape' && option === cards[index]?.shape) ||
                     (currentRule === 'size' && option === cards[index]?.size)) ? 'contained' : 'outlined') : 'outlined'}
                  color={selected === option ? (feedback === 'correct' && 
                    ((currentRule === 'color' && option === cards[index]?.color) || 
                     (currentRule === 'shape' && option === cards[index]?.shape) ||
                     (currentRule === 'size' && option === cards[index]?.size)) ? 'success' : 'error') : 'primary'}
                  onClick={() => handleSelect(option)}
                  fullWidth
                  sx={{ 
                    fontSize: 14, 
                    mb: 1, 
                    py: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                  disabled={!!selected}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center">
            <Typography>
              Card: {index + 1} / {ROUNDS} | Score: {score}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rule changes every 15 seconds
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Taskflex; 