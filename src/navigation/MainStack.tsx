import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Diary from '@app/screens/diary/Diary';
import Home from '@app/screens/menu/Home';
import Story from '@app/screens/menu/Story';
import DiaryNewEntry from '@app/screens/diary/DiaryNewEntry';
import { HomeName } from '@app/utils/constants';
import DiaryEntry from '@app/screens/diary/DiaryEntry';
import YourName from '@app/screens/onboarding/YourName';
import PartnerName from '@app/screens/onboarding/PartnerName';
import Age from '@app/screens/onboarding/Age';
import DatingLength from '@app/screens/onboarding/DatingLength';
import Job from '@app/screens/onboarding/Job';
import RelationshipStory from '@app/screens/onboarding/RelationshipStory';
import SkipRelationshipStory from '@app/components/onboarding/SkipRelationshipStory';
import RelationshipStoryExplanation from '@app/screens/onboarding/RelationshipStoryExplanation';
import ConfigureDate from '@app/screens/date/ConfigureDate';
import OnDate from '@app/screens/date/OnDate';
import Profile from '@app/screens/menu/Profile';

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
        name={'Profile'}
        component={Profile}
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

      <MainStack.Screen options={{ animation: 'slide_from_right' }} name={'Age'} component={Age} />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'DatingLength'}
        component={DatingLength}
      />
      <MainStack.Screen options={{ animation: 'slide_from_right' }} name={'Job'} component={Job} />
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
    </MainStack.Navigator>
  );
};

export default Main;
