import React, {useRef, useState} from "react";
import {Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View} from "react-native";
import {supabase} from "@app/initSupabase";
import {AuthStackParamList} from "@app/types/navigation";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Button} from "@rneui/base";
import {Input, Text} from "@rneui/themed";
import {GoogleOAuth} from "@app/components/auth/GoogleOAuth";
import * as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession();
export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "Login">) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const passwordRef = useRef(null) as any;

  async function login() {
    setLoading(true);
    const { data:{user, session}, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error && !user) {
      setLoading(false);
      alert("Check your email for the login link!");
    }
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../../assets/images/login.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: 'white'
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                marginVertical: 10,
                fontWeight: "bold"
              }}
              h4
            >
              Login
            </Text>
            <Text>Email</Text>
            <Input
              containerStyle={{ marginTop: 10, paddingHorizontal:0 }}
              inputStyle={{padding: 5}}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              onChangeText={(text) => setEmail(text)}
              onSubmitEditing={()=> passwordRef.current?.focus()}
            />

            <Text>Password</Text>
            <Input
              containerStyle={{ marginTop: 10, paddingHorizontal:0 }}
              inputStyle={{padding: 5}}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              secureTextEntry={true}
              returnKeyType="send"
              onChangeText={(text) => setPassword(text)}
              ref={passwordRef}
              onSubmitEditing={()=> login()}
            />
            <Button
              title={loading ? "Loading" : "Continue"}
              onPress={() => {
                login();
              }}
              style={{
                marginTop: 10,
              }}
              disabled={loading}
            />
            <GoogleOAuth/>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Register");
                }}
              >
                <Text
                  style={{
                    marginLeft: 5,
                    fontWeight: "bold"
                  }}
                >
                  Register here
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ForgetPassword");
                }}
              >
                <Text style={{fontWeight:'bold'}}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "center",
              }}
            >
            </View>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}
