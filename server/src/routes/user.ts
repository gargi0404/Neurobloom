import { Router, Response } from 'express';
import User from '../models/User';
import { firebaseAuth, AuthenticatedRequest } from '../middleware/firebaseAuth';

const router = Router();

// Get current user profile
router.get('/me', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Register user profile (on first login)
// req.body is available because express.json() is used globally in index.ts
router.post('/register', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, role } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Name and role required' });
  try {
    let user = await User.findOne({ uid: req.user.uid });
    if (user) return res.status(409).json({ error: 'User already exists' });
    user = new User({
      uid: req.user.uid,
      name,
      email: req.user.email,
      role,
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

export default router; 