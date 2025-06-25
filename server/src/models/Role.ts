import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: 'user' | 'therapist';
  description: string;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, enum: ['user', 'therapist'], required: true, unique: true },
  description: { type: String, required: true },
});

export default mongoose.model<IRole>('Role', RoleSchema); 