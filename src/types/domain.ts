import { APIAction, APIFeedbackChoice, APIFeedbackQuestion, APIQuestion } from './api';

export class OnboardingQuestion {
  id: number;
  slug: string;
  title: string;
  order: number;
  answers: OnboardingAnswer[];
}

export class OnboardingAnswer {
  id: number;
  slug: string;
  title: string;
  order: number;
}

export class UserOnboardingAnswer {
  question: Pick<OnboardingQuestion, 'id' | 'slug'>;
  answer: Pick<OnboardingAnswer, 'id' | 'slug'>;
}

export type Question = Omit<APIQuestion, 'question_tag'> & {
  tags: string[];
};

export type Action = APIAction;

export class FeedbackQuestion extends APIFeedbackQuestion {
  answers: FeedbackChoice[] | undefined;
}

export class FeedbackChoice extends APIFeedbackChoice {}

export class UserFeedbackAnswer {
  type: FeedbackQuestion['type'];
  feedback_question_id: FeedbackQuestion['id'];
  feedback_choice_id: FeedbackChoice['id'] | undefined;
  text_answer: string | undefined;
  bool_answer: boolean | undefined;
}

export enum NOTIFICATION_IDENTIFIERS {
  SCHEDULE_DATE = 'schedule_date:couple_set_id:',
  DATE_SOON = 'date_soon:couple_set_id:',
}

export type SetQuestionAction = {
  setId: number;
  question: Question;
  action: Action;
  type: SetType;
};
export type SetType = 'normal' | 'unavailable' | 'ai';
