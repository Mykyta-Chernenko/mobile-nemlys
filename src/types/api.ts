import { PostgrestError } from '@supabase/supabase-js';

export { User as SupabaseUser } from '@supabase/supabase-js';
export type SupabaseAnswer<T> = { data: T; error: null } | { data: null; error: PostgrestError };
export type SupabaseEdgeAnswer<T> = { data: T; error: null } | { data: null; error: any };

export class ApiEntry {
  id: number;
  created_at: string;
  updated_at: string;
}

export class APICouple extends ApiEntry {
  invitation_code: string;
}

export type InsertAPICouple = Omit<APICouple, keyof ApiEntry>;

export class APIUserProfile extends ApiEntry {
  first_name: string;
  partner_first_name: string;
  ios_expo_token: string | undefined;
  android_expo_token: string | undefined;
  onboarding_finished: boolean;
  showed_interview_request: boolean;
  user_id: string;
  couple_id: number;
}

export type InsertAPIUserProfile = Omit<APIUserProfile, keyof ApiEntry>;

export class APIDiary extends ApiEntry {
  user_id: string;
  date: string;
  text: string;
}

export class APIConversation extends ApiEntry {
  user_id: string;
  text: string;
  ai: string;
}
export class APINotification extends ApiEntry {
  identifier: string;
  expo_notification_id: string;
}
export type InsertAPINotification = Omit<APINotification, keyof ApiEntry>;

export class APIDate extends ApiEntry {
  couple_id: APICouple['id'];
  topic: string;
  level: number;
  active: boolean;
  with_partner: boolean;
}

export type InsertAPIDate = Omit<APIDate, keyof ApiEntry>;

export class APIGeneratedQuestion extends ApiEntry {
  date_id: APIDate['id'];
  question: string;
  finished: boolean;
  feedback_score?: number;
  skipped: boolean;
}

export class APIAppSettings extends ApiEntry {
  version: number;
}

export class APIReflectionQuestion extends ApiEntry {
  slug: string;
  reflection: string;
  level: number;
  active: boolean;
}

export class APIReflectionQuestionAnswer extends ApiEntry {
  reflection_id: APIReflectionQuestion['id'];
  user_id: string;
  answer: string;
  reflection_question: any;
}

export class APIUserPremium extends ApiEntry {
  introduction_sets_count: number;
  daily_sets_count: number;
  is_trial: boolean;
  trial_start?: string;
  trial_finish?: string;
  is_premium: boolean;
  premium_start?: string;
}
