import React, { useEffect, useState } from 'react';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, Button } from '@rneui/themed';
import { OnboardingAnswer, OnboardingQuestion } from '@app/types/domain';
import { supabase } from '@app/api/initSupabase';
import SurveyView from '@app/components/common/SurveyView';
import { FontText } from '@app/components/utils/FontText';
import { logErrors } from '@app/utils/errors';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Placement'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        if (route.params.questions) {
          setQuestions(route.params.questions);
        } else {
          const { data, error, status } = await supabase
            .from('onboarding_question')
            .select(
              `
            id, slug, content, order, 
            onboarding_answer (
              id, slug, content, order
            )
          `,
            )
            .order('order', { ascending: true })
            .order('order', { foreignTable: 'onboarding_answer', ascending: true });

          if (error && status !== 406) {
            throw error;
          }

          if (data) {
            const questions = data.map(
              (q) =>
                ({
                  id: q.id,
                  slug: q.slug,
                  title: q.content,
                  order: q.order,
                  answers: (Array.isArray(q.onboarding_answer)
                    ? q.onboarding_answer
                    : [q.onboarding_answer]
                  ).map(
                    (a) =>
                      a &&
                      ({
                        id: a.id,
                        slug: a.slug,
                        title: a.content,
                        order: a.order,
                      } as OnboardingAnswer),
                  ),
                } as OnboardingQuestion),
            );
            setQuestions(questions);
          }
        }
      } catch (error) {
        logErrors(error);
      } finally {
        setLoading(false);
      }
    };
    void getQuestions();
  }, [route.params.questions]);

  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const questionIndex = route.params.questionIndex ?? 0;
  const currentQuestion = questions?.[questionIndex];
  const userAnswers = route.params.userAnswers;
  const isNextQuestion = questionIndex + 1 < questions.length;

  const handlePressBack = () => {
    void localAnalytics().logEvent('PlacementBackClicked', {
      screen: 'Placement',
      action: 'Back is clicked',
      userId: ANON_USER,
      questionIndex: route.params.questionIndex,
    });
    if (questionIndex === 0) {
      navigation.navigate('PrePlacement', {
        ...route.params,
      });
    } else {
      navigation.navigate('Placement', {
        ...route.params,
        userAnswers,
        questionIndex: questionIndex - 1,
      });
    }
  };
  const handleNextPress = (chosenValue) => {
    void localAnalytics().logEvent('PlacementNextClicked', {
      screen: 'Placement',
      action: 'Next is clicked',
      userId: ANON_USER,
      questionIndex: route.params.questionIndex,
    });
    if (chosenValue) {
      userAnswers.push({ question: currentQuestion, answer: chosenValue });
      if (isNextQuestion) {
        // micro delay between answers
        setTimeout(() => {
          navigation.navigate('Placement', {
            ...route.params,
            questions,
            questionIndex: questionIndex + 1,
            userAnswers,
          });
        }, 200);
      } else {
        navigation.navigate('PlacementRelationshipState', { ...route.params, userAnswers });
      }
    }
  };

  const progressValue =
    questionIndex === undefined ? 0 : (questionIndex + 1) / (questions.length ?? 1);
  return (
    <SurveyView
      loading={loading}
      title={currentQuestion?.title || ''}
      progress={progressValue}
      progressText={`${questionIndex + 1}/${questions.length}`}
      showButton={false}
      onPress={() => {}}
      onBackPress={handlePressBack}
      buttonText={''}
    >
      {currentQuestion?.answers.map((a) => (
        <Button
          onPress={() => handleNextPress(a)}
          type="outline"
          key={a.id}
          buttonStyle={{
            borderRadius: 16,
            padding: 30,
            borderColor: 'rgba(130, 79, 231, 0.2)',
            borderWidth: 1,
            opacity: 1,
          }}
          activeOpacity={0.5}
          containerStyle={{
            marginVertical: 5,
          }}
        >
          <FontText
            style={{
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              textAlign: 'left',
              flexGrow: 1,
              marginHorizontal: 20,
              fontSize: 16,
            }}
          >
            {a.title}
          </FontText>
        </Button>
      ))}
    </SurveyView>
  );
}
