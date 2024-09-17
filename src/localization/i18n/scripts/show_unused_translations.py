import os
import json
import re
from typing import Dict, Set, List
exception_list = {
'notification.after_date.after_date_challenge_accepted_29_02_2024.body',
'notification.after_date.after_date_challenge_accepted_29_02_2024.title',
'notification.after_date.after_date_feeling_curious_29_02_2024.body',
'notification.after_date.after_date_feeling_curious_29_02_2024.title',
'notification.after_date.after_date_guess_what_time_29_02_2024.body',
'notification.after_date.after_date_guess_what_time_29_02_2024.title',
'notification.after_date.after_date_morning_sunshine_29_02_2024.body',
'notification.after_date.after_date_morning_sunshine_29_02_2024.title',
'notification.after_date.after_date_time_for_your_relationship_29_02_2024.body',
'notification.after_date.after_date_time_for_your_relationship_29_02_2024.title',
'notification.finish_date.finish_date_dont_leave_love_hanging_29_02_2024.body',
'notification.finish_date.finish_date_dont_leave_love_hanging_29_02_2024.title',
'notification.finish_date.finish_date_oops_29_02_2024.body',
'notification.finish_date.finish_date_oops_29_02_2024.title',
'notification.pre_date.pre_date_lets_pla_game_29_02_2024.body',
'notification.pre_date.pre_date_lets_pla_game_29_02_2024.title',
'notification.pre_date.pre_date_ready_for_a_date_29_02_2024.body',
'notification.pre_date.pre_date_ready_for_a_date_29_02_2024.title',
'notification.pre_date.pre_date_time_to_connect_29_02_2024.body',
'notification.pre_date.pre_date_time_to_connect_29_02_2024.title',
'interview_text.reason_1_title_1',
'interview_text.reason_1_title_2',
'interview_text.reason_1_title_3',
'interview_text.reason_2_title_1',
'interview_text.reason_2_title_2',
'interview_text.reason_2_title_3',
'interview_text.reason_3_title_1',
'interview_text.reason_3_title_2',
'interview_text.reason_3_title_3',
'interview.reason_1_title_1',
'interview.reason_1_title_2',
'interview.reason_1_title_3',
'interview.reason_2_title_1',
'interview.reason_2_title_2',
'interview.reason_2_title_3',
'interview.reason_3_title_1',
'interview.reason_3_title_2',
'interview.reason_3_title_3',
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
            print(f"  - {key}")

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