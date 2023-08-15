import React, { useContext, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { FontText } from '../utils/FontText';
import { ScrollView } from 'react-native-gesture-handler';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import Feedback1Icon from '@app/icons/feedback1';

import SmallArrowRight from '@app/icons/small_arrow_right';

export default function (props: {
  lowPersonalization: boolean;
  topic?: string;
  onNextPress: (topic: string) => void;
  goToReflection: () => void;
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    tag: {
      borderRadius: 20,
      margin: 3,
      borderWidth: 1,
      borderColor: theme.colors.white,
      backgroundColor: theme.colors.white,
      color: theme.colors.black,
      padding: 20,
    },
    selectedTag: {
      borderColor: theme.colors.black,
    },
  });
  const authContext = useContext(AuthContext);
  const randomTopic = i18n.t('date.topic.surprise');
  const intimacy = i18n.t('date.topic.intimacy');
  const allTopics = [
    i18n.t('date.topic.emotions'),
    i18n.t('date.topic.fun'),
    i18n.t('date.topic.worldview'),
    intimacy,
    i18n.t('date.topic.goals'),
    i18n.t('date.topic.future'),
    i18n.t('date.topic.communication'),
    i18n.t('date.topic.preferences'),
    i18n.t('date.topic.appearance'),
    i18n.t('date.topic.travel'),
    i18n.t('date.topic.career'),
    i18n.t('date.topic.expectations'),
    i18n.t('date.topic.values'),
    i18n.t('date.topic.gifts'),
    i18n.t('date.topic.friends'),
    i18n.t('date.topic.childhood'),
    i18n.t('date.topic.commitment'),
    i18n.t('date.topic.past'),
    i18n.t('date.topic.ex'),
    i18n.t('date.topic.fidelity'),
    i18n.t('date.topic.trust'),
    i18n.t('date.topic.money'),
    i18n.t('date.topic.conflict'),
    i18n.t('date.topic.social_circle'),
    i18n.t('date.topic.love_language'),
    i18n.t('date.topic.mental_health'),
    i18n.t('date.topic.parents'),
    i18n.t('date.topic.children'),
    i18n.t('date.topic.living_together'),
  ];

  const [pickedTopic, setPickedTopic] = useState<string>(props.topic || randomTopic);

  const isPressEnabled = !!pickedTopic;

  return (
    <View style={{ flex: 1, marginTop: '5%' }}>
      <ScrollView
        style={{
          flexGrow: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            void localAnalytics().logEvent('ConfigureDateGoToReflection', {
              screen: 'ConfigureDate',
              action: 'GoToReflection',
              userId: authContext.userId,
            });
            props.goToReflection();
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.colors.white,
              padding: 20,
              borderRadius: 16,
              marginBottom: '10%',
              width: '100%',
            }}
          >
            <Feedback1Icon height={32} width={32}></Feedback1Icon>
            <View style={{ width: '75%' }}>
              <FontText>{i18n.t('date.low_quality_explanation')}</FontText>
            </View>
            <SmallArrowRight height={24} width={24}></SmallArrowRight>
          </View>
        </TouchableOpacity>
        <FontText
          style={{
            textAlign: 'left',
          }}
          h1
        >
          {i18n.t('date.topic_title_first')}
          <FontText style={{ color: theme.colors.primary }} h1>
            {i18n.t('date.topic_title_second')}
          </FontText>
          {i18n.t('date.topic_title_third')}
        </FontText>
        <View
          style={{ marginVertical: '5%', flexDirection: 'row', width: '100%', flexWrap: 'wrap' }}
        >
          {[randomTopic, ...allTopics].map((t, i) => (
            <TouchableOpacity key={i} onPress={() => setPickedTopic(t)}>
              <View style={pickedTopic === t ? [styles.tag, styles.selectedTag] : styles.tag}>
                <FontText>{t}</FontText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <PrimaryButton
        containerStyle={{
          width: '100%',
        }}
        disabled={!isPressEnabled}
        onPress={() => {
          if (pickedTopic === randomTopic) {
            void localAnalytics().logEvent('ChooseDateTopicsRandomTopicChosen', {
              screen: 'ChooseDateTopics',
              action: 'RandomTopicChosen',
              userId: authContext.userId,
            });
            props.onNextPress(allTopics[Math.floor(Math.random() * allTopics.length)]);
          } else if (pickedTopic === intimacy) {
            void localAnalytics().logEvent('ChooseDateTopicsSpicyTopicChosen', {
              screen: 'ChooseDateTopics',
              action: 'SpicyTopicChosen',
              userId: authContext.userId,
            });
            props.onNextPress('Intimacy');
          } else {
            void localAnalytics().logEvent('ChooseDateTopicsSpecificTopicChosen', {
              screen: 'ChooseDateTopics',
              action: 'SpecificTopicChosen',
              topic: pickedTopic,
              userId: authContext.userId,
            });
            props.onNextPress(pickedTopic);
          }
        }}
      >
        {i18n.t('continue')}
      </PrimaryButton>
    </View>
  );
}
