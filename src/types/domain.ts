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

export type JobSlug = 'issues' | 'sex' | 'know' | 'hard' | 'meaningful' | 'fun';
