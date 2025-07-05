import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import User from '../models/User';
import { Document } from 'mongoose';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Exists' : 'Missing');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

// AuthenticatedRequest extends express.Request, which includes headers
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken | (Document & { role?: string; uid?: string; email?: string });
}

export const firebaseAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Fetch user from MongoDB by uid
    const userDoc = await User.findOne({ uid: decodedToken.uid });
    if (userDoc) {
      req.user = userDoc;
    } else {
      req.user = decodedToken;
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}; 