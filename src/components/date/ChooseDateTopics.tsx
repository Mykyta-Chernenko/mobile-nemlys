import React, { useContext, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { FontText } from '../utils/FontText';

import { PrimaryButton } from '../buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';

import { JobSlug } from '@app/types/domain';

export default function (props: {
  job: JobSlug;
  topic?: string;
  onNextPress: (topic: string) => void;
  goToReflection: () => void;
}) {
  const topics: Record<JobSlug, [string, string][]> = {
    sex: [
      ['general', i18n.t('topic_sex_general')],
      ['fantasies', i18n.t('topic_sex_fantasies')],
      ['surprises', i18n.t('topic_sex_surprises')],
      ['new_spark', i18n.t('topic_sex_new_spark')],
      ['flirting', i18n.t('topic_sex_flirting')],
      ['kinks', i18n.t('topic_sex_kinks')],
      ['foreplay', i18n.t('topic_sex_foreplay')],
      ['positions', i18n.t('topic_sex_positions')],
      ['experiments', i18n.t('topic_sex_experiments')],
      ['role_playing', i18n.t('topic_sex_role_playing')],
      ['sex_toys', i18n.t('topic_sex_sex_toys')],
      ['communication', i18n.t('topic_sex_communication')],
      ['past', i18n.t('topic_sex_past')],
      ['frequency', i18n.t('topic_sex_frequency')],
      ['masturbation', i18n.t('topic_sex_masturbation')],
      ['vulnerability', i18n.t('topic_sex_vulnerability')],
      ['safety', i18n.t('topic_sex_safety')],
      ['boundaries', i18n.t('topic_sex_boundaries')],
      ['setting', i18n.t('topic_sex_setting')],
      ['needs', i18n.t('topic_sex_needs')],
      ['challenges', i18n.t('topic_sex_challenges')],
    ],
    know: [
      ['general', i18n.t('topic_know_general')],
      ['emotions', i18n.t('topic_know_emotions')],
      ['communication', i18n.t('topic_know_communication')],
      ['love_languages', i18n.t('topic_know_love_languages')],
      ['future', i18n.t('topic_know_future')],
      ['worldview', i18n.t('topic_know_worldview')],
      ['exes', i18n.t('topic_know_exes')],
      ['conflict', i18n.t('topic_know_conflict')],
      ['therapy', i18n.t('topic_know_therapy')],
      ['living_together', i18n.t('topic_know_living_together')],
      ['values', i18n.t('topic_know_values')],
      ['mental_health', i18n.t('topic_know_mental_health')],
      ['past', i18n.t('topic_know_past')],
      ['lifestyle', i18n.t('topic_know_lifestyle')],
      ['trust', i18n.t('topic_know_trust')],
      ['goals', i18n.t('topic_know_goals')],
      ['habits', i18n.t('topic_know_habits')],
      ['social_circle', i18n.t('topic_know_social_circle')],
      ['appearance', i18n.t('topic_know_appearance')],
      ['commitment', i18n.t('topic_know_commitment')],
      ['finances', i18n.t('topic_know_finances')],
      ['exclusivity', i18n.t('topic_know_exclusivity')],
      ['personal_space', i18n.t('topic_know_personal_space')],
      ['travel', i18n.t('topic_know_travel')],
      ['memories', i18n.t('topic_know_memories')],
      ['dreams', i18n.t('topic_know_dreams')],
      ['childhood', i18n.t('topic_know_childhood')],
      ['talents', i18n.t('topic_know_talents')],
      ['gifts', i18n.t('topic_know_gifts')],
      ['education', i18n.t('topic_know_education')],
      ['work', i18n.t('topic_know_work')],
      ['entertainment', i18n.t('topic_know_entertainment')],
      ['sport', i18n.t('topic_know_sport')],
      ['food', i18n.t('topic_know_food')],
      ['challenges', i18n.t('topic_know_challenges')],
      ['milestones', i18n.t('topic_know_milestones')],
      ['spirituality', i18n.t('topic_know_spirituality')],
      ['family', i18n.t('topic_know_family')],
      ['pets', i18n.t('topic_know_pets')],
      ['life_changing', i18n.t('topic_know_life_changing')],
      ['growth', i18n.t('topic_know_growth')],
      ['nature', i18n.t('topic_know_nature')],
      ['wellness', i18n.t('topic_know_wellness')],
      ['social_media', i18n.t('topic_know_social_media')],
      ['politics', i18n.t('topic_know_politics')],
      ['achievements', i18n.t('topic_know_achievements')],
      ['regrets', i18n.t('topic_know_regrets')],
      ['hobbies', i18n.t('topic_know_hobbies')],
    ],
    hard: [
      ['general', i18n.t('topic_hard_general')],
      ['emotions', i18n.t('topic_hard_emotions')],
      ['communication', i18n.t('topic_hard_communication')],
      ['insecurities', i18n.t('topic_hard_insecurities')],
      ['jealousy', i18n.t('topic_hard_jealousy')],
      ['priorities', i18n.t('topic_hard_priorities')],
      ['living_together', i18n.t('topic_hard_living_together')],
      ['love_languages', i18n.t('topic_hard_love_languages')],
      ['exes', i18n.t('topic_hard_exes')],
      ['mental_health', i18n.t('topic_hard_mental_health')],
      ['shared_responsibilities', i18n.t('topic_hard_shared_responsibilities')],
      ['cheating', i18n.t('topic_hard_cheating')],
      ['expectations', i18n.t('topic_hard_expectations')],
      ['finances', i18n.t('topic_hard_finances')],
      ['marriage', i18n.t('topic_hard_marriage')],
      ['children', i18n.t('topic_hard_children')],
      ['secrets', i18n.t('topic_hard_secrets')],
      ['sex', i18n.t('topic_hard_sex')],
      ['legal_issues', i18n.t('topic_hard_legal_issues')],
      ['addictions', i18n.t('topic_hard_addictions')],
      ['therapy', i18n.t('topic_hard_therapy')],
      ['spark', i18n.t('topic_hard_spark')],
      ['aging', i18n.t('topic_hard_aging')],
      ['travel', i18n.t('topic_hard_travel')],
      ['worldview', i18n.t('topic_hard_worldview')],
      ['past', i18n.t('topic_hard_past')],
      ['regrets', i18n.t('topic_hard_regrets')],
      ['trauma', i18n.t('topic_hard_trauma')],
      ['future', i18n.t('topic_hard_future')],
      ['boundaries', i18n.t('topic_hard_boundaries')],
      ['support', i18n.t('topic_hard_support')],
      ['trust', i18n.t('topic_hard_trust')],
      ['health', i18n.t('topic_hard_health')],
      ['fears', i18n.t('topic_hard_fears')],
      ['growth', i18n.t('topic_hard_growth')],
      ['commitment', i18n.t('topic_hard_commitment')],
      ['personal_space', i18n.t('topic_hard_personal_space')],
      ['external_attraction', i18n.t('topic_hard_external_attraction')],
      ['career', i18n.t('topic_hard_career')],
    ],
    meaningful: [
      ['general', i18n.t('topic_meaningful_general')],
      ['purpose', i18n.t('topic_meaningful_purpose')],
      ['dreams', i18n.t('topic_meaningful_dreams')],
      ['culture', i18n.t('topic_meaningful_culture')],
      ['emotions', i18n.t('topic_meaningful_emotions')],
      ['art', i18n.t('topic_meaningful_art')],
      ['science', i18n.t('topic_meaningful_science')],
      ['death', i18n.t('topic_meaningful_death')],
      ['history', i18n.t('topic_meaningful_history')],
      ['moral', i18n.t('topic_meaningful_moral')],
      ['nature', i18n.t('topic_meaningful_nature')],
      ['empathy', i18n.t('topic_meaningful_empathy')],
      ['spirituality', i18n.t('topic_meaningful_spirituality')],
      ['freedom', i18n.t('topic_meaningful_freedom')],
      ['philosophy', i18n.t('topic_meaningful_philosophy')],
      ['psychology', i18n.t('topic_meaningful_psychology')],
      ['values', i18n.t('topic_meaningful_values')],
      ['gratitude', i18n.t('topic_meaningful_gratitude')],
      ['travel', i18n.t('topic_meaningful_travel')],
      ['role_models', i18n.t('topic_meaningful_role_models')],
      ['content', i18n.t('topic_meaningful_content')],
      ['altruism', i18n.t('topic_meaningful_altruism')],
      ['looks', i18n.t('topic_meaningful_looks')],
      ['personality', i18n.t('topic_meaningful_personality')],
      ['friendship', i18n.t('topic_meaningful_friendship')],
      ['mistakes', i18n.t('topic_meaningful_mistakes')],
      ['life_lessons', i18n.t('topic_meaningful_life_lessons')],
      ['fears', i18n.t('topic_meaningful_fears')],
      ['selfesteem', i18n.t('topic_meaningful_selfesteem')],
      ['technology', i18n.t('topic_meaningful_technology')],
      ['passion', i18n.t('topic_meaningful_passion')],
      ['what_if', i18n.t('topic_meaningful_what_if')],
      ['fame', i18n.t('topic_meaningful_fame')],
      ['society', i18n.t('topic_meaningful_society')],
      ['artificial_intelligence', i18n.t('topic_meaningful_artificial_intelligence')],
      ['dilemmas', i18n.t('topic_meaningful_dilemmas')],
      ['wealth', i18n.t('topic_meaningful_wealth')],
      ['traditions', i18n.t('topic_meaningful_traditions')],
      ['sacrifice', i18n.t('topic_meaningful_sacrifice')],
      ['justice', i18n.t('topic_meaningful_justice')],
      ['vulnerability', i18n.t('topic_meaningful_vulnerability')],
      ['inspiration', i18n.t('topic_meaningful_inspiration')],
      ['transformation', i18n.t('topic_meaningful_transformation')],
      ['authenticity', i18n.t('topic_meaningful_authenticity')],
      ['introspection', i18n.t('topic_meaningful_introspection')],
    ],
    fun: [
      ['general', i18n.t('topic_fun_general')],
      ['ice_breakers', i18n.t('topic_fun_ice_breakers')],
      ['foods', i18n.t('topic_fun_foods')],
      ['funny_questions', i18n.t('topic_fun_funny_questions')],
      ['music', i18n.t('topic_fun_music')],
      ['animals', i18n.t('topic_fun_animals')],
      ['movies', i18n.t('topic_fun_movies')],
      ['tv_shows', i18n.t('topic_fun_tv_shows')],
      ['celebrities', i18n.t('topic_fun_celebrities')],
      ['social_media', i18n.t('topic_fun_social_media')],
      ['books', i18n.t('topic_fun_books')],
      ['superpowers', i18n.t('topic_fun_superpowers')],
      ['fashion', i18n.t('topic_fun_fashion')],
      ['vacation', i18n.t('topic_fun_vacation')],
      ['dancing', i18n.t('topic_fun_dancing')],
      ['jokes', i18n.t('topic_fun_jokes')],
      ['quizzes', i18n.t('topic_fun_quizzes')],
      ['weird_facts', i18n.t('topic_fun_weird_facts')],
      ['concerts', i18n.t('topic_fun_concerts')],
      ['pet_peeves', i18n.t('topic_fun_pet_peeves')],
      ['rest', i18n.t('topic_fun_rest')],
      ['sport', i18n.t('topic_fun_sport')],
      ['talents', i18n.t('topic_fun_talents')],
      ['dates', i18n.t('topic_fun_dates')],
      ['family', i18n.t('topic_fun_family')],
      ['friends', i18n.t('topic_fun_friends')],
      ['games', i18n.t('topic_fun_games')],
      ['relationships', i18n.t('topic_fun_relationships')],
      ['flirt', i18n.t('topic_fun_flirt')],
      ['preferences', i18n.t('topic_fun_preferences')],
      ['tattoos', i18n.t('topic_fun_tattoos')],
      ['parties', i18n.t('topic_fun_parties')],
      ['pandemic', i18n.t('topic_fun_pandemic')],
      ['nostalgia', i18n.t('topic_fun_nostalgia')],
      ['fails', i18n.t('topic_fun_fails')],
      ['weekend_activities', i18n.t('topic_fun_weekend_activities')],
      ['plans', i18n.t('topic_fun_plans')],
      ['strange_stories', i18n.t('topic_fun_strange_stories')],
      ['hobbies', i18n.t('topic_fun_hobbies')],
      ['work', i18n.t('topic_fun_work')],
      ['free_time', i18n.t('topic_fun_free_time')],
    ],
    issues: [],
  };
  const job = props.job;
  const jobTitle = i18n.t(`jobs_${job}`);
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
  const allTopics = topics[job];

  const [pickedTopic, setPickedTopic] = useState<string>(props.topic || allTopics[0][0]);

  const isPressEnabled = !!pickedTopic;

  return (
    <View style={{ flex: 1, marginTop: '5%' }}>
      <ScrollView
        style={{
          flexGrow: 1,
        }}
      >
        <FontText style={{ marginVertical: '5%', color: theme.colors.grey5 }}>{jobTitle}</FontText>
        <FontText
          style={{
            textAlign: 'left',
          }}
          h1
        >
          {i18n.t('date_topic_title_first')}
          <FontText style={{ color: theme.colors.primary }} h1>
            {i18n.t('date_topic_title_second')}
          </FontText>
          {i18n.t('date_topic_title_third')}
        </FontText>
        <View
          style={{ marginVertical: '5%', flexDirection: 'row', width: '100%', flexWrap: 'wrap' }}
        >
          {allTopics.map((t, i) => (
            <TouchableOpacity key={i} onPress={() => setPickedTopic(t[0])}>
              <View style={pickedTopic === t[0] ? [styles.tag, styles.selectedTag] : styles.tag}>
                <FontText>{t[1]}</FontText>
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
          void localAnalytics().logEvent('ChooseDateTopicsChosen', {
            screen: 'ChooseDateTopics',
            action: 'Chosen',
            topic: pickedTopic,
            userId: authContext.userId,
          });
          props.onNextPress(pickedTopic);
        }}
      >
        {i18n.t('continue')}
      </PrimaryButton>
    </View>
  );
}
