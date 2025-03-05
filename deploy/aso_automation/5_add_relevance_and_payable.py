import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict

import openai

# Configure logging
logging.basicConfig(level=logging.INFO)

# Set OpenAI API key and model
openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = "o3-mini"
MAX_RETRIES = 3
RETRY_DELAY = 2
BATCH = 40
APP_SHOT_DESCRIPTION = (
    "ai note transcribe app, helps you to record and take and transcribe business notes, "
    "using microphone, at work, or at university, record with ai, and get your notes sorted "
    "and configured and also write them down by hand and structure it"
)

# Few-shot examples
FEW_SHOT_EXAMPLES = [
    {
        "product": APP_SHOT_DESCRIPTION,
        "locale": "en-US",
        "keywords": ['free notes', 'notes', 'notas', 'diary', 'sex', 'screen', 'friend', 'teen school', 'ai meetings',
                     'notetaker', 'microphone',
                     'uni notes', 'work write', 'gather notes', 'transcribe', 'candy crush', 'instagram', 'whisper',
                     'otter', 'novel', 'take down my notes', 'diary work notes', 'nyheter', 'vær', 'нотатки',
                     'note app', '일기'],
        "output": [
            {"term": "free notes", "relevance": 80, "payable": 10},
            {"term": "notes", "relevance": 90, "payable": 50},
            {"term": "notas", "relevance": 90, "payable": 50},
            {"term": "diary", "relevance": 18, "payable": 30},
            {"term": "sex", "relevance": 0, "payable": 40},
            {"term": "screen", "relevance": 5, "payable": 40},
            {"term": "friend", "relevance": 0, "payable": 40},
            {"term": "teen school", "relevance": 35, "payable": 15},
            {"term": "ai meetings", "relevance": 85, "payable": 55},
            {"term": "notetaker", "relevance": 90, "payable": 50},
            {"term": "microphone", "relevance": 80, "payable": 50},
            {"term": "uni notes", "relevance": 85, "payable": 45},
            {"term": "work write", "relevance": 75, "payable": 70},
            {"term": "gather notes", "relevance": 85, "payable": 50},
            {"term": "transcribe", "relevance": 90, "payable": 50},
            {"term": "candy crush", "relevance": 5, "payable": 10},
            {"term": "instagram", "relevance": 5, "payable": 30},
            {"term": "whisper", "relevance": 70, "payable": 80},
            {"term": "otter", "relevance": 80, "payable": 80},
            {"term": "novel", "relevance": 10, "payable": 50},
            {"term": "take down my notes", "relevance": 90, "payable": 50},
            {"term": "diary work notes", "relevance": 70, "payable": 65},
            {"term": "nyheter", "relevance": 10, "payable": 50},
            {"term": "vær", "relevance": 5, "payable": 40},
            {"term": "нотатки", "relevance": 90, "payable": 50},
            {"term": "note app", "relevance": 90, "payable": 50},
            {"term": "일기", "relevance": 18, "payable": 30},
        ]
    },
]


def get_system_msg(description):
    """Returns the system message for the LLM prompt."""
    return f"""
You are a professional ASO Product Manager tasked with analyzing ASO keywords for an app. The app's description is: {description}.

For each keyword provided, generate four metrics:
1. **relevance**: Integer (1-100) indicating how related the keyword is to the app’s purpose, jobs, and audience. Unrelated terms should be <20. Relevance of 75+, means that the key word is exteremely revelevant as good as it gets, it can even be the title of the app, 50-70 means it is pretty relevant, 30-40 somewhat distanly relevant in some contexts. Be careful here, a lot of keywords are not very relevant
2. **payable**: Integer (1-100) indicating how payable the keyword’s audience is. Non-payable terms (e.g., "free") should be < 20; payable terms (e.g., "trust issues", "business meeting") higher., neutral or indecisive words get 50, most words are around 50  as it is hard to say what the audience is

You will receive a locale and a list of keywords. Return a JSON object with key 'result' containg an array containing a list of dictionaries, each with the "term" and its addittonal metrics, in the same order as the input.
you need to produce a list back of the exactly same size as the input, no words can be omitted, order must be exactly the same as it provided to you
by no means can you change the spelling of the terms, correct them or change the terms, god prohibits it and you will be punished for it
example input 
["notes"]
Example output:
{{"result": [{{"term": "notes", "relevance": 90, "payable": 70 }}]}}
"""


def call_llm(messages, words, must_size, must_keys):
    for attempt in range(MAX_RETRIES):
        try:
            response = openai.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)['result']

            expected_size = len(must_size)
            if not isinstance(parsed, list) or len(parsed) != expected_size:
                raise ValueError("LLM response size does not match expected size.")

            for item, original in zip(parsed, words):
                if not all(key in item for key in must_keys):
                    raise ValueError("LLM response is missing required keys.")

            return parsed

        except Exception as e:
            logging.error(f"LLM call attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                raise Exception(f"Failed after {MAX_RETRIES} attempts: {e}")


def process_batch(batch, locale, description):
    terms = [keyword["keyword_term"] for keyword in batch]
    user_msg = (
        f"Product description {description}"
        f"Locale: {locale}\n"
        f"Keywords: {json.dumps(terms)}\n"
        "Provide the metrics for each keyword, return json array."
    )

    messages = [{"role": "system", "content": get_system_msg(description)}]

    # Add few-shot examples
    for example in FEW_SHOT_EXAMPLES:
        few_shot_user = (
            f"Product description: {example['product']}\n"
            f"Locale: {example['locale']}\n"
            f"Keywords: {json.dumps(example['keywords'])}\n"
            "Provide the metrics for each keyword."
        )
        few_shot_assistant = json.dumps({"result": example["output"]}, indent=0, ensure_ascii=False)
        messages.append({"role": "user", "content": few_shot_user})
        messages.append({"role": "assistant", "content": few_shot_assistant})

    messages.append({"role": "user", "content": user_msg})

    response_list = call_llm(messages, terms, batch, ['term', "relevance",
                                                      "payable"])

    # Update original batch dictionaries with new metrics
    for keyword, metrics in zip(batch, response_list):
        keyword["relevance"] = metrics["relevance"]
        keyword["payable"] = metrics["payable"]

    logging.info(f"Batch processed: {locale}, {batch}")


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


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product name provided in arguments")
        raise ValueError("Please provide a product name as argument")

    product = sys.argv[1]
    product_desc = load_json("./product_description.json")
    iteration = product_desc[product]['iteration']
    description = product_desc[product]['description']
    logging.info(f"Using iteration: {iteration} for product: {product}")

    input_file = f"keywords_{product}_{iteration}_llm_competitors.json"
    output_file = f"keywords_{product}_{iteration}_llm_competitors_scored.json"

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    logging.info(f"Loaded keywords from '{input_file}'.")

    futures = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        for store, locales in data.items():
            for locale, keywords in locales.items():
                if not keywords:
                    continue

                batches = [keywords[i:i + BATCH] for i in range(0, len(keywords), BATCH)]

                for batch in batches:
                    future = executor.submit(process_batch, batch, locale, description)
                    futures.append(future)

        for future in as_completed(futures):
            try:
                future.result()
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            except Exception as e:
                logging.error(f"Batch processing failed: {e}")

    logging.info(f"Saved updated keywords to '{output_file}'.")


if __name__ == "__main__":
    main()
