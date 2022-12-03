import React from 'react';
import { View } from 'react-native';
import { Card, Icon, Text, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { UserOnboardingAnswer } from '@app/types/domain';

export default function (props: { userAnswers: UserOnboardingAnswer[] }) {
  const { theme } = useTheme();
  type AnswerSlug = 'dating_length' | 'open' | 'well_covered' | 'to_cover';
  const slugs: AnswerSlug[] = ['dating_length', 'open', 'well_covered', 'to_cover'];
  const getAnswersForQuestion = (slug: AnswerSlug) => {
    const answer = props.userAnswers.find((a) => a.question.slug == slug);
    return answer?.answer ?? { slug: 'uknknown_question' };
  };

  const getAnswerFor = (slug: AnswerSlug) => {
    switch (slug) {
      case 'dating_length':
        return getTitleForDatingLength(getAnswersForQuestion('dating_length').slug);
      case 'open':
        return getTitleForOpen(getAnswersForQuestion('open').slug);
      case 'well_covered':
        return getCoveredAndToCoperTopics().covered.join(', ') || '-';
      case 'to_cover':
        return getCoveredAndToCoperTopics().toCover.join(', ');
      default:
        return 'uknnown';
    }
  };
  const getTitleForDatingLength = (answerSlug: string) => {
    return i18n.t(`register.questions.dating_length.answers.${answerSlug}`);
  };
  const getTitleForOpen = (answerSlug: string) => {
    return i18n.t(`register.questions.open.answers.${answerSlug}`);
  };
  const getCoveredAndToCoperTopics = () => {
    const questionSlugs = ['relationship-image', 'time', 'values'];
    const covered: string[] = [];
    const toCover: string[] = ['commitment', 'past', 'emotions', 'conflict'];
    questionSlugs.map((s) => {
      const answer = props.userAnswers.find((a) => a.question.slug === s);
      if (!answer) return;
      if (parseInt(answer.answer.slug.slice(-1)) > 7) {
        covered.push(s);
      } else {
        toCover.push(s);
      }
    });
    return {
      covered: covered.map((c) => i18n.t(`register.questions.topics.${c}`)),
      toCover: toCover.map((c) => i18n.t(`register.questions.topics.${c}`)),
    };
  };
  const results = slugs.map((s) => ({
    title: i18n.t(`register.questions.${s}.title`),
    answer: getAnswerFor(s),
  }));

  return (
    <View
      style={{
        marginBottom: '3%',
      }}
    >
      <Card>
        <Card.Title h4>{i18n.t('register.results')}</Card.Title>
        <Card.Divider />
        {results.map((r, i) => {
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', margin: '2%' }}>
              <Icon name="beenhere" color={theme.colors.primary} />
              <View style={{ flexDirection: 'column', marginHorizontal: '2%' }}>
                <Text style={{ fontSize: 16, color: theme.colors.grey2 }}>{r.title}</Text>
                <Text style={{ fontWeight: 'bold' }}>{r.answer}</Text>
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
