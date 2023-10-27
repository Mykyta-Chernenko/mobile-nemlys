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
      void localAnalytics().logEvent('OpenedPushNotification', {
        screen: '',
        action: 'OpenedPushNotification',
        title: response?.notification?.request?.content?.title,
        sceenProp: screen,
        userId: auth.userId,
      });
      if (screen) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        navigation.navigate(screen);
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response);
    });
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response) {
        return;
      }
      void localAnalytics().logEvent('GothNotificationOnStart', {
        screen: '',
        action: 'GothNotificationOnStart',
        userId: auth.userId,
      });
      redirect(response);
    });
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [navigation]);

  return <>{props.children}</>;
}
