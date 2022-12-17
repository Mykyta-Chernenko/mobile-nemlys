import React, { useEffect, useState } from 'react';
import { useTheme, Text, CheckBox } from '@rneui/themed';
import { Platform, View } from 'react-native';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '../../components/buttons/GoBackButton';
import { i18n } from '@app/localization/i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ViewSetHomeScreen } from '@app/components/sets/ViewSetHomeScreen';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import * as Notifications from 'expo-notifications';
import { isDevice } from 'expo-device';
import { APISet, APIUserProfile, InsertAPICoupleSet, SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { combineDateWithTime } from '@app/utils/time';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetReminder'>) {
  const { theme } = useTheme();

  const [profile, setProfile] = useState<APIUserProfile | undefined>(undefined);
  const [noDateYet, setNoDateYet] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const GRANTED_NOTIFICATION_STATUS = 'granted';
  const [notificationStatus, setNotificationStatus] = useState<string | undefined>(undefined);
  const showNotificationText = notificationStatus && notificationStatus === 'undetermined';
  const now = new Date();
  const [chosenDate, setChosenDate] = useState<Date>(now);
  const [chosenDateTouched, setChosenDateTouched] = useState<boolean>(false);
  const [chosenTime, setChosenTime] = useState<Date>(now);
  const [chosenTimeTouched, setChosenTimeTouched] = useState<boolean>(false);
  const dateTimeSet = chosenDateTouched && chosenTimeTouched;
  const showNextButton = dateTimeSet || noDateYet;

  useEffect(() => {
    const getProfile = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        alert(userError.message);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select(
          'id, user_id, couple_id, first_name, expo_token, onboarding_finished, created_at, updated_at',
          { count: 'exact' },
        )
        .eq('user_id', user.user.id)
        .single();
      if (profileError) {
        alert(profileError.message);
        return;
      }
      setProfile(profile);
    };
    void getProfile();
  });

  useEffect(() => {
    const getCurrentToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    };
    void getCurrentToken();
  });

  const createSet = async () => {
    if (!profile) return;
    const res: SupabaseAnswer<APISet> = await supabase
      .from('set')
      .select('id, level, created_at, updated_at')
      .eq('id', route.params.setId)
      .single();
    if (res.error) {
      alert(JSON.stringify(res.error));
      return;
    }

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const newCoupleSet: InsertAPICoupleSet = {
      set_id: res.data.id,
      order: res.data.level,
      couple_id: profile.couple_id,
      completed: false,
      schedule_reminder: dateTimeSet ? undefined : tomorrow.toISOString(),
      meeting: dateTimeSet ? combineDateWithTime(chosenDate, chosenTime).toISOString() : undefined,
    };
    const coupleSetRes = await supabase.from('couple_set').insert(newCoupleSet);
    if (coupleSetRes.error) {
      alert(JSON.stringify(coupleSetRes.error));
      return;
    }
    navigation.navigate('SetHomeScreen', { refresh: true });
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (isDevice) {
        let finalStatus = notificationStatus;
        if (notificationStatus !== GRANTED_NOTIFICATION_STATUS) {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== GRANTED_NOTIFICATION_STATUS) {
          return;
        }
        setLoading(true);
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        if (token && token != profile?.expo_token) {
          const res = await supabase
            .from('user_profile')
            .update({ expo_token: token, updated_at: new Date() })
            .eq('id', profile?.id);
          if (res.error) {
            alert(JSON.stringify(res.error));
          }
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    } finally {
      await createSet();
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    await registerForPushNotificationsAsync();
  };

  return (
    <ViewSetHomeScreen>
      <View
        style={{
          padding: 15,
          backgroundColor: 'white',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <GoBackButton
            onPress={() => {
              navigation.goBack();
            }}
          ></GoBackButton>
        </View>
        <Text h4 style={{ textAlign: 'center' }}>
          {i18n.t('set.reminder.title')}
        </Text>
        <Text
          style={{
            marginTop: 15,
            color: theme.colors.grey3,
          }}
        >
          {i18n.t('set.reminder.content')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          <DateTimePicker
            testID="datePicker"
            value={chosenDate}
            mode="date"
            onChange={(event, value) => {
              setChosenDateTouched(true);
              setChosenDate(value || now);
            }}
            themeVariant={theme.mode}
            style={{ marginRight: 5 }}
          />
          <DateTimePicker
            testID="timePicker"
            value={chosenTime}
            mode="time"
            is24Hour={true}
            onChange={(event, value) => {
              setChosenTimeTouched(true);
              setChosenTime(value || now);
            }}
            themeVariant={theme.mode}
          />
        </View>
        {!dateTimeSet && (
          <Text
            style={{
              marginTop: 10,
              color: theme.colors.grey1,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </Text>
        )}
        {!dateTimeSet && (
          <CheckBox
            center
            size={26}
            title={i18n.t('set.reminder.no_date_yet_checkbox')}
            checkedColor={theme.colors.primary}
            checked={noDateYet}
            onPress={() => setNoDateYet(!noDateYet)}
            containerStyle={{
              paddingHorizontal: 0,
            }}
          />
        )}

        {showNextButton && (
          <View>
            <Text
              style={{
                marginTop: 20,
                color: theme.colors.grey3,
              }}
            >
              {showNotificationText &&
                (noDateYet
                  ? i18n.t('set.reminder.notification_access_no_date')
                  : i18n.t('set.reminder.notification_access'))}
            </Text>
            {loading ? (
              <Loading></Loading>
            ) : (
              <PrimaryButton
                style={{ marginTop: 5 }}
                title={i18n.t('set.reminder.next_button')}
                onPress={() => void handleSubmit()}
              ></PrimaryButton>
            )}
          </View>
        )}
      </View>
    </ViewSetHomeScreen>
  );
}
