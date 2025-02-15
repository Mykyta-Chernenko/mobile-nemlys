import json
import os
import time
import openai
from typing import Dict, List
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 0
PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 1,
    "max_tokens": 300,
    "top_p": 1,
    "n": 1,
    "stop": None
}
MAX_WORKERS = 20

# Load environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY

def read_languages_json() -> Dict:
    with open('./languages.json', 'r') as f:
        return json.load(f)

def write_languages_json(data: Dict):
    with open('./languages.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def call_gpt(prompt: str, system_prompt: str) -> str:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                temperature=PARAMS["temperature"],
                max_tokens=PARAMS["max_tokens"],
                top_p=PARAMS["top_p"],
                n=PARAMS["n"],
                stop=PARAMS["stop"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            )
            content = response.choices[0].message.content.strip()
            logging.info("API call successful")
            return content
        except Exception as e:
            logging.error(f"Error during API call: {e}. Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    logging.error("Max retries exceeded. Skipping this batch.")
    return ""

def create_engaging_notes(notes: str) -> str:
    logging.info("Creating engaging notes")
    system_prompt = """
    You are an expert in creating engaging app release notes. Your task is to transform basic release notes into compelling and user-friendly descriptions. Focus on the benefits to the user and create excitement about the new features or improvements. Use a friendly, conversational tone. Return the result in 20 words or less per line, nothing else.
    You are created notes for a couple app that helps to improve relationships through generating different questions to discuss on sex, issues, getting to know eahc other, deep questions, fun and meaningful conversations, that couple discuss in person or over a chat. Sound very relaxed, natural language, not promotional or marketing like
    Example input:
    Fixed bugs, improved performance, added dark mode

    Example output:
    ✨ Smoother than ever! We squashed those pesky bugs so your dates go with no hassle.
    🚀 Feel the speed? That's our turbocharged performance upgrade to match your couple's speed.
    🌙 Night owls rejoice! Dark mode is here for your late-night chats with your loved ones.
    
    Example input:
    Added 40 new languages, create onboarding dating length screen

    Example output:
    😊 Wanted to get the questions in your language? Here it is, love-bud! We added 40 more languages so yours is definitely on the list
    ❤️ Dating for a while? Personalize your app experience by answering how long you have been together.
    
    Never produce more than 300 symbols
    """

    user_prompt = f"Create engaging release notes based on the following updates:\n\n{notes}"
    engaging_notes = call_gpt(user_prompt, system_prompt)
    logging.info(f"Engaging notes created: {engaging_notes}")
    return engaging_notes

def translate_notes(notes: str, target_language: str) -> str:
    logging.info(f"Translating notes to {target_language}")
    system_prompt = f"""You are a professional translator. Translate the following text from English to {target_language}. Maintain the tone and style of the original text. first 2 letters in {target_language} identify the language, then the dialect follows. 
    for example, if you are asked to translate to en-IN, you need to use English, but with the words adapted to Indian English
    for example, if you are asked to translate to en-CA, you need to use English, but with the words adapted to Canadian English
    for example, if you are asked to translate to es-MX, you need to use Spanish, but with the words adapted to Mexican Spanish
    
    input: 
    Translate the following release notes to 'en-IN':\n\namazing dark mode is available 
    output: 
    amazing dark mode is available 
    
    input: 
    Translate the following release notes to 'en-CA':\n\namazing dark mode is available,
    output: 
    amazing dark mode is available 
    
    input: 
    Translate the following release notes to 'uk-UA':\n\nnew amazing questions
    output:
    нові чудові питання
    
    produce only the translation.  never produce more than 300 symbols
    """
    user_prompt = f"Translate the following release notes to {target_language}:\n\n{notes}"
    translated_notes = call_gpt(user_prompt, system_prompt)
    logging.info(f"Translation to {target_language} completed")
    return translated_notes

def translate_worker(lang: str, engaging_notes: str) -> tuple:
    translated_notes = translate_notes(engaging_notes, lang)
    if translated_notes:
        logging.info(f"Translation for {lang} completed")
        return lang, translated_notes
    else:
        logging.warning(f"Translation failed for {lang}, using English notes.")
        return lang, engaging_notes

def main():
    logging.info("Starting app notes update process")

    # Read the current languages.json
    languages_data = read_languages_json()
    logging.info("languages.json read successfully")

    # Clear all translations
    for store in ['play_market', 'app_store']:
        for lang in languages_data[store]:
            languages_data[store][lang] = ""
    logging.info("All translations cleared")

    # Get the original notes
    original_notes = languages_data['notes']
    logging.info(f"Original notes: {original_notes}")

    # Create engaging notes in English
    engaging_notes = create_engaging_notes(original_notes)

    # Update English versions
    languages_data['play_market']['en-US'] = engaging_notes
    languages_data['app_store']['en-US'] = engaging_notes
    logging.info("English versions updated")

    # Write intermediate results
    write_languages_json(languages_data)
    logging.info("Intermediate results written to languages.json")

    # Create a set of all unique language codes
    all_languages = set(languages_data['play_market'].keys()) | set(languages_data['app_store'].keys())
    all_languages.remove('en-US')  # Remove English as it's already translated

    # Use ThreadPoolExecutor for parallel translations
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_lang = {executor.submit(translate_worker, lang, engaging_notes): lang for lang in all_languages}
        for future in as_completed(future_to_lang):
            lang = future_to_lang[future]
            try:
                lang, translated_notes = future.result()
                # Apply translation to both stores if the language exists
                for store in ['play_market', 'app_store']:
                    if lang in languages_data[store]:
                        languages_data[store][lang] = translated_notes

                # Write intermediate results after each translation
                write_languages_json(languages_data)
                logging.info(f"Intermediate results written to languages.json after {lang} translation")
            except Exception as exc:
                logging.error(f'{lang} generated an exception: {exc}')

    # Write final updated data back to languages.json
    write_languages_json(languages_data)
    logging.info("Final results written to languages.json")

    logging.info("App notes update and translations completed.")

if __name__ == "__main__":
    main()