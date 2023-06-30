import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetHomeScreen from '@app/screens/sets/SetHomeScreen';
import SetItemDetails from '@app/screens/sets/SetItemDetails';
import CompleteSetReflect from '@app/screens/sets/completeSet/CompleteSetReflect';
import CompleteSetQuestion from '@app/screens/sets/completeSet/CompleteSetQuestion';
import CompleteSetFinal from '@app/screens/sets/completeSet/CompleteSetFinal';
import HistorySet from '@app/components/sets/HistorySet';
import HistorySetCardDetails from '@app/screens/sets/history/HistorySetCardDetails';
import Diary from '@app/screens/diary/Diary';
import Home from '@app/screens/Home';
import Story from '@app/screens/Story';
import Settings from '@app/screens/settings/Settings';
import DiaryNewEntry from '@app/screens/diary/DiaryNewEntry';
import { HistorySetScreenName, HomeName, SetHomeScrenName } from '@app/utils/constants';
import DiaryEntry from '@app/screens/diary/DiaryEntry';
import Conversations from '@app/screens/conversations/Conversations';
import ConversationDetail from '@app/screens/conversations/ConversationDetail';
import YourName from '@app/screens/onboarding/YourName';
import PartnerName from '@app/screens/onboarding/PartnerName';
import RelationshipStory from '@app/screens/onboarding/RelationshipStory';
import SkipRelationshipStory from '@app/components/onboarding/SkipRelationshipStory';
import RelationshipStoryExplanation from '@app/screens/onboarding/RelationshipStoryExplanation';
import ConfigureDate from '@app/screens/date/ConfigureDate';
import OnDate from '@app/screens/date/OnDate';

const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        // disable ios gesture back
        gestureEnabled: false,
      }}
    >
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={HomeName}
        component={Home}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'Story'}
        component={Story}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'ConfigureDate'}
        component={ConfigureDate}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnDate'}
        component={OnDate}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'YourName'}
        component={YourName}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'PartnerName'}
        component={PartnerName}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'RelationshipStory'}
        component={RelationshipStory}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'RelationshipStoryExplanation'}
        component={RelationshipStoryExplanation}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'SkipRelationshipStory'}
        component={SkipRelationshipStory}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={SetHomeScrenName}
        component={SetHomeScreen}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="SetItemDetails"
        component={SetItemDetails}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="CompleteSetReflect"
        component={CompleteSetReflect}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="CompleteSetQuestion"
        component={CompleteSetQuestion}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="CompleteSetFinal"
        component={CompleteSetFinal}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={HistorySetScreenName}
        component={HistorySet}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="HistorySetCardDetails"
        component={HistorySetCardDetails}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="DiaryNewEntry"
        component={DiaryNewEntry}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Diary"
        component={Diary}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="DiaryEntry"
        component={DiaryEntry}
      ></MainStack.Screen>

      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Settings"
        component={Settings}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Conversations"
        component={Conversations}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="ConversationDetail"
        component={ConversationDetail}
      ></MainStack.Screen>
    </MainStack.Navigator>
  );
};

export default Main;
