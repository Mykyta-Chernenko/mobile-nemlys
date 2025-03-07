import json
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

import openai

PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 0,
    "max_tokens": 4000,
    "top_p": 1,
    "n": 1,
    "stop": None
}

# Maximum number of concurrent workers
MAX_WORKERS = 100

# Number of attempts to call the GPT API before giving up
MAX_RETRIES = 5

# Delay between retries
RETRY_DELAY = 0

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

TRANSLATED = [
    "uk", "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "tr", "ru", "vi", "no", "af", "sq",
    "hy",
    "az", "eu", "be", "bg", "my",
    "ca", "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu", "he", "hu", "is",
    "kn", "kk",
    "ko", "ky", "lv", "lt", "mk", "ms",
    "mr", "mn",
    "ne", "fa", "pa", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te", "th", "ur", "zu", "am", "ml", "rm", "km"
]

# List of all target languages
LANGUAGES = [

]

language_full_name = {
    "uk": "Ukrainian",
    "es": "Spanish",
    "nl": "Dutch",
    "de": "German",
    "it": "Italian",
    "fr": "French",
    "ar": "Arabic",
    "bn": "Bengali",
    "zh_cn": "Chinese (Simplified)",
    "zh_tw": "Chinese (Traditional)",
    "zh_hk": "Chinese (Hong Kong)",
    "hi": "Hindi",
    "ja": "Japanese",
    "pt": "Portuguese",
    "fil": "Filipino",
    "id": "Indonesian",
    "pl": "Polish",
    "ro": "Romanian",
    "tr": "Turkish",
    "ru": "Russian",
    "vi": "Vietnamese",
    "no": "Norwegian",
    "af": "Afrikaans",
    "sq": "Albanian",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bg": "Bulgarian",
    "my": "Burmese",
    "ca": "Catalan",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "et": "Estonian",
    "fi": "Finnish",
    "gl": "Galician",
    "ka": "Georgian",
    "el": "Greek",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hu": "Hungarian",
    "is": "Icelandic",
    "kn": "Kannada",
    "kk": "Kazakh",
    "ko": "Korean",
    "ky": "Kyrgyz",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "ms": "Malay",
    "mr": "Marathi",
    "mn": "Mongolian",
    "ne": "Nepali",
    "fa": "Persian",
    "pa": "Punjabi",
    "sr": "Serbian",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sw": "Swahili",
    "sv": "Swedish",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "ur": "Urdu",
    "zu": "Zulu",
    "am": "Amharic",
    "ml": "Malayalam",
    "rm": "Romansh",
    "km": "Khmer"
}

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


# ------------------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------------------

