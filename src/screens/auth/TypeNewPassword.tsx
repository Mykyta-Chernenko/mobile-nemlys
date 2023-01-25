import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { logEvent } from 'expo-firebase-analytics';
import { AuthContext } from '@app/provider/AuthProvider';

export const TYPE_NEW_PASSWORD_PATH = 'type-new-password';
export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'TypeNewPassword'>) {
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const authContext = useContext(AuthContext);

  useEffect(() => {
    void logEvent('TypeNewPasswordOpenScreen', {
      screen: 'TypeNewPassword',
      action: 'Screen opened',
      userId: authContext.userId,
    });
    async function getSession() {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      setLoading(false);
      console.log(data);
      console.log(error);
    }
    void getSession();
  }, []);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        justifyContent: 'center',
      }}
    >
      <FontText
        style={{
          marginLeft: 5,
        }}
      >
        {loading ? i18n.t('loading') : 'not loading'}
      </FontText>
    </View>
  );
}
