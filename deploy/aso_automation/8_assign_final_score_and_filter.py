import json
import sys
from math import exp


def get_rank_rating(rank):
    if rank is None:
        return 1.0
    elif rank == 1:
        return 2.0
    elif 2 <= rank <= 3:
        return 1.5
    elif 4 <= rank <= 5:
        return 1.2
    elif 6 <= rank <= 7:
        return 1.0
    elif 8 <= rank <= 10:
        return 0.8
    elif 11 <= rank <= 20:
        return 0.6
    elif 21 <= rank <= 100:
        return 0.5
    else:  # rank > 100
        return 0.4


def get_max_reach(popularity):
    # formula to calculate how popularity converts to max reach
    return 10 ** (0.059 * popularity + 1.47)


def get_competiteveness(competitiveness):
    return exp(-7 * competitiveness / 100)


def get_relevance(relevance):
    return exp(-2 * (100 - relevance) / 100)


def process_keywords(keywords, threshold):
    """
    Process keywords by applying filters, calculating scores, and sorting them.
    Prints the number of keywords after each filtering step.
    """
    print(f"Initial keywords: {len(keywords)}")

    # Filter out keywords with null popularity
    keywords = [kw for kw in keywords if kw.get("popularity") is not None]
    print(f"After filtering null popularity: {len(keywords)}")

    # Filter out keywords with popularity < 6
    keywords = [kw for kw in keywords if kw["popularity"] >= 6]
    print(f"After filtering popularity < 6: {len(keywords)}")

    # Filter out keywords with null competitiveness
    keywords = [kw for kw in keywords if kw.get("competitiveness") is not None]
    print(f"After filtering null competitiveness: {len(keywords)}")

    # Filter out keywords with relevance <= 50 (missing treated as 0)
    keywords = [kw for kw in keywords if kw.get("relevance", 0) > 50]
    print(f"After filtering relevance <= 50: {len(keywords)}")

    # Filter out keywords with payable < 21 (missing treated as 0)
    keywords = [kw for kw in keywords if kw.get("payable", 0) >= 21]
    print(f"After filtering payable < 21: {len(keywords)}")

    # Filter out keywords with competitiveness > threshold
    keywords = [kw for kw in keywords if kw["competitiveness"] <= threshold]
    print(f"After filtering competitiveness > {threshold}: {len(keywords)}")

    # Calculate final score for each remaining keyword

    for kw in keywords:
        relevance = kw["relevance"]
        popularity = kw["popularity"]
        payable = kw["payable"]
        competitiveness = kw["competitiveness"]
        rank = kw.get("rank")
        max_reach = get_max_reach(popularity)
        competition_factor = get_competiteveness(competitiveness)
        relevance_coef = get_relevance(relevance)
        rank_rating = get_rank_rating(rank)

        final_score = max_reach * competition_factor * relevance_coef * rank_rating
        kw["final_score"] = int(final_score)
        kw["max_reach"] = int(get_max_reach(popularity))

        # TODO take into account that competitiveness > 0.8 can be reachable from app figures

    sorted_keywords = sorted(keywords, key=lambda x: x["final_score"], reverse=True)

    seen_terms = set()
    unique_keywords = []
    for kw in sorted_keywords:
        term = kw["keyword_term"]
        if term not in seen_terms:
            seen_terms.add(term)
            unique_keywords.append(kw)
    return unique_keywords[:30]


def load_json(filepath):
    """Load JSON data from a file."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data, filepath):
    """Save JSON data to a file with formatting."""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    # Check for product name argument
    if len(sys.argv) < 2:
        print("Error: Please provide a product name as an argument")
        sys.exit(1)

    product = sys.argv[1]

    # Load product description to get iteration
    try:
        product_desc = load_json("product_description.json")
        iteration = product_desc.get(product).get("iteration")
        threshold = product_desc.get(product).get("threshold")
        if not iteration:
            print(f"Error: Iteration not found for product '{product}'")
            sys.exit(1)
    except FileNotFoundError:
        print("Error: product_description.json not found")
        sys.exit(1)

    input_file = f"keywords_{product}_{iteration}_llm_competitors_scored_filtered_irrelevant_enriched_competiteveness.json"
    output_file = f"keywords_{product}_{iteration}_final_score.json"

    try:
        data = load_json(input_file)
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)


    # ---------------- TEMPORARY CODE START ----------------
    # Load iteration+1 data and merge with current data
    next_iteration = str(int(iteration) + 1)
    next_input_file = f"keywords_{product}_{next_iteration}_llm_competitors_scored_filtered_irrelevant_enriched_competiteveness.json"
    try:
        next_data = load_json(next_input_file)
        # Merge keywords for each store and locale
        for store in next_data:
            if store not in data:
                data[store] = next_data[store]
            else:
                print(len(next_data[store].keys()))
                print(len(data[store].keys()))
                for locale in next_data[store]:
                    if locale not in data[store]:
                        data[store][locale] = next_data[store][locale]
                    else:
                        data[store][locale].extend(next_data[store][locale])
        print(f"Merged data from iteration {next_iteration}")
    except FileNotFoundError:
        print(f"Warning: Next iteration file '{next_input_file}' not found, proceeding with single iteration")
    # ---------------- TEMPORARY CODE END ----------------

    summary = {}
    for store in data:
        for locale in data[store]:
            data[store][locale] = process_keywords(data[store][locale], threshold)
            count = len(data[store][locale])
            summary[f"{store} - {locale}"] = count

    save_json(data, output_file)
    print(f"\nProcessed data saved to '{output_file}'")
    print("\nFinal keywords count summary:")
    for key, count in summary.items():
        print(f"{key}: {count}")


if __name__ == "__main__":
    main()
