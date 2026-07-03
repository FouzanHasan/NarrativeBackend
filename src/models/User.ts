import { Schema, model, Document, Types } from 'mongoose';

// studyGoal/motivationalGoal live directly on User rather than a separate
// Profile model — it's a 1:1, always-present relationship, so a join would
// be unnecessary overengineering for a V1 research prototype.
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  studyGoal: string | null;
  motivationalGoal: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    studyGoal: {
      type: String,
      default: null,
    },
    motivationalGoal: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = model<UserDocument>('User', userSchema);
