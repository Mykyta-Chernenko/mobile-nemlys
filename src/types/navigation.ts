import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSlug } from './domain';

export type MainStackParamList = {
  YourName: { fromSettings: boolean };
  PartnerName: { fromSettings: boolean };
  Language: { fromSettings: boolean };
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
  ConfigureDate: {
    job: JobSlug;
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDate: {
    job: JobSlug;
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDateNewLevel: { withPartner: boolean; refreshTimeStamp: string | undefined };
  OnDateNotification: { withPartner: boolean; isOnboarding: boolean };
  PremiumOffer: { refreshTimeStamp: string | undefined; isOnboarding: boolean };
  PremiumSuccess: { state: 'premium_started' | 'trial_started' };

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
