import { Router, Response } from 'express';
import User from '../models/User';
import { firebaseAuth, AuthenticatedRequest } from '../middleware/firebaseAuth';

const router = Router();

// Get current user profile (auto-create if not found)
router.get('/me', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  let user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    // Auto-create minimal user profile
    const userName = (req.user as any).name || req.user.email?.split('@')[0] || 'New User';
    try {
      user = new User({
        uid: req.user.uid,
        name: userName,
        firstName: userName.split(' ')[0] || '',
        lastName: userName.split(' ')[1] || '',
        email: req.user.email,
        role: req.user.role || 'user', // set role only on creation
      });
      await user.save();
    } catch (err: any) {
      console.error('Auto-create user error:', err);
      if (err.code === 11000 && err.keyPattern) {
        if (err.keyPattern.email) {
          return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        if (err.keyPattern.uid) {
          return res.status(400).json({ error: 'A user with this UID already exists.' });
        }
        // Any other duplicate key
        return res.status(400).json({ error: 'Duplicate key error.' });
      }
      return res.status(500).json({ error: 'Server error', details: err });
    }
  }
  console.log('Returning user from /me:', user);
  res.json(user);
});

// Register user profile (on first login)
// req.body is available because express.json() is used globally in index.ts
router.post('/register', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  console.log('Register endpoint hit. req.user:', req.user, 'req.body:', req.body);
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { firstName, lastName, role, ...rest } = req.body;
  if (!firstName || !lastName || !role) return res.status(400).json({ error: 'First name, last name, and role required' });
  const name = `${firstName} ${lastName}`;
  try {
    const user = await User.findOneAndReplace(
      { uid: req.user.uid },
      {
        uid: req.user.uid,
        name,
        firstName,
        lastName,
        email: req.user.email,
        role,
        ...rest,
      },
      { new: true, upsert: true }
    );
    console.log('User document after upsert:', user);
    res.status(200).json(user);
  } catch (err: any) {
    console.error('Registration error:', err);
    if (err.code === 11000 && err.keyPattern) {
      if (err.keyPattern.email) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      if (err.keyPattern.uid) {
        return res.status(400).json({ error: 'A user with this UID already exists.' });
      }
      // Any other duplicate key
      return res.status(400).json({ error: 'Duplicate key error.' });
    }
    res.status(500).json({ error: 'Server error', details: err });
  }
});

// Add this after the GET /me endpoint
router.put('/me', firebaseAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const updates = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
});

export default router; 