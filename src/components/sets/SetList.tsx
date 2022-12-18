import React from 'react';
import { useTheme } from '@rneui/themed';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import ItemCard from './ItemCard';
import { Question, Action } from '@app/types/domain';
import { FontText } from '../utils/FontText';

export default function (props: { questions: Question[]; actions: Action[]; chosenSet: boolean }) {
  const { theme } = useTheme();

  return (
    <>
      <FontText
        h4
        style={{ color: theme.colors.white, marginBottom: '1%' }}
        h4Style={{ textAlign: 'center' }}
      >
        {props.chosenSet ? i18n.t('set.chosen.questions.title') : i18n.t('set.new.questions.title')}
      </FontText>
      <View>
        {props.questions.map((q) => (
          <ItemCard
            key={q.id}
            type="question"
            title={q.title}
            details={q.details}
            image={q.image}
            tips={q.tips}
            tags={q.tags}
            importance={q.importance}
          ></ItemCard>
        ))}
      </View>
      <FontText
        h4
        style={{ color: theme.colors.white, marginTop: '1%' }}
        h4Style={{ textAlign: 'center' }}
      >
        {props.chosenSet ? i18n.t('set.chosen.actions.title') : i18n.t('set.new.actions.title')}
      </FontText>
      <View>
        {props.actions.map((q) => (
          <ItemCard
            key={q.id}
            type="action"
            title={q.title}
            details={q.details}
            image={q.image}
            tags={[]}
            instruction={q.instruction}
            importance={q.importance}
          ></ItemCard>
        ))}
      </View>
    </>
  );
}
