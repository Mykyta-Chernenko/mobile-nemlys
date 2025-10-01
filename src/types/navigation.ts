import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSlug } from './domain';

export type MainStackParamList = {
  YourName: {
    fromSettings: boolean;
  };
  PartnerName: {
    fromSettings: boolean;
  };
  Language: {
    fromSettings: boolean;
  };
  DatingLength: undefined;
  OnboardingInviteCode: {
    nextScreen: string | undefined;
    screenParams: Record<string, any> | undefined;
  };
  OnboardingInviteCodeInput: {
    nextScreen: string | undefined;
    screenParams: Record<string, any> | undefined;
  };
  OnboardingQuizIntro: {
    name: string;
    partnerName: string;
  };
  OnboardingQuiz: {
    isOnboarding: boolean;
    refreshTimeStamp: string | undefined;
  };
  Analyzing: {
    jobs: string[];
  };
  OnboardingPlan: {
    isOnboarding: boolean;
    refreshTimeStamp: string | undefined;
  };
  ChangePlan: {
    isOnboarding: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnboardingStatistics: {
    job: string;
  };
  OnboardingNotification: {
    isOnboarding: boolean;
  };
  V3Upgrade: undefined;
  Home: {
    refreshTimeStamp: string | undefined;
  };
  V2Home: {
    refreshTimeStamp: string | undefined;
  };
  ReflectionHome: {
    refreshTimeStamp: string | undefined;
  };
  WriteReflection: {
    reflectionId: number;
    question: string;
    answer: string | undefined;
  };
  FinishedWriting: undefined;
  Profile: {
    refreshTimeStamp: string | undefined;
  };
  V2Profile: {
    refreshTimeStamp: string | undefined;
  };
  V3Profile: {
    refreshTimeStamp: string | undefined;
  };
  LoveNote: {
    refreshTimeStamp: string | undefined;
  };
  CoupleLanguage: {
    fromSettings: boolean;
    language: string;
  };
  DateIsWithPartner: {
    job: JobSlug;
  };
  ConfigureDate: {
    job: JobSlug;
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDate: {
    id: number;
    refreshTimeStamp: string | undefined;
  };
  OnDateNewLevel: {
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDateNotification: {
    withPartner: boolean;
    isOnboarding: boolean;
  };
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
  V3PremiumOffer: {
    refreshTimeStamp: string | undefined;
    isOnboarding: boolean;
  };
  RevenueCatPremiumOffer: {
    refreshTimeStamp: string | undefined;
    isOnboarding: boolean;
  };
  PremiumSuccess: {
    state: 'premium_started' | 'trial_started';
    isOnboarding: boolean;
  };
  QuestionAnswer: {
    questionId: number;
    fromDate: boolean;
  };
  AnswerHome: {
    refreshTimeStamp: string | undefined;
  };

  InterviewRequest: {
    refreshTimeStamp: string | undefined;
  };
  InterviewText: {
    refreshTimeStamp: string | undefined;
  };
  Diary: {
    refreshTimeStamp: string | undefined;
  };
  DiaryEntry: {
    id: number;
  };
  DiaryNewEntry: undefined;
  Settings: undefined;
  Job: undefined;

  V3Home: {
    refreshTimeStamp: string | undefined;
  };
  V3Explore: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreJourneyList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreTestList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreGameList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreCheckupList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreQuestionList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreQuestionListJob: {
    refreshTimeStamp: string | undefined;
    job: string;
  };
  V3ExploreExerciseList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreArticleList: {
    refreshTimeStamp: string | undefined;
  };
  V3ExploreQuestionDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3ExploreTestDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3ExploreCheckupDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3ExploreGameDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3ExploreArticleDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3ExploreExerciseDetail: {
    refreshTimeStamp: string | undefined;
    id: number;
    shouldGoBack?: boolean;
    fromHome?: boolean;
    canActivate?: boolean;
  };
  V3Test: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3TestStart: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3TestFinish: {
    refreshTimeStamp: string | undefined;
    instanceId: number;
    showStreak: boolean;
    fromHome?: boolean;
  };
  V3Checkup: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3CheckupStart: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3CheckupFinish: {
    refreshTimeStamp: string | undefined;
    instanceId: number;
    showStreak: boolean;
    fromHome?: boolean;
  };
  V3Game: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3GameStart: {
    refreshTimeStamp: string | undefined;
    id: number;
    fromHome?: boolean;
  };
  V3GameFinish: {
    refreshTimeStamp: string | undefined;
    instanceId: number;
    showStreak: boolean;
    fromHome?: boolean;
  };

  V3ShowStreak: {
    refreshTimeStamp: string | undefined;
    nextScreen: string | undefined;
    screenParams: Record<string, any> | undefined;
  };

  V3AnswerHome: {
    refreshTimeStamp: string | undefined;
  };
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
