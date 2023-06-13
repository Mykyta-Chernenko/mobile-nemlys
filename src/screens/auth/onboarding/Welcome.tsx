import React, { useEffect } from 'react';
import { Image, ImageBackground, SafeAreaView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Welcome'>) {
  useEffect(() => {
    void localAnalytics().logEvent('WelcomeVisited', {
      screen: 'Welcome',
      action: 'Visited Welcome screen',
      userId: ANON_USER,
    });
  }, []);
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
        width: '100%',
      }}
      source={require('../../../../assets/images/onboarding_background.png')}
    >
      <Image
        style={{
          resizeMode: 'cover',
          width: '100%',
        }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../../assets/images/buddys.png')}
      />
      <SafeAreaView style={{ flexGrow: 1, width: '100%' }}>
        <View
          style={{
            paddingHorizontal: 15,
            marginTop: -30,
            marginBottom: '10%',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <View>
            <FontText
              style={{
                textAlign: 'center',
                fontWeight: '600',
              }}
              h1
            >
              {i18n.t('welcome.title')}
            </FontText>
          </View>

          <PrimaryButton
            title={i18n.t('welcome.button.default')}
            onPress={() => {
              void localAnalytics().logEvent('WelcomeNextClicked', {
                screen: 'Welcome',
                action: 'Clicked on next on Welcome',
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
              navigation.navigate('Login');
            }}
          />
          {/* <FontText>{i18n.t('welcome.pre_join_text')}</FontText>
            <Button
              title={i18n.t('welcome.join_button.default')}
              onPress={() => {
                navigation.navigate('JoinPartner');
              }}
              disabled={disabled}
            /> */}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
