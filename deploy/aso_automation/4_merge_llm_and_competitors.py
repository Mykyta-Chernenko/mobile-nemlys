import sys
import json
import logging
from typing import Dict, List, Optional

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def load_json(filepath: str, can_except: bool=False) -> Dict:
    """Load JSON data from a file."""
    try:
        logging.info(f"Loading JSON file: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        logging.info(f"Successfully loaded {filepath}")
        return data
    except Exception as e:
        if can_except:
            return None
        logging.error(f"Error loading {filepath}: {e}")
        raise


def save_json(data: Dict, filepath: str) -> None:
    """Save JSON data to a file."""
    try:
        logging.info(f"Saving merged data to: {filepath}")
        with open(filepath, "w", encoding="utf-8") as outfile:
            json.dump(data, outfile, ensure_ascii=False, indent=2)
        logging.info(f"Successfully saved to {filepath}")
    except Exception as e:
        logging.error(f"Error saving to {filepath}: {e}")
        raise


def merge_keywords(llm_data: Dict, comp_data: Dict, rank_data: Optional[Dict]) -> Dict:
    merged_data = {}

    for store_type in llm_data.keys():
        merged_data[store_type] = {}

        all_locales = llm_data[store_type].keys()

        for locale in all_locales:
            llm_keywords = llm_data[store_type].get(locale)
            comp_keywords = comp_data[store_type].get(locale, [])
            all_k = llm_keywords + comp_keywords
            if rank_data:
                all_k += rank_data[store_type].get(locale, [])

            merged_data[store_type][locale] = all_k

    return merged_data


def main():
    # Check if product name is provided
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product name provided in arguments")
        raise ValueError("Please provide a product name as argument")

    product = sys.argv[1]
    logging.info(f"Starting merge process for product: {product}")

    # Load product description to get iteration
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

    # Construct input filenames
    llm_file = f"keywords_{product}_{iteration}_llm.json"
    comp_file = f"keywords_{product}_{iteration}_competitors.json"
    rank_file = f"keywords_{product}_{iteration}_ranked.json"
    output_file = f"keywords_{product}_{iteration}_llm_competitors.json"

    # Load both JSON files
    llm_data = load_json(llm_file)
    comp_data = load_json(comp_file)
    rank_data = load_json(rank_file, can_except=True)

    # Merge the data
    merged_data = merge_keywords(llm_data, comp_data, rank_data)

    # Save the merged result
    save_json(merged_data, output_file)

    logging.info("Merge process completed successfully")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.error(f"Script failed: {e}")
        sys.exit(1)