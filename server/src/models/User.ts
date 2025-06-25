import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'user' | 'therapist';

export interface IUser extends Document {
  uid: string; // Firebase UID
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'therapist'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 