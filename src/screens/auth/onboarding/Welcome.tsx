import React, { useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Welcome'>) {
  const { theme } = useTheme();
  const [name, setName] = useState<string>('');
  const disabled = name.length === 0;
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../../assets/splash.png')}
    >
      <SafeAreaView style={{ flexGrow: 1, width: '100%' }}>
        <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
          <View
            style={{
              marginBottom: 20,
              marginTop: '10%',
              height: '25%',
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: '100%',
                width: '100%',
              }}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('../../../../assets/images/buddies.png')}
            />
          </View>
          <View
            style={{
              paddingHorizontal: 15,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                marginBottom: 20,
                flexDirection: 'column',
              }}
            >
              <View>
                <FontText
                  style={{
                    alignSelf: 'flex-start',
                  }}
                  h3
                >
                  {i18n.t('welcome.title')}
                </FontText>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <FontText
                  style={{
                    alignSelf: 'flex-start',
                    fontWeight: '500',
                  }}
                  h3
                >
                  {i18n.t('welcome.middle')}
                </FontText>
                <FontText
                  style={{
                    alignSelf: 'flex-start',
                  }}
                  h3
                >
                  {i18n.t('welcome.title2')}
                </FontText>
              </View>
            </View>
            <FontText
              style={{
                alignSelf: 'flex-start',
                marginBottom: 20,
                fontSize: 16,
                lineHeight: 22,
                color: theme.colors.grey1,
              }}
            >
              {i18n.t('welcome.pretext')}
            </FontText>
            <Input
              containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
              inputStyle={{ padding: 5 }}
              placeholder={i18n.t('name_placeholder')}
              value={name}
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="done"
              onChangeText={(text) => setName(text)}
            />

            <PrimaryButton
              title={i18n.t('welcome.button.default')}
              onPress={() => {
                void localAnalytics().logEvent('WelcomeOnboardingTestClicked', {
                  screen: 'Welcome',
                  action: 'Onboarding test link clicked',
                  userId: ANON_USER,
                });
                // navigation.navigate('PlacementRelationshipState', {
                //   name: 'Mykyta',
                //   questionIndex: 1,
                //   questions: [
                //     {
                //       id: 22,
                //       slug: 'dating_length',
                //       title: 'How long have you been going out with your partner?',
                //       order: 1,
                //       answers: [
                //         { id: 231, slug: '1-4-weeks', title: '1 - 4 weeks', order: 1 },
                //         { id: 232, slug: '1-3-months', title: '1 - 3 months', order: 2 },
                //         { id: 233, slug: '3-12-months', title: '3 - 12 months', order: 3 },
                //         { id: 234, slug: '12-more-months', title: '12+ months', order: 4 },
                //       ],
                //     },
                //     {
                //       id: 24,
                //       slug: 'open',
                //       title: 'How comfortable are you as a couple discussing deep and hard topics?',
                //       order: 3,
                //       answers: [
                //         { id: 240, slug: 'open-0', title: 'Not at all', order: 1 },
                //         { id: 241, slug: 'open-1', title: 'We can open up a little bit', order: 2 },
                //         {
                //           id: 242,
                //           slug: 'open-2',
                //           title:
                //             'Pretty comfortable, but not deep traumas, fears, goals, and desires yet',
                //           order: 3,
                //         },
                //         {
                //           id: 245,
                //           slug: 'open-5',
                //           title: 'I am much more comfortable to go personal than my partner',
                //           order: 4,
                //         },
                //         {
                //           id: 244,
                //           slug: 'open-4',
                //           title: 'My partner is much more comfortable to go personal than me',
                //           order: 5,
                //         },
                //         {
                //           id: 243,
                //           slug: 'open-3',
                //           title: 'I feel like we can discuss everything',
                //           order: 6,
                //         },
                //       ],
                //     },
                //   ],
                //   userAnswers: [
                //     {
                //       question: {
                //         id: 22,
                //         slug: 'dating_length',
                //       },
                //       answer: { id: 233, slug: '3-12-months' },
                //     },
                //     {
                //       question: {
                //         id: 24,
                //         slug: 'open',
                //       },
                //       answer: {
                //         id: 245,
                //         slug: 'open-5',
                //       },
                //     },
                //   ],
                // });
                navigation.navigate('PrePlacement', {
                  name,
                });
              }}
              disabled={disabled}
            />
            {/* <FontText>{i18n.t('welcome.pre_join_text')}</FontText>
          <Button
            title={i18n.t('welcome.join_button.default')}
            onPress={() => {
              navigation.navigate('JoinPartner');
            }}
            disabled={disabled}
          /> */}
            <SecondaryButton
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
                justifyContent: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('WelcomeLoginClicked', {
                  screen: 'Welcome',
                  action: 'Login link clicked',
                  userId: ANON_USER,
                });
                navigation.navigate('Login');
              }}
            >
              <FontText
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('welcome.login.link')}
              </FontText>
            </SecondaryButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
