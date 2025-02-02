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
BATCH_SIZE = 3
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

    For each check-up, assign 1-5 relevant jobs from the provided list. Consider:
    1. The primary purpose of the question
    2. Secondary benefits and related areas it might help with
    3. The depth and context of the question
    4. How the question might serve multiple relationship goals
    5. Some check-ups will belong to only 1 job, then assign 1 job to them
    6. If you are unsure whether belongs to a job, do not assign the job to the check-up, only assign jobs you are 100% are relevant
    7. Be especially careful with the obscene/raw/rough sex-related questions, assign them to only having_and_discussing_sex (but if it is a lighter question about intimacy in general, other topics are in play)
    Only use jobs from the provided list. Do not invent new jobs.
    Return ONLY a JSON array with question-job mappings. No explanations or additional text.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": """
  [{
    "title": "Open Dialogue About Desires",
    "research": "Effective communication about sexual desires and preferences is crucial for a fulfilling sex life. Research in relationship psychology indicates that couples who openly discuss their sexual needs report higher satisfaction and intimacy levels. By fostering an environment where both partners feel safe to express their desires, relationships can strengthen their emotional and physical connections. This check-up aims to assess the comfort and effectiveness of these conversations within your relationship.",
    "questions": [
      "I feel comfortable expressing my sexual desires to my partner.",
      "My partner listens attentively when I talk about my sexual needs.",
      "We regularly discuss what we enjoy during intimacy.",
      "I feel confident bringing up new sexual ideas with my partner.",
      "Our conversations about sex help enhance our overall relationship satisfaction.",
      "I trust my partner to understand and respect my sexual preferences.",
      "We are proactive in addressing any sexual concerns together."
    ]
  }, {
         "title": "Spontaneous Fun",
         "research": "Spontaneity injects excitement and fosters adaptability in relationships. Psychological research suggests that spontaneous fun can improve communication by creating relaxed atmospheres for open dialogue. Additionally, embracing spontaneous activities helps couples overcome differences by encouraging flexibility and mutual enjoyment. This spontaneity can lead to a more resilient and harmonious partnership.",
         "questions": [
           "We often engage in spontaneous fun activities.",
           "Spontaneous plans make our relationship more exciting.",
           "I feel free to suggest impromptu activities with my partner.",
           "Our spontaneous fun helps improve our communication.",
           "Embracing spontaneity helps us overcome differences.",
           "I enjoy unplanned adventures with my partner.",
           "Spontaneous activities bring us closer together."
         ]
       },
       {
        "job": ["getting_to_know_partner", "improving_relationship_satisfaction", "having_fun_and_entertainment"],
        "title": "Hobbies and Passions",
        "research": "Discovering each other's hobbies and interests can increase relationship satisfaction by providing opportunities for shared activities and mutual support. Engaging in each other's passions can lead to greater appreciation and bonding. Psych studies have shown that shared interests can foster a sense of teamwork and companionship.",
        "questions": [
          "We have explored each other's hobbies and interests together.",
          "I actively participate in my partner's favorite activities.",
          "Our shared hobbies have brought us closer as a couple.",
          "I appreciate the time my partner spends on their passions.",
          "We make time to engage in fun activities together regularly.",
          "Trying new activities together has been enjoyable for us.",
          "Our hobbies have provided meaningful experiences in our relationship."
        ]
      }
       ]"""},
        {"role": "assistant", "content": """[
        {
            "job": ['having_and_discussing_sex', 'improving_communication'],
            "title": "Open Dialogue About Desires",
            "research": "Effective communication about sexual desires and preferences is crucial for a fulfilling sex life. Research in relationship psychology indicates that couples who openly discuss their sexual needs report higher satisfaction and intimacy levels. By fostering an environment where both partners feel safe to express their desires, relationships can strengthen their emotional and physical connections. This check-up aims to assess the comfort and effectiveness of these conversations within your relationship.",
            "questions": [
              "I feel comfortable expressing my sexual desires to my partner.",
              "My partner listens attentively when I talk about my sexual needs.",
              "We regularly discuss what we enjoy during intimacy.",
              "I feel confident bringing up new sexual ideas with my partner.",
              "Our conversations about sex help enhance our overall relationship satisfaction.",
              "I trust my partner to understand and respect my sexual preferences.",
              "We are proactive in addressing any sexual concerns together."
            ]
          },
          {
           "job": ["having_fun_and_entertainment", "improving_relationship_satisfaction"],
           "title": "Spontaneous Fun",
           "research": "Spontaneity injects excitement and fosters adaptability in relationships. Psychological research suggests that spontaneous fun can improve communication by creating relaxed atmospheres for open dialogue. Additionally, embracing spontaneous activities helps couples overcome differences by encouraging flexibility and mutual enjoyment. This spontaneity can lead to a more resilient and harmonious partnership.",
           "questions": [
             "We often engage in spontaneous fun activities.",
             "Spontaneous plans make our relationship more exciting.",
             "I feel free to suggest impromptu activities with my partner.",
             "Our spontaneous fun helps improve our communication.",
             "Embracing spontaneity helps us overcome differences.",
             "I enjoy unplanned adventures with my partner.",
             "Spontaneous activities bring us closer together."
           ]
         },
         {
             "job": ["getting_to_know_partner", "improving_relationship_satisfaction", "having_fun_and_entertainment"],
             "title": "Hobbies and Passions",
             "research": "Discovering each other's hobbies and interests can increase relationship satisfaction by providing opportunities for shared activities and mutual support. Engaging in each other's passions can lead to greater appreciation and bonding. Psych studies have shown that shared interests can foster a sense of teamwork and companionship.",
             "questions": [
               "We have explored each other's hobbies and interests together.",
               "I actively participate in my partner's favorite activities.",
               "Our shared hobbies have brought us closer as a couple.",
               "I appreciate the time my partner spends on their passions.",
               "We make time to engage in fun activities together regularly.",
               "Trying new activities together has been enjoyable for us.",
               "Our hobbies have provided meaningful experiences in our relationship."
             ]
           }
]"""},
        {"role": "user",
         "content": f"""Please assign relevant jobs to these 3 check ups. Only use jobs from this list: {', '.join(JOBS)}
For each ckeck-up assign 1-5 most relevant jobs. Return only valid JSON array, no other text, return the list of the check-ups back, wit the same content and a new key 'job' on every check-up:
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
