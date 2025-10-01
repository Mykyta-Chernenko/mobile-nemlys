import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '@app/screens/menu/Home';

import { HomeName } from '@app/utils/constants';
import YourName from '@app/screens/onboarding/YourName';
import PartnerName from '@app/screens/onboarding/PartnerName';
import ConfigureDate from '@app/screens/date/ConfigureDate';
import OnDate from '@app/screens/date/OnDate';
import Profile from '@app/screens/menu/Profile';
import LoveNote from '@app/screens/menu/LoveNote';
import V2Profile from '@app/screens/menu/V2Profile';
import V3Profile from '@app/screens/menu/V3Profile';
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
import DateIsWithPartner from '@app/components/date/DateIsWithPartner';
import OnboardingInviteCode from '@app/screens/onboarding/OnboardingInviteCode';
import OnboardingInviteCodeInput from '@app/screens/onboarding/OnboardingInviteCodeInput';
import CoupleLanguage from '@app/screens/settings/CoupleLanguage';
import QuestionAnswer from '@app/screens/answer/QuestionAnswer';
import AnswerHome from '@app/screens/answer/AnswerHome';
import GeneratingQuestion from '@app/components/date/GeneratingQuestion';
import DatingLength from '@app/screens/onboarding/DatingLength';
import V2Home from '@app/screens/menu/V2Home';
import V3Home from '@app/screens/menu/V3Home';
import V3Explore from '@app/screens/explore/V3Explore';
import V3ExploreTestList from '@app/screens/explore/V3ExploreTestList';
import V3ExploreTestDetail from '@app/screens/explore/V3ExploreTestDetail';
import V3CheckupStart from '@app/screens/content/checkup/V3CheckupStart';
import V3Checkup from '@app/screens/content/checkup/V3Checkup';
import V3CheckupFinish from '@app/screens/content/checkup/V3CheckupFinish';
import V3ShowStreak from '@app/screens/content/V3ShowStreak';
import V3ExploreArticleList from '@app/screens/explore/V3ExploreArticleList';
import V3ExploreArticleDetail from '@app/screens/explore/V3ExploreArticleDetail';
import V3ExploreExerciseList from '@app/screens/explore/V3ExploreExerciseList';
import V3ExploreExerciseDetail from '@app/screens/explore/V3ExploreExerciseDetail';
import V3ExploreGameList from '@app/screens/explore/V3ExploreGameList';
import V3ExploreCheckupList from '@app/screens/explore/V3ExploreCheckupList';
import V3ExploreCheckupDetail from '@app/screens/explore/V3ExploreCheckupDetail';
import V3TestFinish from '@app/screens/content/test/V3TestFinish';
import V3Test from '@app/screens/content/test/V3Test';
import V3TestStart from '@app/screens/content/test/V3TestStart';
import V3ExploreGameDetail from '@app/screens/explore/V3ExploreGameDetail';
import V3GameStart from '@app/screens/content/game/V3GameStart';
import V3Game from '@app/screens/content/game/V3Game';
import V3GameFinish from '@app/screens/content/game/V3GameFinish';
import V3AnswerHome from '@app/screens/answer/V3AnswerHome';
import V3ExploreQuestionList from '@app/screens/explore/V3ExploreQuestionList';
import V3ExploreQuestionListJob from '@app/screens/explore/V3ExploreQuestionListJob';
import V3ExploreQuestionDetail from '@app/screens/explore/V3ExploreQuestionDetail';
import OnboardingQuizIntro from '@app/screens/onboarding/OnboardingQuizIntro';
import OnboardingQuiz from '@app/screens/onboarding/OnboardingQuiz';
import OnboardingPlan from '@app/screens/onboarding/OnboardingPlan';
import ChangePlan from '@app/screens/onboarding/ChangePlan';
import V3PremiumOffer from '@app/screens/premium/V3PremiumOffer';
import OnboardingStatistics from '@app/screens/onboarding/OnboardingStatistics';
import OnboardingNotification from '@app/screens/onboarding/OnboardingNotification';
import V3Upgrade from '@app/screens/menu/V3Upgrade';
import RevenueCatPremiumOffer from '@app/screens/premium/RevenueCatPremiumOffer';

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
      {/*Entry point of the app if a user is logged in, redirect to the new or old version*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={HomeName}
        component={Home}
      />
      {/*old v2 home*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V2Home'}
        component={V2Home}
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
      {/*profile entry point, redirect to v2 or v3*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V2Profile'}
        component={V2Profile}
      />
      {/*v2 pages down*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'DateIsWithPartner'}
        component={DateIsWithPartner}
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
        name={'GeneratingQuestion'}
        component={GeneratingQuestion}
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

      {/*end of v2 screens*/}

      {/*onboarding screens/config screens, used in both v2 and v3*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'QuestionAnswer'}
        component={QuestionAnswer}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'AnswerHome'}
        component={AnswerHome}
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
        name={'DatingLength'}
        component={DatingLength}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'Language'}
        component={Language}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'CoupleLanguage'}
        component={CoupleLanguage}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingInviteCode'}
        component={OnboardingInviteCode}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingInviteCodeInput'}
        component={OnboardingInviteCodeInput}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingQuizIntro'}
        component={OnboardingQuizIntro}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingQuiz'}
        component={OnboardingQuiz}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingPlan'}
        component={OnboardingPlan}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'ChangePlan'}
        component={ChangePlan}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingStatistics'}
        component={OnboardingStatistics}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'OnboardingNotification'}
        component={OnboardingNotification}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'Analyzing'}
        component={Analyzing}
      />

      {/*v3 screens*/}
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3PremiumOffer'}
        component={V3PremiumOffer}
      />
       <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'RevenueCatPremiumOffer'}
        component={RevenueCatPremiumOffer}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Upgrade'}
        component={V3Upgrade}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Home'}
        component={V3Home}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Profile'}
        component={V3Profile}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'LoveNote'}
        component={LoveNote}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Explore'}
        component={V3Explore}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreTestList'}
        component={V3ExploreTestList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreGameList'}
        component={V3ExploreGameList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreCheckupList'}
        component={V3ExploreCheckupList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreArticleList'}
        component={V3ExploreArticleList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreExerciseList'}
        component={V3ExploreExerciseList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreQuestionListJob'}
        component={V3ExploreQuestionListJob}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreQuestionList'}
        component={V3ExploreQuestionList}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreQuestionDetail'}
        component={V3ExploreQuestionDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreTestDetail'}
        component={V3ExploreTestDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreGameDetail'}
        component={V3ExploreGameDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreArticleDetail'}
        component={V3ExploreArticleDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreExerciseDetail'}
        component={V3ExploreExerciseDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ExploreCheckupDetail'}
        component={V3ExploreCheckupDetail}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3TestStart'}
        component={V3TestStart}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Test'}
        component={V3Test}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3TestFinish'}
        component={V3TestFinish}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3CheckupStart'}
        component={V3CheckupStart}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Checkup'}
        component={V3Checkup}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3CheckupFinish'}
        component={V3CheckupFinish}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3GameStart'}
        component={V3GameStart}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3Game'}
        component={V3Game}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3GameFinish'}
        component={V3GameFinish}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3ShowStreak'}
        component={V3ShowStreak}
      />
      <MainStack.Screen
        options={{ animation: 'slide_from_right' }}
        name={'V3AnswerHome'}
        component={V3AnswerHome}
      />
    </MainStack.Navigator>
  );
};

export default Main;
