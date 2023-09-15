import React, { useContext, useEffect, useState } from 'react';
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
import { getIsLowPersonalization } from '@app/api/reflection';
import { Loading } from '../utils/Loading';
import { JobSlug } from '@app/types/domain';
import { supabase } from '@app/api/initSupabase';
import { SupabaseAnswer } from '@app/types/api';
import { logErrors } from '@app/utils/errors';

export default function (props: {
  job: JobSlug;
  topic?: string;
  onNextPress: (topic: string) => void;
  goToReflection: () => void;
}) {
  const job = props.job;
  const jobTitle = i18n.t(`jobs.${job}`);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isLowPersonalization, setIsLowPersonalization] = useState(false);
  const getTopics = async (job: JobSlug): Promise<string[]> => {
    const topics: SupabaseAnswer<{ topic: string }[]> = await supabase
      .from('job_topics')
      .select('topic')
      .eq('job_slug', job)
      .order('id');
    if (topics.error) {
      logErrors(topics.error);
      return [];
    }
    return topics.data.map((t) => t.topic);
  };
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const [lowPersonalization, topics] = await Promise.all([
        getIsLowPersonalization(),
        getTopics(job),
      ]);
      setIsLowPersonalization(lowPersonalization);
      setAllTopics(topics);
      setLoading(false);
    };
    void getData();
  }, [job]);
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
  const [allTopics, setAllTopics] = useState<string[]>([]);

  const [pickedTopic, setPickedTopic] = useState<string>(props.topic || randomTopic);

  const isPressEnabled = !!pickedTopic;

  return loading ? (
    <Loading></Loading>
  ) : (
    <View style={{ flex: 1, marginTop: '5%' }}>
      <ScrollView
        style={{
          flexGrow: 1,
        }}
      >
        {isLowPersonalization && (
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
        )}
        <FontText style={{ marginVertical: '5%', color: theme.colors.grey5 }}>{jobTitle}</FontText>
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
          const random = pickedTopic === randomTopic;
          const topic = random ? 'General' : pickedTopic;

          void localAnalytics().logEvent('ChooseDateTopicsChosen', {
            screen: 'ChooseDateTopics',
            action: 'Chosen',
            random,
            topic,
            userId: authContext.userId,
          });
          props.onNextPress(topic);
        }}
      >
        {i18n.t('continue')}
      </PrimaryButton>
    </View>
  );
}
