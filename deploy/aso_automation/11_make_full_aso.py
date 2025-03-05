import sys
import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

IOS_LANGUAGES = {
    'uk', 'ar-SA', 'ca', 'zh-Hans', 'zh-Hant', 'hr', 'cs', 'da', 'nl-NL',
    'en-AU', 'en-CA', 'en-GB', 'en-US', 'fi', 'fr-FR', 'fr-CA', 'de-DE',
    'el', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl',
    'pt-BR', 'pt-PT', 'ro', 'sk', 'es-ES', 'es-MX', 'sv', 'th', 'tr', 'vi'
}

ANDROID_LANGUAGES = {
    'no-NO', 'en-US', 'en-GB', 'en-CA', 'en-AU', 'en-IN', 'en-ZA', 'es-ES',
    'es-US', 'es-419', 'fr-FR', 'fr-CA', 'pt-BR', 'pt-PT', 'it-IT', 'de-DE',
    'nl-NL', 'uk', 'pl-PL', 'tr-TR', 'ro', 'id', 'fil', 'vi', 'zh-CN',
    'zh-TW', 'ar', 'hi-IN', 'ja-JP', 'hr', 'cs-CZ', 'da-DK', 'fi-FI',
    'el-GR', 'iw-IL', 'sv-SE', 'sk', 'hu-HU', 'ca', 'ko-KR', 'ms', 'ms-MY',
    'th', 'fa-AE', 'ne-NP', 'mn-MN', 'mr-IN', 'ml-IN', 'mk-MK', 'lt',
    'lv', 'lo-LA', 'ky-KG', 'km-KH', 'kk', 'kn-IN', 'is-IS', 'gu', 'ka-GE',
    'gl-ES', 'et', 'zh-HK', 'my-MM', 'bg', 'be', 'eu-ES', 'bn-BD', 'az-AZ',
    'hy-AM', 'am', 'sq', 'af', 'sr', 'sl'
}

SKIP_LANGUAGES = {"zu", "sw", "my", "mr", "mn", "ml", "ky", "kn", "km",
                 "ka", "hy", "gu", "gl", "eu", "be", "am"}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_aso(store, name, product_desc, keywords, default_keywords,
                 known_competitors, irrelevant_competitors, locale):
    # Placeholder for actual ASO generation logic
    # This should be implemented based on your specific needs
    return {"keywords": keywords, "name": name, "description": product_desc}


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product provided in arguments")
        raise Exception('No product provided')
    product = sys.argv[1]

    # Load initial product data
    product_data = load_json("product_description.json")[product]
    iteration = product_data['iteration']

    # Input and output files
    input_file = f"10_{product}_{iteration}_aso.json"
    output_file = f"11_{product}_{iteration}_aso_final.json"

    # Load ASO data
    aso_data = load_json(input_file)

    name = product_data['name']
    product_desc = product_data["description"]
    default_keywords = product_data["default_keywords"]
    known_competitors = product_data["known_competitors"]
    irrelevant_competitors = product_data["irrelevant_competitors"]

    output_data = {"app_store": {}, "play_market": {}}
    missing_languages = {"app_store": [], "play_market": []}

    # Process languages
    for store in ['app_store', 'play_market']:
        valid_languages = IOS_LANGUAGES if store == 'app_store' else ANDROID_LANGUAGES
        store_data = aso_data.get(store, {})

        # Check for unexpected languages
        for locale in store_data.keys():
            if locale not in valid_languages:
                logging.info(f"Removed unexpected language {locale} from {store}")
                continue

            # Handle skip languages
            if locale[:2].lower() in SKIP_LANGUAGES:
                logging.info(f"Using en-US for skip language {locale} in {store}")
                if 'en-US' in store_data:
                    output_data[store][locale] = store_data['en-US']
                else:
                    logging.warning(f"en-US not found for replacing {locale} in {store}")
                    output_data[store][locale] = {}
            else:
                output_data[store][locale] = store_data[locale]

        # Check for missing languages
        for lang in valid_languages:
            if lang not in store_data:
                missing_languages[store].append(lang)
                output_data[store][lang] = {}

    # Generate ASO for valid languages using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_task = {}
        for store, locales in output_data.items():
            for locale, data in locales.items():
                if not data:  # Only process if data is empty (missing languages)
                    future = executor.submit(generate_aso, store, name, product_desc,
                                             default_keywords[:20], default_keywords,
                                             known_competitors, irrelevant_competitors, locale)
                    future_to_task[future] = (store, locale)

        for future in as_completed(future_to_task):
            store, locale = future_to_task[future]
            try:
                result = future.result()
                output_data[store][locale] = result
            except Exception as e:
                logging.error(f"Failed to generate ASO for {store} - {locale}: {e}")

    # Save output
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    logging.info(f"Saved ASO to {output_file}")

    # Report missing languages
    for store, langs in missing_languages.items():
        if langs:
            logging.info(f"Missing languages in {store}: {', '.join(langs)}")


if __name__ == "__main__":
    main()