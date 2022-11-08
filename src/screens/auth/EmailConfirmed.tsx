import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { startAsync, makeRedirectUri } from "expo-auth-session";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import * as Linking from 'expo-linking';
import { supabase } from "../../initSupabase";
import { AuthStackParamList } from "../../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";

export const EMAIL_CONFIRMED_PATH = 'email-confirmed'
export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "EmailConfirmed">) {
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
    <Layout>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 30,
            justifyContent: "center",
          }}
        >
            <Text
              size="md"
              fontWeight="bold"
              style={{
                marginLeft: 5,
              }}
            >
              {loading?"Loading": "Email is confirmed"}
            </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}
