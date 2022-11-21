import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';

export const EMAIL_CONFIRMED_PATH = 'email-confirmed';
export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'EmailConfirmed'>) {
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
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
      <Text
        style={{
          marginLeft: 5,
        }}
      >
        {loading ? i18n.t('loading') : i18n.t('email_confirmed.content')}
      </Text>
    </View>
  );
}
