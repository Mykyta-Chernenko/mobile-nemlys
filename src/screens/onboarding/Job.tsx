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
import JobFunIcon from '@app/icons/job_fun';
import JobMatchIcon from '@app/icons/job_match';
import JobHardIcon from '@app/icons/job_hard';
import JobIssuesIcon from '@app/icons/job_issues';
import JobOtherIcon from '@app/icons/job_other';

export default function ({ route, navigation }: NativeStackScreenProps<MainStackParamList, 'Job'>) {
  const { theme } = useTheme();
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const choiceFresh = [
    { icon: JobFunIcon, slug: 'fun', title: i18n.t('onboarding.job.fun') },
    { icon: JobMatchIcon, slug: 'match', title: i18n.t('onboarding.job.match') },
    { icon: JobHardIcon, slug: 'hard', title: i18n.t('onboarding.job.hard') },
    { icon: JobOtherIcon, slug: 'other', title: i18n.t('onboarding.job.other') },
  ];
  const choiceNotFreh = [
    { icon: JobFunIcon, slug: 'fun', title: i18n.t('onboarding.job.fun') },
    { icon: JobHardIcon, slug: 'hard', title: i18n.t('onboarding.job.hard') },
    { icon: JobIssuesIcon, slug: 'issues', title: i18n.t('onboarding.job.issues') },
    { icon: JobOtherIcon, slug: 'other', title: i18n.t('onboarding.job.other') },
  ];
  const choices = ['1_5_years', '5_more_years'].includes(route.params.length_slug)
    ? choiceNotFreh
    : choiceFresh;
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
      .match({ user_id: authContext.userId, question_slug: 'job' });
    const dateReponse = await supabase
      .from('onboarding_poll')
      .insert({ user_id: authContext.userId, question_slug: 'job', answer_slug: chosen });
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }
    void localAnalytics().logEvent('JobContinueClicked', {
      screen: 'Job',
      action: 'ContinueClicked',
      job: chosen,
      userId: authContext.userId,
    });
    navigation.navigate('RelationshipStoryExplanation');
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
                void localAnalytics().logEvent('JobBackClicked', {
                  screen: 'Job',
                  action: 'BackClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('DatingLength');
              }}
            ></GoBackButton>
            <Progress current={5} all={6}></Progress>
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
              {i18n.t('onboarding.job.title_first')}
              <FontText style={{ color: theme.colors.primary }} h1>
                {i18n.t('onboarding.job.title_second')}
              </FontText>
              {i18n.t('onboarding.job.title_third')}
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
                  }}
                  onPress={() => void setChosen(c.slug)}
                >
                  <View style={{ marginRight: 10 }}>
                    <c.icon></c.icon>
                  </View>
                  <View style={{ marginRight: '20%' }}>
                    <FontText style={{ lineHeight: 20 }}>{c.title}</FontText>
                  </View>
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
