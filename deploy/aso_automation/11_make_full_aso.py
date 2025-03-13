import json
import logging
import sys

from general import SKIP_LANGUAGES, IOS_LANGUAGES, ANDROID_LANGUAGES

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)


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

    output_data = {"app_store": {}, "play_market": {}}
    missing_languages = {"app_store": [], "play_market": []}
    present_languages = {"app_store": [], "play_market": []}

    # Process languages
    for store in ['app_store', 'play_market']:
        valid_languages = IOS_LANGUAGES if store == 'app_store' else ANDROID_LANGUAGES
        store_data = aso_data.get(store, {})
        # Check for unexpected languages
        for locale in store_data.keys():
            if locale not in valid_languages:
                logging.info(f"Removed unexpected language {locale} from {store}")
                continue
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
            if lang not in output_data[store]:
                if lang[:2].lower() in SKIP_LANGUAGES:
                    output_data[store][lang] = store_data['en-US']
                    present_languages[store].append(lang)
                else:
                    missing_languages[store].append(lang)
            else:
                present_languages[store].append(lang)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    logging.info(f"Saved ASO to {output_file}")

    # Report missing languages
    for store, langs in missing_languages.items():
        if langs:
            logging.info(f"Missing languages in {store}: {', '.join(langs)}")

    for store, langs in present_languages.items():
        if langs:
            logging.info(f"Present languages in {store}: {', '.join(langs)}")


if __name__ == "__main__":
    main()
