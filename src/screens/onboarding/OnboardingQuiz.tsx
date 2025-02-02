import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme, useThemeMode } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR } from '@app/utils/colors';
import Option1 from '@app/icons/option_1';
import Option2 from '@app/icons/option_2';
import Option3 from '@app/icons/option_3';
import Option4 from '@app/icons/option_4';
import Option5 from '@app/icons/option_5';
import { i18n } from '@app/localization/i18n';
import { Progress } from '@app/components/utils/Progress';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { ONBOARDING_STEPS } from '@app/utils/constants';
import { getQuizQuestions } from '@app/utils/quiz';

type Props = NativeStackScreenProps<MainStackParamList, 'OnboardingQuiz'>;

export default function OnboardingQuiz({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const quizQuestions = getQuizQuestions(i18n);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    {
      question: string;
      option: string;
      job: string;
    }[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<
    {
      question: string;
      option: string;
      job: string;
    }[]
  >([]);
  const isFirstMount = useRef(true);

  const optionLabels = [Option1, Option2, Option3, Option4, Option5];

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      setAnswers([]);
      setSelectedOptions([]);
      setCurrentQuestionIndex(0);
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    setAnswers([]);
    setSelectedOptions([]);
    setCurrentQuestionIndex(0);
    isFirstMount.current = false;
  }, []);

  const handleGoBack = () => {
    if (currentQuestionIndex === 0) {
      localAnalytics().logEvent('OnboardingQuizBackToStart', {
        screen: 'OnboardingQuiz',
        action: 'BackClickedToStart',
        userId: authContext.userId,
      });
      navigation.goBack();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousSelectedAnswers = answers.filter(
        (a) => a.question === quizQuestions[currentQuestionIndex - 1].question,
      );
      setSelectedOptions(previousSelectedAnswers);
      localAnalytics().logEvent('OnboardingQuizBackClicked', {
        screen: 'OnboardingQuiz',
        action: 'BackClicked',
        userId: authContext.userId,
        currentQuestionIndex,
        oldAnswers: previousSelectedAnswers,
      });
    }
  };

  const handleSelectOption = (option: string, job: string) => {
    if (selectedOptions.find((o) => o.option === option)) {
      setSelectedOptions(selectedOptions.filter((a) => a.option !== option));
    } else {
      setSelectedOptions([
        ...selectedOptions,
        { option, job, question: quizQuestions[currentQuestionIndex].question },
      ]);
    }
  };
  const handleNextQuestion = () => {
    localAnalytics().logEvent('OnboardingQuizNextClicked', {
      screen: 'OnboardingQuiz',
      action: 'NextClicked',
      userId: authContext.userId,
      question: quizQuestions[currentQuestionIndex].question,
      selectedOptions,
    });

    if (currentQuestionIndex === quizQuestions.length - 1) {
      const answersParam = [...answers, ...selectedOptions];
      const jobPriorities = {
        getting_to_know_partner: 10,
        having_fun_and_entertainment: 9,
        having_and_discussing_sex: 8,
        understanding_mutual_compatibility: 7,
        improving_communication: 6,
        solving_relationship_problems: 5,
        having_meaningful_conversations: 4,
        discussing_difficult_topics: 3,
        planning_for_future: 2,
        building_trust: 1,
      };

      const jobCounts = answersParam.reduce((acc, o) => {
        acc[o.job] = ((acc[o.job] as number) || 0) + 1;
        return acc;
      }, {});
      const jobsArray = Object.keys(jobPriorities).map((job) => ({
        job,
        count: jobCounts[job] || 0,
        priority: jobPriorities[job],
      }));

      // Step 3: Sort jobs by count descending, then by priority descending
      jobsArray.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.priority - a.priority;
      });

      // Step 4: Select top two jobs
      let finalJobs: string[] = [];
      for (let i = 0; i < jobsArray.length && finalJobs.length < 2; i++) {
        if (jobsArray[i].count > 0) {
          finalJobs.push(jobsArray[i].job);
        }
      }

      if (finalJobs.length < 1) {
        finalJobs = ['getting_to_know_partner'];
      }

      localAnalytics().logEvent('OnboardingQuizCompleted', {
        screen: 'OnboardingQuiz',
        action: 'Completed',
        userId: authContext.userId,
        answersParam,
        finalJobs,
      });
      if (route.params.isOnboarding) {
        navigation.navigate('Analyzing', { jobs: finalJobs });
      } else {
        navigation.navigate('OnboardingPlan', {
          isOnboarding: false,
          refreshTimeStamp: new Date().toISOString(),
        });
      }
    } else {
      const allAnswers = [...answers, ...selectedOptions];
      setAnswers(allAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // this is for the case when we go back and forth
      const nextSelectedAnswers = answers.filter(
        (a) => a.question === quizQuestions[currentQuestionIndex + 1].question,
      );
      setSelectedOptions(nextSelectedAnswers);
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentOptions = currentQuestion.options;

  const progress = currentQuestionIndex;
  const QUIZ_STEP = 6;
  const currentIndex = QUIZ_STEP + progress;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR, paddingHorizontal: 20 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 20,
          justifyContent: 'space-between',
        }}
      >
        <GoBackButton onPress={handleGoBack} />
        <Progress current={currentIndex} all={ONBOARDING_STEPS}></Progress>
        <View
          style={{
            borderRadius: 40,
            backgroundColor: theme.colors.white,
          }}
        >
          <TouchableOpacity style={{ padding: 10 }} onPress={handleNextQuestion}>
            <FontText>{i18n.t('skip')}</FontText>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <View>
          {currentQuestion && (
            <FontText h3 style={{ marginBottom: 20 }}>
              {currentQuestion.question}
            </FontText>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
          }}
        >
          <FontText style={{ color: theme.colors.grey5, marginBottom: 12 }}>
            {i18n.t('onboarding_quiz_tip')}
          </FontText>
          {currentOptions.slice(0, 5).map((opt, index) => {
            const Label = optionLabels[index % optionLabels.length];
            const isSelected = selectedOptions.find((o) => o.option === opt.option);
            return (
              <TouchableOpacity
                key={opt.option}
                onPress={() => {
                  void handleSelectOption(opt.option, opt.job);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.white,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 8,
                  gap: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.colors.black : theme.colors.white,
                }}
              >
                <Label width={24} height={24} />
                <FontText normal style={{ flex: 1 }}>
                  {opt.option}
                </FontText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <PrimaryButton
        disabled={!selectedOptions.length}
        buttonStyle={{ marginTop: '5%', marginBottom: '2%' }}
        title={i18n.t('next')}
        onPress={handleNextQuestion}
      />
    </SafeAreaView>
  );
}
