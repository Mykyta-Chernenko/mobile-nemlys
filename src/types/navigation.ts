import { OnboardingQuestion, UserOnboardingAnswer } from './domain';

export type MainStackParamList = {
  SetHomeScreen: undefined;
  SecondScreen: undefined;
};

type PrePlacementParams = {
  name: string;
};
type PlacementParams = PrePlacementParams & {
  questions: OnboardingQuestion[];
  questionIndex: number | undefined;
  userAnswers: UserOnboardingAnswer[];
};
type RegisterParams = Omit<PlacementParams, 'questions' | 'questionIndex'>;
export type AuthStackParamList = {
  Welcome: undefined;
  PrePlacement: PrePlacementParams;
  Placement: PlacementParams;
  HowWeWork: PlacementParams;
  Login: undefined;
  Register: RegisterParams;
  ForgetPassword: undefined;
  EmailConfirmed: undefined;
  TypeNewPassword: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
};
