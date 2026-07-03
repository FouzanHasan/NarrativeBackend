// Shared request/response DTOs mirroring the API contract in docs/ARCHITECTURE.md.
// Kept intentionally small and flat — this is a V1 research prototype, not a
// general-purpose platform, so we avoid speculative generalization.

export type PromptMode = 'baseline' | 'narrative' | 'compare';
export type PromptType = 'baseline' | 'narrative' | 'none';
export type UserAction = 'accepted' | 'dismissed' | 'ignored' | 'opened_app' | 'none';
export type SourcePlatform = 'android' | 'ios-mock';
export type TriggerReason = 'threshold_exceeded' | 'manual_test' | 'none';

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface ProfileResponse {
  firstName: string;
  studyGoal: string | null;
  motivationalGoal: string | null;
}

export interface UpdateProfileRequestBody {
  firstName?: string;
  studyGoal?: string;
  motivationalGoal?: string;
}

export interface SettingsResponse {
  thresholdMinutes: number;
  promptsEnabled: boolean;
  promptMode: PromptMode;
}

export interface UpdateSettingsRequestBody {
  thresholdMinutes?: number;
  promptsEnabled?: boolean;
  promptMode?: PromptMode;
}

export interface AppsResponse {
  selectedApps: string[];
}

export interface UpdateAppsRequestBody {
  selectedApps: string[];
}

export interface CreateLogRequestBody {
  app: string;
  duration: number;
  promptType: PromptType;
  userAction: UserAction;
  sessionId?: string;
  sourcePlatform: SourcePlatform;
  triggerReason?: TriggerReason;
}

export interface LogsQuery {
  limit?: string;
  app?: string;
}

export interface PromptsHistoryQuery {
  limit?: string;
}
