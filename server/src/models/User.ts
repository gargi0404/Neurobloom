import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'therapist';

export interface IUser extends Document {
  uid: string; // Firebase UID
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  mentalHealthConditions: string[];
  goals: string;
  experience: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  disorder?: string;
  therapistName?: string;
  overallProgress?: number;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    age: { type: Number },
    mentalHealthConditions: { type: [String], default: [] },
    goals: { type: String },
    experience: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'therapist'], required: true },
    disorder: { type: String },
    therapistName: { type: String },
    overallProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 