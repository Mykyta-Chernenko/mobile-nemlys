import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingQuestion, UserOnboardingAnswer } from './domain';

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
  actionsIds: number[];
  questionIds: number[];
}

export type MainStackParamList = {
  SetHomeScreen: { refresh: boolean | undefined };
  SetItemDetails: SetItemProps;
  SetReminder: SetReminderProps;
};

export type ProfileScreenNavigationProp = NativeStackScreenProps<MainStackParamList>['navigation'];

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
