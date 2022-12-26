import React, { useEffect, useState } from 'react';
import { useTheme, CheckBox, Button } from '@rneui/themed';
import {
  CompleteSetQuestionProps,
  MainNavigationProp,
  MainStackParamList,
} from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import SurveyView from '@app/components/common/SurveyView';
import { Platform, TextInput, View } from 'react-native';
import { FeedbackChoice, FeedbackQuestion, UserFeedbackAnswer } from '@app/types/domain';
import { FontText } from '@app/components/utils/FontText';
import { UNEXPECTED_ERROR } from '@app/utils/constants';

export const goBackToThePreviousQuestion = (
  navigation: MainNavigationProp,
  userAnswers: UserFeedbackAnswer[],
  questionIndex: number | undefined,
  params: CompleteSetQuestionProps,
) => {
  const index = questionIndex ?? 0;

  const newIndex = index - 1;
  const newUserAnswers = userAnswers.filter((i, ind) => {
    return ind < newIndex;
  });

  if (index > 0) {
    navigation.navigate('CompleteSetQuestion', {
      ...params,
      userAnswers: newUserAnswers,
      questionIndex: newIndex,
    });
  } else {
    navigation.navigate('CompleteSetReflect', {
      ...params,
    });
  }
};
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CompleteSetQuestion'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<FeedbackQuestion[] | undefined>(undefined);
  const [choiceAnswer, setChoiceAnswer] = useState<FeedbackChoice | undefined>(undefined);
  const [boolAnswer, setBoolAnswer] = useState<boolean | undefined>(undefined);
  const [textAnswer, setTextAnswer] = useState<string | undefined>(undefined);
  const questionIndex = route.params.questionIndex ?? 0;
  const currentQuestion = questions?.[questionIndex];
  const userAnswers = route.params.userAnswers;
  const isNextQuestion = questionIndex + 1 < (questions?.length ?? 0);
  const progressValue =
    0.1 +
    (questionIndex === undefined ? 0 : 0.7 * ((questionIndex + 1) / (questions?.length ?? 1)));

  useEffect(() => {
    const getQuestions = async () => {
      setLoading(true);
      try {
        if (route.params.questions) {
          setQuestions(route.params.questions);
        } else {
          const { data, error } = await supabase
            .from('feedback_question')
            .select(
              `
            id, title, order, type,
            feedback_choice (
              id, title, order
            )
          `,
            )
            .order('order', { ascending: true })
            .order('order', { foreignTable: 'feedback_choice', ascending: true });

          if (error) {
            alert(error.message ?? i18n.t(UNEXPECTED_ERROR));
            return;
          }

          if (data) {
            const questions = data.map(
              (q) =>
                ({
                  id: q.id,
                  title: q.title,
                  order: q.order,
                  type: q.type,
                  answers:
                    q.feedback_choice &&
                    (Array.isArray(q.feedback_choice)
                      ? q.feedback_choice
                      : [q.feedback_choice]
                    ).map(
                      (a) =>
                        a &&
                        ({
                          id: a.id,
                          title: a.title,
                          order: a.order,
                        } as FeedbackChoice),
                    ),
                } as FeedbackQuestion),
            );
            setQuestions(questions);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    void getQuestions();
  }, [route.params.questions]);
  const handleBack = () => {
    goBackToThePreviousQuestion(
      navigation,
      route.params.userAnswers,
      route.params.questionIndex,
      route.params,
    );
  };

  const handlePress = (
    choiceAnswer: FeedbackChoice | undefined,
    boolAnswer: boolean | undefined,
  ) => {
    if (currentQuestion) {
      const finalTextAnswer =
        currentQuestion.type === 'text' && textAnswer === undefined ? '' : textAnswer;
      const userAnswers = [
        ...route.params.userAnswers,
        {
          type: currentQuestion.type,
          feedback_question_id: currentQuestion.id,
          feedback_choice_id: choiceAnswer?.id,
          text_answer: finalTextAnswer,
          bool_answer: boolAnswer,
        },
      ];
      if (isNextQuestion) {
        setBoolAnswer(undefined);
        setTextAnswer(undefined);
        setChoiceAnswer(undefined);
        navigation.navigate('CompleteSetQuestion', {
          ...route.params,
          questions,
          questionIndex: questionIndex + 1,
          userAnswers,
        });
      } else {
        navigation.navigate('CompleteSetFinal', { ...route.params, userAnswers });
      }
    }
  };

  let mainCointent = <View></View>;
  if (currentQuestion?.type === 'text') {
    mainCointent = (
      <TextInput
        multiline={Platform.OS === 'ios'} // true is needed on IPhone so that the placeholder is at the top, but it breaks the return button for Adnroid
        placeholder={i18n.t('input_here')}
        style={{
          height: 200,
          textAlignVertical: 'top',
          borderColor: theme.colors.primary,
          backgroundColor: 'white',
          borderWidth: 1,
          padding: 10,
        }}
        onChangeText={setTextAnswer}
        onSubmitEditing={() => handlePress(undefined, undefined)}
        returnKeyType="done"
        returnKeyLabel="done"
      />
    );
  } else if (currentQuestion?.type === 'choice') {
    mainCointent = (
      <View
        style={{
          flex: 5,
          paddingLeft: 15,
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        {currentQuestion?.answers?.map((a) => (
          <Button
            onPress={() => handlePress(a, undefined)}
            type="outline"
            key={a.id}
            containerStyle={{
              width: '100%',
              padding: 5,
            }}
          >
            <FontText
              style={{
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {a.title}
            </FontText>
          </Button>
        ))}
      </View>
    );
  } else if (currentQuestion?.type === 'bool') {
    mainCointent = (
      <View
        style={{
          flex: 5,
          paddingLeft: 15,
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        {[true, false].map((a, i) => (
          <CheckBox
            center
            title={a ? i18n.t('yes') : i18n.t('no')}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor={theme.colors.primary}
            checked={boolAnswer === a}
            onPress={() => {
              setBoolAnswer(a);
              handlePress(undefined, a);
            }}
            key={i}
            containerStyle={{
              justifyContent: 'flex-start',
              marginVertical: 0,
              paddingVertical: 5,
            }}
            wrapperStyle={{
              justifyContent: 'flex-start',
            }}
          />
        ))}
      </View>
    );
  }
  return (
    <SurveyView
      loading={loading}
      title={currentQuestion?.title || ''}
      progress={progressValue}
      showButton={currentQuestion?.type == 'text'}
      onPress={() => handlePress(choiceAnswer, boolAnswer)}
      onBackPress={handleBack}
      buttonText={i18n.t('skip')}
    >
      {mainCointent}
    </SurveyView>
  );
}
