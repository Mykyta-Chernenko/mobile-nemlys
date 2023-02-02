import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FeedbackQuestion,
  OnboardingQuestion,
  UserFeedbackAnswer,
  UserOnboardingAnswer,
} from './domain';

export type SetItemPropsAction = {
  type: 'action';
  instruction: string;
};
export type SetItemPropsQuestion = {
  type: 'question';
  tips: string;
};
export type SetItemProps = {
  image: string | undefined;
  title: string;
  details: string;
  importance: string;
  tags: string[];
} & (SetItemPropsAction | SetItemPropsQuestion);

export class SetReminderProps {
  setId: number;
}

export class CompleteSetReflectProps {
  setId: number;
  coupleSetId: number;
}

export class CompleteSetQuestionProps extends CompleteSetReflectProps {
  questions: FeedbackQuestion[] | undefined;
  questionIndex: number | undefined;
  userAnswers: UserFeedbackAnswer[];
}

export class CompleteSetFinalProps extends CompleteSetQuestionProps {}

export type MainStackParamList = {
  SetHomeScreen: { refreshTimeStamp: string | undefined };
  SetItemDetails: SetItemProps;
  SetReminder: SetReminderProps;
  CompleteSetReflect: CompleteSetReflectProps;
  CompleteSetQuestion: CompleteSetQuestionProps;
  CompleteSetFinal: CompleteSetFinalProps;
};

export type MainNavigationProp = NativeStackScreenProps<MainStackParamList>['navigation'];

type PrePlacementParams = {
  name: string;
};
type PlacementParams = PrePlacementParams & {
  questions: OnboardingQuestion[] | undefined;
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
