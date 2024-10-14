import React, { useContext, useEffect, useState } from 'react';
import { DimensionValue, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logSupaErrors } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import Bulb from '@app/icons/bulb';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ({ route, navigation }: NativeStackScreenProps<MainStackParamList, 'Job'>) {
  const { theme } = useTheme();

  const authContext = useContext(AuthContext);
  const [answer, setAnswer] = useState('');

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const f = async () => {
      setMode('light');
      try {
        const cachedAnswer = await AsyncStorage.getItem('onboarding_job_input');
        if (cachedAnswer !== null) {
          setAnswer(cachedAnswer);
        }
      } catch (error) {
        console.error('Error fetching cached job input:', error);
      }
    };
    const unsubscribeFocus = navigation.addListener('focus', () => void f());
    return unsubscribeFocus;
  }, [navigation, setMode]);

  const getLengthStyle = (type: string) => {
    if (type === activeLengthResult) return { color: theme.colors.black };
    return { color: theme.colors.grey3 };
  };

  const handlePress = async () => {
    await supabase
      .from('onboarding_poll')
      .delete()
      .match({ user_id: authContext.userId, question_slug: 'open-job' });
    const dateResponse = await supabase.from('onboarding_poll').insert({
      user_id: authContext.userId!,
      question_slug: 'open-job',
      answer_slug: answer,
    });
    if (dateResponse.error) {
      logSupaErrors(dateResponse.error);
      return;
    }
    void localAnalytics().logEvent('JobInputContinueClicked', {
      screen: 'JobInput',
      action: 'ContinueClicked',
      job: answer,
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingInviteCode', { fromSettings: false });
  };

  const handleInputChange = async (text: string) => {
    setAnswer(text);
    try {
      await AsyncStorage.setItem('onboarding_job_input', text);
    } catch (error) {
      console.error('Error saving job input to cache:', error);
    }
  };
  const handleBack = () => {
    void localAnalytics().logEvent('JobInputBackClicked', {
      screen: 'JobInput',
      action: 'BackClicked',
      userId: authContext.userId,
    });
    navigation.navigate('DatingLength');
  };
  const [inputHeight, setInputHeight] = useState(100);
  const nextEnabled = answer.trim().length > 10;
  const activeLengthResult =
    answer.length > 500 ? 'perfect' : answer.length > 300 ? 'good' : 'short';
  const progress = Math.min(5 + (answer.length / 750) * 100, 100);

  const getProgressColor = () => {
    if (activeLengthResult === 'short') {
      return theme.colors.warning;
    } else if (activeLengthResult === 'good') {
      return 'rgba(180, 232, 140, 1)';
    } else if (activeLengthResult === 'perfect') {
      return theme.colors.primary;
    }
    return theme.colors.primary;
  };
  const progressColor = getProgressColor();
  return (
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
            }}
          >
            <GoBackButton
              theme="light"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={handleBack}
            ></GoBackButton>
            <Progress current={5} all={7}></Progress>
            <View
              style={{
                position: 'absolute',
                right: 0,
                borderRadius: 40,
                backgroundColor: nextEnabled ? theme.colors.black : theme.colors.grey2,
              }}
            >
              <TouchableOpacity
                disabled={!nextEnabled}
                style={{ padding: 10 }}
                onPress={() => void handlePress()}
              >
                <FontText style={{ color: nextEnabled ? theme.colors.white : theme.colors.grey3 }}>
                  {i18n.t('next')}
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
              style={{
                marginTop: 20,
                flex: 1,
                backgroundColor: theme.colors.grey1,
              }}
            >
              <View
                style={{
                  marginTop: 0,
                  flexGrow: 1,
                }}
              >
                <View
                  style={{
                    padding: 20,
                    backgroundColor: theme.colors.white,
                    borderRadius: 16,
                    justifyContent: 'space-between',
                  }}
                >
                  <FontText
                    style={{
                      textAlign: 'left',
                    }}
                    h3
                  >
                    {i18n.t('onboarding_job_input_title')}
                  </FontText>
                  <StyledTextInput
                    value={answer}
                    returnKeyType="done"
                    placeholder={i18n.t('onboarding_job_input_placeholder')}
                    style={{
                      height: Math.max(100, inputHeight),
                      marginTop: '3%',
                      padding: 0,
                      borderWidth: 0,
                      paddingHorizontal: 0,
                      marginBottom: '5%',
                    }}
                    onChangeText={(value) => {
                      void handleInputChange(value);
                    }}
                    onContentSizeChange={(event) =>
                      setInputHeight(event.nativeEvent.contentSize.height)
                    }
                  ></StyledTextInput>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'column',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.colors.grey0,
                        height: 16,
                        borderRadius: 20,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: progressColor,
                          height: 16,
                          borderRadius: 20,
                          width: (progress.toString() + '%') as DimensionValue,
                        }}
                      ></View>
                    </View>
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <FontText style={getLengthStyle('short')}>
                        {i18n.t('onboarding_reflection_short')}
                      </FontText>
                      <FontText style={getLengthStyle('good')}>
                        {i18n.t('onboarding_reflection_good')}
                      </FontText>
                      <FontText style={getLengthStyle('perfect')}>
                        {i18n.t('onboarding_reflection_perfect')}
                      </FontText>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: theme.colors.grey2,
                    marginTop: 10,
                    padding: 20,
                    paddingVertical: 15,
                    borderRadius: 16,
                    marginBottom: 10,
                  }}
                >
                  <Bulb />
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <FontText style={{ marginTop: 3 }}>
                      {i18n.t('onboarding_job_input_explanation')}
                    </FontText>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
