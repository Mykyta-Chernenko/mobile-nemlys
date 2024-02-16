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
import { logSupaErrors } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import JobFunIcon from '@app/icons/job_fun';
import JobHardIcon from '@app/icons/job_hard';
import JobIssuesIcon from '@app/icons/job_issues';
import StyledInput from '@app/components/utils/StyledInput';

export default function ({ route, navigation }: NativeStackScreenProps<MainStackParamList, 'Job'>) {
  const { theme } = useTheme();
  const [chosen, setChosen] = useState<string | undefined>(undefined);

  const choices = [
    { icon: JobFunIcon, slug: 'fun', title: i18n.t('onboarding.job.fun') },
    { icon: JobHardIcon, slug: 'hard', title: i18n.t('onboarding.job.hard') },
    { icon: JobIssuesIcon, slug: 'issues', title: i18n.t('onboarding.job.issues') },
  ];
  const authContext = useContext(AuthContext);
  const [other, setOther] = useState('');

  const [inputActive, setInputActive] = useState(false);
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
      .insert({ user_id: authContext.userId!, question_slug: 'job', answer_slug: chosen || other });
    if (dateReponse.error) {
      logSupaErrors(dateReponse.error);
      return;
    }
    void localAnalytics().logEvent('JobContinueClicked', {
      screen: 'Job',
      action: 'ContinueClicked',
      job: chosen || other,
      userId: authContext.userId,
    });
    navigation.navigate('DiscussWay');
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
                navigation.navigate('PartnerName', { fromSettings: false });
              }}
            ></GoBackButton>
            <Progress current={3} all={5}></Progress>
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
              {!inputActive &&
                choices.map((c, i) => (
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
              <View style={{ marginTop: '2%' }}>
                <FontText>{i18n.t('onboarding.job.other')}</FontText>
                <StyledInput
                  containerStyle={{ marginTop: '2%', borderWidth: !chosen && other ? 1 : 0 }}
                  placeholder={i18n.t('onboarding.job.other_placeholder')}
                  value={other}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  keyboardType="default"
                  returnKeyType="send"
                  onTouchStart={() => {
                    void setChosen(undefined);
                    setInputActive(true);
                  }}
                  onEndEditing={() => {
                    setInputActive(false);
                  }}
                  onChangeText={setOther}
                />
              </View>
            </ScrollView>
          </View>
          <View style={{ marginTop: '4%' }}>
            <PrimaryButton
              disabled={!(chosen || other)}
              title={i18n.t('continue')}
              onPress={() => void handlePress()}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
