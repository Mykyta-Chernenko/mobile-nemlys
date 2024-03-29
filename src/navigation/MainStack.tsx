import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '@app/screens/menu/Home';

import { HomeName } from '@app/utils/constants';
import YourName from '@app/screens/onboarding/YourName';
import PartnerName from '@app/screens/onboarding/PartnerName';
import OnboardingReflection from '@app/screens/onboarding/OnboardingReflection';
import OnboardingReflectionExplanation from '@app/screens/onboarding/OnboardingReflectionExplanation';
import ConfigureDate from '@app/screens/date/ConfigureDate';
import OnDate from '@app/screens/date/OnDate';
import Profile from '@app/screens/menu/Profile';
import DiscussWay from '@app/screens/onboarding/DiscussWay';
import Analyzing from '@app/screens/onboarding/Analyzing';
import ReflectionHome from '@app/screens/reflection/ReflectionHome';
import WriteReflection from '@app/screens/reflection/WriteReflection';
import FinishedWriting from '@app/screens/reflection/FinishedWriting';
import OnDateNotification from '@app/screens/date/OnDateNotification';
import PremiumOffer from '@app/screens/premium/PremiumOffer';
import PremiumSuccess from '@app/screens/premium/PremiumSuccess';
import InterviewRequest from '@app/screens/utils/InterviewRequest';
import Language from '@app/screens/onboarding/Language';
import InterviewText from '@app/screens/utils/InterviewText';

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
        name={'ReflectionHome'}
        component={ReflectionHome}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'WriteReflection'}
        component={WriteReflection}
      />

      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'FinishedWriting'}
        component={FinishedWriting}
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
        name={'OnDateNotification'}
        component={OnDateNotification}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'PremiumOffer'}
        component={PremiumOffer}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'PremiumSuccess'}
        component={PremiumSuccess}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'InterviewRequest'}
        component={InterviewRequest}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'InterviewText'}
        component={InterviewText}
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
        name={'Language'}
        component={Language}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'DiscussWay'}
        component={DiscussWay}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingReflection'}
        component={OnboardingReflection}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingReflectionExplanation'}
        component={OnboardingReflectionExplanation}
      />

      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'Analyzing'}
        component={Analyzing}
      />
    </MainStack.Navigator>
  );
};

export default Main;
