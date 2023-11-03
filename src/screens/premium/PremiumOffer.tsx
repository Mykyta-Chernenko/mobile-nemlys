import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Modal,
} from 'react-native';
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
import * as RNIap from 'react-native-iap';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PremiumOffer'>) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
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
    handleToggle('Annual');

    try {
      const {
        premiumState,
        totalDateCount,
        introductionDatesLimit,
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
      } else if (introductionDatesLimit && totalDateCount === introductionDatesLimit) {
        currentPremiumState = 'introduction_limit';
      } else if (totalDateCount < introductionDatesLimit) {
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
        try {
          setProductLoading(true);
          void localAnalytics().logEvent('PremiumPremiumStartInitiated', {
            screen: 'Premium',
            action: 'PremiumStartInitiated',
            userId: authContext.userId,
            plan: selectedPlan,
          });
          const subscriptionPlan =
            selectedPlan === 'Annual' ? yearlySubscriptionId : monthlySubscriptionId;

          if (Platform.OS === 'ios') {
            await RNIap.requestSubscription({
              sku: subscriptionPlan,
            });
          } else if (Platform.OS === 'android') {
            await RNIap.requestSubscription({
              subscriptionOffers: [
                {
                  sku: subscriptionPlan,
                  offerToken: '',
                },
              ],
              // TODO handle update of the subscription
              // purchaseTokenAndroid:
              //   '',
              // prorationModeAndroid: RNIap.ProrationModesAndroid.IMMEDIATE_WITHOUT_PRORATION,
            });
          }
        } catch (error) {
          console.log(error);
          setProductLoading(false);
        }
      }
      await sleep(200);
    } finally {
      setButtonDisabled(false);
    }
  };

  const monthlySubscriptionId = 'nemlys.subscription.monthly';
  const yearlySubscriptionId = 'nemlys.subscription.yearly';

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    async function initIAP() {
      setProductLoading(true);
      try {
        await RNIap.initConnection();

        if (Platform.OS === 'android') {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }
        const handelPurchase = async (purchase: RNIap.Purchase) => {
          try {
            localAnalytics().logEvent('PremiumOfferSuccessfulPurchaseReceived', {
              screen: 'PremiumOffer',
              action: 'SuccessfulPurchaseReceived',
              userId: authContext.userId,
              purchase,
            });
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              try {
                if (Platform.OS === 'android') {
                  await RNIap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken! });
                } else {
                  await RNIap.finishTransaction({ purchase: purchase, isConsumable: true });
                }
                const res = await supabase.functions.invoke('manage-premium', {
                  body: {
                    action: 'activate_premium',
                    transactionReceipt: receipt,
                    platform: Platform.OS,
                    productId: purchase.productId,
                  },
                });
                if (res.error) {
                  logErrors(res.error);
                  return;
                }

                navigation.navigate('PremiumSuccess', { state: 'premium_started' });
              } catch (error) {
                logErrors(error);
              }
            }
          } finally {
            setProductLoading(false);
          }
        };
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener((purchase) => {
          void handelPurchase(purchase);
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: RNIap.PurchaseError) => {
          if (error.code === 'E_USER_CANCELLED') {
            void localAnalytics().logEvent('PremiumOfferSubscriptionAttemptCancelled', {
              screen: 'PremiumOffer',
              action: 'CancelledSubscriptionAttempt',
              userId: authContext.userId,
            });
          } else {
            void localAnalytics().logEvent('PremiumOfferSubscriptionAttemptError', {
              screen: 'PremiumOffer',
              action: 'SubscriptionAttemptError',
              userId: authContext.userId,
              error,
            });
            logErrors(error);
          }

          switch (error.code) {
            case 'E_ALREADY_OWNED':
              console.log('You already own this item.');
              // Handle logic if the user already owns the item.
              break;

            case 'E_ITEM_UNAVAILABLE':
              console.log('This item is currently unavailable.');
              // Handle logic if the item is currently unavailable.
              break;

            case 'E_NETWORK_ERROR':
              console.log('Network error occurred. Please check your connection and try again.');
              // Handle logic if a network error occurs.
              break;

            case 'E_USER_CANCELLED':
              console.log('User cancelled the purchase.');
              // Handle logic if the user cancels the purchase.
              break;

            case 'E_UNKNOWN':
              console.log('An unknown error occurred.');
              // Handle logic for all other unknown errors.
              break;

            default:
              console.log('Other purchase error:', error.message);
              // Handle other types of errors if necessary.
              break;
          }
          setProductLoading(false);
        });

        let products;
        if (Platform.OS === 'ios') {
          products = await RNIap.getProducts({
            skus: [monthlySubscriptionId, yearlySubscriptionId],
          });
        } else {
          products = await RNIap.getSubscriptions({
            skus: [monthlySubscriptionId, yearlySubscriptionId],
          });
        }
        void localAnalytics().logEvent('PremiumOfferStoreProductsLoaded', {
          screen: 'PremiumOffer',
          action: 'StoreProductsLoaded',
          userId: authContext.userId,
          products,
        });
      } catch (err) {
        logErrors(err);
      }

      setProductLoading(false);
    }

    void initIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
        purchaseUpdateSubscription = null;
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }
      void RNIap.endConnection();
    };
  }, []);

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

  const handleToggleAnimation = (plan: Plan) => {
    Animated.timing(animateValue, {
      toValue: plan === 'Annual' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const handleToggle = (plan: Plan) => {
    handleToggleAnimation(plan);
    setSelectedPlan(plan);
  };
  handleToggleAnimation(selectedPlan);

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
      {productLoading && (
        <Modal animationType="none" transparent={true}>
          <TouchableWithoutFeedback onPress={onClosePressed} style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.8)',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 100,
                  backgroundColor: theme.colors.grey1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Loading></Loading>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
          {currentPremiumState !== 'premium' ? (
            <>
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
            </>
          ) : (
            <View></View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
