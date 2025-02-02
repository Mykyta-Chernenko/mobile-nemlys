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
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 4000,
}
MAX_WORKERS = 20

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

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY


def read_content_json() -> List[Dict]:
    try:
        with open('./content.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def write_content_json(data: List[Dict]):
    with open('./content.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def call_gpt(job: str) -> List[Dict]:
    system_prompt = """
    You are a professional relationship coach, psychotherapist in CBT practice.
    You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online or offline.
    
    Here are some good quality questions for couples on different topics:
    
    Meaningful conversations:
    - If you could fix one world problem, what would it be?
    - Should prisoners with full life sentences be given the chance to end their life rather than live out their days locked up?
    
    Fun:
    - Do you like to travel? What's the most exciting place you've been?
    - What's your go-to drink order?
    - Do you have a preferred streaming platform?
    
    Emotions and Getting to know each other:
    - How should I support you when you feel down?
    - What did you cry about the last time you cried?
    
    Generate questions that will not potentially overlap with other jobs. For example, if the topic is "having_new_experiences", do not produce questions about "how would you like to move in together" because this naturally belongs to "prepare_for_moving_in_together".
    
    Be entertaining and laid-back. Write in a funny and light-hearted way, but ensure content is highly valuable and useful.
    Questions must vary in difficulty level - include both deeper and lighter questions, and be extremely creative.
    Each question can have multiple associated jobs if relevant. OUTPUT ONLY JSON STRING, NOTHING ELSE, NO DELIMETERS
    """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": "build_trust"},
        {"role": "assistant", "content": """[
            {
                "question": "What counts as cheating to you?",
                "job": ["understanding_mutual_compatibility", "build_trust", "preparing_for_intimacy", "improving_honesty_and_openness"]
            },
            {
                "question": "What past events have affected how you trust other people now?",
                "job": ["discussing_difficult_topics", "solving_relationship_problems", "building_trust"]
            }
        ]"""},
        {"role": "user", "content": "having_meaningful_conversations"},
        {"role": "assistant", "content": """[
            {
                "question": "What do you think people feel when they help others and how much it drives them to do what they do?",
                "job": ["having_meaningful_conversations", "understanding_mutual_compatibility"]
            }
        ]"""},
        {"role": "user",
         "content": f"Generate 30 unique, varied, and creative questions for the job: {job}\n\nRequirements:\n1. Questions must be unique and tailored to this specific job, at the same time, every question must have 1-5 jobs assosicated with it (only the jobs from the provided list!)\n2. Include a mix of light and deep questions\n3. Questions can reference other relevant jobs from this list: {', '.join(JOBS)}\n and no others 4. Return exactly 30 questions in valid JSON STRING format\n5. Make sure questions are diverse and don't resemble each other"}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call for job '{job}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            print(response)
            content = response.choices[0].message.content.strip()

            # Parse the response as JSON
            try:
                questions = json.loads(content)
                logging.info(f"Successfully generated {len(questions)} questions for job '{job}'")
                return questions
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON response for job '{job}': {e}")
                if attempt == MAX_RETRIES:
                    return []

        except Exception as e:
            logging.error(f"Error during API call for job '{job}': {e}")
            if attempt == MAX_RETRIES:
                return []
            time.sleep(RETRY_DELAY)

    return []


def process_job(job: str) -> List[Dict]:
    #     TODO there is no validation of the content, jobs can be random strings, validate it
    questions = call_gpt(job)
    if questions:
        # Read current content
        current_content = read_content_json()

        # Add new questions
        current_content.extend(questions)

        # Write updated content
        write_content_json(current_content)

        logging.info(f"Successfully processed job '{job}' and updated content.json")
        return questions
    return []


def main():
    logging.info("Starting question generation process")

    # Initialize empty content.json if it doesn't exist
    if not os.path.exists('./content.json'):
        write_content_json([])

    # Process jobs in parallel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_job = {executor.submit(process_job, job): job for job in JOBS}
        for future in as_completed(future_to_job):
            job = future_to_job[future]
            try:
                questions = future.result()
                logging.info(f"Completed processing job '{job}' with {len(questions)} questions")
            except Exception as exc:
                logging.error(f"Job '{job}' generated an exception: {exc}")

    logging.info("Question generation process completed")


if __name__ == "__main__":
    main()
