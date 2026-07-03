import { Schema, model, Document, Types } from 'mongoose';
import { PromptType, SourcePlatform, TriggerReason, UserAction } from '../types/dto';

// Minimal, purpose-limited usage log. Deliberately does NOT contain any
// message/notification/typed-text/website-content/screenshot/contact/media
// fields — this is a hard ethics/privacy requirement for the study, enforced
// structurally by the schema (the fields simply do not exist).
//
// This model also doubles as the prompt-history record: a row with
// promptType !== 'none' *is* a prompt event. See prompts.controller.ts /
// logService.ts for why there is no separate PromptEvent collection.
export interface UsageLogDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  timestamp: Date;
  app: string;
  duration: number;
  promptType: PromptType;
  userAction: UserAction;
  sessionId: string;
  sourcePlatform: SourcePlatform;
  triggerReason: TriggerReason;
  createdAt: Date;
  updatedAt: Date;
}

const usageLogSchema = new Schema<UsageLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    app: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    promptType: {
      type: String,
      enum: ['baseline', 'narrative', 'none'],
      default: 'none',
    },
    userAction: {
      type: String,
      enum: ['accepted', 'dismissed', 'ignored', 'opened_app', 'none'],
      default: 'none',
    },
    sessionId: {
      type: String,
      required: true,
    },
    sourcePlatform: {
      type: String,
      enum: ['android', 'ios-mock'],
      required: true,
    },
    triggerReason: {
      type: String,
      enum: ['threshold_exceeded', 'manual_test', 'none'],
      default: 'none',
    },
  },
  { timestamps: true }
);

export const UsageLog = model<UsageLogDocument>('UsageLog', usageLogSchema);