def read_content_json(filepath: str) -> List[Dict[str, Any]]:
    """
    Reads the JSON data from `filepath` and returns it as a list of dictionaries.
    Returns an empty list if the file does not exist or if JSON is invalid.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logging.warning(f"File '{filepath}' not found or invalid JSON. Returning empty list.")
        return []


def write_content_json(filepath: str, data: List[Dict[str, Any]]) -> None:
    """
    Writes the given list of dictionaries to `filepath` as a pretty-printed JSON.
    Creates directories if they do not exist.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def build_translation_prompt(content_item: Dict[str, Any], target_language: str) -> List[Dict[str, str]]:
    example_input_1 = {
        "title": "How do you cope with disappointment?",
        "job": [
            "exploring_feelings",
            "improving_communication"
        ],
        "slug": "how-do-you-cope-with-disappointment"
    }

    example_output_1_es = {
        "title": "¿Cómo enfrentas la decepción?",
        "job": [
            "exploring_feelings",
            "improving_communication"
        ],
        "slug": "how-do-you-cope-with-disappointment"
    }

    example_input_2 = {
        "title": "What ways do you prefer to say 'I love you' besides words",
        "job": [
            "understanding_mutual_compatibility",
            "building_trust",
            "discussing_difficult_topics"
        ],
        "slug": "how-do-you-define-loyalty-in-our-relationship"
    }

    example_output_2_ukraine = {
        "title": "Які способи ти використовуєш, щоб сказати 'Я тебе кохаю' без слів?",
        "job": [
            "understanding_mutual_compatibility",
            "building_trust",
            "discussing_difficult_topics"
        ],
        "slug": "how-do-you-define-loyalty-in-our-relationship"
    }

    # System message: Contains the instruction prompt and rules tailored for "question" type
    system_prompt = f"""
You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish, 'ти' in Ukranian).
2. Preserve JSON structure: do not change key names. Only modify relevant text fields (title).
2. You MUST translate all the content apart from job and slug, do not use untranslated english words in the final translations if there is a good translations or alternative concept in {language_full_name[target_language]} like the following alternatives in Ukranian: lap dance -> танець на колінах, public affection -> прояв ніжності на людях.
3. Keep 'job' as it is (unchanged).
4. Keep 'slug' as it is (unchanged).
6. If you have to use quotes inside the content like "term", use singular quotes 'term', NEVER double "" quotes inside content, title, description as it ruins JSON, you will be banned for it. All json keys and values are surrounded by double quotes though like "key": "value", it can also be "key": "value and some 'term' some text"
7. Output valid JSON (no extra text) with the same keys as the input. God forbid you do not output valid JSON, simple JSON string as the response, the only option you can take.
8. If something doesn't need translation (like 'job', 'slug'), keep it in English.
9. translation MUST be to {language_full_name[target_language]} not to Ukrainian or Spanish
Ensure that the final translation meets these criteria exactly.
"""

    # Build the 5-message conversation array with updated examples for "question" type
    messages = [
        {"role": "system", "content": system_prompt},

        {"role": "user",
         "content": f"Example input #1: translate this actual item to es:Spanish :\n{json.dumps(example_input_1, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output_1_es, indent=2, ensure_ascii=False)},

        {"role": "user",
         "content": f"Example input #2: translate this actual item to uk:Ukrainian :\n\n{json.dumps(example_input_2, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output_2_ukraine, indent=2, ensure_ascii=False)},

        {"role": "user",
         "content": f"translate this actual item to {target_language}:{language_full_name[target_language]} :\n{json.dumps(content_item, indent=2, ensure_ascii=False)}"}
    ]

    return messages


def fix_quotes_in_title(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the title field value of a JSON string.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "title": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    pattern = r'("title"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def fix_all_quotes(json_str: str) -> str:
    """
    Applies all quote-fixing functions to the JSON string.
    """
    json_str = fix_quotes_in_title(json_str)
    return json_str


def validate_translated_content(original_item: Dict[str, Any], translated_data: Dict[str, Any]) -> None:
    """
    Validates the translated content based on the specified rules for 'question' content type.
    Raises an Exception if validation fails.
    """
    required_keys = original_item.keys()
    translated_keys = translated_data.keys()

    # Check that all required keys are present
    for key in required_keys:
        if key not in translated_keys:
            raise Exception(f"Missing key '{key}' in translated data.")

    # Check that 'job' and 'slug' are unchanged
    if original_item.get('job') != translated_data.get('job'):
        raise Exception("'job' field has been altered in the translated data.")

    if original_item.get('slug') != translated_data.get('slug'):
        raise Exception("'slug' field has been altered in the translated data.")


def call_gpt_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Calls GPT to translate the fields of 'content_item' into 'target_language'.
    Returns a new dictionary with the translated fields or the original data if translation fails.
    """
    messages = build_translation_prompt(content_item, target_language)
    content_text = ''
    # Attempt the GPT call with retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(
                f"Translating '{content_item.get('title', 'Untitled')}' into '{target_language}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages,
                temperature=PARAMS["temperature"],
                max_tokens=PARAMS["max_tokens"],
                top_p=PARAMS["top_p"],
                n=PARAMS["n"],
                stop=PARAMS["stop"],
                response_format={
                    "type": "json_object"
                }
            )
            logging.info('Got response from GPT API.')
            content_text = response.choices[0].message.content.strip()

            # Clean the response
            content_text = content_text.replace("\n", "")
            content_text = content_text.replace("\\", "")
            content_text = content_text.replace("```", "")
            content_text = content_text.replace("*", "")
            content_text = content_text.replace("json", "")
            content_text = fix_all_quotes(content_text.strip())

            translated_data = json.loads(content_text)

            # Validate mandatory fields exist and apply rules:
            validate_translated_content(content_item, translated_data)

            # Keep 'job' and 'slug' as is
            translated_data["job"] = content_item.get("job", [])
            translated_data["slug"] = content_item.get("slug", "")

            return translated_data

        except Exception as e:
            logging.error(f"Error translating '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            logging.info(f"Response content: {content_text}")
            if target_language in ['am', 'ml', 'rm', 'km'] and attempt > 1:
                return content_item
            if attempt == MAX_RETRIES:
                if target_language in ['am', 'ml', 'rm', 'km']:
                    return content_item
                raise Exception(
                    f"Could not translate '{content_item.get('title', 'Untitled')}' to '{target_language}' after {MAX_RETRIES} attempts.")
            time.sleep(RETRY_DELAY)

    # If fails all attempts, return original for specific languages or raise exception
    if target_language in ['am', 'ml', 'rm', 'km']:
        return content_item
    return None


def process_item_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Process a single item: translate it into the target language using the GPT API.
    """
    return call_gpt_translation(content_item, target_language)


# ------------------------------------------------------------------------------
# Main Function
# ------------------------------------------------------------------------------

def main():
    content_type = "question"  # Changed from "exercise" to "question"
    en_folder = os.path.join("en", content_type)
    input_file = os.path.join(en_folder, "marriage_content.json")

    logging.info(f"Reading content from: {input_file}")
    content_data = read_content_json(input_file)
    if not content_data:
        logging.warning("No content to translate. Exiting.")
        return

    # Translate for each language in LANGUAGES
    for lang in LANGUAGES:
        logging.info(f"Translating to '{lang}'...")

        translated_items = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(process_item_translation, item, lang): item
                for item in content_data
            }
            for future in as_completed(futures):
                original_item = futures[future]
                try:
                    result = future.result()
                    if result:
                        translated_items.append(result)
                except Exception as exc:
                    logging.error(f"Translation error for item '{original_item.get('title', 'Untitled')}': {exc}")
                    raise exc

        # Write the translations out
        output_folder = os.path.join(lang, content_type)
        output_file = os.path.join(output_folder, "final_content.json")
        if len(translated_items) > len(content_data) * 0.8:
            logging.info(f"Writing translated content to: {output_file}")
#             TODO uncomment to add instead of rewriting
#             existing_translated = read_content_json(output_file)

            # Append new translated items to the existing list
#             combined_translated = existing_translated + translated_items

            # Write the combined list back to the output file
            write_content_json(output_file, translated_items)
        else:
            write_content_json(output_file, "")
            raise Exception(
                f"Language '{lang}': Translation unsuccessful. Only {len(translated_items)} out of {len(content_data)} items translated.")

    logging.info("All translations completed successfully.")


if __name__ == "__main__":
    main()
