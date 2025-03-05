import sys
import json
import logging
from operator import eq, ge
from typing import Dict, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Map condition strings to comparison functions
CONDITION_FUNCS = {
    "equals": eq,
    "greater_equal": ge
}

# Define configurable filters (terms must satisfy these to be kept)
FILTERS = [
    {"field": "relevance", "condition": "greater_equal", "value": 21},
    {"field": "payable", "condition": "greater_equal", "value": 21}
]

def load_json(filepath: str) -> Dict:
    """Load JSON data from a file."""
    try:
        logging.info(f"Loading JSON file: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        logging.info(f"Successfully loaded {filepath}")
        return data
    except Exception as e:
        logging.error(f"Error loading {filepath}: {e}")
        raise

def save_json(data: Dict, filepath: str) -> None:
    """Save JSON data to a file."""
    try:
        logging.info(f"Saving filtered data to: {filepath}")
        with open(filepath, "w", encoding="utf-8") as outfile:
            json.dump(data, outfile, ensure_ascii=False, indent=2)
        logging.info(f"Successfully saved to {filepath}")
    except Exception as e:
        logging.error(f"Error saving to {filepath}: {e}")
        raise

def passes_filters(term: Dict, filters: List[Dict]) -> bool:
    """Check if a term satisfies all filter conditions."""
    for f in filters:
        field = f["field"]
        condition = f["condition"]
        value = f["value"]
        if condition not in CONDITION_FUNCS:
            raise ValueError(f"Unknown condition: {condition}")
        if field not in term:
            return False
        else:
            if not CONDITION_FUNCS[condition](term[field], value):
                return False
    return True

def main():
    # Validate command-line argument
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

    # Construct input and output filenames
    input_file = f"keywords_{product}_{iteration}_llm_competitors_scored.json"
    output_file = f"keywords_{product}_{iteration}_llm_competitors_scored_filtered_irrelevant.json"

    # Load keyword data
    data = load_json(input_file)

    # Filter keywords for each store type and locale
    for store_type, locales in data.items():
        for locale, keywords in locales.items():
            before_count = len(keywords)
            filtered_keywords = [term for term in keywords if passes_filters(term, FILTERS)]
            after_count = len(filtered_keywords)
            logging.info(
                f"Filtering {store_type} - {locale}: {before_count} terms before, "
                f"{after_count} after"
            )
            data[store_type][locale] = filtered_keywords

    # Save filtered data
    save_json(data, output_file)
    logging.info("Filtering process completed successfully")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.error(f"Script failed: {e}")
        sys.exit(1)