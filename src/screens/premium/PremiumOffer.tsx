import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, View, TouchableWithoutFeedback, Platform, Modal } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import {
  logErrorsWithMessage,
  logErrorsWithMessageWithoutAlert,
  logSupaErrors,
  retryAsync,
} from '@app/utils/errors';
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
import * as RNIap from 'react-native-iap';
import { TouchableOpacity } from 'react-native';
import PlanSelector from '@app/components/premium/PlanSelector';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PremiumOffer'>) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [trialLength, setTrialLength] = useState(7);
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
      isOnboarding: route?.params?.isOnboarding,
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
            const subscriptions = await RNIap.getSubscriptions({
              skus: [subscriptionPlan],
            });

            const subscription = subscriptions?.[0] as RNIap.SubscriptionAndroid;
            const offerToken = subscription?.subscriptionOfferDetails?.[0]?.offerToken ?? '';

            await RNIap.requestSubscription({
              subscriptionOffers: [
                {
                  sku: subscriptionPlan,
                  offerToken: offerToken,
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

  const monthlySubscriptionId = 'nemlys.subscription.monthly_no_trial';
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
            const receipt = purchase.transactionReceipt;
            localAnalytics().logEvent('PremiumOfferSuccessfulPurchaseReceived', {
              receipt,
              screen: 'PremiumOffer',
              action: 'SuccessfulPurchaseReceived',
              userId: authContext.userId,
            });
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
            alert(i18n.t('errors_play_market'));
          } else if (error.code === ('PROMISE_BUY_ITEM' as RNIap.ErrorCode)) {
            void localAnalytics().logEvent('PremiumOfferSubscriptionErrorProductNotLoaded', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorProductNotLoaded',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors_play_market'));
          } else if (error.code === 'E_UNKNOWN') {
            void localAnalytics().logEvent('PremiumOfferSubscriptionErrorUnknownError', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorUnknownError',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors_payment_error'));
          } else if (error.code === 'E_ALREADY_OWNED') {
            console.log('skip');
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
          const subscriptions = await RNIap.getSubscriptions({
            skus: [monthlySubscriptionId, yearlySubscriptionId],
          });
          if (Platform.OS === 'ios') {
            const monthlyProduct: RNIap.ProductIOS | undefined = products.find(
              (x) => x.productId === monthlySubscriptionId,
            );
            const yearlyProduct: RNIap.ProductIOS | undefined = products.find(
              (x) => x.productId === yearlySubscriptionId,
            );
            setMonthlyPrice(monthlyProduct ? monthlyProduct.localizedPrice : '10$');
            setYearlyPrice(yearlyProduct ? yearlyProduct.localizedPrice : '49$');

            const yearlySubscription = subscriptions.find(
              (sub) => sub.productId === yearlySubscriptionId,
            ) as RNIap.SubscriptionIOS;
            if (
              yearlySubscription &&
              yearlySubscription.introductoryPricePaymentModeIOS === 'FREETRIAL'
            ) {
              const trialPeriod = yearlySubscription.introductoryPriceSubscriptionPeriodIOS;

              const trialPeriodNumber = parseInt(
                yearlySubscription.introductoryPriceNumberOfPeriodsIOS || '0',
                10,
              );

              if (trialPeriod === 'DAY') {
                setTrialLength(trialPeriodNumber);
              } else if (trialPeriod === 'WEEK') {
                setTrialLength(trialPeriodNumber * 7);
              }
            }
          } else if (Platform.OS === 'android') {
            const monthlySubscription = subscriptions.find(
              (sub) => sub.productId === monthlySubscriptionId,
            );
            const yearlySubscription = subscriptions.find(
              (sub) => sub.productId === yearlySubscriptionId,
            );

            if (monthlySubscription) {
              const monthlyOfferDetails = monthlySubscription?.['subscriptionOfferDetails']?.[0];
              const monthlyPricingPhases = monthlyOfferDetails?.['pricingPhases'];
              const monthlyPricingPhaseList = monthlyPricingPhases?.['pricingPhaseList'];
              const validMonthlyPricing = monthlyPricingPhaseList.find(
                (phase) => phase?.['priceAmountMicros'] !== '0',
              );

              if (validMonthlyPricing) {
                const monthlyFormattedPrice = validMonthlyPricing['formattedPrice'] as string;
                setMonthlyPrice(monthlyFormattedPrice);
              } else {
                setMonthlyPrice('10$');
              }
            } else {
              setMonthlyPrice('10$');
            }

            if (yearlySubscription) {
              const yearlyOfferDetails = yearlySubscription?.['subscriptionOfferDetails']?.[0];
              const yearlyPricingPhases = yearlyOfferDetails?.['pricingPhases'];
              const yearlyPricingPhaseList = yearlyPricingPhases?.['pricingPhaseList'];
              const validYearlyPricing = yearlyPricingPhaseList.find(
                (phase) => phase['priceAmountMicros'] !== '0',
              );

              if (validYearlyPricing) {
                const yearlyFormattedPrice = validYearlyPricing['formattedPrice'] as string;
                setYearlyPrice(yearlyFormattedPrice);
              } else {
                setYearlyPrice('49$');
              }
              try {
                const trialPhase = yearlyPricingPhaseList.find(
                  (phase) => phase['priceAmountMicros'] === '0',
                ) as { billingPeriod: string };
                if (trialPhase && trialPhase['billingPeriod']) {
                  setTrialLength(
                    parseInt(trialPhase['billingPeriod'].replace('P', '').replace('D', ''), 10),
                  );
                }
              } catch (e) {
                logErrorsWithMessageWithoutAlert(e);
                setTrialLength(7);
              }
            } else {
              setYearlyPrice('49$');
            }
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
        setMonthlyPrice('10$');
        setYearlyPrice('49$');
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
      TitleComponent = <>{i18n.t('premium_offer_enjoy_your_premium')}</>;
      break;
    case 'trial_expired':
      TitleComponent = <>{i18n.t('premium_offer_trial_expired')}</>;
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
                <>{i18n.t('premium_offer_reached_limit')}</>
              )}
              {i18n.t('premium_offer_try_unlimited_1')}
            </>
          ) : (
            <>{i18n.t('premium_offer_premium_title')}</>
          )}
          <FontText h1 style={{ color: theme.colors.primary }}>
            {i18n.t('premium_offer_try_unlimited_2')}
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
    if (route.params.shouldGoBack) {
      navigation.goBack();
      return;
    }
    const showInterview =
      !route?.params?.isOnboarding &&
      (currentPremiumState === 'trial_expired' ||
        (currentPremiumState !== 'premium' &&
          currentPremiumState !== 'trial' &&
          !eligibleForTrial));
    if (showInterview) {
      navigation.replace('InterviewText', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.replace('Home', {
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

  const handleToggle = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  let yearlyTrialLength;

  if (trialLength === 3) {
    yearlyTrialLength = i18n.t('premium_3_days_trial');
  } else if (trialLength === 14) {
    yearlyTrialLength = i18n.t('premium_14_days_trial');
  } else {
    yearlyTrialLength = i18n.t('premium_7_days_trial');
  }
  return loading || productLoading ? (
    <Loading></Loading>
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
                alignSelf: 'center',
              }}
            >
              <FontText
                style={{
                  color: theme.colors.white,
                }}
              >
                {i18n.t('premium_offer_title')}
              </FontText>
            </View>
            <View style={{ width: getFontSizeForScreen('h1') * 1.1 }}></View>
          </View>
          <View>
            <View style={{ alignItems: 'center' }}>
              {currentPremiumState !== 'premium' && (
                <FontText
                  style={{
                    color: theme.colors.grey3,
                    textAlign: 'center',
                    marginTop: 30,
                    marginBottom: 10,
                    width: '100%',
                  }}
                >
                  {i18n.t('premium_two')}
                </FontText>
              )}
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
                  {i18n.t('premium_offer_manage')}
                </SecondaryButton>
              ) : (
                <View
                  style={{
                    marginTop: 25,
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
                            height: getFontSizeForScreen('h3') * 2,
                            width: getFontSizeForScreen('h3') * 2,
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
                  <FontText h4>{i18n.t('premium_unlimited_topics_title')}</FontText>
                  <FontText style={{ color: theme.colors.grey5, marginTop: 5 }}>
                    {i18n.t('premium_unlimited_topics_explanation', { dailyTopics })}
                  </FontText>
                </View>
              )}
            </View>
          </View>
          {currentPremiumState !== 'premium' ? (
            <>
              <View style={{ marginBottom: 10, marginTop: 40 }}>
                {eligibleForTrial ? (
                  <>
                    <SecondaryButton
                      disabled={buttonDisabled}
                      containerStyle={{ marginTop: 10 }}
                      buttonStyle={{ width: '100%' }}
                      onPress={() => void handleButtonPress()}
                      title={
                        eligibleForTrial
                          ? i18n.t('premium_offer_trial_button')
                          : i18n.t('premium_offer_premium_button')
                      }
                    ></SecondaryButton>
                    <FontText
                      style={{ color: theme.colors.grey3, textAlign: 'center', marginVertical: 20 }}
                    >
                      {i18n.t('premium_offer_trial_no_card')}
                    </FontText>
                  </>
                ) : (
                  <>
                    <FontText
                      style={{ color: theme.colors.grey3, textAlign: 'center', marginVertical: 15 }}
                    >
                      {i18n.t('premium_offer_choose_plan')}
                    </FontText>
                    <PlanSelector
                      selectedPlan={selectedPlan}
                      handleToggle={handleToggle}
                      monthlyPrice={monthlyPrice}
                      yearlyPrice={yearlyPrice}
                      yearlyTrialLength={yearlyTrialLength}
                    ></PlanSelector>
                    <SecondaryButton
                      disabled={buttonDisabled}
                      containerStyle={{ marginTop: 20 }}
                      buttonStyle={{ width: '100%' }}
                      onPress={() => void handleButtonPress()}
                    >
                      <FontText>
                        {selectedPlan === 'Annual' ? yearlyTrialLength : i18n.t('continue')}
                      </FontText>
                    </SecondaryButton>
                    <View
                      style={{
                        marginTop: 15,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        opacity: selectedPlan === 'Annual' ? 1 : 0,
                      }}
                    >
                      <FontText
                        style={{
                          fontSize: getFontSizeForScreen('small'),
                          color: theme.colors.grey5,
                        }}
                      >
                        {i18n.t('premium_charged', {
                          price: yearlyPrice,
                        })}
                      </FontText>
                    </View>
                    <View
                      style={{
                        marginTop: 30,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          void Linking.openURL('https://nemlys.com/terms');
                        }}
                      >
                        <FontText style={{ color: theme.colors.grey3 }}>
                          {i18n.t('premium_offer_terms')}
                        </FontText>
                      </TouchableOpacity>
                      <FontText style={{ color: theme.colors.grey5 }}> </FontText>
                      <TouchableOpacity
                        onPress={() => {
                          void Linking.openURL('https://nemlys.com/policy');
                        }}
                      >
                        <FontText style={{ color: theme.colors.grey3 }}>
                          {i18n.t('premium_offer_privacy')}
                        </FontText>
                      </TouchableOpacity>
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
