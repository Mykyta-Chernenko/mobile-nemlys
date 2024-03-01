import React, { useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';

interface Props {
  children: React.ReactNode;
}
export default function (props: Props) {
  const navigation = useNavigation<any>();
  const auth = useContext(AuthContext);

  // get notification redirects
  React.useEffect(() => {
    let isMounted = true;
    const redirect = (response: Notifications.NotificationResponse) => {
      const screen = response?.notification?.request?.content?.data?.screen;
      const type = response?.notification?.request?.content?.data?.type;
      const subtype = response?.notification?.request?.content?.data?.subtype;
      const band = response?.notification?.request?.content?.data?.band;
      void localAnalytics().logEvent('PushNotificationOpened', {
        screen: 'PushNotification',
        action: 'Opened',
        title: response?.notification?.request?.content?.title,
        sceenProp: screen,
        userId: auth.userId,
        type,
        subtype,
        band,
      });
      if (screen) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        navigation.navigate(screen, { refreshTimeStamp: new Date().toISOString() });
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response);
    });
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response) {
        return;
      }
      redirect(response);
    });
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [navigation]);

  return <>{props.children}</>;
}
