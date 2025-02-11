import os
import json
import openai
import time
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
LANG_DIR = '../lang'
REFERENCE_FILE = 'english.json'
BATCH_SIZE = 50
MAX_RETRIES = 3
RETRY_DELAY = 0  # seconds

# OpenAI API configuration
openai.api_key = os.getenv("OPENAI_API_KEY")  # Ensure your API key is set in the environment
PARAMS = {
    "model": "o3-mini",
    "max_tokens": 4000,
}
# PARAMS = {
#     "model": "gpt-4o-mini",
#     "temperature": 0,
#     "max_tokens": 4000,
#     "top_p": 1,
#     "n": 1,
#     "stop": None,
# }

def load_json(filepath: str) -> Dict:
    """Load JSON data from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded '{filepath}' successfully.")
        return data
    except Exception as e:
        print(f"Error loading '{filepath}': {e}")
        return {}

def save_json(filepath: str, data: Dict):
    """Save JSON data to a file with proper formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved updates to '{filepath}'.")
    except Exception as e:
        print(f"Error saving '{filepath}': {e}")

def get_missing_keys(language: str, reference: Dict, target: Dict) -> Dict:
    """Identify keys present in reference but missing in target."""
    missing = {k: v for k, v in reference.items() if k not in target}
    print(f"Found {len(missing)} missing keys for {language}")
    return missing

def chunk_dict(data: Dict, size: int) -> List[Dict]:
    """Yield successive chunks of the dictionary."""
    items = list(data.items())
    for i in range(0, len(items), size):
        yield dict(items[i:i + size])

# TODO make more precise
def build_prompt(batch: Dict[str, str], target_language: str) -> str:
    system_prompt = f"""
    You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions. Your task is to translate i18n strings accurately while maintaining a friendly, informal tone. Follow these guidelines:
    from English to {target_language}

    !!!Your most important task is to translate the translation strings, in the context of each other, so that they make sense together, sound naturally in the target language, and that the word choice is natural in the target language. Do not translate word to word, rather convery the same meaning.
    1. Tone and Style:
       - Use a friendly, informal tone throughout the translations.
       - Prefer the informal "you" (e.g., "ти" in Ukrainian, "du" in German) over formal forms when addressing the user.
       - Maintain a casual yet respectful tone, appropriate for discussing relationship topics.

    2. Context Awareness:
       - Pay attention to key prefixes (e.g., "question_home_", "couple_language_") as they indicate strings belonging to the same screen or feature. Ensure these translations are coherent when used together.
       - For keys with "__first", "__second", "__third" suffixes, treat them as parts of a single phrase. Ensure the complete phrase makes sense and flows naturally in the target language.

    3. Grammatical Considerations:
       - Distinguish between nouns and verbs based on context, even if not explicitly marked in the source text.
       - When referring to the couple, use appropriate pronouns or forms that denote a pair in the target language.

    4. Formatting and Structure:
       - Preserve any line breaks ("\n") present in the original text.
       - Maintain the JSON structure of the input, translating only the values and leaving keys unchanged.

    5. Cultural Adaptation:
       - Adapt idiomatic expressions or cultural references to equivalents that resonate in the target culture while preserving the original meaning.

    6. Consistency:
       - Maintain consistent terminology throughout the translation, especially for key terms related to the app's features.

    7. Length Considerations:
       - Be mindful of text length, especially for UI elements. If possible, keep translations concise without losing meaning.
    8. You must always copy over variables in mustache brackets "{'{{...}}'}" as it is, for example "Say hello to {'{{'}partnerName{'}}'}" you need to keep the {'{{'}partnerName{'}}'} as it is
    9. if you were to translate slang, translate it to the equivalents in the target language if possible

    10. We will have concepts in the app: 'test', 'exercise', 'question', 'checkup', 'article', 'game', 'journey'. Each is a different type of content couple can engage with.
    Choose a translation for a concept one (the most popular and appropriate word in the target language), and then always stick to that one chosen translation for the concept
    11. If we refer to partner as 'they' or in that form, you need to convert it to the appropriate form in the target language, for example: 'when they do something...' to Ukrainian -> 'коли він/вона щось робить'
    Examples of high-quality translations:
    12. Translate absolutely all words to the target language, the must be no english words in the final translation or anglicism if there is a good synonym. E.g. 'проверка' instead of 'чек-ап' or 'checkup' when translating to russian

    English to Spanish:
    {{
      "couple_language_title": "Select language of your couple",
      "couple_language_hint": "We will use the language to generate your questions"
    }}
   {{
       "couple_language_title": "Selecciona el idioma de tu pareja",
       "couple_language_hint": "Usaremos el idioma para generar tus preguntas"
   }}

    English to Ukrainian (multi-part strings):
    {{
      "onboarding": {{
        "your_name_first": "Hey! What is\n",
        "your_name_second": "your name",
        "your_name_third": "?",
        "partner_name_first": "What is your\n",
        "partner_name_second": "partner name",
        "partner_name_third": "?"
      }}
    }}
    {{
      "onboarding": {{
        "your_name_first": "Привіт! Як\n",
        "your_name_second": "тебе звати",
        "your_name_third": "?",
        "partner_name_first": "Як звуть твого\n",
        "partner_name_second": "партнера",
        "partner_name_third": "?"
      }}
    }}

    English to Russian (multi-part strings with context):
    {{
      "analyzing": {{
        "text_1": "Analyzing\nyour answers",
        "text_2": "Analyzing\nyour preferences",
        "text_3": "Adapting app\nto {'{{'}partnerName{'}}'}",
        "text_4_first": "All done,\n",
        "text_4_second": "start exploring\nthe app"
      }}
    }}
    {{
      "analyzing": {{
        "text_1": "Анализируем\nтвои ответы",
        "text_2": "Анализируем\nтвои предпочтения",
        "text_3": "Адаптируем приложение\nк {'{{'}partnerName{'}}'}",
        "text_4_first": "Все готово,\n",
        "text_4_second": "начинай пользоваться приложением"
      }}
    }}


    Your task is to provide accurate  from English to {target_language}  , natural-sounding translations that capture the essence and tone of the original text while adapting it appropriately for the target language and culture.
    """
    prompt = f"""



Translate the following key-value pairs from English to {target_language}. Maintain the JSON structure.
Here is an example of how to format the response:
{{
  "greeting": "Hola",
  "farewell": "Adiós"
}}
Now, translate these key-value pairs:
{json.dumps(batch, ensure_ascii=False, indent=2)}
"""
    return prompt.strip(), system_prompt.strip()

