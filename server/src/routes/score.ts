import { Router, Response } from 'express';
import Score from '../models/Score';
import User from '../models/User';
import { firebaseAuth, AuthenticatedRequest } from '../middleware/firebaseAuth';

const router = Router();

// Submit a score
// req.body is available because express.json() is used globally in index.ts
router.post('/', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { game, score, difficulty } = req.body;
  if (!game || typeof score !== 'number' || typeof difficulty !== 'number') {
    return res.status(400).json({ error: 'game, score, and difficulty required' });
  }
  try {
    const userDoc = await User.findOne({ uid: req.user.uid });
    if (!userDoc) return res.status(404).json({ error: 'User not found' });
    const newScore = new Score({
      user: userDoc._id,
      game,
      score,
      difficulty,
    });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

// Get current user's scores
router.get('/my', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userDoc = await User.findOne({ uid: req.user.uid });
    if (!userDoc) return res.status(404).json({ error: 'User not found' });
    const scores = await Score.find({ user: userDoc._id }).sort({ createdAt: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

export default router; 