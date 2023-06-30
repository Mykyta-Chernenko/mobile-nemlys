import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CarouselCardsType,
  FeedbackQuestion,
  OnboardingQuestion,
  UserFeedbackAnswer,
  UserOnboardingAnswer,
} from './domain';

export type SetItemPropsAction = {
  type: 'action';
  instruction: string;
  importance: string;
};
export type SetItemPropsQuestion = {
  type: 'question';
  importance: string;
  tips: string;
};
export type SetItemPropsAIQuestion = {
  type: 'ai_question';
};
export type SetItemPropsAIAction = {
  type: 'ai_action';
  instruction: string;
};
export type SetItemProps = {
  deckType: CarouselCardsType;
  image: string | undefined;
  title: string;
  details: string;
  tags: string[];
} & (SetItemPropsAction | SetItemPropsQuestion | SetItemPropsAIQuestion | SetItemPropsAIAction);

export type HistorySetCardDetailsProps = {
  coupleSetId: number;
};

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
  YourName: undefined;
  PartnerName: undefined;
  RelationshipStoryExplanation: undefined;
  RelationshipStory: undefined;
  SkipRelationshipStory: undefined;
  Home: { refreshTimeStamp: string | undefined };
  Story: { refreshTimeStamp: string | undefined };
  ConfigureDate: { refreshTimeStamp: string | undefined };
  OnDate: { refreshTimeStamp: string | undefined };

  SetHomeScreen: { refreshTimeStamp: string | undefined };
  SetItemDetails: SetItemProps;
  HistorySet: undefined;
  HistorySetCardDetails: HistorySetCardDetailsProps;
  SetReminder: SetReminderProps;
  CompleteSetReflect: CompleteSetReflectProps;
  CompleteSetQuestion: CompleteSetQuestionProps;
  CompleteSetFinal: CompleteSetFinalProps;
  Diary: { refreshTimeStamp: string | undefined };
  DiaryEntry: { id: number };
  DiaryNewEntry: undefined;
  Settings: undefined;
  Conversations: undefined;
  ConversationDetail: { id: number };
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

type PlacementRelationshipStateParams = PlacementParams & {
  relationshipStateAnswer: string;
};

type RegisterParams = Omit<PlacementRelationshipStateParams, 'questions' | 'questionIndex'>;
export type AuthStackParamList = {
  Welcome: undefined;
  PrePlacement: PrePlacementParams;
  Placement: PlacementParams;
  PlacementRelationshipState: PlacementParams;
  HowWeWork: PlacementRelationshipStateParams;
  Login: undefined;
  Register: RegisterParams;
  ForgetPassword: undefined;
  EmailConfirmed: undefined;
  TypeNewPassword: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
};
