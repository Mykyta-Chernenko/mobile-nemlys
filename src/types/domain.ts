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
