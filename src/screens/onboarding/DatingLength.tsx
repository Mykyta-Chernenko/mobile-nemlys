import React, { useContext, useEffect, useState } from 'react';
import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logErrorsWithMessage } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'DatingLength'>) {
  const { theme } = useTheme();
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const choices = [
    { slug: 'not_yet', title: i18n.t('onboarding.length.choice_1') },
    { slug: '1_4_weeks', title: i18n.t('onboarding.length.choice_2') },
    { slug: '1_12_months', title: i18n.t('onboarding.length.choice_3') },
    { slug: '1_5_years', title: i18n.t('onboarding.length.choice_4') },
    { slug: '5_more_years', title: i18n.t('onboarding.length.choice_5') },
    { slug: 'single', title: i18n.t('onboarding.length.choice_6') },
  ];
  const authContext = useContext(AuthContext);

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const handlePress = async () => {
    await supabase
      .from('onboarding_poll')
      .delete()
      .match({ user_id: authContext.userId, question_slug: 'dating_length' });
    const dateReponse = await supabase
      .from('onboarding_poll')
      .insert({ user_id: authContext.userId, question_slug: 'dating_length', answer_slug: chosen });
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }
    void localAnalytics().logEvent('DatingLengthContinueClicked', {
      screen: 'DatingLength',
      action: 'ContinueClicked',
      dating_length: chosen,
      userId: authContext.userId,
    });
    if (chosen === 'single') {
      navigation.navigate('RelationshipStoryExplanation');
    } else {
      navigation.navigate('Job', { length_slug: chosen! });
    }
  };
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
              onPress={() => {
                void localAnalytics().logEvent('DatingLengthBackClicked', {
                  screen: 'DatingLength',
                  action: 'BackClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('Age');
              }}
            ></GoBackButton>
            <Progress current={4} all={6}></Progress>
          </View>
          <View
            style={{
              flexGrow: 1,
              marginTop: '10%',
            }}
          >
            <FontText
              style={{
                textAlign: 'left',
              }}
              h1
            ></FontText>
            <FontText
              style={{
                textAlign: 'left',
              }}
              h1
            >
              {i18n.t('onboarding.length.title_first')}
              <FontText style={{ color: theme.colors.primary }} h1>
                {i18n.t('onboarding.length.title_second')}
              </FontText>
              {i18n.t('onboarding.length.title_third')}
            </FontText>
            <ScrollView style={{ marginTop: '5%', flex: 1 }}>
              {choices.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    marginTop: 10,
                    borderRadius: 20,
                    backgroundColor: theme.colors.white,
                    borderColor: c.slug === chosen ? theme.colors.black : theme.colors.white,
                    borderWidth: 1,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => void setChosen(c.slug)}
                >
                  <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={{ padding: 20 }}>
          <PrimaryButton
            disabled={!chosen}
            title={i18n.t('continue')}
            onPress={() => void handlePress()}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
