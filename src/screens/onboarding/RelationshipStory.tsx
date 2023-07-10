import React, { useContext, useEffect } from 'react';
import { ImageBackground, KeyboardAvoidingView, TouchableOpacity, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { StoryInput } from '@app/components/onboarding/StoryInput';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Progress } from '@app/components/utils/Progress';
import { FontText } from '@app/components/utils/FontText';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'RelationshipStory'>) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);
  const handlePress = () => {
    void localAnalytics().logEvent('RelationshipStoryContinueCLicked', {
      screen: 'RelationshipStory',
      action: 'ContinueCLicked',
      userId: authContext.userId,
    });
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
  };

  const handleSkipDisclaimer = () => {
    void localAnalytics().logEvent('RelationshipStorySkipClicked', {
      screen: 'RelationshipStory',
      action: 'SkipClicked',
      userId: authContext.userId,
    });
    navigation.navigate('SkipRelationshipStory');
  };
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ImageBackground
        style={{
          flexGrow: 1,
        }}
        source={require('../../../assets/images/onboarding_background.png')}
      >
        <SafeAreaView style={{ flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                margin: 20,
                marginBottom: 10,
              }}
            >
              <GoBackButton
                theme="light"
                containerStyle={{ position: 'absolute', left: 0 }}
                onPress={() => {
                  void localAnalytics().logEvent('RelationshipStoryBackClicked', {
                    screen: 'RelationshipStory',
                    action: 'BackClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('RelationshipStoryExplanation');
                }}
              ></GoBackButton>
              <Progress current={6} all={6}></Progress>
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  borderRadius: 40,
                  backgroundColor: theme.colors.white,
                }}
              >
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => void handleSkipDisclaimer()}
                >
                  <FontText>{i18n.t('skip')}</FontText>
                </TouchableOpacity>
              </View>
            </View>

            <StoryInput
              onSave={() => handlePress()}
              buttonText={i18n.t('continue')}
              title={i18n.t('onboarding.relationship_story_first')}
            ></StoryInput>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
