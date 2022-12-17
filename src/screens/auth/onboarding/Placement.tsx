import React, { useEffect, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckBox, Skeleton, Text, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { Progress } from '@app/components/utils/Progress';
import { OnboardingAnswer, OnboardingQuestion } from '@app/types/domain';
import { supabase } from '@app/api/initSupabase';
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
        alert(error.message);
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

  const [chosenValue, setChosenValue] = useState<OnboardingAnswer | undefined>(undefined);
  const buttonDisabled = !chosenValue;

  const handlePressBack = () => {
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
  const handleNextPress = () => {
    if (chosenValue) {
      userAnswers.push({ question: currentQuestion, answer: chosenValue });
      if (isNextQuestion) {
        navigation.navigate('Placement', {
          ...route.params,
          questions,
          questionIndex: questionIndex + 1,
          userAnswers,
        });
        // it does not get back to default when we move to the screen again
        setChosenValue(undefined);
      } else {
        navigation.navigate('HowWeWork', { ...route.params, userAnswers });
      }
    }
  };

  const progressValue =
    0.1 + (questionIndex === undefined ? 0 : 0.7 * ((questionIndex + 1) / (questions.length ?? 1)));
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: 'white',
        paddingVertical: 25,
        paddingHorizontal: 15,
      }}
    >
      <View
        style={{
          marginBottom: 20,
          height: 250,
        }}
      >
        <Image
          resizeMode="contain"
          style={{
            height: '100%',
            width: '100%',
          }}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('../../../../assets/images/placement.png')}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 15,
          marginBottom: 10,
        }}
      >
        {loading ? (
          <Skeleton animation="pulse" style={{ borderRadius: 20 }} />
        ) : (
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            {currentQuestion?.title}
          </Text>
        )}
      </View>
      <View
        style={{
          flex: 5,
          paddingLeft: 15,
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Skeleton animation="pulse" style={{ width: '80%', height: '40%', borderRadius: 20 }} />
        ) : (
          currentQuestion?.answers.map((a) => (
            <CheckBox
              center
              title={a.title}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              checkedColor={theme.colors.primary}
              checked={chosenValue?.id === a.id}
              onPress={() => setChosenValue(a)}
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
          ))
        )}
      </View>
      <View>
        <Progress value={progressValue}></Progress>
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          <GoBackButton onPress={handlePressBack} containerStyle={{ flexGrow: 1 }}></GoBackButton>
          <PrimaryButton
            title={i18n.t('next')}
            disabled={buttonDisabled}
            onPress={handleNextPress}
            containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
