import os
import json
import re
from typing import Dict, Set, List
exception_list = {
'notification_after_date_after_date_challenge_accepted_29_02_2024_body',
'notification_after_date_after_date_challenge_accepted_29_02_2024_title',
'notification_after_date_after_date_feeling_curious_29_02_2024_body',
'notification_after_date_after_date_feeling_curious_29_02_2024_title',
'notification_after_date_after_date_guess_what_time_29_02_2024_body',
'notification_after_date_after_date_guess_what_time_29_02_2024_title',
'notification_after_date_after_date_morning_sunshine_29_02_2024_body',
'notification_after_date_after_date_morning_sunshine_29_02_2024_title',
'notification_after_date_after_date_time_for_your_relationship_29_02_2024_body',
'notification_after_date_after_date_time_for_your_relationship_29_02_2024_title',
'notification_finish_date_finish_date_dont_leave_love_hanging_29_02_2024_body',
'notification_finish_date_finish_date_dont_leave_love_hanging_29_02_2024_title',
'notification_finish_date_finish_date_oops_29_02_2024_body',
'notification_finish_date_finish_date_oops_29_02_2024_title',
'notification_pre_date_pre_date_lets_pla_game_29_02_2024_body',
'notification_pre_date_pre_date_lets_pla_game_29_02_2024_title',
'notification_pre_date_pre_date_ready_for_a_date_29_02_2024_body',
'notification_pre_date_pre_date_ready_for_a_date_29_02_2024_title',
'notification_pre_date_pre_date_time_to_connect_29_02_2024_body',
'notification_pre_date_pre_date_time_to_connect_29_02_2024_title',
'interview_text_reason_1_title_1',
'interview_text_reason_1_title_2',
'interview_text_reason_1_title_3',
'interview_text_reason_2_title_1',
'interview_text_reason_2_title_2',
'interview_text_reason_2_title_3',
'interview_text_reason_3_title_1',
'interview_text_reason_3_title_2',
'interview_text_reason_3_title_3',
'interview_reason_1_title_1',
'interview_reason_1_title_2',
'interview_reason_1_title_3',
'interview_reason_2_title_1',
'interview_reason_2_title_2',
'interview_reason_2_title_3',
'interview_reason_3_title_1',
'interview_reason_3_title_2',
'interview_reason_3_title_3',
'notification_partner_answered_title',
'notification_partner_joined_description',
'notification_partner_joined_title',
'notification_partner_replied_title',
'notification_remind_answer_title',
'notification_remind_test_title',
'notification_remind_checkup_title',
'notification_remind_game_title',
'notification_remind_exercise_title',
'notification_remind_article_title',
'notification_remind_test_description',
'notification_remind_checkup_description',
'notification_remind_game_description',
'notification_remind_exercise_description',
'notification_remind_article_description',
'explore_content_list_all',
'explore_content_list_question_header_title',
'explore_content_list_question_header_description',
'explore_content_list_game_header_description',
'explore_content_list_game_header_title',
'explore_content_list_checkup_header_description',
'explore_content_list_checkup_header_title',
'explore_content_list_test_header_description',
'explore_content_list_test_header_title',
'explore_content_list_exercise_header_description',
'explore_content_list_exercise_header_title',
'explore_content_list_article_header_description',
'explore_content_list_article_header_title',
'unexpected_error_3',
'unexpected_error',
'onboarding_analyzing_2_text_1',
'onboarding_analyzing_2_text_2',
'onboarding_analyzing_2_text_3',
'getting_to_know_partner',
'having_fun_and_entertainment',
'having_and_discussing_sex',
'understanding_mutual_compatibility',
'improving_communication',
'solving_relationship_problems',
'having_meaningful_conversations',
'discussing_difficult_topics',
'planning_for_future',
'building_trust',
'overcoming_differences',
'improving_relationship_satisfaction',
'exploring_feelings',
'having_new_experiences',
'preparing_for_cohabitation',
'preparing_for_intimacy',
'discussing_religions',
'improving_honesty_and_openness',
'learning_relationship_skills',
'discussing_finances',
'enhancing_love_and_affection',
'rekindling_passion',
'introducing_healthy_habits',
'preparing_for_children',
'preparing_for_marriage',
'notification_daily_content_1_body',
'notification_daily_content_1_title',
'notification_daily_content_2_body',
'notification_daily_content_2_title',
'notification_daily_content_3_body',
'notification_daily_content_3_title',
'notification_daily_content_4_body',
'notification_daily_content_4_title',
'notification_daily_content_5_body',
'notification_daily_content_5_title',
'notification_daily_content_6_body',
'notification_daily_content_6_title',
'notification_daily_content_7_body',
'notification_daily_content_7_title',
'notification_inactivity_1_body',
'notification_inactivity_1_title',
'notification_inactivity_2_body',
'notification_inactivity_2_title',
'notification_inactivity_3_body',
'notification_inactivity_3_title',
'notification_inactivity_4_body',
'notification_inactivity_4_title',
'notification_inactivity_5_body',
'notification_inactivity_5_title',
'notification_inactivity_6_body',
'notification_inactivity_6_title',
'notification_inactivity_7_body',
'notification_inactivity_7_title',
'notification_inactivity_8_body',
'notification_inactivity_8_title',
'notification_love_note_description',
'notification_love_note_title',
'notification_pre_content_1_body',
'notification_pre_content_1_title',
'notification_pre_content_2_body',
'notification_pre_content_2_title',
'notification_remind_question_title',
'notification_streak_1_body',
'notification_streak_1_title',
'notification_streak_2_body',
'notification_streak_2_title',
'notification_streak_3_body',
'notification_streak_3_title',
'onboarding_analyzing_3_text_1',
'onboarding_analyzing_3_text_2',
'onboarding_analyzing_3_text_3',
'love_note_attention',
'love_note_date',
'love_note_hug',
'love_note_love',
'love_note_miss',
'love_note_sex',
'love_note_sorry',
'love_note_talk',
'onboarding_quiz_question_1_option_2_understanding_mutual_compatibility_2',
'onboarding_quiz_question_3_option_2_understanding_mutual_compatibility_2',
'onboarding_quiz_question_4_option_4_understanding_mutual_compatibility_2',
}

