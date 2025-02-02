import gettingToKnowPartner from '@app/icons/jobs/getting_to_know_partner';
import havingFunAndEntertainment from '@app/icons/jobs/having_fun_and_entertainment';
import havingAndDiscussingSex from '@app/icons/jobs/having_and_discussing_sex';
import understandingMutualCompatibility from '@app/icons/jobs/understanding_mutual_compatibility';
import improvingCommunication from '@app/icons/jobs/improving_communication';
import solvingRelationshipProblems from '@app/icons/jobs/solving_relationship_problems';
import havingMeaningfulConversations from '@app/icons/jobs/having_meaningful_conversations';
import discussingDifficultTopics from '@app/icons/jobs/discussing_difficult_topics';
import planningForFuture from '@app/icons/jobs/planning_for_future';
import buildingTrust from '@app/icons/jobs/building_trust';
import overcomingDifferences from '@app/icons/jobs/overcoming_differences';
import improvingRelationshipSatisfaction from '@app/icons/jobs/improving_relationship_satisfaction';
import exploringFeelings from '@app/icons/jobs/exploring_feelings';
import havingNewExperiences from '@app/icons/jobs/having_new_experiences';
import preparingForCohabitation from '@app/icons/jobs/preparing_for_cohabitation';
import preparingForIntimacy from '@app/icons/jobs/preparing_for_intimacy';
import discussingReligions from '@app/icons/jobs/discussing_religions';
import improvingHonestyAndOpenness from '@app/icons/jobs/improving_honesty_and_openness';
import learningRelationshipSkills from '@app/icons/jobs/learning_relationship_skills';
import discussingFinances from '@app/icons/jobs/discussing_finances';
import enhancingLoveAndAffection from '@app/icons/jobs/enhancing_love_and_affection';
import rekindlingPassion from '@app/icons/jobs/rekindling_passion';
import introducingHealthyHabits from '@app/icons/jobs/introducing_healthy_habits';
import preparingForChildren from '@app/icons/jobs/preparing_for_children';
import preparingForMarriage from '@app/icons/jobs/preparing_for_marriage';

