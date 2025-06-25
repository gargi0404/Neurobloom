import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const DIFFICULTY = 5;

function getRandomSequence(length: number) {
  return Array.from({ length }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
}

function playSound(color: string) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value =
    color === 'red' ? 440 : color === 'blue' ? 660 : color === 'green' ? 550 : 770;
  o.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.18);
}

const PatternHeist: React.FC = () => {
  const { user } = useAuth();
  const [sequence, setSequence] = useState<string[]>(getRandomSequence(DIFFICULTY));
  const [showing, setShowing] = useState(true);
  const [showIndex, setShowIndex] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [waiting, setWaiting] = useState(false);
  const showTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show sequence one by one
  useEffect(() => {
    if (!showing) return;
    setShowIndex(0);
    setWaiting(true);
    let i = 0;
    function showNext() {
      if (i >= round) {
        setShowing(false);
        setWaiting(false);
        setActiveColor(null);
        return;
      }
      setActiveColor(sequence[i]);
      playSound(sequence[i]);
      showTimeout.current = setTimeout(() => {
        setActiveColor(null);
        showTimeout.current = setTimeout(() => {
          i++;
          showNext();
        }, 200);
      }, 500);
    }
    showNext();
    return () => {
      if (showTimeout.current) clearTimeout(showTimeout.current);
    };
    // eslint-disable-next-line
  }, [showing, round, sequence]);

  // Handle user click
  const handleTileClick = (color: string) => {
    if (showing || waiting || gameOver) return;
    playSound(color);
    const idx = userInput.length;
    if (sequence[idx] === color) {
      setUserInput([...userInput, color]);
      setFeedback('correct');
      if (idx + 1 === round) {
        setScore(s => s + 1);
        if (round === DIFFICULTY) setGameOver(true);
        else {
          setTimeout(() => {
            setRound(r => r + 1);
            setUserInput([]);
            setShowing(true);
            setFeedback(null);
          }, 700);
        }
      }
    } else {
      setFeedback('wrong');
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
        { game: 'pattern_heist', score, difficulty: DIFFICULTY },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleRestart = () => {
    setSequence(getRandomSequence(DIFFICULTY));
    setUserInput([]);
    setScore(0);
    setGameOver(false);
    setSubmitted(false);
    setFeedback(null);
    setActiveColor(null);
    setRound(1);
    setShowing(true);
    setWaiting(false);
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Pattern Heist</Typography>
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
          <Typography mb={1}>Memorize the sequence, then repeat it by clicking the tiles in order!</Typography>
          <Box mb={2}>
            <Typography>Round: {round} / {DIFFICULTY}</Typography>
          </Box>
          <Grid container spacing={2} justifyContent="center" mb={2}>
            {COLORS.map(color => (
              <Grid item key={color} xs={3}>
                <Paper
                  sx={{
                    bgcolor: activeColor === color ? color : 'grey.300',
                    height: 60,
                    width: 60,
                    cursor: showing || waiting || gameOver ? 'default' : 'pointer',
                    border: feedback === 'wrong' && !showing && !waiting ? '2px solid red' : undefined,
                  }}
                  onClick={() => handleTileClick(color)}
                />
              </Grid>
            ))}
          </Grid>
          <Box>
            <Typography>Progress: {userInput.length} / {round}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PatternHeist; 