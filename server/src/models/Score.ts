import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScore extends Document {
  user: Types.ObjectId;
  game?: string;
  score?: number;
  difficulty?: number;
  screenerType?: string;
  screenerScore?: number;
  screenerDetails?: string;
  screenerRaw?: any;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: String },
    score: { type: Number },
    difficulty: { type: Number },
    screenerType: { type: String },
    screenerScore: { type: Number },
    screenerDetails: { type: String },
    screenerRaw: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<IScore>('Score', ScoreSchema); 