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
, create "description" field for the two, which will in 3 sentences describe what the check up is about, what it is going to accomplish, how it will help the couple. The idea of a checkup is that you both in a couple evaluate a couple of statements and the higher you evaluate them the better state of yoru relationship is. Description must be not fluffy, up to the point, very clear
      """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": """{
           "job": ["discussing_finances", "discussing_difficult_topics"]
           "title": "Discussing Money Worries",
           "research": "Dr. Terri Orbuch found that when couples avoid difficult discussions about topics including money, they're less happy. The 2022 research project 'Money On My Mind: Investigating the Dynamics of Financial Worry' states that higher levels of financial worry aren't only detrimental to our sense of mental well-being but can also negatively impact the growth of our social networks and relationships. According to several studies, including two 2023 ones by Peetz et al. published in the Journal of Social and Personal Relationships, money can be one of the most persistent and ultimately destructive types of stress.",
           "questions": [
               "We're able to discuss our money worries together without fighting",
               "I feel comfortable bringing up financial concerns with my partner",
               "We agree on which finances to share and what to keep private",
               "I trust that I can count on my partner for emotional support when I'm worried about money",
               "Discussing any money worries together helps us feel more secure",
               "We can resolve our money disagreements efficiently",
           ]
       }"""},
        {"role": "assistant",
         "content": """Check whether you tackle financial concerns openly and directly. By rating statements on money communication, you can see where you excel and where you need improvement. Reducing financial tension through honest dialogue builds trust, security, and a healthier partnership."""},
        {"role": "user", "content": """{
                                                   "job": ["having_and_discussing_sex"],
                                                   "title": "Talking About Sex",
                                                   "research": "Studies consistently show that couples who speak openly about sex are the most satisfied — emotionally, physically, and sexually. Yet a study from Paired found that 1 in 5 people find sex to be the hardest topic to discuss with their partner.",
                                                   "questions": [
                                                       "We talk about the sex we're having",
                                                       "I feel comfortable articulating which sexual acts I like and dislike",
                                                       "I know which words my partner prefers to use to describe their body parts and specific sex acts",
                                                       "My partner knows which words I prefer to use to describe my body parts and specific sex acts",
                                                       "We've agreed which details of our sex life it is, and isn't, OK to discuss with others",
                                                       "Talking about sex together improves our sex life"
                                                   ]
                                               },"""},
        {"role": "assistant",
         "content": """This checkup evaluates how openly you two discuss your sexual experiences and boundaries. By reflecting on comfort levels with sexual communication, you can identify ways to enhance intimacy. Strengthening sexual dialogue fosters emotional connection and a more satisfying sex life."""},
        {"role": "user",
         "content": f"Generate description fro the item: {item} Requirements: description must explain what the content will help them with, it must use 'you' not generalizations, must be up to the point and not fluffy, DO NOT INCLUDE THE NAME OF THE CHECKUPS IN THE DESCRIPTION"}
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
    logging.info("Starting the process of adding 'description' to each checkup in final_content.json")

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
