import React, { useContext, useCallback } from 'react';
import { Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { getJobsDetails } from '@app/utils/jobs';
import { i18n } from '@app/localization/i18n';

const CHART_IMAGE = require('../../../assets/images/onboarding_statistics.png');

type OnboardingStatisticsProps = NativeStackScreenProps<MainStackParamList, 'OnboardingStatistics'>;

export default function OnboardingStatistics({ route, navigation }: OnboardingStatisticsProps) {
  const { job } = route.params;
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const authContext = useContext(AuthContext);
  const jobsDetails = getJobsDetails(i18n);
  const screenWidth = Dimensions.get('window').width - 40;
  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      localAnalytics().logEvent('OnboardingStatisticsOpened', {
        screen: 'OnboardingStatistics',
        action: 'Opened',
        userId: authContext.userId,
        job,
      });
      return () => setMode('light');
    }, []),
  );

  let jobInfo = jobsDetails[job];
  if (!jobInfo) {
    const firstKey = Object.keys(jobsDetails)[0];
    jobInfo = jobsDetails[firstKey];
  }

  const handleContinue = () => {
    localAnalytics().logEvent('OnboardingStatisticsContinueClicked', {
      screen: 'OnboardingStatistics',
      action: 'Continue',
      userId: authContext.userId,
      job,
    });
    navigation.navigate('V3PremiumOffer', {
      isOnboarding: true,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.black }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.black }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <GoBackButton theme="black" onPress={() => navigation.goBack()} />
        </View>

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            marginTop: 16,
            justifyContent: 'space-around',
            marginBottom: 50,
          }}
        >
          <View>
            <FontText small style={{ color: theme.colors.primary, textAlign: 'center' }}>
              {i18n.t('onboarding_statistics_interesting_fact')}
            </FontText>
            <FontText h3 style={{ color: theme.colors.white, textAlign: 'center', marginTop: 4 }}>
              {jobInfo.statistics}
            </FontText>
          </View>
          <View style={{ marginVertical: 24 }}>
            <Image
              source={CHART_IMAGE}
              style={{
                width: '100%',
                height: (screenWidth * 528) / 670,
                resizeMode: 'contain',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <FontText small style={{ color: theme.colors.white }}>
                {i18n.t('onboarding_statistics_today')}
              </FontText>
              <FontText small style={{ color: theme.colors.white }}>
                {i18n.t('onboarding_statistics_after_30_days')}
              </FontText>
            </View>
          </View>
        </View>

        <SecondaryButton
          containerStyle={{ marginHorizontal: 20, marginBottom: 20 }}
          onPress={handleContinue}
        >
          <FontText>{i18n.t('onboarding_statistics_i_am_ready')}</FontText>
        </SecondaryButton>
      </SafeAreaView>
    </>
  );
}
