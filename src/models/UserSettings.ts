import { Schema, model, Document, Types } from 'mongoose';
import { PromptMode } from '../types/dto';

export interface UserSettingsDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  thresholdMinutes: number;
  promptsEnabled: boolean;
  promptMode: PromptMode;
  selectedApps: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema<UserSettingsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    thresholdMinutes: {
      type: Number,
      default: 10,
    },
    promptsEnabled: {
      type: Boolean,
      default: true,
    },
    promptMode: {
      type: String,
      enum: ['baseline', 'narrative', 'compare'],
      default: 'narrative',
    },
    selectedApps: {
      type: [String],
      default: ['instagram'],
    },
  },
  { timestamps: true }
);

export const UserSettings = model<UserSettingsDocument>('UserSettings', userSettingsSchema);
