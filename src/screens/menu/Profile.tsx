import React, { useContext, useEffect, useRef } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { logout } from '@app/utils/auth';
import { localAnalytics } from '@app/utils/analytics';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Profile'>) {
  const authContext = useContext(AuthContext);

  async function getVersionRedirect() {
    const userId = authContext.userId!;
    const profileResponse = await supabase
      .from('user_profile')
      .select('id, couple(switched_to_v3, v2_user)')
      .eq('user_id', authContext.userId!)
      .single();

    if (profileResponse.error) {
      logSupaErrors(profileResponse.error);
      void logout();
      return;
    }

    const switchedToV3 = profileResponse.data?.couple?.switched_to_v3;
    const v2User = profileResponse.data?.couple?.v2_user;
    void localAnalytics().logEvent('ProfileLoaded', {
      screen: 'Profile',
      action: 'Loaded',
      userId,
      switchedToV3,
      v2User,
    });
    if (switchedToV3) {
      navigation.navigate('V3Profile', { refreshTimeStamp: route.params.refreshTimeStamp });
    } else {
      navigation.navigate('V2Profile', { refreshTimeStamp: route.params.refreshTimeStamp });
    }
  }

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void getVersionRedirect();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getVersionRedirect();
    isFirstMount.current = false;
  }, []);

  return <Loading />;
}
