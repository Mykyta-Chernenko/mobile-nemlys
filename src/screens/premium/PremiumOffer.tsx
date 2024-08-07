import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Modal,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText, REGULAR_FONT_FAMILY } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { logErrorsWithMessage, logSupaErrors, retryAsync } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { Loading } from '@app/components/utils/Loading';
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
import * as RNIap from 'react-native-iap';
import { TouchableOpacity } from 'react-native';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PremiumOffer'>) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
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
    let currentPremiumState: CurrentPremiumState = 'daily';

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
      // if (trialStart || premiumStart) {
      //   setEligebleForTrial(false);
      // }
      // no more in app trial, we have subscription trial
      setEligebleForTrial(false);

      if (premiumState === 'premium') {
        currentPremiumState = 'premium';
      } else if (trialExpired && !afterTrialPremiumOffered) {
        const updateProfile = await supabase
          .from('user_technical_details')
          .update({ after_trial_premium_offered: true, updated_at: getNow().toISOString() })
          .eq('user_id', authContext.userId!);
        if (updateProfile.error) {
          logSupaErrors(updateProfile.error);
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
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
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
          logErrorsWithMessage(res.error, 'Manage premium function returned error');
          return;
        }
        navigation.navigate('PremiumSuccess', { state: 'trial_started' });
      } else {
        try {
          setSubscriptionLoading(true);
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
          setSubscriptionLoading(false);
        }
      }
      await sleep(200);
    } finally {
      setButtonDisabled(false);
    }
  };

  const monthlySubscriptionId = 'nemlys.subscription.monthly';
  const yearlySubscriptionId = 'nemlys.subscription.yearly';
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');

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
                const func = async () => {
                  const res = await supabase.functions.invoke('manage-premium', {
                    body: {
                      action: 'activate_premium',
                      transactionReceipt: receipt,
                      platform: Platform.OS,
                      productId: purchase.productId,
                    },
                  });
                  if (res.error) {
                    throw res.error;
                  }
                };
                await retryAsync('PremiumOfferManagePremiumFunc', func);
                navigation.navigate('PremiumSuccess', { state: 'premium_started' });
              } catch (e) {
                logErrorsWithMessage(e, (e?.message as string) || '');
              }
            }
          } finally {
            setSubscriptionLoading(false);
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
              error,
            });
          } else if (error.code === 'E_SERVICE_ERROR') {
            void localAnalytics().logEvent('PremiumOfferSubscriptionErrorPlayMarketNotLoggedIn', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorPlayMarketNotLoggedIn',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors.play_market'));
          } else if (error.code === ('PROMISE_BUY_ITEM' as RNIap.ErrorCode)) {
            void localAnalytics().logEvent('PremiumOfferSubscriptionErrorProductNotLoaded', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorProductNotLoaded',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors.play_market'));
          } else if (error.code === 'E_UNKNOWN') {
            void localAnalytics().logEvent('PremiumOfferSubscriptionErrorUnknownError', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorUnknownError',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors.payment_error'));
          } else {
            void localAnalytics().logEvent('PremiumOfferSubscriptionAttemptError', {
              screen: 'PremiumOffer',
              action: 'SubscriptionAttemptError',
              userId: authContext.userId,
              error,
            });
            logErrorsWithMessage(error, error?.message);
          }

          switch (error.code) {
            case 'PROMISE_BUY_ITEM' as RNIap.ErrorCode:
              break;
            case 'E_USER_CANCELLED':
              break;
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
            default:
              console.log('Other purchase error:', error.code, error.message);
              // Handle other types of errors if necessary.
              break;
          }
          setSubscriptionLoading(false);
        });
        const func = async () => {
          const products = await RNIap.getProducts({
            skus: [monthlySubscriptionId, yearlySubscriptionId],
          });
          const monthlyProduct = products.find((x) => x.productId === monthlySubscriptionId);
          const yearlyProduct = products.find((x) => x.productId === yearlySubscriptionId);
          setMonthlyPrice(monthlyProduct ? monthlyProduct.localizedPrice : '5$');
          setYearlyPrice(yearlyProduct ? yearlyProduct.localizedPrice : '49$');
          let subscriptions: RNIap.Subscription[] = [];
          if (Platform.OS === 'android') {
            // we need to get all subscription so that it works on android
            subscriptions = await RNIap.getSubscriptions({
              skus: [monthlySubscriptionId, yearlySubscriptionId],
            });
          }
          void localAnalytics().logEvent('PremiumOfferStoreProductsLoaded', {
            screen: 'PremiumOffer',
            action: 'StoreProductsLoaded',
            userId: authContext.userId,
            products,
            subscriptions,
          });
        };
        await retryAsync('PremiumOfferGetProducts', func);
      } catch (err) {
        void localAnalytics().logEvent('PremiumOfferStoreProductsError', {
          screen: 'PremiumOffer',
          action: 'StoreProductsError',
          userId: authContext.userId,
          err,
        });
        logErrorsWithMessage(err, (err?.message as string) || '');
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
      navigation.navigate('InterviewText', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };
  const managePremium = () => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      void Linking.openURL('https://play.google.com/store/account/subscriptions');
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

  return loading || productLoading ? (
    <Loading light></Loading>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      {subscriptionLoading && (
        <Modal animationType="none" transparent={true}>
          <TouchableWithoutFeedback style={{ flex: 1 }}>
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
          <View>
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
              {currentPremiumState === 'premium' ? (
                <SecondaryButton buttonStyle={{ marginTop: 150 }} onPress={managePremium}>
                  {i18n.t('premium.offer.manage')}
                </SecondaryButton>
              ) : (
                <View
                  style={{
                    marginTop: 40,
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
              )}
            </View>
          </View>
          {currentPremiumState !== 'premium' ? (
            <>
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
                            {i18n.t('premium.offer.plan_yearly_price', { price: yearlyPrice })}
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
                            {i18n.t('premium.offer.plan_monthly_price', { price: monthlyPrice })}
                          </AnimatedFontText>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    <SecondaryButton
                      disabled={buttonDisabled}
                      containerStyle={{ marginTop: '5%' }}
                      buttonStyle={{ width: '100%' }}
                      onPress={() => void handleButtonPress()}
                      title={i18n.t('premium.offer.subscribe')}
                    ></SecondaryButton>
                    <View
                      style={{
                        marginTop: 15,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          void Linking.openURL('https://nemlys.com/terms');
                        }}
                      >
                        <FontText style={{ color: theme.colors.grey3, marginRight: 10 }}>
                          {i18n.t('premium.offer.terms')}
                        </FontText>
                      </TouchableOpacity>
                      <FontText style={{ color: theme.colors.grey5 }}> </FontText>
                      <TouchableOpacity
                        onPress={() => {
                          void Linking.openURL('https://nemlys.com/policy');
                        }}
                      >
                        <FontText style={{ color: theme.colors.grey3, marginLeft: 10 }}>
                          {i18n.t('premium.offer.privacy')}
                        </FontText>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        marginTop: 12,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <FontText style={{ fontSize: 10, color: theme.colors.grey5 }}>
                        {i18n.t('premium.offer.charged')}
                      </FontText>
                    </View>
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
