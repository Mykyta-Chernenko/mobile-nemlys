import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as RNIap from 'react-native-iap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';
import {
  logErrorsWithMessage,
  logErrorsWithMessageWithoutAlert,
  retryAsync,
  retryRequestAsync,
} from '@app/utils/errors';
import { i18n } from '@app/localization/i18n';
import { getPremiumDetails } from '@app/api/premium';
import { sleep } from '@app/utils/date';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { CloseButton } from '@app/components/buttons/CloseButton';

// New icons and images requested
import QuestionIcon from '@app/icons/home_question';
import ExerciseIcon from '@app/icons/home_exercise';
import CheckupIcon from '@app/icons/home_checkup';
import TestIcon from '@app/icons/home_test';
import ArticleIcon from '@app/icons/home_article';
import GameIcon from '@app/icons/home_game';
import StarReviewIcon from '@app/icons/star_review';
import PremiumLoveNoteIcon from '@app/icons/premium_love_note';
import TwoPeopleAccess from '@app/icons/two_people_access';
import CheckSimple from '@app/icons/check_simple';
import LongDash from '@app/icons/long_dash';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useFocusEffect } from '@react-navigation/native';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'V3PremiumOffer'>) {
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
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  useEffect(() => {
    setMode('dark');
    return () => setMode('light');
  }, []);
  const getData = async () => {
    setLoading(true);
    setButtonDisabled(false);
    let currentPremiumState: CurrentPremiumState = 'daily';

    try {
      const { premiumState } = await getPremiumDetails(authContext.userId!);
      if (premiumState === 'premium') {
        currentPremiumState = 'premium';
      } else {
        currentPremiumState = 'daily';
      }
      setCurrentPremiumState(currentPremiumState);
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
      return;
    }

    void localAnalytics().logEvent('V3PremiumOfferLoaded', {
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
      void localAnalytics().logEvent('V3PremiumContinuePressed', {
        screen: 'Premium',
        action: 'ContinuePressed',
        userId: authContext.userId,
      });

      try {
        setSubscriptionLoading(true);
        void localAnalytics().logEvent('V3PremiumPremiumStartInitiated', {
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
      await sleep(200);
    } finally {
      setButtonDisabled(false);
    }
  };

  // breaking, non-breaking space
  const SPACE_REGEX = /[\u0020\u00A0]/;

  const monthlySubscriptionId = 'nemlys.subscription.monthly_no_trial';
  const yearlySubscriptionId = 'nemlys.subscription.yearly';
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [yearlyPerMonthPrice, setYearlyPerMonthPrice] = useState('');

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
            localAnalytics().logEvent('V3PremiumOfferSuccessfulPurchaseReceived', {
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
                navigation.navigate('PremiumSuccess', {
                  state: 'premium_started',
                  isOnboarding: route.params.isOnboarding,
                });
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
            void localAnalytics().logEvent('V3PremiumOfferSubscriptionAttemptCancelled', {
              screen: 'PremiumOffer',
              action: 'CancelledSubscriptionAttempt',
              userId: authContext.userId,
              error,
            });
          } else if (error.code === 'E_SERVICE_ERROR') {
            void localAnalytics().logEvent('V3PremiumOfferSubscriptionErrorPlayMarketNotLoggedIn', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorPlayMarketNotLoggedIn',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors_play_market'));
          } else if (error.code === ('PROMISE_BUY_ITEM' as RNIap.ErrorCode)) {
            void localAnalytics().logEvent('V3PremiumOfferSubscriptionErrorProductNotLoaded', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorProductNotLoaded',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors_play_market'));
          } else if (error.code === 'E_UNKNOWN') {
            void localAnalytics().logEvent('V3PremiumOfferSubscriptionErrorUnknownError', {
              screen: 'PremiumOffer',
              action: 'SubscriptionErrorUnknownError',
              userId: authContext.userId,
              error,
            });
            alert(i18n.t('errors_payment_error'));
          } else if (error.code === 'E_ALREADY_OWNED') {
            console.log('skip');
          } else {
            void localAnalytics().logEvent('V3PremiumOfferSubscriptionAttemptError', {
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
            if (yearlyProduct) {
              try {
                const yearlyPriceNumber = parseFloat(String(yearlyProduct.price));
                if (!isNaN(yearlyPriceNumber)) {
                  const monthlyPriceNumber = yearlyPriceNumber / 12;
                  const monthlyPriceString = monthlyPriceNumber.toFixed(2);
                  // try to preserve the currency symbol from localizedPrice
                  const matchSymbol = yearlyProduct.localizedPrice.match(/[^\d.,]+/g);
                  let currencySymbol = matchSymbol ? matchSymbol.join('').trim() : '';
                  if (!currencySymbol) {
                    currencySymbol = '$'; // fallback
                  }

                  const delimiter = yearlyProduct.localizedPrice.match(SPACE_REGEX)?.[0] || '';
                  const result = yearlyProduct.localizedPrice.startsWith(currencySymbol)
                    ? `${currencySymbol}${delimiter}${monthlyPriceString}`
                    : `${monthlyPriceString}${delimiter}${currencySymbol}`;
                  setYearlyPerMonthPrice(result);
                } else {
                  setYearlyPerMonthPrice('$4.08');
                }
              } catch {
                setYearlyPerMonthPrice('$4.08');
              }
            } else {
              setYearlyPerMonthPrice('$4.08');
            }

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
                try {
                  const micros = parseInt(validYearlyPricing['priceAmountMicros'] as string, 10);
                  const priceValue = micros / 1_000_000; // convert from micros
                  const monthlyValue = priceValue / 12;
                  const monthlyString = monthlyValue.toFixed(2);

                  const matchSymbol = yearlyFormattedPrice.match(/[^\d.,]+/g);
                  let currencySymbol = matchSymbol ? matchSymbol.join('').trim() : '';
                  if (!currencySymbol) {
                    currencySymbol = '$';
                  }
                  const delimiter = yearlyFormattedPrice.match(SPACE_REGEX)?.[0] || '';
                  const result = yearlyFormattedPrice.startsWith(currencySymbol)
                    ? `${currencySymbol}${delimiter}${monthlyString}`
                    : `${monthlyString}${delimiter}${currencySymbol}`;
                  setYearlyPerMonthPrice(result);
                } catch {
                  setYearlyPerMonthPrice('$4.08');
                }
              } else {
                setYearlyPrice('49$');
                setYearlyPerMonthPrice('$4.08');
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
              setYearlyPerMonthPrice('$4.08');
            }
          }
          void localAnalytics().logEvent('V3PremiumOfferStoreProductsLoaded', {
            screen: 'PremiumOffer',
            action: 'StoreProductsLoaded',
            userId: authContext.userId,
            products,
            subscriptions,
          });
        };
        await retryRequestAsync('PremiumOfferGetProducts', func, authContext.userId!);
      } catch (err) {
        void localAnalytics().logEvent('V3PremiumOfferStoreProductsError', {
          screen: 'PremiumOffer',
          action: 'StoreProductsError',
          userId: authContext.userId,
          err,
        });
        logErrorsWithMessage(err, (err?.message as string) || '');
        setMonthlyPrice('10$');
        setYearlyPrice('49$');
        setYearlyPerMonthPrice('$4.08');
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

  const onClosePressed = () => {
    void localAnalytics().logEvent('V3PremiumOfferClosePressed', {
      screen: 'V3PremiumOffer',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    if (route.params.isOnboarding) {
      navigation.replace('OnboardingNotification', {
        isOnboarding: true,
      });
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Home', {
          refreshTimeStamp: new Date().toISOString(),
        });
      }
    }
  };

  const onBackPressed = () => {
    void localAnalytics().logEvent('V3PremiumOfferGoBackPressed', {
      screen: 'V3PremiumOffer',
      action: 'GoBackPressed',
      userId: authContext.userId,
    });
    if (navigation.canGoBack() && navigation.canGoBack()) {
      navigation.goBack();
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

  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      return () => setMode('light');
    }, []),
  );

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    return () => setMode('light');
  }, []);

  let yearlyTrialLength;
  if (trialLength === 3) {
    yearlyTrialLength = i18n.t('premium_3_days_trial');
  } else if (trialLength === 14) {
    yearlyTrialLength = i18n.t('premium_14_days_trial');
  } else {
    yearlyTrialLength = i18n.t('premium_7_days_trial');
  }

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  };

  type Plan = 'Monthly' | 'Annual';
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Annual');

  const handleToggle = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  let TitleComponent = <></>;
  switch (currentPremiumState) {
    case 'premium':
      TitleComponent = (
        <FontText h1 style={{ color: theme.colors.white, textAlign: 'center', marginVertical: 20 }}>
          {i18n.t('premium_offer_enjoy_your_premium')}
        </FontText>
      );
      break;
    default:
      TitleComponent = (
        <>
          <FontText
            h2
            style={{ color: theme.colors.white, textAlign: 'center', marginVertical: 20 }}
          >
            {selectedPlan === 'Annual'
              ? i18n.t('v3_premium_offer_premium_yearly_title')
              : i18n.t('v3_premium_offer_premium_monthly_title')}
          </FontText>
        </>
      );
  }

  return loading || productLoading ? (
    <Loading />
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.colors.black }}>
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
                <Loading />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: 10,
            }}
          >
            <GoBackButton onPress={onBackPressed} theme="black" />
            <CloseButton onPress={onClosePressed} theme="black" />
          </View>

          {currentPremiumState === 'premium' ? (
            <View>
              {TitleComponent}
              <SecondaryButton buttonStyle={{ marginTop: 50 }} onPress={managePremium}>
                {i18n.t('premium_offer_manage')}
              </SecondaryButton>
            </View>
          ) : (
            <>
              {PremiumReviewBlock()}
              {TitleComponent}
              <View style={{ marginBottom: 32 }}>
                <FontText
                  style={{
                    textAlign: 'center',
                    color: theme.colors.grey3,
                    marginBottom: 16,
                  }}
                >
                  {i18n.t('premium_offer_choose_plan')}
                </FontText>

                <TouchableOpacity
                  onPress={() => handleToggle('Annual')}
                  style={{
                    backgroundColor:
                      selectedPlan === 'Annual' ? theme.colors.white : 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      backgroundColor: theme.colors.warning,
                      paddingVertical: 6,
                      borderTopLeftRadius: 14,
                      borderTopRightRadius: 14,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      paddingHorizontal: 12,
                    }}
                  >
                    <FontText style={{ textAlign: 'center', color: theme.colors.black }}>
                      {i18n.t('premium_7_days_trial_desc', { days: trialLength })}
                    </FontText>
                  </View>

                  <View style={{ padding: 16, paddingTop: 44 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 7,
                        }}
                      >
                        <FontText
                          style={{
                            color:
                              selectedPlan === 'Annual' ? theme.colors.black : theme.colors.white,
                          }}
                        >
                          {i18n.t('premium_offer_yearly_label')}
                        </FontText>
                        <FontText
                          style={{
                            color:
                              selectedPlan === 'Annual' ? theme.colors.grey3 : theme.colors.grey3,
                          }}
                        >
                          {yearlyPrice} / {i18n.t('year')}
                        </FontText>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <FontText
                          style={{
                            color:
                              selectedPlan === 'Annual' ? theme.colors.black : theme.colors.white,
                          }}
                        >
                          {`${yearlyPerMonthPrice} / ${i18n.t('month')}`}
                        </FontText>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor:
                              selectedPlan === 'Annual' ? theme.colors.warning : 'transparent',
                            borderWidth: selectedPlan === 'Annual' ? 0 : 2,
                            borderColor: theme.colors.grey3,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {selectedPlan === 'Annual' && <CheckSimple color={theme.colors.black} />}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleToggle('Monthly')}
                  style={{
                    backgroundColor:
                      selectedPlan === 'Monthly' ? theme.colors.white : 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                  }}
                >
                  <View style={{ padding: 16 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <FontText
                        style={{
                          color:
                            selectedPlan === 'Monthly' ? theme.colors.black : theme.colors.white,
                        }}
                      >
                        {i18n.t('premium_offer_monthly_label')}
                      </FontText>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <FontText
                          style={{
                            color:
                              selectedPlan === 'Monthly' ? theme.colors.black : theme.colors.white,
                          }}
                        >
                          {monthlyPrice} / {i18n.t('month')}
                        </FontText>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor:
                              selectedPlan === 'Monthly' ? theme.colors.warning : 'transparent',
                            borderWidth: selectedPlan === 'Monthly' ? 0 : 2,
                            borderColor: theme.colors.grey3,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {selectedPlan === 'Monthly' && <CheckSimple color={theme.colors.black} />}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <View style={{ flex: 1 }} />
                  <View
                    style={{
                      width: 100,
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 3,
                      height: '100%',
                    }}
                  >
                    <FontText small style={{ color: theme.colors.white }}>
                      {i18n.t('free')}
                    </FontText>
                  </View>
                  <View
                    style={{
                      width: 100,
                      alignItems: 'center',
                      backgroundColor: theme.colors.warning,
                      height: '100%',
                      paddingVertical: 16,
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      paddingHorizontal: 3,
                    }}
                  >
                    <FontText small style={{ color: theme.colors.black }}>
                      {i18n.t('premium')}
                    </FontText>
                  </View>
                </View>

                {/* Feature Rows */}
                <RowComparison
                  icon={<StarReviewIcon />}
                  label={i18n.t('premium_personalised_plan')}
                  free={<CheckSimple color={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<PremiumLoveNoteIcon />}
                  label={i18n.t('premium_love_notes')}
                  free={<CheckSimple color={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<TwoPeopleAccess />}
                  label={i18n.t('premium_access_for_two')}
                  free={<CheckSimple color={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<TestIcon />}
                  label={i18n.t('premium_tests')}
                  free={<LongDash fill={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<GameIcon />}
                  label={i18n.t('premium_games')}
                  free={<LongDash fill={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<QuestionIcon />}
                  label={i18n.t('premium_questions')}
                  free={
                    <FontText small style={{ color: theme.colors.white }}>
                      {i18n.t('premium_per_day')}
                    </FontText>
                  }
                  isLast={false}
                />
                <RowComparison
                  icon={<ExerciseIcon />}
                  label={i18n.t('premium_practices')}
                  free={<LongDash fill={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<ArticleIcon />}
                  label={i18n.t('premium_articles')}
                  free={<LongDash fill={theme.colors.white} />}
                  isLast={false}
                />
                <RowComparison
                  icon={<CheckupIcon />}
                  label={i18n.t('premium_checkups')}
                  free={<LongDash fill={theme.colors.white} />}
                  isLast={true}
                />
              </View>

              {/* Reviews */}
              <View style={{ marginTop: 30 }}>
                <FontText
                  style={{ color: theme.colors.grey3, marginBottom: 10, textAlign: 'center' }}
                >
                  {i18n.t('reviews_from_couples')}
                </FontText>

                <ReviewCard
                  name={i18n.t('v3_premium_review_1_name')}
                  text={i18n.t('v3_premium_review_1_description')}
                  stars={5}
                />

                <ReviewCard
                  name={i18n.t('v3_premium_review_2_name')}
                  text={i18n.t('v3_premium_review_2_description')}
                  stars={4}
                />
                <ReviewCard
                  name={i18n.t('v3_premium_review_3_name')}
                  text={i18n.t('v3_premium_review_3_description')}
                  stars={5}
                />
              </View>
            </>
          )}
        </ScrollView>
        {currentPremiumState !== 'premium' && (
          <View style={{ marginTop: 10, paddingHorizontal: 5 }}>
            {selectedPlan === 'Annual' && (
              <View style={{ marginBottom: 10, alignItems: 'center' }}>
                <FontText small style={{ color: theme.colors.white }}>
                  {i18n.t('premium_charged', { price: yearlyPrice })}
                </FontText>
              </View>
            )}

            <SecondaryButton
              buttonStyle={{ width: '100%' }}
              disabled={buttonDisabled}
              onPress={() => void handleButtonPress()}
              title={selectedPlan === 'Annual' ? yearlyTrialLength : i18n.t('continue')}
            ></SecondaryButton>

            <View
              style={{
                marginTop: 10,
                marginHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row',
                gap: 5,
                justifyContent: 'center',
              }}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => void Linking.openURL('https://nemlys.com/terms')}
              >
                <FontText small style={{ color: theme.colors.grey3, textAlign: 'right' }}>
                  {i18n.t('premium_offer_terms')}
                </FontText>
              </TouchableOpacity>
              <FontText small style={{ color: theme.colors.grey3 }}>
                {'•'}
              </FontText>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => void Linking.openURL('https://nemlys.com/policy')}
              >
                <FontText small style={{ color: theme.colors.grey3, textAlign: 'left' }}>
                  {i18n.t('premium_offer_privacy')}
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
const RowComparison = (props: {
  icon: JSX.Element;
  label: string;
  free: JSX.Element;
  isLast: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: props.isLast ? 0 : 1,
        borderColor: props.isLast ? 'transparent' : 'rgba(255, 255, 255, 0.3)',
      }}
    >
      <View
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }}
      >
        <View style={{ width: 24, height: 24, paddingTop: 2 }}>{props.icon}</View>
        <FontText style={{ color: theme.colors.white }}>{props.label}</FontText>
      </View>
      <View style={{ width: 100, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 3 }}>
        {props.free}
      </View>
      <View
        style={{
          width: 100,
          alignItems: 'center',
          paddingVertical: 12,
          height: '100%',
          backgroundColor: theme.colors.warning,
          borderBottomLeftRadius: props.isLast ? 16 : 0,
          borderBottomRightRadius: props.isLast ? 16 : 0,
        }}
      >
        <CheckSimple color={theme.colors.black} />
      </View>
    </View>
  );
};

function ReviewCard({ name, text, stars }: { name: string; text: string; stars: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', marginBottom: 8, gap: 4 }}>
        {[...Array(stars)].map((_, index) => (
          <StarReviewIcon key={index} />
        ))}
      </View>
      <FontText style={{ color: theme.colors.white, marginBottom: 10 }}>{text}</FontText>
      <FontText style={{ color: theme.colors.grey3 }}>{name}</FontText>
    </View>
  );
}

const REVIEW_LEFT = require('../../../assets/images/review_left.png');
const REVIEW_RIGHT = require('../../../assets/images/review_right.png');
const REVIEW_STARS = require('../../../assets/images/review_stars.png');

function PremiumReviewBlock() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-around',
        marginBottom: 10,
        maxWidth: 350,
      }}
    >
      <Image
        source={REVIEW_LEFT}
        style={{
          height: 56,
          width: 25,
          resizeMode: 'contain',
        }}
      />

      <View
        style={{
          alignItems: 'center',
          marginHorizontal: 10,
        }}
      >
        <FontText
          style={{
            color: theme.colors.white,
            textTransform: 'capitalize',
            textAlign: 'center',
          }}
        >
          {i18n.t('premium_offer_review_couple_count', { coupleCount: '150 000' })}
        </FontText>
        <Image
          source={REVIEW_STARS}
          style={{
            width: 96,
            height: 16,
            resizeMode: 'contain',
            marginTop: 10,
          }}
        />
      </View>

      <Image
        source={REVIEW_RIGHT}
        style={{
          height: 56,
          width: 25,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}
