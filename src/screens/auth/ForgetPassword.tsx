import React, {useState} from "react";
import {Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View,} from "react-native";
import {supabase} from "../../initSupabase";
import {AuthStackParamList} from "../../types/navigation";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Text, Input, Button} from "@rneui/themed"
import {EMAIL_CONFIRMED_PATH} from "./EmailConfirmed";
import * as Linking from 'expo-linking';

export default function ({
                             navigation,
                         }: NativeStackScreenProps<AuthStackParamList, "ForgetPassword">) {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function forget() {
        setLoading(true);
        const redirectTo = Linking.createURL(EMAIL_CONFIRMED_PATH)
        // TODO handle password input
        const {data, error} = await supabase.auth.resetPasswordForEmail(
            email, {redirectTo}
        );
        if (!error) {
            setLoading(false);
            alert("Check your email to reset your password!");
        }
        if (error) {
            setLoading(false);
            alert(error.message);
        }
    }

    return (
        <KeyboardAvoidingView behavior="height" enabled style={{flex: 1}}>
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
                        source={require("../../../assets/images/forget.png")}
                    />
                </View>
                <View
                    style={{
                        flex: 3,
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                        backgroundColor: 'white',
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
                        Forget password
                    </Text>
                    <Text>Email</Text>
                    <Input
                        containerStyle={{marginTop: 15}}
                        placeholder="Enter your email"
                        value={email}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect={false}
                        keyboardType="email-address"
                        onChangeText={(text) => setEmail(text)}
                    />
                    <Button
                        title={loading ? "Loading" : "Send email"}
                        onPress={() => {
                            forget();
                        }}
                        disabled={loading}
                    />

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 15,
                            justifyContent: "center",
                        }}
                    >
                        <Text>Already have an account?</Text>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Login");
                            }}
                        >
                            <Text
                                style={{
                                    marginLeft: 5,
                                    fontWeight:'bold'
                                }}
                            >
                                Login here
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
