import json
import logging
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

COOKIE = """_ga=GA1.2.172498101.1737473012; _gcl_au=1.1.329856309.1737473012; _pk_id.1.f8d6=7b1f49a9ced28de7.1737473012.; cb_user_id=null; cb_group_id=null; cb_anonymous_id=%221333fdad-0558-4516-b4a3-beb4e946b279%22; g_state={"i_l":0}; _afm_session=tm2UtTwS4P5k_9-W_xcndA.6MGW41njdJLcdJWwHNKjyJRb0F46uyDfWE7VLv2UAB6GjTxTgTjrbAQm4CnnrVyOSM7sjJe1oZSR5sYYTYUMxg.1738785571002.2592000000.BB8Le5I3I4d1B3nxbuJf8Vta43QXbu4wTr_Q4VHKr_4; _af_session=cw5udg1x434sj5vgulljhynn; _gid=GA1.2.687554963.1739782405; KSERVERID=1739782684.191.32.761069|69c6428cdf95fffd388eca01de8b64ef; _ga_SJVSQFX28Z=GS1.2.1740001647.3.1.1740002025.0.0.0; _pk_ses.1.f8d6=1; _gat=1; crisp-client%2Fsession%2F8be82478-7316-42dc-b8d4-fb27fbdf055d=session_bf0e9b2d-3d88-44c6-92bd-6a63c02fd83f; _af_session_verifier=b747e0bf-ca9b-4fb1-94ef-9978c4562a12; _ga_TV1FTXB4NN=GS1.2.1740076146.21.1.1740076151.0.0.0"""
API_URL = "https://appfigures.com/api/aso-ranks"
HEADERS = {
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
STOREFRONT_MAPPING = {"play_market": "google_play", "app_store": "apple"}


def load_json(filepath):
    logging.info(f"Loading JSON file: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Loaded data from {filepath}")
    return data


def get_keyword_data(term, country, storefront):
    params = {
        "term": term,
        "country": country,
        "storefront": storefront,
        "page": 1,
        "device": "handheld",
        "count": 1,
        "include_stale": "true"
    }
    max_retries = 1
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            response = requests.get(API_URL, params=params, headers=HEADERS, timeout=10)
            response.raise_for_status()
            data = response.json()
            keyword_info = data.get("metadata", {}).get("keyword", {})
            status = keyword_info.get("status")
            popularity = keyword_info.get("popularity")
            competitiveness = keyword_info.get("competitiveness")

            if status == "running":
                if popularity is not None and popularity < 6 and competitiveness is None:
                    logging.info(
                        f"Retrieved data for term '{term}' in country '{country}': popularity={popularity}, competitiveness={competitiveness}")
                    return popularity, None
                if popularity is None:
                    popularity = 5
                if competitiveness is not None:
                    logging.info(
                        f"Retrieved data for term '{term}' in country '{country}': popularity={popularity}, competitiveness={competitiveness}")
                    return popularity, competitiveness

                elif attempt < max_retries - 1:
                    logging.info(
                        f"Competitiveness missing for term '{term}' in country '{country}', retrying in {retry_delay} seconds (attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay + attempt*3 + random.randint(1, 3) - 2)
                    continue
                else:
                    logging.warning(
                        f"Max retries reached for term '{term}' in country '{country}', setting competitiveness to None")
                    return popularity, None
            elif status == "finished":
                if popularity is None:
                    popularity = 5
                if competitiveness is None:
                    competitiveness = None
                logging.info(
                    f"Retrieved data for term '{term}' in country '{country}': popularity={popularity}, competitiveness={competitiveness}")
                return popularity, competitiveness
            else:
                logging.warning(
                    f"Unknown status '{status}' for term '{term}' in country '{country}', setting values to None")
                return None, None
        except requests.RequestException as e:
            logging.error(f"API error for term '{term}' in country '{country}': {e}")
            return None, None
    logging.error(f"Failed to retrieve data for term '{term}' in country '{country}' after {max_retries} retries")
    return None, None



def main():

    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product name provided in arguments")
        raise ValueError("Please provide a product name as argument")

    product = sys.argv[1]
    logging.info(f"Starting filtering process for product: {product}")

    # Get iteration from product description
    try:
        product_desc = load_json("./product_description.json")
        iteration = product_desc[product]['iteration']
        logging.info(f"Using iteration: {iteration} for product: {product}")
    except KeyError:
        logging.error(f"Product {product} not found in product_description.json")
        raise
    except Exception as e:
        logging.error(f"Error loading product description: {e}")
        raise
    # Load input files
    keywords_data = load_json(f"keywords_{product}_{iteration}_llm_competitors_scored_filtered_irrelevant.json")
    store_languages = load_json("store_languages_app_figures_keyword.json")
    output_file = f"keywords_{product}_{iteration}_llm_competitors_scored_filtered_irrelevant_enriched_competiteveness.json"

    def save():
        logging.info("saving")
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(keywords_data, f, ensure_ascii=False, indent=2)
            logging.info(f"Saved final updated data to {output_file}")
        except Exception as e:
            logging.error(f"Error saving final updated data: {e}")

    # Prepare tasks for parallel execution
    futures = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        for storefront in keywords_data:
            store_key = STOREFRONT_MAPPING[storefront]
            for locale in keywords_data[storefront]:
                countries = store_languages.get(storefront).get(locale)
                if not countries:
                    logging.warning(f"No countries mapped for locale '{locale}' in storefront '{storefront}', skipping")
                    continue

                country = countries[0]
                logging.info(f"Processing locale '{locale}' in storefront '{storefront}' with country '{country}'")
                for term in keywords_data[storefront][locale]:
                    if term.get('popularity', None) and term.get('competitiveness', None):
                        continue
                    future = executor.submit(get_keyword_data, term["keyword_term"], country, store_key)
                    futures.append((future, term))

        processed_count = 0
        future_to_term = {fut: term for fut, term in futures}  # mapping for retrieving the correct term
        for future in as_completed(future_to_term):
            term = future_to_term[future]
            try:
                popularity, competitiveness = future.result()
                term["popularity"] = popularity
                term["competitiveness"] = competitiveness
                logging.info(
                    f"Updated term '{term['keyword_term']}' with popularity={popularity}, competitiveness={competitiveness}"
                )
            except Exception as e:
                logging.error(f"Error processing term '{term['keyword_term']}': {e}")
                term["popularity"] = None
                term["competitiveness"] = None

            processed_count += 1
            print(processed_count)
            if processed_count % 50 == 0:
                save()
        save()




if __name__ == "__main__":
    main()
