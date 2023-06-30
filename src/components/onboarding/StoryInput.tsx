import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Loading } from '../utils/Loading';
import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessage } from '@app/utils/errors';

export const StoryInput = (props: { onSave: () => void; title: string; buttonText: string }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const paddingHorizontal = 20;
  const [loading, setLoading] = useState<boolean>(false);

  const [answer0, setAnswer0] = useState<string>('');
  const [answer1, setAnswer1] = useState<string>('');
  const [answer2, setAnswer2] = useState<string>('');
  const [answer3, setAnswer3] = useState<string>('');

  const questionColors = {
    0: theme.colors.error,
    1: theme.colors.primary,
    2: theme.colors.success,
    3: theme.colors.warning,
  };

  const questionSlug = {
    0: 'challenges',
    1: 'like',
    2: 'milestones',
    3: 'plans',
  };
  const questionAnswers = {
    0: [answer0, setAnswer0],
    1: [answer1, setAnswer1],
    2: [answer2, setAnswer2],
    3: [answer3, setAnswer3],
  };

  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

  const questionLocalizationPrefix = 'onboarding.relationship_story.question';

  const getQuestionText = (index: number) => {
    return `${i18n.t(questionLocalizationPrefix + index.toString() + '_first')}${i18n.t(
      questionLocalizationPrefix + index.toString() + '_second',
    )}${i18n.t(questionLocalizationPrefix + index.toString() + '_third')}`;
  };

  const getQuestionDisplayText = (index: number) => {
    return (
      <>
        {i18n.t(questionLocalizationPrefix + index.toString() + '_first')}
        <FontText style={{ color: questionColors[index] }} h3>
          {i18n.t(questionLocalizationPrefix + index.toString() + '_second')}
        </FontText>
        {i18n.t(questionLocalizationPrefix + index.toString() + '_third')}
      </>
    );
  };
  const getFilledStory = async () => {
    setLoading(true);
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
      const story: any = JSON.parse(data.data.relationship_story as string);
      setAnswer0(story[0].answer as string);
      setAnswer1(story[1].answer as string);
      setAnswer2(story[2].answer as string);
      setAnswer3(story[3].answer as string);
    }
    setLoading(false);
  };
  useEffect(() => {
    void getFilledStory();
  }, []);
  const handlePress = async () => {
    const story: { title: string; answer: string; slug: string }[] = [];
    Object.values(questionAnswers).map((a, index) => {
      story.push({
        title: getQuestionText(index),
        slug: questionSlug[index],
        answer: a[0] as string,
      });
    });

    const dateReponse = await supabase
      .from('user_profile')
      .update({ relationship_story: JSON.stringify(story), onboarding_finished: true })
      .eq('user_id', authContext.userId);
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }

    props.onSave();
  };
  return loading ? (
    <Loading></Loading>
  ) : (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme.colors.grey1,
      }}
      automaticallyAdjustsScrollIndicatorInsets={true}
      ref={scrollViewRef}
    >
      <View style={{ flexGrow: 1, padding: paddingHorizontal }}>
        {props.title && <FontText h1>{props.title}</FontText>}
        <View
          style={{
            margin: -paddingHorizontal,
            marginTop: paddingHorizontal,
            paddingHorizontal: paddingHorizontal,
            paddingBottom: insets.bottom,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flexGrow: 1,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                style={{
                  marginTop: '5%',
                  padding: 20,
                  backgroundColor: theme.colors.white,
                  borderRadius: 16,
                }}
              >
                <FontText
                  style={{
                    textAlign: 'left',
                  }}
                  h3
                >
                  {getQuestionDisplayText(index)}
                </FontText>
                <StyledTextInput
                  value={questionAnswers[index][0]}
                  placeholder={i18n.t('onboarding.relationship_story.answer_placeholder')}
                  style={{ marginTop: 5, padding: 0, borderWidth: 0 }}
                  onChangeText={questionAnswers[index][1]}
                  blurOnSubmit={true}
                ></StyledTextInput>
              </View>
            ))}
          </View>
          <PrimaryButton
            buttonStyle={{ marginTop: '7%', marginBottom: '5%' }}
            disabled={!(answer0 || answer1 || answer2 || answer3)}
            title={props.buttonText}
            onPress={() => void handlePress()}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
