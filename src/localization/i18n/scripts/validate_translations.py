import os
import json
from typing import Dict, Set

def load_json(file_path: str) -> Dict:
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def get_all_keys(json_obj: Dict, prefix: str = '') -> Set[str]:
    keys = set()
    for key, value in json_obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        keys.add(full_key)
        if isinstance(value, dict):
            keys.update(get_all_keys(value, full_key))
    return keys

def compare_json_keys(lang_dir: str):
    english_file = os.path.join(lang_dir, 'english.json')
    if not os.path.exists(english_file):
        print(f"Error: {english_file} does not exist.")
        return

    english_keys = get_all_keys(load_json(english_file))

    for filename in os.listdir(lang_dir):
        if filename.endswith('.json') and filename != 'english.json':
            file_path = os.path.join(lang_dir, filename)
            other_keys = get_all_keys(load_json(file_path))

            missing_in_other = english_keys - other_keys
            extra_in_other = other_keys - english_keys

            if missing_in_other or extra_in_other:
                print(f"\nDiscrepancies found in {filename}:")
                if missing_in_other:
                    print("  Keys missing in this file:")
                    for key in missing_in_other:
                        print(f"    - {key}")
                if extra_in_other:
                    print("  Extra keys in this file:")
                    for key in extra_in_other:
                        print(f"    + {key}")
            else:
                print(f"{filename} is good")

if __name__ == "__main__":
    lang_dir = os.path.abspath(os.path.join('..', 'lang'))
    compare_json_keys(lang_dir)