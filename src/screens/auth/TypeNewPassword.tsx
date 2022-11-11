import React, { useEffect, useState } from "react";
import {
  View,
} from "react-native";
import { supabase } from "@app/initSupabase";
import { AuthStackParamList } from "@app/types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from '@rneui/themed';
export const TYPE_NEW_PASSWORD_PATH = 'type-new-password'
export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "TypeNewPassword">) {
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(()=> {
    async function getSession() {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession()
      setLoading(false)
      console.log(data)
      console.log(error)
    }
    getSession()
  }, [supabase])
  return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "center",
          }}
        >
            <Text
              style={{
                marginLeft: 5,
              }}
            >
              {loading?"Loading": "Email is confirmed"}
            </Text>
        </View>
  );
}
