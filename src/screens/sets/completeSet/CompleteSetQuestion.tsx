import React, { useEffect, useState } from 'react';
import { useTheme, CheckBox } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import SurveyView from '@app/components/common/SurveyView';
import { TextInput, View } from 'react-native';
import { FeedbackChoice, FeedbackQuestion } from '@app/types/domain';

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
          const { data, error, status } = await supabase
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
            alert(error.message ?? i18n.t('unexpected_error'));
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
    if (questionIndex === undefined || questionIndex === 0) {
      navigation.navigate('CompleteSetReflect', {
        ...route.params,
      });
    } else {
      navigation.navigate('CompleteSetQuestion', {
        ...route.params,
        userAnswers: userAnswers.filter((i, ind) => ind <= questionIndex),
        questionIndex: questionIndex - 1,
      });
    }
  };
  console.log(userAnswers);
  const handlePress = (
    choiceAnswer: FeedbackChoice | undefined,
    boolAnswer: boolean | undefined,
  ) => {
    if (currentQuestion) {
      const finalTextAnswer =
        currentQuestion.type === 'text' && textAnswer === undefined ? '' : textAnswer;
      userAnswers.push({
        type: currentQuestion.type,
        feedback_question_id: currentQuestion.id,
        feedback_choice_id: choiceAnswer?.id,
        text_answer: finalTextAnswer,
        bool_answer: boolAnswer,
      });
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
        multiline={true}
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
        returnKeyType="done"
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
          <CheckBox
            center
            title={a.title}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor={theme.colors.primary}
            checked={choiceAnswer?.id === a.id}
            onPress={() => {
              setChoiceAnswer(a);
              handlePress(a, undefined);
            }}
            key={a.id}
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
      buttonText={i18n.t('finish')}
    >
      {mainCointent}
    </SurveyView>
  );
}
