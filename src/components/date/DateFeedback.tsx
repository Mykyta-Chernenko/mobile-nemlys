import React, { useCallback } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import Feedback4Icon from '@app/icons/feedback4';
import Feedback3Icon from '@app/icons/feedback3';
import Feedback2Icon from '@app/icons/feedback2';
import Feedback1Icon from '@app/icons/feedback1';
import { TouchableOpacity } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';

export default function (props: { onPressForward: (feedback: number) => void }) {
  const { theme } = useTheme();

  const { setMode } = useThemeMode();
  useFocusEffect(
    useCallback(() => {
      setMode('light');
    }, []),
  );

  const choices = [
    { value: 4, icon: Feedback4Icon, title: i18n.t('date_feedback_with_partner_choice_4') },
    { value: 3, icon: Feedback3Icon, title: i18n.t('date_feedback_with_partner_choice_3') },
    { value: 2, icon: Feedback2Icon, title: i18n.t('date_feedback_with_partner_choice_2') },
    { value: 1, icon: Feedback1Icon, title: i18n.t('date_feedback_with_partner_choice_1') },
  ];

  const titleFirst = i18n.t('date_feedback_with_partner_title_first');

  const titleSecond = i18n.t('date_feedback_with_partner_title_second');
  const titleThird = i18n.t('date_feedback_with_partner_title_third');

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
