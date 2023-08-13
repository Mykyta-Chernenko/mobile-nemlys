import React, { useContext, useEffect, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { FontText } from '@app/components/utils/FontText';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import StyledTextInput from '../utils/StyledTextInput';
import LockGrey from '../../icons/lock_grey';
import Wand from '../../icons/wand';
import { logErrorsWithMessage } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';

export default function ({
  reflectionId,
  question,
  answer = '',
  onBack,
  onSave,
}: {
  reflectionId: number;
  question: string;
  answer?: string;
  onBack: () => void;
  onSave: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [inputHeight, setInputHeight] = useState(100);
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const [touched, setTouched] = useState(false);
  const [resultAnswer, setResultAnswer] = useState(answer);
  const showButton = touched && resultAnswer.trim().length > 0;
  const navigation = useNavigation();
  // to set the color of status bar
  const { setMode } = useThemeMode();
  const activeLengthResult =
    resultAnswer.length > 500 ? 'perfect' : resultAnswer.length > 300 ? 'good' : 'short';
  const progress = Math.min(5 + (resultAnswer.length / 750) * 100, 100);
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

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const getLengthStyle = (type: string) => {
    if (type === activeLengthResult) return { color: theme.colors.black };
    return { color: theme.colors.grey3 };
  };
  const handleOnPress = async () => {
    void localAnalytics().logEvent('ReflectionSaved', {
      screen: 'Reflection',
      action: 'SavedClicked',
      length: resultAnswer?.length,
      userId: authContext.userId,
    });
    const { error, data } = await supabase
      .from('reflection_question_answer')
      .select('id')
      .match({ user_id: authContext.userId, reflection_id: reflectionId })
      .maybeSingle();
    if (error) {
      logErrorsWithMessage(error, error.message);
      return;
    }
    if (data) {
      const relfectionResponse = await supabase
        .from('reflection_question_answer')
        .update({ answer: resultAnswer, updated_at: new Date() })
        .eq('id', data.id)
        .single();

      if (relfectionResponse.error) {
        logErrorsWithMessage(relfectionResponse.error, relfectionResponse.error.message);
        return;
      }
    } else {
      const relfectionResponse = await supabase.from('reflection_question_answer').insert({
        user_id: authContext.userId,
        reflection_id: reflectionId,
        answer: resultAnswer,
      });
      if (relfectionResponse.error) {
        logErrorsWithMessage(relfectionResponse.error, relfectionResponse.error.message);
        return;
      }
    }
    setTouched(false);
    setResultAnswer('');
    onSave();
  };
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ImageBackground
        style={{
          flexGrow: 1,
        }}
        source={require('../../../assets/images/onboarding_background.png')}
      >
        <View style={{ flex: 1, marginTop: insets.top, marginBottom: 5 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
              margin: 20,
              marginBottom: 5,
            }}
          >
            <GoBackButton
              theme="light"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={onBack}
            ></GoBackButton>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LockGrey></LockGrey>
              <FontText style={{ color: theme.colors.grey5 }}>
                {i18n.t('onboarding.reflection.private')}
              </FontText>
            </View>

            <View
              style={{
                position: 'absolute',
                right: 0,
                borderRadius: 40,
                backgroundColor: showButton ? theme.colors.black : theme.colors.grey2,
              }}
            >
              <TouchableOpacity
                disabled={!showButton}
                style={{ padding: 10 }}
                onPress={() => void handleOnPress()}
              >
                <FontText
                  style={{
                    color: showButton ? theme.colors.white : theme.colors.grey3,
                  }}
                >
                  {i18n.t('save')}
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
              style={{
                padding: 20,

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
                    {question}
                  </FontText>
                  <StyledTextInput
                    value={resultAnswer}
                    returnKeyType="done"
                    placeholder={i18n.t('onboarding.reflection.write_answer')}
                    style={{
                      height: Math.max(100, inputHeight),
                      marginTop: '3%',
                      padding: 0,
                      borderWidth: 0,
                      marginBottom: '5%',
                    }}
                    onChangeText={(value) => {
                      setTouched(true);
                      setResultAnswer(value);
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
                          width: progress.toString() + '%',
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
                        {i18n.t('onboarding.reflection.short')}
                      </FontText>
                      <FontText style={getLengthStyle('good')}>
                        {i18n.t('onboarding.reflection.good')}
                      </FontText>
                      <FontText style={getLengthStyle('perfect')}>
                        {i18n.t('onboarding.reflection.perfect')}
                      </FontText>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: '5%' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.grey2,
                      padding: 20,
                      paddingHorizontal: 30,
                      borderRadius: 16,
                    }}
                  >
                    <Wand></Wand>
                    <View>
                      <FontText style={{ marginLeft: 5 }}>
                        {i18n.t('onboarding.reflection.explanation')}
                      </FontText>
                    </View>
                    <View></View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
