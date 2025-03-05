import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import openai

logging.basicConfig(level=logging.INFO)

openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = "o3-mini"
MAX_TOKENS = 10000
MAX_RETRIES = 1
RETRY_DELAY = 2
TOTAL_KEYWORDS = 500

SKIP_LANGUAGES = {"zu", "sw", "my", "mr", "mn", "ml", "ky", "kn", "km", "ka", "hy", "gu", "gl", "eu", "be", "am"}


def load_production_description(filepath="./product_description.json"):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Loaded production description from '{filepath}'.")
    return data


def load_store_languages(filepath="./store_languages.json"):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Loaded store languages from '{filepath}'.")
    return data


def call_llm(messages):
    for attempt in range(0, MAX_RETRIES + 1):
        try:
            response = openai.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={
                    "type": "json_object"
                }
            )
            content = json.loads(response.choices[0].message.content.strip())['keywords']
            if len(content) < TOTAL_KEYWORDS - 100:
                logging.error(f"LLM call attempt {attempt} failed not enough words: {len(content)}")
                continue
            return content

        except Exception as e:
            logging.error(f"LLM call attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
            else:
                raise e


def generate_keywords_for_locale(product_name, description, good_keywords, language_code, store_type):
    system_msg = (
        f"""You are a senior store aso manager and senior product marketing manager. Your task is to create {TOTAL_KEYWORDS} initial keywords that will be relevant describing the app’s purpose and user scenarios (JTBD).
        for further adaptation and basing our assumptions for aso, the words must be high popularity, this is very important, so people are searching the words on the stores, most likely it will be 1-3 words keywords. Most likely 1 or 2 words.
        Words must be very adapted and relevant for the country, you know the most popular searching terms on stores there. search terms must be in the local language.
        Keywords you create must be different in nature, but relevant to the jTBDS  and purpose of the app"""
        f"Your task is to create {TOTAL_KEYWORDS} initial ASO keyword(s) that describe an app’s purpose and user scenarios (JTBD) "
        f"for the {product_name} product. The keywords must be high popularity search terms (usually 1-3 words, mostly 1 or 2 words), "
        "using natural language synonyms, including plural and singular variations. "
        f"They must be in {language_code} and tailored for the local market. "
        """You are to use natural language adapted synonyms, if they are popular, like couple game and relationship game are 2 completely different keywords, also plural and singular form like couple games and couple game are 2 different search terms, so you need to include both, jogos para casais  and jogo para casal  are differente search terms.
Gra par and Gra dla par are very different concept for ASO keywords as well, so produce such variations as well. so plural forms, synonyms, preposition are to be used if relevant for a language.
"""
        "don't be afraid to use general search terms as: love, relationship, book, friend, sex in the targeted language"
        "You must return JSON dict with key \"keywords\" like: \{\"keywords\":[\"keyword_1\",\"keyword_2\"]\}, no extra spaces, no other info"
        "Don't forget that you generate Play Market and App Store ASO keywords, they have specific nature and form"
    )
    few_shot_user = (
        'App Description: "ShortBooks redefines your escape into immersive, sexual fiction. '
        'Experience a new era of storytelling with bite-sized chapters that hook you from the first line, offering cliffhangers, twists, '
        'and emotionally charged narratives across diverse genres—from high-stakes billionaire romance and paranormal love to gripping mysteries." '
        'Good Keywords: "fiction, stories, shortbooks, romance, mystery, short read, suspense, book app, novel app, premium books, addictive reads, drama reads". '
        "Generate 10 unique keyword(s) relevant to the app’s purpose and user scenarios. "
        "Include variations like singular/plural forms, synonyms, and popular search terms. "
        "They must be in Ukranian and tailored for the local market. "
        "Return exactly a JSON dict with keywords key and array of strings with no extra text."
    )
    few_shot_assistant = json.dumps(
        {"keywords": ["книга", "романтичні книги", "сексуальні історії", "фентезі", "міліонери", "вампіри",
                      "перевертень", "перевертні", "романтика", "паранормальна романтика"]},
        indent=0,
        ensure_ascii=True
    )

    user_msg = (
        f'App Description: "{description}"\n'
        f'Good Keywords: "{good_keywords}"\n'
        f"Generate {TOTAL_KEYWORDS} unique keyword(s) relevant to the app’s purpose and user scenarios. "
        "Include variations like singular/plural forms, synonyms, and popular search terms. "
        f"They must be in {language_code} and tailored for the local market. "
        "Return exactly a JSON dict with keywords key and array of strings with no extra text."
    )

    messages = [
        {"role": "assistant", "content": system_msg},
        {"role": "user", "content": few_shot_user},
        {"role": "assistant", "content": few_shot_assistant},
        {"role": "user", "content": user_msg}
    ]
    return call_llm(messages)


def save_file(filename, data):
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logging.info(f"Saved updated keywords to '{filename}'.")
    except Exception as e:
        logging.error(f"Error saving file '{filename}': {e}")


def main():
    product = sys.argv[1]
    if not product:
        raise Exception('not product provided')
    production_data = load_production_description()
    store_languages = load_store_languages()
    product_data = production_data.get(product)
    if not product_data:
        raise Exception(product)
    iteration = product_data.get("iteration", "1")
    filename = f"keywords_{product}_{iteration}_llm.json"
    combined = {"play_market": {}, "app_store": {}}
    futures = []

    with ThreadPoolExecutor(max_workers=50) as executor:
        for store_type in ["play_market", "app_store"]:
            for loc in list(store_languages[store_type].keys()):
                locale_full_name = store_languages[store_type].get(loc)
                # if loc != 'en-US' or store_type != 'play_market':
                #     continue
                if loc[:2] in SKIP_LANGUAGES:
                    logging.info(f"Skipping locale {loc} - {locale_full_name}")
                    combined[store_type][loc] = []
                    save_file(filename, combined)
                else:
                    logging.info(f"Processing product {product} for {store_type} locale {loc} - {locale_full_name}")
                    future = executor.submit(
                        generate_keywords_for_locale,
                        product,
                        product_data.get("description", ""),
                        product_data.get("good_keywords", ""),
                        locale_full_name,
                        store_type
                    )
                    futures.append((future, store_type, loc))

        for future in as_completed([f[0] for f in futures]):
            meta = next((item for item in futures if item[0] == future), None)
            if meta is None:
                continue
            store_type, loc = meta[1], meta[2]

            try:
                keywords = future.result()
                formatted_keywords = [{"keyword_term": kw, "competitiveness": None, "popularity": None} for
                                                   kw in keywords]
                combined[store_type][loc] = formatted_keywords
                save_file(filename, combined)
            except Exception as e:
                logging.error(f"Error processing {store_type} locale {loc}: {e}")
                combined[store_type][loc] = []
                save_file(filename, combined)


if __name__ == "__main__":
    main()
