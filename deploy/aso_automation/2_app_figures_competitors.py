import json
import logging
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

app_figures_languages = [
    'ar', 'au', 'at', 'be', 'br', 'ca', 'cl', 'cn', 'co',
    'dk', 'eg', 'fi', 'fr', 'de', 'hk', 'in', 'id', 'iq',
    'ie', 'il', 'it', 'jp', 'my', 'mx', 'nl', 'nz', 'no',
    'pe', 'ph', 'pl', 'pt', 'qa', 'sa', 'sg', 'za', 'kr',
    'es', 'se', 'ch', 'tw', 'th', 'tr', 'ae', 'gb', 'us',
    'vn'
]

irrelevant = [
    'ru', 'dz', 'bh', 'bz', 'sv', 'gh', 'gt', 'jo', 'ke', 'kw', 'lb', 'ly', 'mo', 'ng', 'om', 'pk', 'tz', 'ye'
]

COOKIE = """_ga=GA1.2.172498101.1737473012; _gcl_au=1.1.329856309.1737473012; _pk_id.1.f8d6=7b1f49a9ced28de7.1737473012.; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%221333fdad-0558-4516-b4a3-beb4e946b279%22; g_state={"i_l":0}; _afm_session=tm2UtTwS4P5k_9-W_xcndA.6MGW41njdJLcdJWwHNKjyJRb0F46uyDfWE7VLv2UAB6GjTxTgTjrbAQm4CnnrVyOSM7sjJe1oZSR5sYYTYUMxg.1738785571002.2592000000.BB8Le5I3I4d1B3nxbuJf8Vta43QXbu4wTr_Q4VHKr_4; _af_session=cw5udg1x434sj5vgulljhynn; _gid=GA1.2.687554963.1739782405; KSERVERID=1739782684.191.32.761069|69c6428cdf95fffd388eca01de8b64ef; _ga_SJVSQFX28Z=GS1.2.1740001647.3.1.1740002025.0.0.0; _gat=1; _pk_ses.1.f8d6=1; crisp-client%2Fsession%2F8be82478-7316-42dc-b8d4-fb27fbdf055d=session_d7daae9c-ec61-439a-9113-a32f6beea64e; _af_session_verifier=32758465-ce5e-40ea-bc04-475d6a63fa1e; _ga_TV1FTXB4NN=GS1.2.1740040430.16.1.1740040435.0.0.0"""

API_BASE_URL = "https://appfigures.com/api/aso/products-snapshot/keywords"
QUERY_PARAMS = {
    "competitiveness.min": 1,
    "competitiveness.max": 80,
    "popularity.min": 6,
    "popularity.max": 100,
    "sort": "-popularity",
    "count": 1000,
    "page": 1,
    "device": "handheld",
    "group_by": "keyword,product"
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)


def save_intermediate(final_results, product, iteration):
    filename = f"keywords_{product}_{iteration}_competitors.json"
    try:
        with open(filename, "w", encoding="utf-8") as outfile:
            json.dump(final_results, outfile, ensure_ascii=False, indent=2)
        logging.info(f"Saved intermediate results to {filename}")
    except Exception as e:
        logging.error(f"Error saving intermediate results: {e}")


def load_json(filepath):
    logging.info(f"Loading JSON file: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Loaded {len(data)} records from {filepath}")
    return data


def build_url(country, product_ids):
    params = QUERY_PARAMS.copy()
    params["countries"] = country
    params["products"] = product_ids
    logging.info(f"Built URL params for country {country} with products {product_ids}")
    return API_BASE_URL, params


def call_app_figures_api(country, product_ids):
    url, params = build_url(country, product_ids)
    headers = {
        'cookie': COOKIE,
        'Accept-Language': 'en-US,en;q=0.9,nb-NO;q=0.8,nb;q=0.7,no;q=0.6,uk;q=0.5',
        'Connection': 'keep-alive',
        'If-None-Match': 'W/"mhZ3n6ullboFBLzO3czRog=="',
        'Referer': 'https://appfigures.com/account/competitors',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'X-ST': 'st_pgn5qihsc5g94rxur5am984uocf746enosmkatwz95cq7yk3ijyo',
        'dpr': '2',
        'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'viewport-width': '903'
    }
    logging.info(f"Calling API for country {country} with products {product_ids}")
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    data = response.json()
    keywords = []
    for item in data.get("results", []):
        keywords.append({
            "keyword_term": item.get("keyword_term"),
            "competitiveness": item.get("competitiveness"),
            "popularity": item.get("popularity"),
            "competitor": True,
            "country": country
        })
    logging.info(f"Retrieved {len(keywords)} keywords for country {country}")
    return keywords


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product provided in arguments")
        raise Exception('No product provided')
    product = sys.argv[1]
    logging.info(f"Starting processing for product: {product}")

    # TODO incorrect languages
    store_lang = load_json("./store_languages_app_figures_competitors.json")
    product_desc = load_json("./product_description.json")
    iteration = product_desc[product]['iteration']
    competitors = load_json("./app_figures_competitors.json")
    platform_map = {"play_market": "android", "app_store": "ios"}
    competitor_products = {}
    for store_type, platform in platform_map.items():
        competitor_products[store_type] = list(competitors[product][platform].keys())
        logging.info(f"For store {store_type}, competitor products: {competitor_products[store_type]}")

    # Initialize final results for every locale even if its country list is empty
    final_results = {}
    for store_type, lang_mapping in store_lang.items():
        final_results[store_type] = {locale: [] for locale in lang_mapping}

    with ThreadPoolExecutor(max_workers=1) as executor:
        future_to_task = {}
        # Process each store type separately
        for store_type in competitor_products:
            # Build a mapping from country to the list of locales that use that country
            lang_mapping = store_lang.get(store_type, {})
            country_to_locales = {}
            for locale, countries in lang_mapping.items():
                for c in countries:
                    country_to_locales.setdefault(c, []).append(locale)
            # For every country in the global list, if it has a mapping, schedule an API call.
            for country in app_figures_languages:
                if country in country_to_locales:
                    future = executor.submit(call_app_figures_api, country, competitor_products[store_type])
                    # Save the store type and the locales that need to be updated when the future completes
                    future_to_task[future] = (store_type, country, country_to_locales[country])
                else:
                    logging.info(f"Country {country} not mapped to any locale for store {store_type}; skipping.")

        # As each API call completes, add its keywords to all applicable locales and save intermediate results.
        for future in as_completed(future_to_task):
            store_type, country, locales = future_to_task[future]
            try:
                keywords = future.result()
                for locale in locales:
                    final_results[store_type][locale].extend(keywords)
                logging.info(f"Task completed for country {country} on store {store_type} added to locales: {locales}")
            except Exception as e:
                logging.error(f"Error processing country {country} for store {store_type}: {e}")
            save_intermediate(final_results, product, iteration)

    output_filename = f"keywords_{product}_{iteration}_competitors.json"
    try:
        with open(output_filename, "w", encoding="utf-8") as outfile:
            json.dump(final_results, outfile, ensure_ascii=False, indent=2)
        logging.info(f"Final results saved to {output_filename}")
    except Exception as e:
        logging.error(f"Error saving final results: {e}")


if __name__ == "__main__":
    main()
