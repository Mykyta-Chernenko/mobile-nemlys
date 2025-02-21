import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { CloseButton } from '@app/components/buttons/CloseButton';
import BuddyPurple from '@app/icons/content_buddy_purple';
import BuddyPink from '@app/icons/content_buddy_pink';
import LoveNoteSorryIcon from '@app/icons/love_note_sorry';
import LoveNoteSexIcon from '@app/icons/love_note_sex';
import LoveNoteMissIcon from '@app/icons/love_note_miss';
import LoveNoteDateIcon from '@app/icons/love_note_date';
import LoveNoteTalkIcon from '@app/icons/love_note_talk';
import LoveNoteAttentionIcon from '@app/icons/love_note_attention';
import LoveNoteLoveIcon from '@app/icons/love_note_love';
import LoveNoteHugIcon from '@app/icons/love_note_hug';
import { localAnalytics } from '@app/utils/analytics';
import {
  logErrorsWithMessage,
  logErrorsWithMessageWithoutAlert,
  logSupaErrors,
  retryAsync,
} from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@app/api/initSupabase';
import { showName } from '@app/utils/strings';
import { LoveNoteAction } from '@app/types/domain';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { PostgrestError } from '@supabase/supabase-js';

export const loveNoteActions: {
  type: LoveNoteAction;
  icon: () => JSX.Element;
  label: string;
}[] = [
  {
    type: 'sorry',
    icon: LoveNoteSorryIcon,
    label: 'love_note_sorry',
  },
  {
    type: 'sex',
    icon: LoveNoteSexIcon,
    label: 'love_note_sex',
  },
  {
    type: 'miss',
    icon: LoveNoteMissIcon,
    label: 'love_note_miss',
  },
  {
    type: 'date',
    icon: LoveNoteDateIcon,
    label: 'love_note_date',
  },
  {
    type: 'talk',
    icon: LoveNoteTalkIcon,
    label: 'love_note_talk',
  },
  {
    type: 'attention',
    icon: LoveNoteAttentionIcon,
    label: 'love_note_attention',
  },
  {
    type: 'love',
    icon: LoveNoteLoveIcon,
    label: 'love_note_love',
  },
  {
    type: 'hug',
    icon: LoveNoteHugIcon,
    label: 'love_note_hug',
  },
];

export default function LoveNote({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'LoveNote'>) {
  const screenName = 'LoveNote';
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [partnerName, setPartnerName] = useState('');

  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      return () => setMode('light');
    }, []),
  );

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      void localAnalytics().logEvent(`${screenName}DataLoading`, {
        screen: screenName,
        action: 'DataLoading',
        userId: authContext.userId,
      });
      const { data, error } = await supabase
        .from('user_profile')
        .select('partner_first_name')
        .eq('user_id', authContext.userId!)
        .single();
      if (error) {
        logSupaErrors(error);
        throw error;
      }
      setPartnerName(showName(data.partner_first_name));
      void localAnalytics().logEvent(`${screenName}DataLoaded`, {
        screen: screenName,
        action: 'DataLoaded',
        userId: authContext.userId,
      });
    } catch (e) {
      setError((e as Error)?.message || '');
      logErrorsWithMessage(e, (e as Error)?.message || '');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    void localAnalytics().logEvent(`${screenName}GoBack`, {
      screen: screenName,
      action: 'GoBack',
      userId: authContext.userId,
    });
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('V3Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };

  const handleActionPress = async (
    action: LoveNoteAction,
    label: string,
    icon: () => JSX.Element,
  ) => {
    void localAnalytics().logEvent(`${screenName}ActionClicked`, {
      screen: screenName,
      actionClicked: action,
      userId: authContext.userId,
    });
    try {
      const { data: loveNoteId, error } = await supabase.rpc('send_love_note', {
        type: action,
      });
      if (error) {
        logSupaErrors(error);
        return;
      }
      const body = { type: 'love_note', id: loveNoteId };
      const res = await retryAsync(screenName, async () => {
        const res = await supabase.functions.invoke('send-partner-notification', {
          body,
        });
        if (res.error) {
          throw res.error;
        }
        return res;
      });
      if (res.data?.error === 'UNKNOWN_TYPE') {
        void localAnalytics().logEvent(`${screenName}RemindPartnerUnknownType`, {
          screen: screenName,
          action: 'RemindPartnerUnknownType',
          userId: authContext.userId,
          body,
        });
        logErrorsWithMessageWithoutAlert(
          new Error(`${screenName}RemindPartnerUnknownType body: ${JSON.stringify(body)}`),
        );
      } else if (res.data?.error === 'NO_PARTNER') {
        void localAnalytics().logEvent(`${screenName}RemindPartnerNoPartner`, {
          screen: screenName,
          action: 'RemindPartnerNoPartner',
          userId: authContext.userId,
          body,
        });
        void navigation.navigate('OnboardingInviteCode', {
          nextScreen: 'V3Profile',
          screenParams: {
            refreshTimeStamp: new Date().toISOString(),
          },
        });
      } else if (res.data?.error === 'NO_PARTNER_TOKEN') {
        void localAnalytics().logEvent(`${screenName}RemindPartnerNoPartnerToken`, {
          screen: screenName,
          action: 'RemindPartnerNoPartnerToken',
          userId: authContext.userId,
          body,
        });
        Toast.show({
          type: 'error',
          text1: i18n.t('remind_no_notification', { partnerName }),
          visibilityTime: 5000,
          onPress: () => Toast.hide(),
        });
      } else {
        void localAnalytics().logEvent(`${screenName}ActionSuccess`, {
          screen: screenName,
          actionClicked: action,
          userId: authContext.userId,
        });
        Toast.show({
          type: 'success',
          text1: i18n.t('love_note_sent', {
            partnerName,
            action: label,
          }),
          props: { icon },
          visibilityTime: 4000,
          onPress: () => Toast.hide(),
        });
      }
    } catch (e) {
      logSupaErrors(e as PostgrestError);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('V3Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <BuddyPurple />
            <BuddyPink />
          </View>
          <View style={{ flex: 1 }} />
          <CloseButton onPress={handleGoBack} theme="black" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
        >
          <FontText h3 style={{ color: theme.colors.white, marginBottom: 20, width: '80%' }}>
            {i18n.t('love_note_title', { partnerName })}
          </FontText>

          {error ? (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <FontText style={{ color: theme.colors.white }}>{error}</FontText>
              <View style={{ height: 10 }} />
              <SecondaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => void fetchInitialData()}
                title={i18n.t('reload')}
              />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              {loveNoteActions.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => void handleActionPress(item.type, i18n.t(item.label), item.icon)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderRadius: 40,
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <FontText style={{ color: theme.colors.white }}>{i18n.t(item.label)}</FontText>
                  <View
                    style={{
                      height: 56,
                      width: 56,
                      borderRadius: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#311E44',
                    }}
                  >
                    <item.icon></item.icon>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
