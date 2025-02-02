// NavigationStackLimiter.tsx
import React, { useEffect } from 'react';
import { useNavigationState, useNavigation, CommonActions } from '@react-navigation/native';

interface NavigationStackLimiterProps {
  maxStackSize?: number;
}

const NavigationStackLimiter: React.FC<NavigationStackLimiterProps> = ({ maxStackSize = 10 }) => {
  const navigation = useNavigation();
  const routes = useNavigationState((state) => state?.routes);

  useEffect(() => {
    // WARN, not needed because when A -> B -> C -> D and we .navigate to B, it does not appear twice, it becomes A -> B
    if (routes?.length > maxStackSize) {
      const excess = routes.length - maxStackSize;
      const newRoutes = routes.slice(excess).map((route) => ({
        name: route.name,
        params: route.params as object | undefined,
      }));
      navigation.dispatch(
        CommonActions.reset({
          index: newRoutes.length - 1,
          routes: newRoutes,
        }),
      );
    }
  }, [routes, maxStackSize, navigation]);

  return null;
};

export default NavigationStackLimiter;
