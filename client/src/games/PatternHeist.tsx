import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import patternImg from '../pattern.jpeg';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const MAX_LEVEL = 10;

function getRandomSequence(length: number, useNumbers: boolean = false) {
  const items = useNumbers ? NUMBERS : COLORS;
  return Array.from({ length }, () => items[Math.floor(Math.random() * items.length)]);
}

function playSound(item: string, useNumbers: boolean = false) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  
  if (useNumbers) {
    // Different frequencies for numbers
    const frequencies = [220, 247, 277, 294, 330, 370, 415, 440, 494];
    const numIndex = parseInt(item) - 1;
    o.frequency.value = frequencies[numIndex] || 440;
  } else {
    // Different frequencies for colors
    o.frequency.value =
      item === 'red' ? 440 : item === 'blue' ? 660 : item === 'green' ? 550 : 770;
  }
  
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.18);
}

const PatternHeist: React.FC = () => {
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [showing, setShowing] = useState(true);
  const [showIndex, setShowIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [useNumbers, setUseNumbers] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const showTimeout = useRef<NodeJS.Timeout | null>(null);
  const [modeChanged, setModeChanged] = useState(false);

  // Generate new sequence for current level
  useEffect(() => {
    const newSequence = getRandomSequence(level, useNumbers);
    setSequence(newSequence);
    setUserInput([]);
    setShowing(true);
    setFeedback(null);
    setActiveItem(null);
    setWaiting(false);
    setModeChanged(true);
    setTimeout(() => setModeChanged(false), 1200);
  }, [level, useNumbers]);

  // Show sequence one by one
  useEffect(() => {
    if (!showing || sequence.length === 0) return;
    setShowIndex(0);
    setWaiting(true);
    let i = 0;
    function showNext() {
      if (i >= sequence.length) {
        setShowing(false);
        setWaiting(false);
        setActiveItem(null);
        return;
      }
      setActiveItem(sequence[i]);
      playSound(sequence[i], useNumbers);
      showTimeout.current = setTimeout(() => {
        setActiveItem(null);
        showTimeout.current = setTimeout(() => {
          i++;
          showNext();
        }, 300);
      }, 600);
    }
    showNext();
    return () => {
      if (showTimeout.current) clearTimeout(showTimeout.current);
    };
  }, [showing, sequence, useNumbers]);

  // Handle user click
  const handleTileClick = (item: string) => {
    if (showing || waiting || gameOver) return;
    playSound(item, useNumbers);
    const idx = userInput.length;
    if (sequence[idx] === item) {
      setUserInput([...userInput, item]);
      setFeedback('correct');
      setActiveItem(item);
      setTimeout(() => setActiveItem(null), 200);
      if (idx + 1 === sequence.length) {
        setScore(s => s + level); // Higher levels give more points
        if (level === MAX_LEVEL) {
          setGameOver(true);
        } else {
          setTimeout(() => {
            // Toggle useNumbers every 3 levels (on 3, 6, 9)
            if ((level + 1) % 3 === 1) {
              setUseNumbers(prev => !prev);
            }
            setLevel(l => l + 1);
          }, 1000);
        }
      }
    } else {
      setFeedback('wrong');
      setActiveItem(item);
      setTimeout(() => setActiveItem(null), 400);
      setGameOver(true);
    }
  };

  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'pattern_heist', score, difficulty: level },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setSubmitted(false);
    setFeedback(null);
    setActiveItem(null);
    setUseNumbers(false);
    setUserInput([]);
  };

  const items = useNumbers ? NUMBERS : COLORS;

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="center" mb={2}>
        <img src={patternImg} alt="Pattern" style={{ maxWidth: 120, borderRadius: 8 }} />
      </Box>
      <Typography variant="h5" mb={2}>Pattern Heist</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Helps with: Schizophrenia | Trains: Logic, Sequencing, Working Memory
      </Typography>
      
      {gameOver ? (
        <Box>
          <Typography variant="h6">Game Over!</Typography>
          <Typography>Final Score: {score}</Typography>
          <Typography>Level Reached: {level}</Typography>
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
          <Typography mb={1}>
            Memorize the {useNumbers ? 'number' : 'color'} sequence, then repeat it by clicking in order!
          </Typography>
          <Box mb={2}>
            <Typography>Level: {level} / {MAX_LEVEL}</Typography>
            <Typography>Sequence Length: {sequence.length}</Typography>
            <Typography>Current Mode: {useNumbers ? 'Numbers' : 'Colors'}</Typography>
          </Box>
          {modeChanged && (
            <Typography align="center" color="primary" mb={1}>
              Mode changed! Now using <b>{useNumbers ? 'Numbers' : 'Colors'}</b>
            </Typography>
          )}
          <Grid container spacing={2} justifyContent="center" mb={2}>
            {items && items.length > 0 ? items.map(item => (
              <Grid item key={item} xs={3} sm={2}>
                <Paper
                  sx={{
                    bgcolor: useNumbers
                      ? (activeItem === item ? 'primary.light' : 'grey.100')
                      : (activeItem === item ? item : 'grey.300'),
                    height: 60,
                    width: 60,
                    cursor: showing || waiting || gameOver ? 'default' : 'pointer',
                    border: feedback === 'wrong' && activeItem === item ? '3px solid red' :
                            feedback === 'correct' && activeItem === item ? '3px solid green' :
                            activeItem === item ? '4px solid #fff' : undefined,
                    boxShadow: activeItem === item ? '0 0 16px 4px rgba(0,0,0,0.25)' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: useNumbers ? 'black' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: showing || waiting || gameOver ? 'none' : 'scale(1.05)',
                    }
                  }}
                  aria-label={useNumbers ? `Number ${item}` : `Color block`}
                  onClick={() => handleTileClick(item)}
                >
                  {useNumbers ? item : ''}
                </Paper>
              </Grid>
            )) : null}
          </Grid>
          {feedback === 'correct' && !gameOver && (
            <Typography align="center" color="success.main" mb={1}>Correct!</Typography>
          )}
          {feedback === 'wrong' && (
            <Typography align="center" color="error.main" mb={1}>Wrong! Game Over.</Typography>
          )}
          <Box>
            <Typography>Progress: {userInput.length} / {sequence.length}</Typography>
            <Typography>Score: {score}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PatternHeist; 