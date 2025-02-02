import json
import os
import sys
from typing import List, Dict

LANGUAGES = [
    "en",
    "es",
    "nl",
    "de",
    "it",
    "fr",
    "ar",
    "bn",
    "zh_cn",
    "zh_tw",
    "zh_hk",
    "hi",
    "ja",
    "pt",
    "fil",
    "id",
    "pl",
    "ro",
    "tr",
    "uk",
    "ru",
    "vi",
    "no",
    "af",
    "sq",
    "hy",
    "az",
    "eu",
    "be",
    "bg",
    "my",
    "ca",
    "hr",
    "cs",
    "da",
    "et",
    "fi",
    "gl",
    "ka",
    "el",
    "gu",
    "he",
    "hu",
    "is",
    "kn",
    "kk",
    "km",
    "ko",
    "ky",
    "lv",
    "lt",
    "mk",
    "ms",
    "mr",
    "mn",
    "ne",
    "fa",
    "pa",
    "sr",
    "si",
    "sk",
    "sl",
    "sw",
    "sv",
    "ta",
    "te",
    "th",
    "ur",
    "zu",
    "am",
    "ml",
    "rm",
]

CONTENT_TYPES = [
    'checkup',
    'question',
    'article',
    'exercise',
    'test',
    'game',
    'journey',
]

def load_json(file_path: str) -> List[Dict]:
    """
    Load a JSON file and return its content.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from file {file_path}: {e}")
        return []

def save_json(data: List[Dict], file_path: str):
    """
    Save data to a JSON file.
    """
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Successfully updated {file_path}")
    except Exception as e:
        print(f"Error saving JSON to file {file_path}: {e}")

def build_en_jobs_map(content_file_path: str) -> Dict[str, List[str]]:
    """
    Build a mapping from 'slug' to 'job' from en/content.json.
    """
    content = load_json(content_file_path)
    en_jobs_map = {}
    for item in content:
        slug = item.get('slug')
        jobs = item.get('job', [])
        if slug:
            en_jobs_map[slug] = jobs
        else:
            print(f"Warning: 'slug' not found in item: {item}")
    return en_jobs_map

def update_language_final_content(language: str, content_type: str, en_jobs_map: Dict[str, List[str]]):
    """
    Update the 'job' in the language's final_content.json based on en_jobs_map.
    """
    final_content_path = os.path.join('.', language, content_type, 'final_content.json')
    if not os.path.exists(final_content_path):
        print(f"Warning: final_content.json does not exist for language '{language}', content type '{content_type}' at {final_content_path}")
        return

    final_content = load_json(final_content_path)
    if not final_content:
        print(f"Warning: final_content.json is empty or invalid for language '{language}', content type '{content_type}'")
        return

    updated = False
    for item in final_content:
        slug = item.get('slug')
        if not slug:
            print(f"Warning: 'slug' not found in item: {item}")
            continue
        if slug in en_jobs_map:
            original_jobs = item.get('job', [])
            new_jobs = en_jobs_map[slug]
            if original_jobs != new_jobs:
                item['job'] = new_jobs
                updated = True
                print(f"Updated jobs for slug '{slug}' in '{language}/{content_type}/final_content.json'")
        else:
            print(f"Warning: Slug '{slug}' not found in en/content.json for content type '{content_type}'")

    if updated:
        save_json(final_content, final_content_path)
    else:
        print(f"No updates made for language '{language}', content type '{content_type}'")

def main():
    # Define the source directory for en
    en_directory = os.path.join('.', 'en')

    for content_type in CONTENT_TYPES:
        print(f"\nProcessing content type: '{content_type}'")
        en_content_file = os.path.join(en_directory, content_type, 'final_content.json')

        if not os.path.exists(en_content_file):
            print(f"Error: en final_content.json does not exist for content type '{content_type}' at {en_content_file}")
            continue

        # Build the slug to jobs map from en/content.json
        en_jobs_map = build_en_jobs_map(en_content_file)
        if not en_jobs_map:
            print(f"Warning: No jobs found in en/final_content.json for content type '{content_type}'")
            continue

        # Iterate through all languages except 'en'
        for language in LANGUAGES:
            if language == 'en':
                continue  # Skip English as it's the source
            print(f"\n  Updating language: '{language}' for content type: '{content_type}'")
            update_language_final_content(language, content_type, en_jobs_map)

    print("\nAll updates completed.")

if __name__ == "__main__":
    main()
