import React, { useCallback, useContext, useState } from 'react';
import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@rneui/themed';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_STEPS } from '@app/utils/constants';
import { showName } from '@app/utils/strings';
import { useFocusEffect } from '@react-navigation/native';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'DatingLength'>) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const choices = [
    { slug: 'just-started', title: i18n.t('onboarding_dating_length_choice_1') },
    { slug: '1-12-weeks', title: i18n.t('onboarding_dating_length_choice_2') },
    { slug: '1-12-months', title: i18n.t('onboarding_dating_length_choice_3') },
    { slug: '1-5-years', title: i18n.t('onboarding_dating_length_choice_4') },
    { slug: '5-more-years', title: i18n.t('onboarding_dating_length_choice_5') },
  ];
  const [chosen, setChosen] = useState<string>('');
  const authContext = useContext(AuthContext);

  const loadCachedChoice = async () => {
    localAnalytics().logEvent('DatingLengthLoaded', {
      screen: 'DatingLength',
      action: 'Loaded',
      userId: authContext.userId,
    });
    try {
      const cachedChoice = await AsyncStorage.getItem('dating_length_choice');
      if (cachedChoice !== null) {
        setChosen(cachedChoice);
      }
    } catch (error) {
      console.error('Error loading cached dating length choice:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadCachedChoice();
    }, []),
  );

  const handleChoiceSelection = async (slug: string) => {
    setChosen(slug);
    try {
      await AsyncStorage.setItem('dating_length_choice', slug);
    } catch (error) {
      console.error('Error saving dating length choice to cache:', error);
    }
  };

  const handlePress = async () => {
    setLoading(true);
    void localAnalytics().logEvent('DatingLengthContinueClicked', {
      screen: 'DatingLength',
      action: 'ContinueClicked',
      length: chosen,
      userId: authContext.userId,
    });
    try {
      const [dateResponse, hasPartnerRes, profileRes] = await Promise.all([
        supabase.from('onboarding_poll').insert({
          user_id: authContext.userId!,
          question_slug: 'dating-length',
          answer_slug: chosen,
        }),
        supabase.rpc('has_partner'),
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
      ]);
      if (dateResponse.error) {
        logSupaErrors(dateResponse.error);
        return;
      }
      if (hasPartnerRes.error) {
        logSupaErrors(hasPartnerRes.error);
        return;
      }
      if (profileRes.error) {
        logSupaErrors(profileRes.error);
        return;
      }
      if (hasPartnerRes.data) {
        navigation.navigate('OnboardingQuizIntro', {
          partnerName: showName(profileRes.data.partner_first_name) || i18n.t('home_partner'),
          name: showName(profileRes.data.first_name),
        });
      } else {
        navigation.navigate('OnboardingInviteCode', {
          nextScreen: undefined,
          screenParams: undefined,
        });
      }
    } finally {
      setLoading(false);
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
                navigation.navigate('Language', { fromSettings: false });
              }}
            ></GoBackButton>
            <Progress current={4} all={ONBOARDING_STEPS}></Progress>
          </View>
          <View
            style={{
              flexGrow: 1,
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
              {i18n.t('onboarding_dating_length_title')}
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
                  onPress={() => void handleChoiceSelection(c.slug)}
                >
                  <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={{ padding: 20 }}>
          <PrimaryButton
            disabled={loading || !chosen}
            title={i18n.t('continue')}
            onPress={() => void handlePress()}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
