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
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
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
    });
    return () => subscription.remove();
  }, [navigation]);

  return <>{props.children}</>;
}
