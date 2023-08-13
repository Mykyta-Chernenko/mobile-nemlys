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
  withPartner: boolean;
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
  const choicesAlone = [
    { value: 4, icon: Feedback4Icon, title: i18n.t('date.feedback.alone.choice_4') },
    { value: 3, icon: Feedback3Icon, title: i18n.t('date.feedback.alone.choice_3') },
    { value: 2, icon: Feedback2Icon, title: i18n.t('date.feedback.alone.choice_2') },
    { value: 1, icon: Feedback1Icon, title: i18n.t('date.feedback.alone.choice_1') },
  ];
  const choicesWithPartner = [
    { value: 4, icon: Feedback4Icon, title: i18n.t('date.feedback.with_partner.choice_4') },
    { value: 3, icon: Feedback3Icon, title: i18n.t('date.feedback.with_partner.choice_3') },
    { value: 2, icon: Feedback2Icon, title: i18n.t('date.feedback.with_partner.choice_2') },
    { value: 1, icon: Feedback1Icon, title: i18n.t('date.feedback.with_partner.choice_1') },
  ];
  const choices = props.withPartner ? choicesWithPartner : choicesAlone;

  const titleFirst = props.withPartner
    ? i18n.t('date.feedback.with_partner.title_first')
    : i18n.t('date.feedback.alone.title_first');

  const titleSecond = props.withPartner
    ? i18n.t('date.feedback.with_partner.title_second')
    : i18n.t('date.feedback.alone.title_second');
  const titleThird = props.withPartner
    ? i18n.t('date.feedback.with_partner.title_third')
    : i18n.t('date.feedback.alone.title_third');

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
                {titleFirst}
                <FontText h1 style={{ color: theme.colors.primary }}>
                  {titleSecond}
                </FontText>
                {titleThird}
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
