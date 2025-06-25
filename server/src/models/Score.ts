import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScore extends Document {
  user: Types.ObjectId;
  game: string;
  score: number;
  difficulty: number;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: String, required: true },
    score: { type: Number, required: true },
    difficulty: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<IScore>('Score', ScoreSchema); 