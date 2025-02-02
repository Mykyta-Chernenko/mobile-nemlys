import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Any

import openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 0
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 4000,
}
MAX_WORKERS = 20

# File paths
INPUT_FILE = './final_content.json'
OUTPUT_FILE = './final_content_with_description.json'

# Load environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY


def read_content_json(filepath: str) -> List[Dict[str, Any]]:
    """
    Reads the JSON data from `filepath` and returns it as a list of dictionaries.
    If the file does not exist or cannot be parsed, returns an empty list.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logging.warning(f"File '{filepath}' not found or invalid JSON. Returning empty list.")
        return []


def write_content_json(filepath: str, data: List[Dict[str, Any]]) -> None:
    """
    Writes the given list of dictionaries to the specified file as JSON.
    """
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def call_gpt_description(item: Dict[str, Any]) -> str:
    system_prompt = """
, create "description" field, which will in 3 sentences describe what the game is about, what it is going to accomplish, how it will help the couple. The idea of a game is to answer questions yourself, and then guess what the partner would answer, games help to get to know each other, and learn about each other, Description must be not fluffy, up to the point, very clear
      """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": """{
                                                   "job":["discussing_finances", "understanding_mutual_compatibility", "planning_for_future"],
                                                   "title": "Budgeting Buddies",
                                                   "questions": [
                                                     {
                                                       "question": "When it comes to saving money, you are...",
                                                       "options": [
                                                         "Very disciplined",
                                                         "Fairly good",
                                                         "Hit and miss",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "What's your biggest financial worry?",
                                                       "options": [
                                                         "Unexpected expenses",
                                                         "Not saving enough",
                                                         "Debt repayment",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "How do you prefer to handle budgeting?",
                                                       "options": [
                                                         "With a strict monthly budget",
                                                         "With a flexible spending plan",
                                                         "By just saving what's leftover",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "What's your top financial goal for the next year?",
                                                       "options": [
                                                         "Saving for a big purchase",
                                                         "Paying off debt",
                                                         "Building an emergency fund",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "What would most put your mind at ease when it comes to financial worries?",
                                                       "options": [
                                                         "Drafting individual budgets together",
                                                         "Drafting a shared budget together",
                                                         "Cutting back on joint expenses",
                                                         "Something else!"
                                                       ]
                                                     }
                                                   ]
                                                 }"""},
        {"role": "assistant",
         "content": """See who knowseach other’s approach to saving, budgeting, and financial priorities better. See where you converge or differ to collaborate on a financial plan that fits both of your lifestyles and ambitions.","""},
        {"role": "user", "content": """{
                                                  "job": ['planning_for_future', 'enhancing_love_and_affection', 'understanding_mutual_compatibility', 'getting_to_know_partner'],
                                                   "title": "Plan Your Perfect Partner Day",
                                                   "questions": [
                                                     {
                                                       "question": "How would you spend a perfect morning together?",
                                                       "options": [
                                                         "Sleeping in together",
                                                         "Going for a morning jog or walk",
                                                         "Visiting a local café",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "What would your idea of the perfect lunch together be?",
                                                       "options": [
                                                         "Hip city food trucks",
                                                         "A picnic in the park",
                                                         "A leisurely lunch at home",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "How would you want to spend the afternoon?",
                                                       "options": [
                                                         "Doing independent hobbies side-by-side",
                                                         "Trying something new together",
                                                         "Catching up with friends or family together",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "Pick your dream dinner plans...",
                                                       "options": [
                                                         "A romantic restaurant",
                                                         "Cozy takeout at home",
                                                         "Snacks at the movies",
                                                         "Something else!"
                                                       ]
                                                     },
                                                     {
                                                       "question": "How would you want to wrap up the day?",
                                                       "options": [
                                                         "Drinks somewhere trendy",
                                                         "Stargazing",
                                                         "Cuddles in bed",
                                                         "Something else!"
                                                       ]
                                                     }
                                                   ]
                                                 }"""},
        {"role": "assistant",
         "content": """Dive into everyday joys and preferences by designing an ideal day from morning to night for yourself and your partner. Comparing responses helps you to align on a definition of a great day, discover shared interests and new ways to make ordinary moments feel special"""},
        {"role": "user",
         "content": f"Generate description fro the item: {item} Requirements: description must explain what the game will help them with, it must use 'you' not generalizations, must be up to the point and not fluffy, it must focus on that you will learn something about your partner, and check who knows each other better DO NOT INCLUDE THE NAME OF THE CHECKUPS IN THE DESCRIPTION"}
    ]

    # Attempt the GPT call with retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(
                f"Attempting to generate 'description' for item '{item.get('title', 'Untitled')}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            content = response.choices[0].message.content.strip("json```")

            # Return the raw text
            return content

        except Exception as e:
            logging.error(f"Error generating description for '{item.get('title', 'Untitled')}': {e}")
            if attempt == MAX_RETRIES:
                return ""
            time.sleep(RETRY_DELAY)

    # If it fails all attempts, return empty
    return ""


def process_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls GPT to generate a description for the given item,
    and adds the 'description' key to the dictionary.
    """
    description = call_gpt_description(item)
    if description:
        item["description"] = description
    else:
        item["description"] = "Description could not be generated."
    return item


def main():
    logging.info("Starting the process of adding 'description' to each game in final_content.json")

    # Read content from the input file
    content = read_content_json(INPUT_FILE)
    if not content:
        logging.warning("No content found in final_content.json. Exiting.")
        return

    # Process items in parallel using threads
    updated_items = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_item = {executor.submit(process_item, item): item for item in content}
        for future in as_completed(future_to_item):
            original_item = future_to_item[future]
            try:
                result = future.result()
                updated_items.append(result)
            except Exception as exc:
                logging.error(f"Item '{original_item.get('title', 'Untitled')}' generated an exception: {exc}")

    # Write the updated items to output file
    write_content_json(OUTPUT_FILE, updated_items)
    logging.info(f"Process completed. Updated content with 'description' saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
