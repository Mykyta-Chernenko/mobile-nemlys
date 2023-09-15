import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSlug } from './domain';

export type MainStackParamList = {
  YourName: undefined;
  PartnerName: undefined;
  DiscussWay: undefined;
  OnboardingReflectionExplanation: undefined;
  OnboardingReflection: undefined;
  Analyzing: undefined;
  SkipOnboardingReflection: undefined;
  Home: { refreshTimeStamp: string | undefined };
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
    job: JobSlug;
    withPartner: boolean;
    refreshTimeStamp: string | undefined;
  };
  OnDateNewLevel: { withPartner: boolean };
  OnDateNotification: { withPartner: boolean };

  Diary: { refreshTimeStamp: string | undefined };
  DiaryEntry: { id: number };
  DiaryNewEntry: undefined;
  Settings: undefined;
  Conversations: undefined;
  ConversationDetail: { id: number };
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