def load_json(file_path: str) -> Dict:
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def save_json(file_path: str, data: Dict):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

def get_all_keys(json_obj: Dict, prefix: str = '') -> Set[str]:
    keys = set()
    for key, value in json_obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.update(get_all_keys(value, full_key))
        else:
            keys.add(full_key)
    return keys

def find_translation_keys_in_file(file_path: str) -> Set[str]:
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    pattern = r"t\(['\"](.+?)['\"]"
    return set(re.findall(pattern, content))

def find_all_used_keys(app_dir: str) -> Set[str]:
    used_keys = set()
    for root, _, files in os.walk(app_dir):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                used_keys.update(find_translation_keys_in_file(file_path))
    return used_keys

def remove_key(obj: Dict, key: str):
    parts = key.split('.')
    for part in parts[:-1]:
        if part not in obj or not isinstance(obj[part], dict):
            return
        obj = obj[part]
    if parts[-1] in obj:
        del obj[parts[-1]]

def clean_empty(obj: Dict):
    if not isinstance(obj, dict):
        return obj
    return {k: v for k, v in ((k, clean_empty(v)) for k, v in obj.items()) if not (isinstance(v, dict) and len(v) == 0)}

def check_and_clean_unused_translations(lang_dir: str, app_dir: str):
    all_translation_keys = set()
    file_path = os.path.join(lang_dir, 'english.json')
    translations = load_json(file_path)
    all_translation_keys.update(get_all_keys(translations))

    used_keys = find_all_used_keys(app_dir)
    print("Used keys:", used_keys)

    global exception_list

    unused_keys = all_translation_keys - used_keys - exception_list

    if unused_keys:
        print("Unused translation keys:")
        for key in sorted(unused_keys):
            print(f"{key}")

        confirmation = input("Do you want to remove these unused keys? (yes/no): ").strip().lower()
        if confirmation == 'yes':
            for file_name in os.listdir(lang_dir):
                if file_name.endswith('.json'):
                    file_path = os.path.join(lang_dir, file_name)
                    translations = load_json(file_path)
                    for key in unused_keys:
                        remove_key(translations, key)
                    translations = clean_empty(translations)
                    save_json(file_path, translations)
            print("Unused keys have been removed from all JSON files in the language directory.")
        else:
            print("No changes were made.")
    else:
        print("All translation keys are in use.")

if __name__ == "__main__":
    lang_dir = os.path.abspath(os.path.join('..', 'lang'))
    app_dir = os.path.abspath(os.path.join('..', '..', '..'))
    check_and_clean_unused_translations(lang_dir, app_dir)