type JobDetails = {
  title: string;
  description: string;
  research: string;
  statistics: string;
  icon: (props: any) => JSX.Element;
};
export const getJobsDetails = (i18n: {
  t: (key: string) => string;
}): {
  [key: string]: JobDetails;
} => ({
  getting_to_know_partner: {
    title: i18n.t('getting_to_know_partner_title'),
    description: i18n.t('getting_to_know_partner_description'),
    research: i18n.t('getting_to_know_partner_research'),
    statistics: i18n.t('getting_to_know_partner_statistics'),
    icon: gettingToKnowPartner,
  },

  having_fun_and_entertainment: {
    title: i18n.t('having_fun_and_entertainment_title'),
    description: i18n.t('having_fun_and_entertainment_description'),
    research: i18n.t('having_fun_and_entertainment_research'),
    statistics: i18n.t('having_fun_and_entertainment_statistics'),
    icon: havingFunAndEntertainment,
  },

  having_and_discussing_sex: {
    title: i18n.t('having_and_discussing_sex_title'),
    description: i18n.t('having_and_discussing_sex_description'),
    research: i18n.t('having_and_discussing_sex_research'),
    statistics: i18n.t('having_and_discussing_sex_statistics'),
    icon: havingAndDiscussingSex,
  },

  understanding_mutual_compatibility: {
    title: i18n.t('understanding_mutual_compatibility_title'),
    description: i18n.t('understanding_mutual_compatibility_description'),
    research: i18n.t('understanding_mutual_compatibility_research'),
    statistics: i18n.t('understanding_mutual_compatibility_statistics'),
    icon: understandingMutualCompatibility,
  },

  improving_communication: {
    title: i18n.t('improving_communication_title'),
    description: i18n.t('improving_communication_description'),
    research: i18n.t('improving_communication_research'),
    statistics: i18n.t('improving_communication_statistics'),
    icon: improvingCommunication,
  },

  solving_relationship_problems: {
    title: i18n.t('solving_relationship_problems_title'),
    description: i18n.t('solving_relationship_problems_description'),
    research: i18n.t('solving_relationship_problems_research'),
    statistics: i18n.t('solving_relationship_problems_statistics'),
    icon: solvingRelationshipProblems,
  },

  having_meaningful_conversations: {
    title: i18n.t('having_meaningful_conversations_title'),
    description: i18n.t('having_meaningful_conversations_description'),
    research: i18n.t('having_meaningful_conversations_research'),
    statistics: i18n.t('having_meaningful_conversations_statistics'),
    icon: havingMeaningfulConversations,
  },

  discussing_difficult_topics: {
    title: i18n.t('discussing_difficult_topics_title'),
    description: i18n.t('discussing_difficult_topics_description'),
    research: i18n.t('discussing_difficult_topics_research'),
    statistics: i18n.t('discussing_difficult_topics_statistics'),
    icon: discussingDifficultTopics,
  },

  planning_for_future: {
    title: i18n.t('planning_for_future_title'),
    description: i18n.t('planning_for_future_description'),
    research: i18n.t('planning_for_future_research'),
    statistics: i18n.t('planning_for_future_statistics'),
    icon: planningForFuture,
  },

  building_trust: {
    title: i18n.t('building_trust_title'),
    description: i18n.t('building_trust_description'),
    research: i18n.t('building_trust_research'),
    statistics: i18n.t('building_trust_statistics'),
    icon: buildingTrust,
  },

  overcoming_differences: {
    title: i18n.t('overcoming_differences_title'),
    description: i18n.t('overcoming_differences_description'),
    research: i18n.t('overcoming_differences_research'),
    statistics: i18n.t('overcoming_differences_statistics'),
    icon: overcomingDifferences,
  },

  improving_relationship_satisfaction: {
    title: i18n.t('improving_relationship_satisfaction_title'),
    description: i18n.t('improving_relationship_satisfaction_description'),
    research: i18n.t('improving_relationship_satisfaction_research'),
    statistics: i18n.t('improving_relationship_satisfaction_statistics'),
    icon: improvingRelationshipSatisfaction,
  },

  exploring_feelings: {
    title: i18n.t('exploring_feelings_title'),
    description: i18n.t('exploring_feelings_description'),
    research: i18n.t('exploring_feelings_research'),
    statistics: i18n.t('exploring_feelings_statistics'),
    icon: exploringFeelings,
  },

  having_new_experiences: {
    title: i18n.t('having_new_experiences_title'),
    description: i18n.t('having_new_experiences_description'),
    research: i18n.t('having_new_experiences_research'),
    statistics: i18n.t('having_new_experiences_statistics'),
    icon: havingNewExperiences,
  },

  preparing_for_cohabitation: {
    title: i18n.t('preparing_for_cohabitation_title'),
    description: i18n.t('preparing_for_cohabitation_description'),
    research: i18n.t('preparing_for_cohabitation_research'),
    statistics: i18n.t('preparing_for_cohabitation_statistics'),
    icon: preparingForCohabitation,
  },

  preparing_for_intimacy: {
    title: i18n.t('preparing_for_intimacy_title'),
    description: i18n.t('preparing_for_intimacy_description'),
    research: i18n.t('preparing_for_intimacy_research'),
    statistics: i18n.t('preparing_for_intimacy_statistics'),
    icon: preparingForIntimacy,
  },

  discussing_religions: {
    title: i18n.t('discussing_religions_title'),
    description: i18n.t('discussing_religions_description'),
    research: i18n.t('discussing_religions_research'),
    statistics: i18n.t('discussing_religions_statistics'),
    icon: discussingReligions,
  },

  improving_honesty_and_openness: {
    title: i18n.t('improving_honesty_and_openness_title'),
    description: i18n.t('improving_honesty_and_openness_description'),
    research: i18n.t('improving_honesty_and_openness_research'),
    statistics: i18n.t('improving_honesty_and_openness_statistics'),
    icon: improvingHonestyAndOpenness,
  },

  learning_relationship_skills: {
    title: i18n.t('learning_relationship_skills_title'),
    description: i18n.t('learning_relationship_skills_description'),
    research: i18n.t('learning_relationship_skills_research'),
    statistics: i18n.t('learning_relationship_skills_statistics'),
    icon: learningRelationshipSkills,
  },

  discussing_finances: {
    title: i18n.t('discussing_finances_title'),
    description: i18n.t('discussing_finances_description'),
    research: i18n.t('discussing_finances_research'),
    statistics: i18n.t('discussing_finances_statistics'),
    icon: discussingFinances,
  },

  enhancing_love_and_affection: {
    title: i18n.t('enhancing_love_and_affection_title'),
    description: i18n.t('enhancing_love_and_affection_description'),
    research: i18n.t('enhancing_love_and_affection_research'),
    statistics: i18n.t('enhancing_love_and_affection_statistics'),
    icon: enhancingLoveAndAffection,
  },

  rekindling_passion: {
    title: i18n.t('rekindling_passion_title'),
    description: i18n.t('rekindling_passion_description'),
    research: i18n.t('rekindling_passion_research'),
    statistics: i18n.t('rekindling_passion_statistics'),
    icon: rekindlingPassion,
  },

  introducing_healthy_habits: {
    title: i18n.t('introducing_healthy_habits_title'),
    description: i18n.t('introducing_healthy_habits_description'),
    research: i18n.t('introducing_healthy_habits_research'),
    statistics: i18n.t('introducing_healthy_habits_statistics'),
    icon: introducingHealthyHabits,
  },

  preparing_for_children: {
    title: i18n.t('preparing_for_children_title'),
    description: i18n.t('preparing_for_children_description'),
    research: i18n.t('preparing_for_children_research'),
    statistics: i18n.t('preparing_for_children_statistics'),
    icon: preparingForChildren,
  },

  preparing_for_marriage: {
    title: i18n.t('preparing_for_marriage_title'),
    description: i18n.t('preparing_for_marriage_description'),
    research: i18n.t('preparing_for_marriage_research'),
    statistics: i18n.t('preparing_for_marriage_statistics'),
    icon: preparingForMarriage,
  },
});
