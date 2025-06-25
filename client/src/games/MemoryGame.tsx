import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const PAIRS = 8;
const CARD_VALUES = Array.from({ length: PAIRS }, (_, i) => i + 1);
const SHUFFLED_CARDS = [...CARD_VALUES, ...CARD_VALUES]
  .sort(() => Math.random() - 0.5)
  .map((value, idx) => ({ id: idx, value, flipped: false, matched: false }));

type CardType = {
  id: number;
  value: number;
  flipped: boolean;
  matched: boolean;
};

const MemoryGame: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCards(SHUFFLED_CARDS.map(card => ({ ...card })));
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      setTimeout(() => {
        const [i, j] = flipped;
        if (cards[i].value === cards[j].value) {
          const newCards = cards.map((card, idx) =>
            idx === i || idx === j ? { ...card, matched: true } : card
          );
          setCards(newCards);
          setMatchedCount(count => count + 1);
        } else {
          const newCards = cards.map((card, idx) =>
            idx === i || idx === j ? { ...card, flipped: false } : card
          );
          setCards(newCards);
        }
        setFlipped([]);
        setMoves(m => m + 1);
      }, 800);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (matchedCount === PAIRS) {
      setGameOver(true);
    }
  }, [matchedCount]);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    const newCards = cards.map((card, i) =>
      i === idx ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    setFlipped([...flipped, idx]);
  };

  const handleRestart = () => {
    setCards(SHUFFLED_CARDS.map(card => ({ ...card })));
    setFlipped([]);
    setMoves(0);
    setMatchedCount(0);
    setGameOver(false);
    setSubmitted(false);
  };

  const handleSubmitScore = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/score`,
        { game: 'memory', score: Math.max(100 - moves * 5, 10), difficulty: PAIRS },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch {
      // ignore error for now
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Memory Match Game</Typography>
      <Grid container spacing={1} maxWidth={320} margin="auto">
        {cards.map((card, idx) => (
          <Grid item xs={3} key={card.id}>
            <Paper
              elevation={3}
              sx={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                cursor: card.flipped || card.matched ? 'default' : 'pointer',
                bgcolor: card.flipped || card.matched ? 'primary.light' : 'grey.300',
                transition: 'background 0.2s',
                userSelect: 'none',
              }}
              onClick={() => handleFlip(idx)}
            >
              {card.flipped || card.matched ? card.value : '?'}
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <Typography>Moves: {moves}</Typography>
        {gameOver && (
          <Box mt={2}>
            <Typography variant="h6">You won in {moves} moves!</Typography>
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
        )}
      </Box>
    </Box>
  );
};

export default MemoryGame; 