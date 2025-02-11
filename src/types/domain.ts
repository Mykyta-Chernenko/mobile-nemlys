import {
  ARTICLE_COLOR,
  CHECKUP_COLOR,
  EXERCISE_COLOR,
  GAME_COLOR,
  QUESTION_COLOR,
  TEST_COLOR,
} from '@app/utils/colors';

export enum NOTIFICATION_IDENTIFIERS {
  PRE_DATE = 'pre_date:user_id:',
  DATE = 'date:user_id:',
  FINISH_DATE = 'finish_date:user_id:',
  REFLECTION_AFTER_DATE = 'reflection_after_date:user_id:',
}

export enum NOTIFICATION_TYPE {
  PRE_DATE = 'pre_date',
  FINISH_DATE = 'finish_date',
  AFTER_DATE = 'after_date',
  REMIND_REFLECTION = 'remind_reflection',
}

export enum NOTIFICATION_SUBTYPE {
  REMIND_REFLECTION_1 = 'remind_reflection_time_to_reflect_30_09_2023',
  PRE_DATE_1 = 'pre_date_ready_for_a_date_29_02_2024',
  PRE_DATE_2 = 'pre_date_time_to_connect_29_02_2024',
  PRE_DATE_3 = 'pre_date_lets_pla_game_29_02_2024',
  FINISH_DATE_1 = 'finish_date_oops_29_02_2024',
  FINISH_DATE_2 = 'finish_date_dont_leave_love_hanging_29_02_2024',
  AFTER_DATE_1 = 'after_date_time_for_your_relationship_29_02_2024',
  AFTER_DATE_2 = 'after_date_morning_sunshine_29_02_2024',
  AFTER_DATE_3 = 'after_date_guess_what_time_29_02_2024',
  AFTER_DATE_4 = 'after_date_feeling_curious_29_02_2024',
  AFTER_DATE_5 = 'after_date_challenge_accepted_29_02_2024',
}

export enum V3_NOTIFICATION_IDENTIFIERS {
  PRE_CONTENT = 'v3_pre_content:user_id:',
  DAILY_CONTENT = 'v3_daily_content:user_id:',
  INACTIVITY = 'v3_inactivity:user_id:',
  STREAK = 'v3_streak:user_id:',
}

export enum V3_NOTIFICATION_TYPE {
  PRE_CONTENT = 'pre_content',
  DAILY_CONTENT = 'daily_content',
  INACTIVITY = 'inactivity',
  STREAK = 'streak',
}

export enum V3_NOTIFICATION_SUBTYPE {
  PRE_CONTENT_1 = 'pre_content_1',
  PRE_CONTENT_2 = 'pre_content_2',
  DAILY_CONTENT_1 = 'daily_content_1',
  DAILY_CONTENT_2 = 'daily_content_2',
  DAILY_CONTENT_3 = 'daily_content_3',
  DAILY_CONTENT_4 = 'daily_content_4',
  DAILY_CONTENT_5 = 'daily_content_5',
  DAILY_CONTENT_6 = 'daily_content_6',
  DAILY_CONTENT_7 = 'daily_content_7',
  INACTIVITY_1 = 'inactivity_1',
  INACTIVITY_2 = 'inactivity_2',
  INACTIVITY_3 = 'inactivity_3',
  INACTIVITY_4 = 'inactivity_4',
  INACTIVITY_5 = 'inactivity_5',
  INACTIVITY_6 = 'inactivity_6',
  INACTIVITY_7 = 'inactivity_7',
  INACTIVITY_8 = 'inactivity_8',
  STREAK_1 = 'streak_1',
  STREAK_2 = 'streak_2',
  STREAK_3 = 'streak_3',
}

export type JobSlug = 'issues' | 'sex' | 'know' | 'hard' | 'meaningful' | 'fun';

export type ContentType = 'test' | 'game' | 'checkup' | 'question' | 'exercise' | 'article';

export type LoveNoteAction =
  | 'sorry'
  | 'sex'
  | 'miss'
  | 'date'
  | 'talk'
  | 'attention'
  | 'love'
  | 'hug';

export const contentListScreen: Record<
  ContentType,
  | 'V3ExploreTestList'
  | 'V3ExploreGameList'
  | 'V3ExploreCheckupList'
  | 'V3ExploreQuestionList'
  | 'V3ExploreExerciseList'
  | 'V3ExploreArticleList'
> = {
  test: 'V3ExploreTestList',
  game: 'V3ExploreGameList',
  checkup: 'V3ExploreCheckupList',
  question: 'V3ExploreQuestionList',
  exercise: 'V3ExploreExerciseList',
  article: 'V3ExploreArticleList',
};

export const contentDetailScreen: Record<
  ContentType,
  | 'V3ExploreTestDetail'
  | 'V3ExploreGameDetail'
  | 'V3ExploreCheckupDetail'
  | 'V3ExploreQuestionDetail'
  | 'V3ExploreExerciseDetail'
  | 'V3ExploreArticleDetail'
> = {
  test: 'V3ExploreTestDetail',
  game: 'V3ExploreGameDetail',
  checkup: 'V3ExploreCheckupDetail',
  question: 'V3ExploreQuestionDetail',
  exercise: 'V3ExploreExerciseDetail',
  article: 'V3ExploreArticleDetail',
};

// journey: JOURNEY_COLOR,
export const contentTypeBackground: Record<ContentType, string> = {
  test: TEST_COLOR,
  game: GAME_COLOR,
  checkup: CHECKUP_COLOR,
  question: QUESTION_COLOR,
  exercise: EXERCISE_COLOR,
  article: ARTICLE_COLOR,
};
