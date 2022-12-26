import { PostgrestError } from '@supabase/supabase-js';

export { User as SupabaseUser } from '@supabase/supabase-js';
export type SupabaseAnswer<T> = { data: T; error: null } | { data: null; error: PostgrestError };
export type SupabaseEdgeAnswer<T> = { data: T; error: null } | { data: null; error: any };

export class ApiEntry {
  id: number;
  created_at: string;
  updated_at: string;
}

export class APIOnboardingQuestion extends ApiEntry {
  content: string;
  slug: string;
  order: number;
}

export class APIOnboardingAnswer extends ApiEntry {
  content: string;
  slug: string;
  order: number;
  onboarding_question_id: number;
}

export class APICouple extends ApiEntry {
  invitation_code: string;
}

export type InsertAPICouple = Omit<APICouple, keyof ApiEntry>;

export class APIUserProfile extends ApiEntry {
  first_name: string;
  ios_expo_token: string | undefined;
  android_expo_token: string | undefined;
  onboarding_finished: boolean;
  user_id: string;
  couple_id: number;
}

export type InsertAPIUserProfile = Omit<APIUserProfile, keyof ApiEntry>;

export type InsertAPIUserOnboardingAnswer = {
  user_id: string;
  onboarding_answer_id: APIOnboardingAnswer['id'];
};

class APIQuestionTag {
  slug: string;
  title: string;
}
class APIQUestionQuestionTag {
  question_question_tag: APIQuestionTag | APIQuestionTag[] | null;
}
export class APIQuestion extends ApiEntry {
  slug: string;
  title: string;
  image: string | undefined;
  details: string;
  tips: string;
  importance: string;
  question_tag: APIQUestionQuestionTag | APIQUestionQuestionTag[] | null;
}

export class APIAction extends ApiEntry {
  slug: string;
  title: string;
  details: string;
  image: string | undefined;
  instruction: string;
  importance: string;
}

export class APIReflection extends ApiEntry {
  slug: string;
  title: string;
  image: string | undefined;
  details: string;
  tips: string;
  importance: string;
}

export class APISet extends ApiEntry {
  level: number;
}

export class APICoupleSet extends ApiEntry {
  set_id: APISet['id'];
  couple_id: APICouple['id'];
  order: number;
  completed: boolean;
  schedule_reminder: string | undefined;
  meeting: string | undefined;
}
export type InsertAPICoupleSet = Omit<APICoupleSet, keyof ApiEntry>;

export class APINotification extends ApiEntry {
  identifier: string;
  expo_notification_id: string;
}
export type InsertAPINotification = Omit<APINotification, keyof ApiEntry>;

export class CoupleSetFeedback extends ApiEntry {
  couple_set_id: APICoupleSet['id'];
  user_id: string;
}
export type InsertCoupleSetFeedback = Omit<CoupleSetFeedback, keyof ApiEntry>;

export class APIFeedbackQuestion extends ApiEntry {
  title: string;
  order: string;
  type: 'text' | 'choice' | 'bool';
}

export class APIFeedbackChoice extends ApiEntry {
  title: string;
  order: string;
  feedback_question_id: APIFeedbackQuestion['id'];
}

export class APICoupleSetFeedback extends ApiEntry {
  couple_set_id: APICoupleSet['id'];
  user_id: string;
}

export class APICoupleSetFeedbackAnswer {
  type: 'text' | 'choice' | 'bool';
  feedback_choice_id: APIFeedbackChoice['id'] | undefined;
  bool_answer: boolean | undefined;
  text_answer: string | undefined;
  feedback_question_id: APIFeedbackQuestion['id'];
  couple_set_feedback_id: APICoupleSetFeedback['id'];
}
