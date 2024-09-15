import React, { useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { AppState } from 'react-native';
import { navigationRef } from '@app/navigation/ref';
import { sleep } from '@app/utils/date';

interface Props {
  children: React.ReactNode;
}

const NotificationHandler: React.FC<Props> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [pendingNotification, setPendingNotification] = useState<Notifications.Notification | null>(
    null,
  );
  const appState = useRef(AppState.currentState);

  // Update app state
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle notification when app is in foreground
  const handleNotificationReceived = (notification: Notifications.Notification) => {
    if (appState.current === 'active') {
      const data = notification.request.content.data;
      const { screen } = data || {};

      if (screen === 'QuestionAnswer') {
        handleNotification(notification);
      }
    }
  };

  // Handle notification when user interacts with it
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { notification } = response;
    handleNotification(notification);
  };

  // Main notification handler
  const handleNotification = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    const { screen, type, subtype, band, args: argString } = data || {};

    let args = {};
    if (argString) {
      try {
        args = JSON.parse(argString as string);
      } catch (e) {
        console.error('Error parsing notification args:', e);
      }
    }

    localAnalytics().logEvent('PushNotificationOpened', {
      screen: 'PushNotification',
      action: 'Opened',
      title: notification.request.content.title,
      screenProp: screen,
      userId: auth.userId,
      type,
      subtype,
      band,
      args,
    });

    if (screen) {
      if (navigationRef.isReady()) {
        (navigationRef.current as any)?.navigate(screen, {
          ...args,
          refreshTimeStamp: new Date().toISOString(),
        });
      } else {
        setPendingNotification(notification);
      }
    }
  };

  // Process pending notifications when navigation is ready
  useEffect(() => {
    if (pendingNotification && navigationRef.isReady()) {
      void sleep(100).then(() => {
        setPendingNotification(null);
        handleNotification(pendingNotification);
      });
    }
  }, [pendingNotification]);

  // Set up notification listeners
  useEffect(() => {
    // TODO handle foregorund notifications
    // const receivedSubscription = Notifications.addNotificationReceivedListener(
    //   handleNotificationReceived,
    // );
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

    // Handle notifications when the app is launched from a closed state
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const checkNavigationReady = setInterval(() => {
          if (navigationRef.isReady()) {
            clearInterval(checkNavigationReady);
            handleNotification(response.notification);
          }
        }, 100);
      }
    });

    return () => {
      // TODO revert when handle local notifications
      // receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return <>{children}</>;
};

export default NotificationHandler;
