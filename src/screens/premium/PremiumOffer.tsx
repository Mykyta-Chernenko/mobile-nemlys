import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Image, Animated, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText, REGULAR_FONT_FAMILY } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { Loading } from '../../components/utils/Loading';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getPremiumDetails } from '@app/api/premium';
import { CloseButton } from '@app/components/buttons/CloseButton';
import PremiumIssues from '@app/icons/premium_issues';
import PremiumSex from '@app/icons/premium_sex';
import PremiumKnow from '@app/icons/premium_know';
import PremiumHard from '@app/icons/premium_hard';
import PremiumMeaningful from '@app/icons/premium_meaningful';
import PremiumFun from '@app/icons/premium_fun';
import { getNow, sleep } from '@app/utils/date';
import { AnimatedFontText } from '@app/components/utils/AnimatedFontText';
import moment from 'moment';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import { recreateNotification } from '@app/utils/notification';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PremiumOffer'>) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  type CurrentPremiumState =
    | 'premium'
    | 'trial'
    | 'trial_expired'
    | 'daily_limit'
    | 'introduction_limit'
    | 'daily'
    | 'introduction';
  const [currentPremiumState, setCurrentPremiumState] = useState<CurrentPremiumState>('daily');
  const [eligibleForTrial, setEligebleForTrial] = useState(true);

  const [dailyTopics, setDailyTopics] = useState(0);

  const icons = [
    { rotation: '-5deg', icon: PremiumIssues },
    { rotation: '5deg', icon: PremiumSex },
    { rotation: '-5deg', icon: PremiumKnow },
    { rotation: '5deg', icon: PremiumHard },
    { rotation: '-5deg', icon: PremiumMeaningful },
    { rotation: '5deg', icon: PremiumFun },
  ];

  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  useEffect(() => {
    setMode('dark');
    return () => setMode('light');
  }, []);
  const getData = async () => {
    setLoading(true);
    setButtonDisabled(false);
    setSelectedPlan('Annual');

    try {
      const {
        premiumState,
        totalDateCount,
        introductionDatesLimit: introductionSetCounts,
        dailyDatesLimit: dailySetCounts,

        todayDateCount,
        trialExpired,
        trialStart,
        afterTrialPremiumOffered,
        premiumStart,
      } = await getPremiumDetails(authContext.userId!);

      setDailyTopics(dailySetCounts);
      // already has trial or premium
      if (trialStart || premiumStart) {
        setEligebleForTrial(false);
      }

      let currentPremiumState: CurrentPremiumState = 'daily';
      if (premiumState === 'premium') {
        currentPremiumState = 'premium';
      } else if (trialExpired && !afterTrialPremiumOffered) {
        const updateProfile = await supabase
          .from('user_technical_details')
          .update({ after_trial_premium_offered: true, updated_at: new Date() })
          .eq('user_id', authContext.userId);
        if (updateProfile.error) {
          logErrors(updateProfile.error);
          return;
        }
        currentPremiumState = 'trial_expired';
      } else if (premiumState === 'trial') {
        currentPremiumState = 'trial';
      } else if (totalDateCount === introductionSetCounts) {
        currentPremiumState = 'introduction_limit';
      } else if (totalDateCount < introductionSetCounts) {
        currentPremiumState = 'introduction';
      } else if (todayDateCount >= dailySetCounts) {
        currentPremiumState = 'daily_limit';
      } else {
        currentPremiumState = 'daily';
      }
      setCurrentPremiumState(currentPremiumState);
    } catch (error) {
      logErrors(error);
      return;
    }

    void localAnalytics().logEvent('PremiumOfferLoaded', {
      screen: 'PremiumOffer',
      action: 'Loaded',
      userId: authContext.userId,
      premiumState: currentPremiumState,
    });

    setLoading(false);
  };
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void getData();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getData();
    isFirstMount.current = false;
  }, []);
  const scheduleNotification = async (trialFinish: string) => {
    const finish = moment(trialFinish);
    const now = getNow();
    const secondsToTrialExpired = finish.diff(now, 'seconds');
    if (secondsToTrialExpired > 0) {
      const reflectionItendifier = NOTIFICATION_IDENTIFIERS.TRIAL_EXPIRED + authContext.userId!;
      await recreateNotification(
        authContext.userId!,
        reflectionItendifier,
        'PremiumOffer',
        i18n.t('notification.trial_expired.title'),
        i18n.t('notification.trial_expired.body'),
        {
          seconds: secondsToTrialExpired,
          repeats: false,
        },
      );
    }
  };
  const handleButtonPress = async () => {
    setButtonDisabled(true);

    try {
      void localAnalytics().logEvent('PremiumContinuePressed', {
        screen: 'Premium',
        action: 'ContinuePressed',
        userId: authContext.userId,
        eligibleForTrial,
      });
      if (eligibleForTrial) {
        void localAnalytics().logEvent('PremiumTrialStarted', {
          screen: 'Premium',
          action: 'TrialStarted',
          userId: authContext.userId,
        });
        const res = await supabase.functions.invoke('manage-premium', {
          body: { action: 'start_trial' },
        });
        if (res.error) {
          logErrors(res.error);
          return;
        }
        await scheduleNotification(res.data.trial_finish as string);
        navigation.navigate('PremiumSuccess', { state: 'trial_started' });
      } else {
        void localAnalytics().logEvent('PremiumPremiumStarted', {
          screen: 'Premium',
          action: 'PremiumStarted',
          userId: authContext.userId,
          plan: selectedPlan,
        });
        const res = await supabase.functions.invoke('manage-premium', {
          body: { action: 'extend_trial' },
        });
        if (res.error) {
          logErrors(res.error);
          return;
        }
        await scheduleNotification(res.data.trial_finish as string);
        navigation.navigate('PremiumSuccess', { state: 'premium_started' });
      }
      await sleep(200);
    } finally {
      setButtonDisabled(false);
    }
  };

  let TitleComponent = <></>;
  switch (currentPremiumState) {
    case 'premium':
      TitleComponent = <>{i18n.t('premium.offer.enjoy_your_premium')}</>;
      break;
    case 'trial_expired':
      TitleComponent = <>{i18n.t('premium.offer.trial_expired')}</>;
      break;
    case 'trial':
    case 'introduction_limit':
    case 'daily_limit':
    case 'introduction':
    case 'daily':
      TitleComponent = (
        <>
          {eligibleForTrial ? (
            <>
              {(currentPremiumState === 'introduction_limit' ||
                currentPremiumState === 'daily_limit') && (
                <>{i18n.t('premium.offer.reached_limit')}</>
              )}

              {i18n.t('premium.offer.try_unlimited_1')}
            </>
          ) : (
            <>{i18n.t('premium.offer.premium_title')}</>
          )}
          <FontText h1 style={{ color: theme.colors.primary }}>
            {i18n.t('premium.offer.try_unlimited_2')}
          </FontText>
        </>
      );
      break;
  }
  const onClosePressed = () => {
    void localAnalytics().logEvent('PremiumOfferClosePressed', {
      screen: 'PremiumOffer',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    const showInterview =
      currentPremiumState === 'trial_expired' ||
      (currentPremiumState !== 'premium' && currentPremiumState !== 'trial' && !eligibleForTrial);
    if (showInterview) {
      navigation.navigate('InterviewRequest', {
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };

  type Plan = 'Monthly' | 'Annual';
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Annual');
  const [containerWidth, setContainerWidth] = useState(0);
  const animateValue = useRef(new Animated.Value(selectedPlan === 'Annual' ? 0 : 1)).current;
  const handleToggle = (plan: Plan) => {
    Animated.timing(animateValue, {
      toValue: plan === 'Annual' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setSelectedPlan(plan);
  };

  const buttonTranslateX = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerWidth / 2], // Use numeric values
  });
  const textColorAnnual = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.black, theme.colors.white],
  }) as unknown as string;

  const subTextColorAnnual = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(26, 5, 47, 0.6)', theme.colors.grey3],
  }) as unknown as string;

  const textColorMonthly = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.white, theme.colors.black],
  }) as unknown as string;

  const subTextColorMonthly = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.grey3, 'rgba(26, 5, 47, 0.6)'],
  }) as unknown as string;

  return loading ? (
    <Loading></Loading>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 15,
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <CloseButton onPress={onClosePressed} theme="black"></CloseButton>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: 10,
                borderRadius: 40,
              }}
            >
              <FontText
                style={{
                  color: theme.colors.white,
                }}
              >
                {i18n.t('premium.offer.title')}
              </FontText>
            </View>
            <View style={{ height: 32, width: 32 }}></View>
          </View>
          <View style={{ alignItems: 'center' }}>
            <FontText
              h1
              style={{
                color: theme.colors.white,
                textAlign: 'center',
              }}
            >
              {TitleComponent}
            </FontText>
          </View>
          <View>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: theme.colors.grey1,
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                {icons.map((i, id) => {
                  return (
                    <View
                      key={id}
                      style={{
                        borderRadius: 8,
                        padding: 5,
                        backgroundColor: theme.colors.white,

                        height: 42,
                        width: 42,
                        justifyContent: 'center',
                        alignItems: 'center',
                        transform: [
                          {
                            rotate: i.rotation,
                          },
                        ],
                      }}
                    >
                      <i.icon />
                    </View>
                  );
                })}
              </View>
              <FontText h4>{i18n.t('premium.offer.unlimited_topics_title')}</FontText>
              <FontText style={{ color: theme.colors.grey5, marginTop: 5 }}>
                {i18n.t('premium.offer.unlimited_topics_explanation', { dailyTopics })}
              </FontText>
            </View>
            <View
              style={{
                marginTop: 10,
                borderRadius: 20,
                backgroundColor: 'rgba(245, 233, 235, 0.1)',
                padding: 20,
              }}
            >
              <Image
                style={{ height: 44, width: 44, marginBottom: 20 }}
                source={require('../../../assets/images/record_button.png')}
              ></Image>
              <FontText h4 style={{ color: theme.colors.grey1 }}>
                {i18n.t('premium.offer.unlimited_audio_title')}
              </FontText>
              <FontText style={{ color: theme.colors.grey3, marginTop: 5 }}>
                {i18n.t('premium.offer.unlimited_audio_explanation')}
              </FontText>
            </View>
          </View>
          <View style={{ marginBottom: 10 }}>
            {eligibleForTrial ? (
              <>
                <SecondaryButton
                  disabled={buttonDisabled}
                  containerStyle={{ marginTop: 10 }}
                  buttonStyle={{ width: '100%' }}
                  onPress={() => void handleButtonPress()}
                  title={
                    eligibleForTrial
                      ? i18n.t('premium.offer.trial_button')
                      : i18n.t('premium.offer.premium_button')
                  }
                ></SecondaryButton>
                <FontText
                  style={{ color: theme.colors.grey3, textAlign: 'center', marginVertical: 15 }}
                >
                  {i18n.t('premium.offer.trial_no_card')}
                </FontText>
              </>
            ) : (
              <>
                <FontText
                  style={{ color: theme.colors.grey3, textAlign: 'center', marginVertical: 15 }}
                >
                  {i18n.t('premium.offer.choose_plan')}
                </FontText>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderRadius: 25,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(245, 233, 235, 0.1)',
                  }}
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setContainerWidth(width);
                  }}
                >
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: '50%',
                      backgroundColor: theme.colors.primary,
                      transform: [{ translateX: buttonTranslateX }],
                      borderRadius: 25,
                    }}
                  />
                  <TouchableWithoutFeedback
                    style={{ flex: 1 }}
                    onPress={() => handleToggle('Annual')}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 15,
                      }}
                    >
                      <AnimatedFontText
                        style={{ color: textColorAnnual, fontFamily: REGULAR_FONT_FAMILY }}
                      >
                        {i18n.t('premium.offer.plan_yearly_title')}
                      </AnimatedFontText>
                      <AnimatedFontText
                        style={{ color: subTextColorAnnual, fontFamily: REGULAR_FONT_FAMILY }}
                      >
                        {i18n.t('premium.offer.plan_yearly_price')}
                      </AnimatedFontText>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 15,
                    }}
                    onPress={() => handleToggle('Monthly')}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 15,
                      }}
                    >
                      <AnimatedFontText
                        style={{ color: textColorMonthly, fontFamily: REGULAR_FONT_FAMILY }}
                      >
                        {i18n.t('premium.offer.plan_monthly_title')}
                      </AnimatedFontText>
                      <AnimatedFontText
                        style={{ color: subTextColorMonthly, fontFamily: REGULAR_FONT_FAMILY }}
                      >
                        {i18n.t('premium.offer.plan_monthly_price')}
                      </AnimatedFontText>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <SecondaryButton
                  disabled={buttonDisabled}
                  containerStyle={{ marginTop: 30 }}
                  buttonStyle={{ width: '100%' }}
                  onPress={() => void handleButtonPress()}
                  title={i18n.t('premium.offer.subscribe')}
                ></SecondaryButton>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}