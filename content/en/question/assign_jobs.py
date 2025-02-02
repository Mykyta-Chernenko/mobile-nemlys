import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List

import openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 0
BATCH_SIZE = 20
MAX_WORKERS = 20
PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 0,
    "max_tokens": 4000,
    "top_p": 1,
    "n": 1,
    "stop": None,
}

# All available jobs
JOBS = [
    "getting_to_know_partner", "having_fun_and_entertainment",
    "having_and_discussing_sex", "understanding_mutual_compatibility",
    "improving_communication", "solving_relationship_problems",
    "having_meaningful_conversations", "discussing_difficult_topics",
    "planning_for_future", "building_trust", "overcoming_differences",
    "improving_relationship_satisfaction", "exploring_feelings",
    "having_new_experiences", "preparing_for_cohabitation",
    "preparing_for_intimacy", "discussing_religions",
    "improving_honesty_and_openness", "learning_relationship_skills",
    "discussing_finances", "enhancing_love_and_affection",
    "rekindling_passion", "introducing_healthy_habits",
    "preparing_for_children", "preparing_for_marriage"
]

# Load environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY


def read_content_without_jobs() -> List[str]:
    with open('./content_without_jobs.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def write_final_content(data: List[Dict]):
    with open('./final_content.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def assign_jobs_to_questions(questions: List[str]) -> List[Dict]:
    system_prompt = """
    You are a relationship coach and CBT psychotherapist who specializes in categorizing relationship questions into specific jobs/goals they help achieve.

    For each question, assign 1-5 relevant jobs from the provided list. Consider:
    1. The primary purpose of the question
    2. Secondary benefits and related areas it might help with
    3. The depth and context of the question
    4. How the question might serve multiple relationship goals
    5. Some questions will belong to only 1 job, then assign 1 job to them
    6. If you are unsure whether belongs to a job, do not assign the job to the question, only assign jobs you are 100% are relevant
    7. Be especially careful with the obscene/raw/rough sex-related questions, assign them to only having_and_discussing_sex (but if it is a lighter question about intimacy in general, other topics are in play)
    Only use jobs from the provided list. Do not invent new jobs.
    Return ONLY a JSON array with question-job mappings. No explanations or additional text.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": """Please assign relevant jobs to these questions:
[
    "What counts as cheating to you?",
    "How do you prefer to receive affection?"
    "What's your plan for dealing with sleepless nights and diaper changes?"
]"""},
        {"role": "assistant", "content": """[
    {
        "question": "What counts as cheating to you?",
        "job": ["understanding_mutual_compatibility", "building_trust", "preparing_for_intimacy", "improving_honesty_and_openness"]
    },
    {
        "question": "How do you prefer to receive affection?",
        "job": ["enhancing_love_and_affection", "improving_communication", "getting_to_know_partner"]
    },
    {
        "question": "What's your plan for dealing with sleepless nights and diaper changes?",
        "job": ["preparing_for_children"]
    }
]"""},
        {"role": "user", "content": """Please assign relevant jobs to these questions:
[
    "What's your love language?",
    "How do you handle stress?",
    "What's your stance on potty training?",
    "Where's the weirdest place you've ever masturbated?",
    "How do you integrate your faith with your personal hobbies or interests?",
    "Does love and companionship give life more meaning?"
]"""},
        {"role": "assistant", "content": """[
    {
        "question": "What's your love language?",
        "job": ["getting_to_know_partner", "enhancing_love_and_affection", "improving_communication"]
    },
    {
        "question": "How do you handle stress?",
        "job": ["getting_to_know_partner", "improving_communication"]
    },
    {
        "question": "What's your stance on potty training?",
        "job": ["preparing_for_children"]
    },
    {
        "question": "Where's the weirdest place you've ever masturbated?",
        "job": ["having_and_discussing_sex"]
    },
    {
        "question": "How do you integrate your faith with your personal hobbies or interests?",
        "job": ["discussing_religions"]
    },
    {
        "question": "Does love and companionship give life more meaning?",
        "job": ["having_meaningful_conversations"]
    }
]"""},
        {"role": "user",
         "content": f"""Please assign relevant jobs to these questions. Only use jobs from this list: {', '.join(JOBS)}
For each question assign 1-5 most relevant jobs. Return only valid JSON array, no other text:
{json.dumps(questions)}"""}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(
                f"Attempting API call for batch of {len(questions)} questions (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            content = response.choices[0].message.content.strip()

            try:
                result = json.loads(content)
                logging.info(f"Successfully processed {len(result)} questions")
                return result
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON response: {e}")
                if attempt == MAX_RETRIES:
                    return []

        except Exception as e:
            logging.error(f"Error during API call: {e}")
            if attempt == MAX_RETRIES:
                return []
            time.sleep(RETRY_DELAY)

    return []


def process_batch(questions: List[str]) -> List[Dict]:
    result = assign_jobs_to_questions(questions)
    if result:
        logging.info(f"Successfully processed batch of {len(result)} questions")
    else:
        logging.error("Failed to process batch")
    return result


def main():
    logging.info("Starting job assignment process")

    # Read questions without jobs
    questions = read_content_without_jobs()
    logging.info(f"Loaded {len(questions)} questions from content_without_jobs.json")

    # Split questions into batches
    batches = [questions[i:i + BATCH_SIZE] for i in range(0, len(questions), BATCH_SIZE)]
    logging.info(f"Split questions into {len(batches)} batches")

    all_results = []

    # Process batches in parallel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_batch = {executor.submit(process_batch, batch): batch for batch in batches}

        for future in as_completed(future_to_batch):
            batch = future_to_batch[future]
            try:
                result = future.result()
                if result:
                    all_results.extend(result)
                    # Write intermediate results
                    write_final_content(all_results)
                    logging.info(f"Saved intermediate results with {len(all_results)} questions processed")
            except Exception as exc:
                logging.error(f"Batch processing generated an exception: {exc}")

    # Write final results
    write_final_content(all_results)
    logging.info(f"Job assignment process completed. Processed {len(all_results)} questions")


if __name__ == "__main__":
    main()
