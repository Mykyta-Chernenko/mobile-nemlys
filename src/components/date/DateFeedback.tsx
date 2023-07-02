import React, { useContext, useEffect } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';
import { localAnalytics } from '@app/utils/analytics';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import Feedback4Icon from '@app/icons/feedback4';
import Feedback3Icon from '@app/icons/feedback3';
import Feedback2Icon from '@app/icons/feedback2';
import Feedback1Icon from '@app/icons/feedback1';
import { AuthContext } from '@app/provider/AuthProvider';
import { TouchableOpacity } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';

export default function (props: {
  onPressBack: () => void;
  onPressForward: (feedback: number) => void;
}) {
  const { theme } = useTheme();

  const { setMode } = useThemeMode();
  useEffect(() => {
    setMode('light');
    return () => setMode('dark');
  }, []);

  const authContext = useContext(AuthContext);
  const choices = [
    { value: 4, icon: Feedback4Icon, title: i18n.t('date.feedback.choice_4') },
    { value: 3, icon: Feedback3Icon, title: i18n.t('date.feedback.choice_3') },
    { value: 2, icon: Feedback2Icon, title: i18n.t('date.feedback.choice_2') },
    { value: 1, icon: Feedback1Icon, title: i18n.t('date.feedback.choice_1') },
  ];

  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 15,
          }}
        >
          <GoBackButton
            theme="light"
            onPress={() => {
              void localAnalytics().logEvent('DateFeedbackGoBack', {
                screen: 'DateFeedback',
                action: 'DateFeedback go back pressed',
                userId: authContext.userId,
              });
              props.onPressBack();
            }}
          ></GoBackButton>
          <View style={{ flexGrow: 1, justifyContent: 'space-between' }}>
            <View
              style={{
                marginTop: '30%',
              }}
            >
              <FontText h1 style={{ textAlign: 'center' }}>
                {i18n.t('date.feedback.title_first')}
                <FontText h1 style={{ color: theme.colors.primary }}>
                  {i18n.t('date.feedback.title_second')}
                </FontText>
                {i18n.t('date.feedback.title_third')}
              </FontText>
            </View>
            <View style={{ marginBottom: '10%' }}>
              {choices.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    marginTop: 10,
                    borderRadius: 20,
                    backgroundColor: theme.colors.white,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => props.onPressForward(c.value)}
                >
                  <c.icon></c.icon>
                  <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
