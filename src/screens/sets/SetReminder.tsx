import React, { useEffect, useState } from 'react';
import { useTheme, CheckBox } from '@rneui/themed';
import { Platform, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '../../components/buttons/GoBackButton';
import { i18n } from '@app/localization/i18n';
import DateTimePicker, {
  AndroidNativeProps,
  DateTimePickerAndroid,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ViewSetHomeScreen } from '@app/components/sets/ViewSetHomeScreen';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import * as Notifications from 'expo-notifications';
import { isDevice } from 'expo-device';
import {
  APICoupleSet,
  APISet,
  APIUserProfile,
  InsertAPICoupleSet,
  SupabaseAnswer,
} from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import moment from 'moment';
import { FontText } from '@app/components/utils/FontText';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import { getNotificationForMeeting } from '@app/utils/sets';
import { scheduleMeetingNotification } from '@app/utils/notification';

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
  const [chosenDateTime, setChosenDateTime] = useState<Date>(now);
  const [chosenDateTouched, setChosenDateTouched] = useState<boolean>(false);
  const [chosenTimeTouched, setChosenTimeTouched] = useState<boolean>(false);
  const chosenDateTimeTouched = chosenDateTouched && chosenTimeTouched;
  const dateTimePickerBaseProps: IOSNativeProps | AndroidNativeProps = {
    value: chosenDateTime,
    display: 'compact',
    style: { marginRight: 5 },
    themeVariant: theme.mode,
  };
  const datePickerProps: IOSNativeProps | AndroidNativeProps = {
    ...dateTimePickerBaseProps,
    testID: 'datePicker',
    mode: 'date',
    onChange: (event, value: Date) => {
      setChosenDateTouched(true);
      setChosenDateTime(value || now);
    },
  };
  const timePickerProps: IOSNativeProps | AndroidNativeProps = {
    ...dateTimePickerBaseProps,
    testID: 'timePicker',
    mode: 'time',
    onChange: (event, value: Date) => {
      setChosenTimeTouched(true);
      setChosenDateTime(value || now);
    },
  };
  const dateAndTimeLabelStyle: StyleProp<ViewStyle> = {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: 3,
    backgroundColor: theme.colors.grey5,
    borderRadius: 7,
  };
  const meetingTimeScheduled = chosenDateTimeTouched;
  const showNextButton = chosenDateTimeTouched || noDateYet;

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
          'id, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, created_at, updated_at',
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

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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

    const newCoupleSet: InsertAPICoupleSet = {
      set_id: res.data.id,
      order: res.data.level,
      couple_id: profile.couple_id,
      completed: false,
      schedule_reminder: meetingTimeScheduled ? undefined : tomorrow.toISOString(),
      meeting: meetingTimeScheduled ? chosenDateTime.toISOString() : undefined,
    };
    const coupleSetRes: SupabaseAnswer<APICoupleSet> = await supabase
      .from('couple_set')
      .insert(newCoupleSet)
      .select()
      .single();
    if (coupleSetRes.error) {
      alert(JSON.stringify(coupleSetRes.error));
      return;
    }
    await scheduleReminder(coupleSetRes.data.id);
    navigation.navigate('SetHomeScreen', { refreshTimeStamp: new Date().toISOString() });
  };

  const scheduleReminder = async (coupleSetId: number) => {
    if (isDevice) {
      let reminderTime: Date | null = null;
      let identifier: string | null = null;
      let title: string | null = null;
      if (meetingTimeScheduled) {
        const res = getNotificationForMeeting(chosenDateTime, coupleSetId);
        reminderTime = res.reminderTime;
        identifier = res.identifier;
        title = res.title;
      } else {
        reminderTime = tomorrow;
        identifier = NOTIFICATION_IDENTIFIERS.SCHEDULE_DATE + coupleSetId.toString();
        title = i18n.t('notifications.schedule_date');
      }
      if (reminderTime && identifier && title) {
        await scheduleMeetingNotification(title, reminderTime, identifier);
      }
    }
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
        let tokenField: string | null = null;
        if (Platform.OS === 'ios') {
          tokenField = 'ios_expo_token';
        } else if (Platform.OS === 'android') {
          tokenField = 'android_expo_token';
        }
        if (token && tokenField && token != profile?.[tokenField]) {
          const res = await supabase
            .from('user_profile')
            .update({ [tokenField]: token, updated_at: new Date() })
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
        <FontText h4 style={{ textAlign: 'center' }}>
          {i18n.t('set.reminder.title')}
        </FontText>
        <FontText
          style={{
            marginTop: 15,
            color: theme.colors.grey3,
          }}
        >
          {i18n.t('set.reminder.content')}
        </FontText>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          {Platform.OS == 'ios' ? (
            <DateTimePicker {...datePickerProps} />
          ) : (
            <TouchableOpacity
              onPress={() => {
                DateTimePickerAndroid.open(datePickerProps as AndroidNativeProps);
              }}
              style={dateAndTimeLabelStyle}
            >
              <FontText>{moment(chosenDateTime).format('MMM Do')}</FontText>
            </TouchableOpacity>
          )}
          {Platform.OS == 'ios' ? (
            <DateTimePicker {...timePickerProps} />
          ) : (
            <TouchableOpacity
              onPress={() => DateTimePickerAndroid.open(timePickerProps as AndroidNativeProps)}
              style={dateAndTimeLabelStyle}
            >
              <FontText>{moment(chosenDateTime).format('HH:mm')}</FontText>
            </TouchableOpacity>
          )}
        </View>
        {!chosenDateTimeTouched && (
          <FontText
            style={{
              marginTop: 10,
              color: theme.colors.grey1,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </FontText>
        )}
        {!chosenDateTimeTouched && (
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
            <FontText
              style={{
                marginTop: 20,
                color: theme.colors.grey3,
              }}
            >
              {showNotificationText &&
                (noDateYet
                  ? i18n.t('set.reminder.notification_access_no_date')
                  : i18n.t('set.reminder.notification_access'))}
            </FontText>
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
