import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Image, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { useTheme } from '@rneui/themed';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import PurpleSwoosh from '@app/icons/purple_swoosh';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { showName } from '@app/utils/strings';
import { handleRemindPartner } from '@app/utils/sendNotification';
import { PostgrestError } from '@supabase/supabase-js';
type Props = NativeStackScreenProps<MainStackParamList, 'V3CheckupFinish'>;

export default function V3CheckupFinish({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState<string>('');
  const [checkupId, setCheckupId] = useState<number | null>(null);
  const [partnerHasResponded, setPartnerHasResponded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFirstMount = useRef(true);

  const { instanceId, showStreak } = route.params;

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3CheckupFinishLoadingStarted', {
        screen: 'V3CheckupFinish',
        action: 'LoadingStarted',
        userId,
        instanceId,
      });

      const [userProfileRes, instanceRes, partnerResultRes] = await Promise.all([
        supabase.from('user_profile').select('partner_first_name').eq('user_id', userId).single(),
        supabase
          .from('content_checkup_couple_instance')
          .select('checkup_id')
          .eq('id', instanceId)
          .single(),
        supabase
          .from('content_checkup_couple_instance_question_answer')
          .select('id')
          .eq('instance_checkup_id', instanceId)
          .neq('user_id', userId),
      ]);

      if (userProfileRes.error) throw userProfileRes.error;
      if (instanceRes.error) throw instanceRes.error;

      setPartnerName(showName(userProfileRes.data.partner_first_name) || i18n.t('home_partner'));
      setCheckupId(instanceRes.data.checkup_id || null);

      void handleRemindPartner(
        'V3CheckupFinish',
        partnerName,
        authContext.userId!,
        () => {},
        {
          checkup_id: instanceRes.data.checkup_id,
          type: 'remind_checkup',
        },
        navigation,
        undefined,
        undefined,
        false,
        false,
      );
      setPartnerHasResponded(!!(partnerResultRes.data?.length || 0));

      localAnalytics().logEvent('V3CheckupFinishLoaded', {
        screen: 'V3CheckupFinish',
        action: 'Loaded',
        userId,
        instanceId,
        showStreak,
        checkupId: instanceRes.data.checkup_id,
        partnerHasResponded: !!partnerResultRes.data,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, instanceId, showStreak]);

  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleContinue = () => {
    localAnalytics().logEvent('V3CheckupFinishContinueClicked', {
      screen: 'V3CheckupFinish',
      action: 'ContinueClicked',
      userId: authContext.userId,
      instanceId: instanceId,
      showStreak,
      checkupId,
    });

    if (showStreak) {
      navigation.navigate('V3ShowStreak', {
        refreshTimeStamp: new Date().toISOString(),
        nextScreen: 'V3ExploreCheckupDetail',
        screenParams: {
          id: checkupId!,
          refreshTimeStamp: new Date().toISOString(),
          fromHome: route.params.fromHome,
        },
      });
    } else {
      navigation.navigate('V3ExploreCheckupDetail', {
        id: checkupId!,
        refreshTimeStamp: new Date().toISOString(),
        fromHome: route.params.fromHome,
      });
    }
  };

  const FINISH_SCREEN_BUDDY = require('../../../../assets/images/finish_screen_buddy.png');

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
        {loading ? (
          <Loading />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 20,
                marginTop: 40,
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.white,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 40,
                  marginBottom: 40,
                }}
              >
                <PurpleSwoosh width={24} height={24} style={{ marginBottom: 2, marginRight: 5 }} />
                <FontText small>{i18n.t('v3_you_finished_your_part')}</FontText>
              </View>
              <View
                style={{
                  alignItems: 'center',
                }}
              >
                <Image
                  source={FINISH_SCREEN_BUDDY}
                  style={{ width: 180, height: 180, resizeMode: 'contain', marginBottom: 30 }}
                />
                <FontText
                  h2
                  style={{ textAlign: 'center', color: theme.colors.white, marginBottom: 12 }}
                >
                  {partnerHasResponded ? i18n.t('finish_nice_work_2') : i18n.t('finish_nice_work')}
                  <FontText h2 style={{ color: theme.colors.error }}>
                    {partnerName}
                  </FontText>
                  {partnerHasResponded ? i18n.t('finish_answers_2') : i18n.t('finish_answers')}
                </FontText>
              </View>
              <SecondaryButton
                containerStyle={{ width: '100%' }}
                onPress={handleContinue}
                title={i18n.t('continue')}
              ></SecondaryButton>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
