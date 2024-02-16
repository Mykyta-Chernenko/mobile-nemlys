import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { logErrorsWithMessage } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';

import { localAnalytics } from '@app/utils/analytics';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Loading } from '../utils/Loading';
import { PremiumState, getPremiumDetails } from '@app/api/premium';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { JobSlug } from '@app/types/domain';

export interface HomePremiumBannerRef {
  startDateClick: (job: JobSlug) => void;
}
export interface Props {
  setDataLoaded: () => void;
}
const HomePremiumBanner = React.forwardRef<HomePremiumBannerRef, Props>((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [premiumState, setPremiumState] = useState<PremiumState>('free');
  const [loadedData, setLoadedData] = useState(false);
  const [introductionDatesLimit, setIntroductionsDatesLimit] = useState(0);
  const [dailyDatesLimit, setDailyDatesLimit] = useState(0);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [totalDateCount, setTotalDateCount] = useState(0);
  const [todayDateCount, setTodayDateCount] = useState(0);
  const [canStartDate, setCanStartDate] = useState(false);
  const newDatesLeft = Math.max(introductionDatesLimit - totalDateCount, 0);
  const freeDatesLeft = Math.max(dailyDatesLimit - todayDateCount, 0);
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();

  const startDateClick = (job) => {
    void localAnalytics().logEvent('HomeStartDateClicked', {
      screen: 'Home',
      action: 'StartDateClicked',
      job,
      userId: authContext.userId,
    });
    if (canStartDate) {
      navigation.navigate('ConfigureDate', {
        job,
        withPartner: true,
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      navigation.navigate('PremiumOffer', { refreshTimeStamp: new Date().toISOString() });
    }
  };

  React.useImperativeHandle(ref, () => ({
    startDateClick,
  }));

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const premiumDetails = await getPremiumDetails(authContext.userId!);
        if (premiumDetails.trialExpired && !premiumDetails.afterTrialPremiumOffered) {
          navigation.navigate('PremiumOffer', { refreshTimeStamp: new Date().toISOString() });
          return;
        }
        setPremiumState(premiumDetails.premiumState);
        setDailyDatesLimit(premiumDetails.dailyDatesLimit);
        setIntroductionsDatesLimit(premiumDetails.introductionDatesLimit);
        setTrialDaysLeft(premiumDetails.trialDaysLeft || 0);
        setTotalDateCount(premiumDetails.totalDateCount);
        setTodayDateCount(premiumDetails.todayDateCount);
      } catch (e) {
        logErrorsWithMessage(e, (e?.message as string) || '');
        return;
      }

      setLoading(false);
      setLoadedData(true);
      props.setDataLoaded();
    };
    void getData();
  }, [authContext.userId]);
  useEffect(() => {
    if (loadedData) {
      setCanStartDate(
        premiumState === 'premium' ||
          premiumState === 'trial' ||
          (premiumState === 'free' && freeDatesLeft > 0) ||
          (premiumState === 'new' && newDatesLeft > 0),
      );
    }
  }, [loadedData, premiumState, freeDatesLeft, newDatesLeft]);

  let leftText = '';
  let rightText = '';
  if (premiumState === 'premium') {
    leftText = '';
    rightText = '';
  } else if (premiumState === 'trial') {
    leftText = i18n.t('premium.banner.trial');
    rightText = i18n.t('premium.banner.days_left', { days: trialDaysLeft });
  } else if (premiumState === 'new') {
    leftText = i18n.t('premium.banner.new');
    rightText = i18n.t('premium.banner.topics_left', {
      total: introductionDatesLimit,
      left: newDatesLeft,
    });
  } else if (premiumState === 'free') {
    leftText = i18n.t('premium.banner.free');
    rightText = i18n.t('premium.banner.topics_left', {
      total: dailyDatesLimit,
      left: freeDatesLeft,
    });
  }
  return !leftText && !rightText ? (
    <></>
  ) : (
    <View style={{ marginBottom: 30, width: '100%' }}>
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          height: 72,
          padding: 10,
          paddingHorizontal: 20,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {loading ? (
          <Loading></Loading>
        ) : (
          <>
            <FontText>{leftText}</FontText>
            <View
              style={{
                backgroundColor: theme.colors.grey0,
                padding: 10,
                paddingHorizontal: 15,
                borderRadius: 40,
              }}
            >
              <FontText>{rightText}</FontText>
            </View>
          </>
        )}
      </View>
    </View>
  );
});
export default HomePremiumBanner;
