import json
import os
import sys
from typing import List, Dict

LANGUAGES = [
  'en', 
  'es', 
  'af', 
  'am', 
  'ar', 
  'az', 
  'be', 
  'bg', 
  'bn', 
  'ca', 
  'cs', 
  'da', 
  'de', 
  'el', 
  'et', 
  'eu', 
  'fa', 
  'fil', 
  'fi', 
  'fr', 
  'gl', 
  'gu', 
  'he', 
  'hi', 
  'hr', 
  'hu', 
  'hy', 
  'id', 
  'is', 
  'it', 
  'ja', 
  'ka', 
  'kk', 
  'km', 
  'kn', 
  'ko', 
  'ky', 
  'lt', 
  'lv', 
  'ml', 
  'mk', 
  'mn', 
  'mr', 
  'ms', 
  'my', 
  'ne', 
  'nl', 
  'no', 
  'pa', 
  'pl', 
  'pt', 
  'rm', 
  'ro', 
  'ru', 
  'si', 
  'sk', 
  'sl', 
  'sq', 
  'sr', 
  'sv', 
  'sw', 
  'ta', 
  'te', 
  'th', 
  'tr', 
  'uk', 
  'ur', 
  'vi', 
  'zh_cn', 
  'zh_hk', 
  'zh_tw', 
  'zu', 
]

CONTENT_TYPES = [
    "checkup",
    "question",
    "article",
    "exercise",
    "test",
    "game",
    "journey"
]

def load_json(file_path: str) -> List[Dict]:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: File not found - {file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decoding JSON from file {file_path}: {e}")

def check_content_slugs():
    errors = []
    for content_type in CONTENT_TYPES:
        en_path = os.path.join("en", content_type, "final_content.json")
        try:
            en_content = load_json(en_path)
        except Exception as e:
            errors.append(str(e))
            continue
        en_slugs = {item.get("slug") for item in en_content if item.get("slug")}
        if not en_slugs:
            errors.append(f"No valid slugs found in {en_path}")
            continue
        for language in LANGUAGES:
            if language == "en":
                continue
            lang_path = os.path.join(language, content_type, "final_content.json")
            try:
                lang_content = load_json(lang_path)
            except Exception as e:
                errors.append(str(e))
                continue
            lang_slugs = {item.get("slug") for item in lang_content if item.get("slug")}
            missing = en_slugs - lang_slugs
            if missing:
                for slug in missing:
                    errors.append(f"Missing slug '{slug}' in {lang_path}")
    if errors:
        for err in errors:
            print(err)
        raise Exception("Content slug check failed. See errors above.")
    else:
        print("All slugs exist across all languages and content types.")

def main():
    try:
        check_content_slugs()
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    main()
