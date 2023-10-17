import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Image, useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { Loading } from '../../components/utils/Loading';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import { recreateNotification } from '@app/utils/notification';
import { getPremiumDetails } from '@app/api/premium';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDateNewLevel'>) {
  const { withPartner, refreshTimeStamp } = route.params;
  const { theme } = useTheme();
  const [dateCount, setDateCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [navigateToPremiumScreen, setNavigateToPremiumScreen] = useState(false);

  const authContext = useContext(AuthContext);

  const setupDateNotification = async (firstName: string, partnerName: string) => {
    const dateItendifier = NOTIFICATION_IDENTIFIERS.DATE + authContext.userId!;
    await recreateNotification(
      authContext.userId!,
      dateItendifier,
      'Home',
      i18n.t('notification.date.title', { firstName }),
      i18n.t('notification.date.body', { partnerName }),
      {
        seconds: 60 * 60 * 24 * 3, // every 3 days
        repeats: true,
      },
    );
  };

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      const data: SupabaseAnswer<APIUserProfile> = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', authContext.userId)
        .single();
      if (data.error) {
        logErrors(data.error);
        return;
      }
      void setupDateNotification(data.data.first_name, data.data.partner_first_name);
      const { error, count } = await supabase
        .from('date')
        .select('*', { count: 'exact' })
        .eq('active', false)
        .eq('stopped', false);
      if (error) {
        logErrors(error);
        return;
      }
      setDateCount(count || 0);
      try {
        const {
          premiumState,
          totalDateCount,
          introductionDatesLimit: introductionSetCounts,
          todayDateCount,
          dailyDatesLimit,
        } = await getPremiumDetails(authContext.userId!);
        // the user has just finished the introduction sets, prompt trial first time
        if (premiumState === 'free' && totalDateCount === introductionSetCounts) {
          setNavigateToPremiumScreen(true);
          void localAnalytics().logEvent('NewLevelNavigateToPremiumTrialFirst', {
            screen: 'NewLevel',
            action: 'NavigateToPremiumTrialFirst',
            userId: authContext.userId,
          });
        }
        // the user has just finished the daily sets, prompt trial every 3 days on average
        else if (
          premiumState === 'free' &&
          todayDateCount >= dailyDatesLimit &&
          Math.random() < 1 / 3
        ) {
          void localAnalytics().logEvent('NewLevelNavigateToPremiumTrial', {
            screen: 'NewLevel',
            action: 'NavigateToPremiumTrial',
            userId: authContext.userId,
          });
          setNavigateToPremiumScreen(true);
        }
      } catch (error) {
        logErrors(error);
      }

      if ((count || 0) === 1 && withPartner) {
        void localAnalytics().logEvent('NewLevelFirstDateFinished', {
          screen: 'NewLevel',
          action: 'FirstDateFinished',
          userId: authContext.userId,
        });
      } else {
        void localAnalytics().logEvent('NewLevelDateFinished', {
          screen: 'NewLevel',
          action: 'DateFinished',
          userId: authContext.userId,
        });
      }

      setLoading(false);
    };
    void f();
  }, [authContext.userId, withPartner, refreshTimeStamp]);

  const handleHomePress = () => {
    setLoading(true);

    void localAnalytics().logEvent('NewLevelNextClicked', {
      screen: 'NewLevel',
      action: 'NextClicked',
      userId: authContext.userId,
    });
    if (navigateToPremiumScreen) {
      navigation.navigate('PremiumOffer', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
    }
    setLoading(false);
  };
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
            marginTop: '10%',
            flexGrow: 1,
            paddingHorizontal: 15,
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <View style={{ width: '100%', height: '50%' }}>
            <Image
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 300,
              }}
              resizeMode="contain"
              source={require('../../../assets/images/new_level.png')}
            >
              <FontText h1 style={{ color: theme.colors.white }}>
                {i18n.t('level')} {dateCount + 1}
              </FontText>
              <FontText style={{ color: theme.colors.white }}>
                {withPartner ? i18n.t('date.new_level.reached') : i18n.t('date.new_level.have')}
              </FontText>
            </Image>
          </View>
          <View style={{ alignItems: 'center' }}>
            <FontText h1 style={{ color: theme.colors.white, textAlign: 'center' }}>
              {withPartner
                ? i18n.t('date.new_level.title_first')
                : i18n.t('date.new_level.alone_title_first')}
            </FontText>
            <FontText h1 style={{ color: theme.colors.primary, textAlign: 'center' }}>
              {i18n.t('date.new_level.title_second')}
            </FontText>
          </View>
          <View>
            <SecondaryButton
              containerStyle={{ marginTop: 10 }}
              buttonStyle={{ width: '100%' }}
              onPress={() => void handleHomePress()}
              title={i18n.t('date.new_level.home')}
            ></SecondaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
