import type { Ref, ComputedRef } from 'vue'

export type TSessionType = 'work' | 'break';
export type TTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type TMotivationCategory =
  | 'welcome'
  | 'session_start'
  | 'session_complete'
  | 'quarter_progress'
  | 'half_progress'
  | 'three_quarter_progress'
  | 'daily_goal'
  | 'tip'
  | 'streak';

export interface ISession {
  id: string;
  created_at: string;
  completed_at: string;
  user_id?: string;
  type: TSessionType;
  duration: number;
  completed: boolean;
  synced?: boolean;
}

export interface IUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface IAuthState {
  user: Ref<IUser | null>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
}

export interface ISupabaseSession {
  user: IUser | null;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface IMotivationMessages {
  welcome: string[];
  session_start: Record<TSessionType, string[]>;
  session_complete: Record<TSessionType, string[]>;
  quarter_progress: string[];
  half_progress: string[];
  three_quarter_progress: string[];
  streak_messages: Record<number, string>;
  daily_goals: string[];
  achievements: string[];
  tips: string[];
}

export interface ITimerState {
  timeRemaining: Ref<number>;
  selectedDuration: Ref<number>;
  isActive: Ref<boolean>;
  isPaused: Ref<boolean>;
  sessionType: Ref<TSessionType>;
  sessionCount: Ref<number>;
  progress: ComputedRef<number>;
  startTimestamp: Ref<number | null>;
  endTimestamp: Ref<number | null>;
}

export interface ITimerActions {
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTimer: (duration: number, type?: TSessionType) => void;
  setDefaultTimers: (workDuration: number, breakDuration: number) => void;
}

export interface ITimerWorkerStart {
  command: 'start';
  duration: number;
}

export interface ITimerWorkerPause {
  command: 'pause';
}

export interface ITimerWorkerResume {
  command: 'resume';
}

export interface ITimerWorkerStop {
  command: 'stop';
}

export interface ITimerWorkerReset {
  command: 'reset';
}

export type TTimerWorkerCommand =
  | ITimerWorkerStart
  | ITimerWorkerPause
  | ITimerWorkerResume
  | ITimerWorkerStop
  | ITimerWorkerReset;

export interface ITimerWorkerResponse {
  remainingTime?: number;
  done?: boolean;
}

export interface IAuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ISignUpData {
  email: string;
  password: string;
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IResetPasswordData {
  email: string;
}

export interface ISettingsState {
  defaultWorkDuration: Ref<number | null>;
  defaultBreakDuration: Ref<number | null>;
  isStartBreakAuto: Ref<boolean>;
  isStartWorkAuto: Ref<boolean>;
}

export interface ISettingsActions {
  setDefaultTimerParams: (duration: number, type: TSessionType) => void;
  changeStartBreakAuto: (event: Event) => void;
  changeStartWorkAuto: (event: Event) => void;
}

export interface IUserState {
  user: Ref<IUser | null>;
  ghostUser: Ref<boolean>;
  isLoading: Ref<boolean>;
}

export interface IUserActions {
  signInGhostMode: () => void;
  signOut: () => Promise<void>;
  saveSession: (sessionData: Partial<ISession>) => Promise<ISession>;
  deleteSession: (userId?: string) => Promise<boolean>;
  getSessions: () => Promise<ISession[]>;
  syncSessions: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export interface ITimeUtils {
  getTimeOfDay: () => TTimeOfDay;
  getTimeBasedGreeting: () => string;
  formatTimeRemaining: (seconds: number) => {
    minutes: string;
    seconds: string;
    formatted: string;
  };
  getSessionDuration: (startTime: string, endTime: string) => number;
  isToday: (date: string) => boolean;
  isThisWeek: (date: string) => boolean;
  getDaysBetween: (date1: string, date2: string) => number;
}

export interface IPreset {
  minutes: number;
}

export interface ITimePresets {
  work: IPreset[];
  break: IPreset[];
}

export interface IWorkerTimerReturn extends ITimerState, ITimerActions {}

export interface IEmailAuthReturn {
  user: Ref<IUser | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  isAuthenticated: ComputedRef<boolean>;
  signUp: (email: string, password: string) => Promise<IAuthResult>;
  signIn: (email: string, password: string) => Promise<IAuthResult>;
  resetPassword: (email: string) => Promise<IAuthResult>;
}

export interface IMotivationReturn {
  getMessage: (type: TMotivationCategory, context?: TSessionType | number) => string;
  getRandomTip: () => string;
  getStreakMessage: (streakCount: number) => string;
  getProgressMessage: (percentage: number) => string;
}

export interface IFormatTimeReturn {
  minutes: string;
  seconds: string;
  formatted: string;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_SUPABASE_URL: string;
    readonly VITE_APP_SUPABASE_KEY: string;
    readonly VITE_APP_SUPABASE_CALLBACK_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export type { ISession as ISessionType };
export type { IUser as IUserType };
export type { IAuthState as IAuthStateType };
export type { IMotivationMessages as IMotivationMessagesType };