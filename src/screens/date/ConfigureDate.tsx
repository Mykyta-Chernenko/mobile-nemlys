import React, { useContext, useEffect, useState } from 'react';

import { useThemeMode } from '@rneui/themed';

import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageBackground, View } from 'react-native';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Progress } from '@app/components/utils/Progress';
import ChooseDateTopics from '@app/components/date/ChooseDateTopics';
import ChooseDateLevel from '@app/components/date/ChooseDateLevel';
import GeneratingQuestions from '@app/components/date/GeneratingQuestions';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reflection from '@app/components/reflection/Reflection';
import { SupabaseAnswer } from '@app/types/api';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'ConfigureDate'>) {
  const job = route.params.job;
  const isIssue = job === 'issues';
  const hasLevels = job === 'issues' || job == 'sex' || job == 'know' || job == 'hard';
  const [currentStep, setCurrentStep] = useState(1);
  const [chosenTopic, setChosenTopic] = useState<string>('');
  const [chosenLevel, setChosenLevel] = useState<number>(2);
  const [reflectionAnswerId, setReflectionAnswerId] = useState<number | undefined>(undefined);
  const authContext = useContext(AuthContext);
  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const [loading, setLoading] = useState(false);
  const [reflectionId, setReflectionId] = useState(0);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data: SupabaseAnswer<{ id: number; reflection: string }> = await supabase
        .from('reflection_question')
        .select('id, reflection')
        .eq('slug', 'discuss_issue')
        .single();
      if (data.error) {
        logErrors(data.error);
        return;
      }
      setReflection(data.data.reflection);
      setReflectionId(data.data.id);
      setLoading(false);
    };
    isIssue && void getData();
  }, [isIssue]);

  const goBack = () => {
    if (currentStep === 1) {
      void localAnalytics().logEvent('ConfigureDateGoBack', {
        screen: 'ConfigureDate',
        action: 'GoBackPressed',
        userId: authContext.userId,
      });
      navigation.navigate('DateIsWithPartner', { job });
    } else {
      void localAnalytics().logEvent('ConfigureDateBackPressed', {
        screen: 'ConfigureDate',
        action: 'BackPressed',
        userId: authContext.userId,
        newStep: currentStep - 1,
      });
      setCurrentStep(currentStep - 1);
    }
  };
  let activeComponent = <></>;
  switch (currentStep) {
    case 1:
      activeComponent = (
        <ChooseDateTopics
          goToReflection={() =>
            navigation.navigate('ReflectionHome', { refreshTimeStamp: new Date().toISOString() })
          }
          job={job}
          topic={chosenTopic}
          onNextPress={function (topic: string): void {
            void localAnalytics().logEvent('ConfigureDateTopicChosen', {
              screen: 'ConfigureDate',
              action: 'TopicContinuePressed',
              topic,
              userId: authContext.userId,
            });
            setChosenTopic(topic);
            if (hasLevels) {
              setCurrentStep(2);
            } else {
              setCurrentStep(3);
            }
          }}
        ></ChooseDateTopics>
      );
      break;
    case 2:
      activeComponent = (
        <ChooseDateLevel
          level={chosenLevel}
          onNextPress={function (level: number): void {
            void localAnalytics().logEvent('ConfigureDateLevelChosen', {
              screen: 'ConfigureDate',
              action: 'LevelContinuePressed',
              userId: authContext.userId,
              level,
            });
            setChosenLevel(level);
            setCurrentStep(3);
          }}
        ></ChooseDateLevel>
      );
      break;
    case 3:
      activeComponent = (
        <GeneratingQuestions
          withPartner={route.params.withPartner}
          job={job}
          topic={chosenTopic}
          level={chosenLevel}
          reflectionAnswerId={reflectionAnswerId}
          onLoaded={() => {
            void localAnalytics().logEvent('ConfigureDateQuestionGenerated', {
              screen: 'ConfigureDate',
              action: 'QuestionGenerated',
              userId: authContext.userId,
            });
            navigation.navigate('OnDate', {
              job,
              withPartner: route.params.withPartner,
              refreshTimeStamp: new Date().toISOString(),
            });
          }}
        ></GeneratingQuestions>
      );
      break;
  }

  return loading ? (
    <Loading></Loading>
  ) : currentStep === 1 && isIssue ? (
    <Reflection
      reflectionId={reflectionId}
      onSave={(answerId) => {
        void localAnalytics().logEvent('ConfigureDateIssueWritten', {
          screen: 'ConfigureDate',
          action: 'IssueWritten',
          userId: authContext.userId,
        });
        setCurrentStep(2);
        setReflectionAnswerId(answerId);
      }}
      question={reflection}
      onBack={() => void goBack()}
    ></Reflection>
  ) : (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
              display: currentStep === 3 ? 'none' : 'flex',
            }}
          >
            <GoBackButton
              theme="light"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={() => void goBack()}
            ></GoBackButton>
            {hasLevels && <Progress current={currentStep} all={2}></Progress>}
          </View>
          <View
            style={{
              flexGrow: 1,
            }}
          >
            {activeComponent}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
