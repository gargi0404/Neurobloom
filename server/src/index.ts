// Make sure to run: yarn install (or npm install) in the server directory
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user';
import scoreRoutes from './routes/score';
import therapistRoutes from './routes/therapist';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/therapist', therapistRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NeuroBloom backend running' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('MongoDB connection error:', err);
  }); 