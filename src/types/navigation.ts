import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSlug } from './domain';

export type MainStackParamList = {
  YourName: { fromSettings: boolean };
  PartnerName: { fromSettings: boolean };
  DatingLength: undefined;
  JobInput: undefined;
  Language: { fromSettings: boolean };
  CoupleLanguage: { fromSettings: boolean; language: string };
  OnboardingInviteCode: { fromSettings: boolean };
  OnboardingInviteCodeInput: { fromSettings: boolean };
  DiscussWay: undefined;
  OnboardingReflectionExplanation: undefined;
  OnboardingReflection: undefined;
  Analyzing: undefined;
  SkipOnboardingReflection: undefined;
  Home: { refreshTimeStamp: string | undefined; showInterview?: boolean };
  ReflectionHome: { refreshTimeStamp: string | undefined };
  WriteReflection: { reflectionId: number; question: string; answer: string | undefined };
  FinishedWriting: undefined;
  Profile: { refreshTimeStamp: string | undefined };
  DateIsWithPartner: { job: JobSlug };
  ConfigureDate: {
    job: JobSlug;
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDate: {
    id: number;
    refreshTimeStamp: string | undefined;
  };
  OnDateNewLevel: { withPartner: boolean; refreshTimeStamp: string | undefined };
  OnDateNotification: { withPartner: boolean; isOnboarding: boolean };
  GeneratingQuestion: {
    withPartner: boolean;
    topic: string;
    job: JobSlug;
    level: number;
    reflectionAnswer: string | undefined | null;
    refreshTimeStamp: string | undefined;
  };
  PremiumOffer: {
    refreshTimeStamp: string | undefined;
    isOnboarding: boolean;
    shouldGoBack?: boolean;
  };
  PremiumSuccess: { state: 'premium_started' | 'trial_started' };
  QuestionAnswer: { questionId: number; fromDate: boolean };
  AnswerHome: {
    refreshTimeStamp: string | undefined;
  };

  InterviewRequest: {
    refreshTimeStamp: string | undefined;
  };
  InterviewText: {
    refreshTimeStamp: string | undefined;
  };
  Diary: { refreshTimeStamp: string | undefined };
  DiaryEntry: { id: number };
  DiaryNewEntry: undefined;
  Settings: undefined;
  Job: undefined;
};

export type MainNavigationProp = NativeStackScreenProps<MainStackParamList>['navigation'];

export type AuthStackParamList = {
  Welcome: undefined;

  Login: undefined;
  ForgetPassword: undefined;
  EmailConfirmed: undefined;
  TypeNewPassword: undefined;
  Register: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
};
