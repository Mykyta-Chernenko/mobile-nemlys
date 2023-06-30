import React, { useContext, useEffect, useState } from 'react';

import { useTheme } from '@rneui/themed';

import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageBackground, ScrollView, View } from 'react-native';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Progress } from '@app/components/utils/Progress';
import { APIDate, SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import ChooseDateTopics from '@app/components/date/ChooseDateTopics';
import ChooseDateLevel from '@app/components/date/ChooseDateLevel';
import GeneratingQuestions from '@app/components/date/GeneratingQuestions';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'ConfigureDate'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [chosenTopic, setChosenTopic] = useState<string>('');
  const [chosenLevel, setChosenLevel] = useState<number>(1);
  const [dateId, setDateId] = useState<number | undefined>(undefined);
  const authContext = useContext(AuthContext);

  const dateFields = 'id, couple_id, active, topic, level, created_at, updated_at';
  async function getDate() {
    setLoading(true);

    const dateRes: SupabaseAnswer<APIDate | null> = await supabase
      .from('date')
      .select(dateFields)
      .eq('active', true)
      .maybeSingle();
    if (dateRes.error) {
      logErrors(dateRes.error);
      return;
    }
    if (dateRes.data) {
      setDateId(dateRes.data.id);
      setChosenTopic(dateRes.data.topic);
      setChosenLevel(dateRes.data.level);
    } else {
      setDateId(undefined);
      setChosenTopic('');
      setChosenLevel(1);
    }
    setCurrentStep(1);
    setLoading(false);
  }
  useEffect(() => {
    void getDate();
  }, [route.params.refreshTimeStamp]);
  const goBack = () => {
    if (currentStep === 1) {
      void localAnalytics().logEvent('ConfigureDateGoHome', {
        screen: 'ConfigureDate',
        action: 'GoHomePressed',
        userId: authContext.userId,
      });
      navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
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
          topic={chosenTopic}
          onNextPress={function (topic: string): void {
            void localAnalytics().logEvent('ConfigureDateTopicChosen', {
              screen: 'ConfigureDate',
              action: 'TopicContinuePressed',
              userId: authContext.userId,
            });
            setChosenTopic(topic);
            setCurrentStep(2);
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
          dateId={dateId}
          topic={chosenTopic}
          level={chosenLevel}
          onLoaded={() => {
            void localAnalytics().logEvent('ConfigureDateQuestionGenerated', {
              screen: 'ConfigureDate',
              action: 'QuestionGenerated',
              userId: authContext.userId,
            });
            navigation.navigate('OnDate', { refreshTimeStamp: new Date().toISOString() });
          }}
        ></GeneratingQuestions>
      );
      break;
  }

  return loading ? (
    <Loading light />
  ) : (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
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
              <Progress current={currentStep} all={2}></Progress>
            </View>
            <View
              style={{
                flexGrow: 1,
              }}
            >
              {activeComponent}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
