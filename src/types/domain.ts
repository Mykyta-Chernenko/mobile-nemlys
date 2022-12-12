import { APIAction, APIQuestion } from './api';

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
