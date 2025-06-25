import { Router, Response } from 'express';
import User from '../models/User';
import Score from '../models/Score';
import { firebaseAuth, AuthenticatedRequest } from '../middleware/firebaseAuth';

const router = Router();

// Middleware to check therapist role
function requireTherapist(req: AuthenticatedRequest, res: Response, next: Function) {
  if (!req.user || req.user.role !== 'therapist') {
    return res.status(403).json({ error: 'Therapist access required' });
  }
  next();
}

// List all users
router.get('/users', firebaseAuth, requireTherapist, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find({}, '-_id uid name email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

// Get a user's scores
// req.params is available because Express attaches it to the request object
router.get('/user/:uid/scores', firebaseAuth, requireTherapist, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.params;
  try {
    const userDoc = await User.findOne({ uid });
    if (!userDoc) return res.status(404).json({ error: 'User not found' });
    const scores = await Score.find({ user: userDoc._id }).sort({ createdAt: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

export default router; 