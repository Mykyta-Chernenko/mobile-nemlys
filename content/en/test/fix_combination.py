import json
import logging
import os
from copy import deepcopy
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def create_empty_combination() -> Dict[str, Dict[str, str]]:
    """Create an empty combination structure with all required keys."""
    combination = {}
    for i in range(1, 6):
        for j in range(i, 6):
            key = f"{i}_{j}"
            combination[key] = {
                "description": f"Default description for combination {i} and {j}",
                "advice": f"Default advice for combination {i} and {j}"
            }
    return combination


# Define supported languages
LANGUAGES = [
    "tr",
    "hy"
    "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "uk", "ru", "vi", "no", "af", "sq",
    "hy", "az", "eu", "be", "bg", "my", "ca", "hr", "cs", "da", "et", "fi",
    "gl", "ka", "el", "gu", "he", "hu", "is", "kn", "kk", "km", "ko", "ky",
    "lv", "lt", "mk", "ms", "mr", "mn", "ne", "fa", "pa", "sr", "si", "sk",
    "sl", "sw", "sv", "ta", "te", "th", "ur", "zu", "am", "ml", "rm",
]


def move_combination_outside_outcome(corrected_quiz: Dict[str, Any]):
    """Move 'combination' out of 'outcome_interpretation' if nested."""
    outcome = corrected_quiz.get('outcome_interpretation', {})
    if 'combination' in outcome:
        corrected_quiz['combination'] = outcome.pop('combination')
        logging.debug("Moved 'combination' out of 'outcome_interpretation'.")


def extract_combination_keys(outcome: Dict[str, Any]) -> List[str]:
    """Extract combination keys like '1_2' from the outcome."""
    return [key for key in outcome.keys() if is_combination_key(key)]


def is_combination_key(key: str) -> bool:
    """Check if a key matches the combination pattern (e.g., '1_2')."""
    parts = key.split('_')
    return len(parts) == 2 and all(part.isdigit() for part in parts)


def move_combination_pairs(corrected_quiz: Dict[str, Any]):
    """Move combination pairs from 'outcome_interpretation' to 'combination'."""
    outcome = corrected_quiz.get('outcome_interpretation', {})
    combination_keys = extract_combination_keys(outcome)

    if combination_keys:
        combination = corrected_quiz.setdefault('combination', {})
        for key in combination_keys:
            combination[key] = outcome.pop(key)
            logging.debug(f"Moved combination key '{key}' to 'combination'.")


def handle_inlined_outcome_interpretation(corrected_quiz: Dict[str, Any]):
    """
    If 'outcome_interpretation' is absent and keys like '1', '2', etc.,
    are present, create 'outcome_interpretation' and move these keys inside it.
    """
    if 'outcome_interpretation' not in corrected_quiz:
        # Identify keys that are single digits
        inlined_keys = [key for key in corrected_quiz.keys() if key.isdigit()]
        if inlined_keys:
            outcome_interpretation = {}
            for key in inlined_keys:
                outcome_interpretation[key] = corrected_quiz.pop(key)
                logging.debug(f"Moved inlined key '{key}' to 'outcome_interpretation'.")
            corrected_quiz['outcome_interpretation'] = outcome_interpretation
            logging.info("Created 'outcome_interpretation' and moved inlined keys.")


def ensure_combination_exists(corrected_quiz: Dict[str, Any]):
    """Ensure that the 'combination' key exists in the quiz."""
    if 'combination' not in corrected_quiz:
        corrected_quiz['combination'] = create_empty_combination()
        logging.debug("Created empty 'combination' structure.")


def fix_quiz_structure(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fix the structure of quiz data."""
    corrected_data = []

    for idx, quiz in enumerate(data, start=1):
        corrected_quiz = deepcopy(quiz)
        logging.debug(f"Processing quiz #{idx}.")

        # Step 1: Handle inlined 'outcome_interpretation' if absent
        handle_inlined_outcome_interpretation(corrected_quiz)

        # Step 2: Move 'combination' out if nested inside 'outcome_interpretation'
        move_combination_outside_outcome(corrected_quiz)

        # Step 3: Move combination pairs from 'outcome_interpretation' to 'combination'
        move_combination_pairs(corrected_quiz)

        # Step 4: Ensure 'combination' exists
        ensure_combination_exists(corrected_quiz)

        corrected_data.append(corrected_quiz)
        logging.debug(f"Quiz #{idx} corrected.")

    return corrected_data


def process_language(l: str):
    """Process a single language's JSON files."""
    try:
        logging.info(f"Processing language: {l}")

        input_path = os.path.join('..', '..', l, 'test', 'final_content.json')
        output_path = os.path.join('..', '..', l, 'test', 'final_content.json')

        if not os.path.exists(input_path):
            logging.error(f"Error: '{input_path}' file not found.")
            return

        # Read the input file
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logging.info(f"Loaded data for language '{l}'.")

        # Apply corrections
        corrected_data = fix_quiz_structure(data)
        logging.info(f"Structure fixed for language '{l}'.")

        # Write the corrected data to a new file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(corrected_data, f, indent=2, ensure_ascii=False)
        logging.info(f"Corrections written to '{output_path}' successfully!")

    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error for language '{l}': {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred for language '{l}': {e}")


def main():
    for l in LANGUAGES:
        process_language(l)


if __name__ == "__main__":
    main()
