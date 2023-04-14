import React from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
}
export default function (props: Props) {
  const navigation = useNavigation<any>();

  // get notification redirects
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (screen) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        navigation.navigate(screen);
      }
    });
    return () => subscription.remove();
  }, [navigation]);

  return <>{props.children}</>;
}
