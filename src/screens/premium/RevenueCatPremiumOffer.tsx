import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import Purchases, { PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import { TouchableOpacity } from 'react-native';
import PlanSelector from '@app/components/premium/PlanSelector';
import { useFocusEffect } from '@react-navigation/native';
const REVENUE_CAT_API_KEYS = {
  ios: 'appl_iFyUuiSazikMPQAZvQgMVsCYCxL',
  android: 'goog_EvHtmHZMwxfZZUPzNCjeaCcbAnc',
};

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
  const [canClose, setCanClose] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<PurchasesPackage[]>([]);
  type CurrentPremiumState =
    | 'premium'
    | 'trial'
    | 'trial_expired'
    | 'daily_limit'
    | 'introduction_limit'
    | 'daily'
    | 'introduction';
  const [currentPremiumState, setCurrentPremiumState] = useState<CurrentPremiumState>('daily');

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
  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      return () => setMode('light');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
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
        forcePremium,
        afterTrialPremiumOffered,
      } = await getPremiumDetails(authContext.userId!);

      setCanClose(!forcePremium);
      if (forcePremium) {
        void localAnalytics().logEvent('V3PremiumOfferRevenueCatForcedLoaded', {
          screen: 'V3PremiumOfferRevenueCat',
          action: 'ForcedLoaded',
          userId: authContext.userId,
          premiumState: currentPremiumState,
          isOnboarding: route?.params?.isOnboarding,
        });
      }

      if (premiumState === 'premium') {
        currentPremiumState = 'premium';
      } else if (trialExpired && !afterTrialPremiumOffered) {
        const updateProfile = await supabase
          .from('user_technical_details')
          .update({ after_trial_premium_offered: true, updated_at: getNow().toISOString() })
          .eq('user_id', authContext.userId || '');
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

    void localAnalytics().logEvent('V3PremiumOfferRevenueCatLoaded', {
      screen: 'V3PremiumOfferRevenueCat',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getData();
    isFirstMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for is_user_premium to return true
  const waitForPremiumUpdate = async (maxAttempts = 20): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(500);

      try {
        const result = await supabase.rpc('is_user_premium');
        if (result.data === true) {
          void localAnalytics().logEvent('V3PremiumOfferRevenueCatPremiumUpdated', {
            screen: 'V3PremiumOfferRevenueCat',
            action: 'PremiumUpdated',
            userId: authContext.userId,
            attempt,
          });
          return true;
        }
      } catch (error) {
        logErrorsWithMessageWithoutAlert(error);
      }

      void localAnalytics().logEvent('V3PremiumOfferRevenueCatPremiumUpdateRetry', {
        screen: 'V3PremiumOfferRevenueCat',
        action: 'PremiumUpdateRetry',
        userId: authContext.userId,
        attempt,
        maxAttempts,
      });
    }

    void localAnalytics().logEvent('V3PremiumOfferRevenueCatPremiumUpdateTimeout', {
      screen: 'V3PremiumOfferRevenueCat',
      action: 'PremiumUpdateTimeout',
      userId: authContext.userId,
      maxAttempts,
    });
    return false;
  };

  const handleButtonPress = async () => {
    setButtonDisabled(true);
    setSubscriptionLoading(true);

    try {
      void localAnalytics().logEvent('V3PremiumContinuePressed', {
        screen: 'Premium',
        action: 'ContinuePressed',
        userId: authContext.userId,
      });

      void localAnalytics().logEvent('V3PremiumPremiumStartInitiated', {
        screen: 'Premium',
        action: 'PremiumStartInitiated',
        userId: authContext.userId,
        plan: selectedPlan,
      });

      const subscriptionPlan =
        selectedPlan === 'Annual' ? yearlySubscriptionId : monthlySubscriptionId;

      // Find the package to purchase
      const packageToPurchase = availablePackages.find(
        (pkg) => pkg.product.identifier === subscriptionPlan,
      );

      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      void localAnalytics().logEvent('V3PremiumOfferRevenueCatPurchaseStarted', {
        screen: 'V3PremiumOfferRevenueCat',
        action: 'PurchaseStarted',
        userId: authContext.userId,
        offeringId: subscriptionPlan,
        value: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode,
        productIdentifier: packageToPurchase.identifier,
      });

      // Purchase the package
      await Purchases.purchasePackage(packageToPurchase);

      void localAnalytics().logEvent('V3PremiumOfferRevenueCatPurchaseCompleted', {
        screen: 'V3PremiumOfferRevenueCat',
        action: 'PurchaseCompleted',
        userId: authContext.userId,
        offeringId: subscriptionPlan,
        value: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode,
        productIdentifier: packageToPurchase.identifier,
      });

      await waitForPremiumUpdate();
      navigation.navigate('PremiumSuccess', {
        state: 'premium_started',
        isOnboarding: route.params.isOnboarding,
      });
    } catch (error) {
      if (
        error?.userInfo?.readableErrorCode === 'PURCHASE_CANCELLED' ||
        error?.userInfo?.readableErrorCode === 'PurchaseCancelledError'
      ) {
        void localAnalytics().logEvent('V3PremiumOfferRevenueCatSubscriptionAttemptCancelled', {
          screen: 'V3PremiumOfferRevenueCat',
          action: 'CancelledSubscriptionAttempt',
          userId: authContext.userId,
          error,
        });
      } else {
        console.log(JSON.stringify(error));
        void localAnalytics().logEvent('V3PremiumOfferRevenueCatSubscriptionAttemptError', {
          screen: 'V3PremiumOfferRevenueCat',
          action: 'SubscriptionAttemptError',
          userId: authContext.userId,
          error: JSON.stringify(error),
        });
        const errorMessage =
          error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
        logErrorsWithMessage(error, errorMessage);
      }
    } finally {
      setSubscriptionLoading(false);
      setButtonDisabled(false);
    }
  };

  const monthlySubscriptionId = 'nemlys.subscription.monthly_no_trial';
  const yearlySubscriptionId = 'nemlys.subscription.yearly';
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [partnerName] = useState('');

  // Initialize Revenue Cat
  useEffect(() => {
    async function initializeRevenueCat() {
      setProductLoading(true);
      try {
        if (!authContext.userId) {
          return;
        }

        const apiKey =
          Platform.OS === 'ios' ? REVENUE_CAT_API_KEYS.ios : REVENUE_CAT_API_KEYS.android;

        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        Purchases.configure({ apiKey, appUserID: authContext.userId });

        void localAnalytics().logEvent('RevenueCatInitialized', {
          platform: Platform.OS,
          userId: authContext.userId,
        });

        // Fetch offerings
        await fetchOfferings();

        // Get customer info
        await Purchases.getCustomerInfo();
      } catch (error) {
        void localAnalytics().logEvent('V3PremiumOfferRevenueCatRevenueCatInitError', {
          screen: 'V3PremiumOfferRevenueCat',
          action: 'RevenueCatInitError',
          userId: authContext.userId,
          error,
        });
        logErrorsWithMessage(error, (error?.message as string) || '');
        setMonthlyPrice('10$');
        setYearlyPrice('49$');
      } finally {
        setProductLoading(false);
      }
    }

    if (authContext.userId) {
      void initializeRevenueCat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.userId]);

  // Fetch Revenue Cat offerings
  const fetchOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        const packages = offerings.current.availablePackages;
        setAvailablePackages(packages);

        // Find monthly and yearly packages
        const monthlyPackage = packages.find(
          (pkg) => pkg.product.identifier === monthlySubscriptionId,
        );
        const yearlyPackage = packages.find(
          (pkg) => pkg.product.identifier === yearlySubscriptionId,
        );

        // Set prices
        if (monthlyPackage) {
          setMonthlyPrice(monthlyPackage.product.priceString);
        } else {
          setMonthlyPrice('10$');
        }

        if (yearlyPackage) {
          setYearlyPrice(yearlyPackage.product.priceString);

          // Check for trial period
          if (Platform.OS === 'ios') {
            const introPrice = yearlyPackage.product.introPrice;
            if (introPrice && introPrice['paymentMode'] === 'FREE_TRIAL') {
              const periodUnit = introPrice.periodUnit;
              const periodNumberOfUnits = introPrice.periodNumberOfUnits;

              if (periodUnit === 'DAY') {
                setTrialLength(periodNumberOfUnits);
              } else if (periodUnit === 'WEEK') {
                setTrialLength(periodNumberOfUnits * 7);
              }
            }
          } else if (Platform.OS === 'android') {
            // Android trial period detection
            const freePhase = yearlyPackage.product['freePhase'];
            if (freePhase) {
              const billingPeriod = freePhase['billingPeriod'];
              if (billingPeriod) {
                const days = parseInt(String(billingPeriod).replace('P', '').replace('D', ''), 10);
                if (!isNaN(days)) {
                  setTrialLength(days);
                }
              }
            }
          }
        } else {
          setYearlyPrice('49$');
        }

        void localAnalytics().logEvent('V3PremiumOfferRevenueCatStoreProductsLoaded', {
          screen: 'V3PremiumOfferRevenueCat',
          action: 'StoreProductsLoaded',
          userId: authContext.userId,
          packages,
        });
      }
    } catch (error) {
      logErrorsWithMessageWithoutAlert(error);
    }
  };

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
          {i18n.t('premium_offer_premium_title')}
          <FontText h2 style={{ color: theme.colors.primary }}>
            {i18n.t('premium_offer_premium_title_2')}
          </FontText>
        </>
      );
      break;
  }
  const onClosePressed = () => {
    void localAnalytics().logEvent('V3PremiumOfferRevenueCatClosePressed', {
      screen: 'V3PremiumOfferRevenueCat',
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
            {canClose ? (
              <CloseButton onPress={onClosePressed} theme="black"></CloseButton>
            ) : (
              <View
                style={{
                  width: getFontSizeForScreen('h1') * 1.1,
                  height: getFontSizeForScreen('h2') * 1.1,
                }}
              ></View>
            )}
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
                    marginTop: 20,
                    marginBottom: 10,
                    width: '100%',
                  }}
                >
                  {i18n.t('premium_two')}
                </FontText>
              )}
              <FontText
                h2
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
                  {canClose ? (
                    <>
                      <FontText h4>{i18n.t('premium_unlimited_content_title')}</FontText>
                      <FontText style={{ color: theme.colors.grey5, marginTop: 5 }}>
                        {i18n.t('premium_unlimited_content_title_2')}
                      </FontText>
                    </>
                  ) : (
                    <>
                      <FontText h4>{i18n.t('premium_forced_title', { partnerName })}</FontText>
                      <FontText style={{ color: theme.colors.grey5, marginTop: 5 }}>
                        {i18n.t('premium_forced_description')}
                      </FontText>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
          {currentPremiumState !== 'premium' ? (
            <>
              <View style={{ marginBottom: 10, marginTop: 30 }}>
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
                        color: theme.colors.white,
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