def call_gpt(prompt: str, system_prompt: str) -> str:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai.chat.completions.create(
                        model=PARAMS["model"],
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                         response_format={
                                            "type": "json_object"
                                        }
                    )
#             response = openai.chat.completions.create(
#                 model=PARAMS["model"],
#                 temperature=PARAMS["temperature"],
#                 max_tokens=PARAMS["max_tokens"],
#                 top_p=PARAMS["top_p"],
#                 n=PARAMS["n"],
#                 stop=PARAMS["stop"],
#                 messages=[
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": prompt}
#                 ],
#                 response_format={
#                     "type": "json_object"
#                 }
#             )
            content = response.choices[0].message.content.strip()
            return content
        except Exception as e:
            print(f"Error during API call: {e}. Attempt {attempt} of {MAX_RETRIES}. Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    print("Max retries exceeded. Skipping this batch.")
    return ""

def validate_json(response: str) -> Dict:
    """Validate and parse the JSON response from GPT."""
    try:
        data = json.loads(response)
        return data
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {}

def translate_language(filename: str, reference_data: Dict):
    if filename == REFERENCE_FILE or not filename.endswith('.json') or 'english' in filename:
        return  # Skip the reference file and non-JSON files

    target_language = os.path.splitext(filename)[0].capitalize()  # e.g., 'dutch' -> 'Dutch'
    target_path = os.path.join(LANG_DIR, filename)
    target_data = load_json(target_path)

    extra_keys = set(target_data.keys()) - set(reference_data.keys())
    if extra_keys:
        print(f"Removing {len(extra_keys)} extra keys from '{filename}': {list(extra_keys)}")
        for key in extra_keys:
            target_data.pop(key)

    # Identify missing keys
    missing_keys = get_missing_keys(target_language, reference_data, target_data)
    print(missing_keys.keys())
    if not missing_keys:
        print(f"No missing keys for '{filename}'. Skipping translation.")
        save_json(target_path, target_data)
        return

    # Process in batches
    batches = list(chunk_dict(missing_keys, BATCH_SIZE))
    total_batches = len(batches)
    print(f"Translating {len(missing_keys)} keys in {total_batches} batch(es) for '{filename}'.")

    for idx, batch in enumerate(batches, 1):
        print(f"Processing batch {idx}/{total_batches} for '{filename}'...")
        prompt, system_prompt = build_prompt(batch, target_language)
        response = call_gpt(prompt, system_prompt)

        if not response:
            print(f"Failed to get a response for batch {idx} of '{filename}'. Skipping.")
            continue

        translated = validate_json(response)
        if not translated:
            print(f"Invalid JSON received for batch {idx} of '{filename}'. Retrying...")
            response = call_gpt(prompt, system_prompt)
            translated = validate_json(response)
            if not translated:
                print(f"Failed to parse JSON after retrying for batch {idx} of '{filename}'. Skipping.")
                continue

        # **Validation Step: Ensure all keys in the batch are present in the translated output**
        missing_in_translation = set(batch.keys()) - set(translated.keys())
        if missing_in_translation:
            print(f"Validation Error: The following keys are missing in the translation for batch {idx} of '{filename}': {missing_in_translation}")
            # Optionally, you can implement a retry mechanism for these specific keys
            # For simplicity, we'll skip updating these keys
            for key in missing_in_translation:
                print(f"Skipping key '{key}' due to missing translation.")
            # Remove missing keys from the translated data
            for key in missing_in_translation:
                translated.pop(key, None)
        else:
            print(f"All keys validated for batch {idx} of '{filename}'.")

        # Update target data with translations
        target_data.update(translated)
        print(f"Batch {idx} translated successfully for '{filename}'.")

    # **Final Validation: Ensure no keys are missing after all translations**
    final_missing_keys = get_missing_keys(target_language, reference_data, target_data)
    if final_missing_keys:
        print(f"Final Validation: {len(final_missing_keys)} keys are still missing in '{filename}': {list(final_missing_keys.keys())}")
    else:
        print(f"All keys have been successfully translated for '{filename}'.")

    # Save the updated target language file
    save_json(target_path, target_data)
    print(f"Completed translations for '{filename}'.\n{'-'*50}")

def main():
    # Load reference English translations
    reference_path = os.path.join(LANG_DIR, REFERENCE_FILE)
    reference_data = load_json(reference_path)
    if not reference_data:
        print("Reference file is empty or could not be loaded. Exiting.")
        return

    # Get all language files
#     TODo revert
    language_files = [f for f in os.listdir(LANG_DIR) if f.endswith('.json') and f != REFERENCE_FILE and 'english' not in f]

    # Use ThreadPoolExecutor to process languages in parallel
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(translate_language, filename, reference_data) for filename in language_files]

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"An error occurred during translation: {e}")

    print("All translations completed.")

if __name__ == "__main__":
    main()
