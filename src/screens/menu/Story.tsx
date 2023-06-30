import React, { useContext, useEffect, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { KeyboardAvoidingView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import QuestionTriangel from '@app/icons/question_triangle';
import StorySelected from '@app/icons/story_selected';
import DiaryLocked from '@app/icons/diary_locked';
import { i18n } from '@app/localization/i18n';
import { Image } from 'react-native';
import { StoryInput } from '@app/components/onboarding/StoryInput';
import { TouchableOpacity } from 'react-native';
import { localAnalytics } from '@app/utils/analytics';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { logErrorsWithMessage } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Story'>) {
  const { theme } = useTheme();
  const allStories = 4;

  const [completedStories, setCompletedStories] = useState(0);
  const padding = 20;
  const authContext = useContext(AuthContext);
  const getFilledStory = async () => {
    const data = await supabase
      .from('user_profile')
      .select('relationship_story')
      .eq('user_id', authContext.userId)
      .single();
    if (data.error) {
      logErrorsWithMessage(data.error, data.error.message);
      return;
    }
    if (data.data.relationship_story) {
      const story: any[] = JSON.parse(data.data.relationship_story as string);
      setCompletedStories(story.filter((s) => !!s.answer).length);
    }
  };
  useEffect(() => {
    void getFilledStory();
  }, [route.params.refreshTimeStamp]);
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: theme.colors.white,
        }}
      >
        <SafeAreaView style={{ flexGrow: 1 }}>
          <View
            style={{
              flexGrow: 1,
              padding: padding,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.grey1,
                marginHorizontal: -padding,
                height: '10%',
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.white,
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'column',
                      paddingHorizontal: padding,
                      paddingBottom: '3%',
                    }}
                  >
                    <FontText h3>{i18n.t('story.title')}</FontText>
                    <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}>
                      {completedStories}/{allStories} {i18n.t('story.completed')}
                    </FontText>
                  </View>
                  <View
                    style={{
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Image
                      // resizeMode="stretch"
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      source={require('../../../assets/images/story_header.png')}
                      style={{
                        borderBottomRightRadius: 24,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
            <View style={{ flex: 1, marginHorizontal: -padding }}>
              <StoryInput
                onSave={() => {
                  void localAnalytics().logEvent('StoryUpdate', {
                    screen: 'Story',
                    action: 'Updated',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
                buttonText={i18n.t('save')}
                title=""
              ></StoryInput>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.grey1,
                marginHorizontal: -padding,
                height: '10%',
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.white,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingTop: '5%',
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    void localAnalytics().logEvent('StoryHomeClicked', {
                      screen: 'Story',
                      action: 'HomeClicked',
                      userId: authContext.userId,
                    });
                    navigation.navigate('Home', {
                      refreshTimeStamp: new Date().toISOString(),
                    });
                  }}
                >
                  <QuestionTriangel height={32} width={32}></QuestionTriangel>
                  <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                    {i18n.t('home.menu.discuss')}
                  </FontText>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <StorySelected height={32} width={32}></StorySelected>
                  <FontText style={{ marginTop: 5 }}>{i18n.t('home.menu.story')}</FontText>
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <DiaryLocked height={32} width={32}></DiaryLocked>
                  <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                    {i18n.t('home.menu.diary')}
                  </FontText>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
