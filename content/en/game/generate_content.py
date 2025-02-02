import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List

import openai

# TODO introduce description
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
    You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.

    Generate games that will not potentially overlap with other jobs. For example, if the topic is "explore_new_experience", do not produce games about "how would you like to move in together" because this naturally belongs to "prepare_for_moving_in_together".
    
    Be entertaining and laid-back. Write in a funny and light-hearted way, but ensure content is highly valuable and useful.
    Questions must vary in difficulty level - include both deeper and lighter games, and be extremely creative.

    The idea of the game you will create is that you will generate 5 questions for a quiz, partner will first answers the question about what they
    think is true for them using options, and then the same questions what is true about their partners. Eventually they will learn about each other more.
    """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": "planning_for_future"},
        {"role": "assistant", "content": """[
                {
                  "job": ["planning_for_future", "getting_to_know_partner", "understanding_mutual_compatibility"],
                  "title": "Partner in Life Planning",
                  "description": "This game invites you to explore future goals, living arrangements, and long-term dreams revealing how closely your visions align. By comparing answers, you’ll uncover opportunities to support each other’s aspirations and build a more cohesive future together."
                  "questions": [
                    {
                      "question": "When picturing where you'd like to live in five years, you're most drawn to...",
                      "options": [
                        "Staying at the same address",
                        "Staying nearby, but in a different home",
                        "Relocating",
                        "Something else"
                      ]
                    },
                    {
                      "question": "When envisioning your forever home, you picture...",
                      "options": [
                        "A city apartment",
                        "A suburban house",
                        "A rural farmstead",
                        "Something else"
                      ]
                    },
                    {
                      "question": "When it comes to planning for retirement, you prefer to...",
                      "options": [
                        "Maximize contributions to retirement accounts",
                        "Focus on investing wisely",
                        "Save as much as possible",
                        "Something else"
                      ]
                    },
                    {
                      "question": "When thinking about your career in 10 years, you're most excited about...",
                      "options": [
                        "Being at the top of the corporate ladder",
                        "Owning a business",
                        "Working less, or retiring",
                        "Something else"
                      ]
                    },
                    {
                      "question": "When planning for the future, you'd feel most secure if you...",
                      "options": [
                        "Regularly discussed wishes and plans",
                        "Filled out important documents",
                        "Built up a savings fund for emergencies",
                        "Something else"
                      ]
                    }
                  ]
                },
            },
            {
             "job": ['planning_for_future', 'enhancing_love_and_affection', 'understanding_mutual_compatibility', 'getting_to_know_partner'],
              "title": "Plan Your Perfect Partner Day",
              "description": "Dive into everyday joys and preferences by designing an ideal day from morning to night for yourself and your partner. Comparing responses helps you to align on a definition of a great day, discover shared interests and new ways to make ordinary moments feel special."
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
            }
            ...
        ]"""},
        {"role": "user", "content": "discussing_finances"},
        {"role": "assistant", "content": """[
            {
              "title": "Tech Spending Habits",
              "description": "Test how well you know each other’s tech-buying impulses and habits. First, share how you personally handle gadgets, subscriptions, and upgrades, then guess your partner’s reactions. Comparing answers sparks conversations about balancing fun purchases and financial responsibility, deepening mutual understanding."
              "questions": [
                {
                  "question": "A new tech gadget has launched. You want it but only have savings left. Do you...",
                  "options": [
                    "Dip into savings",
                    "Check eBay",
                    "Finance it",
                    "Stoically wait until payday"
                  ]
                },
                {
                  "question": "How well do you manage your digital subscriptions?",
                  "options": [
                    "Excellently; like a fiscal ninja",
                    "Pretty well",
                    "Not great; a little randomly",
                    "They need managing?"
                  ]
                },
                {
                  "question": "How frequently do you upgrade your smartphone?",
                  "options": [
                    "Once a year or more",
                    "Every 2 to 3 years",
                    "Every 4 to 5 years",
                    "When the screen goes dark for the last time"
                  ]
                },
                {
                  "question": "If your tech spending habit was an animal, which would it be?",
                  "options": [
                    "Magpie (attracted to shiny new gadgets)",
                    "Squirrel (saves up for big-ticket items)",
                    "Dolphin (playful, gaming purchases)",
                    "Sloth (slow, deliberate tech adopter)"
                  ]
                },
                {
                  "question": "How do you prefer to negotiate shared tech purchases?",
                  "options": [
                    "Flip a coin",
                    "Run the numbers together",
                    "You got X, so I should be allowed Y",
                    "One person buys; the other has to deal with it"
                  ]
                }
              ]
            },
            {
              "job":["discussing_finances", "understanding_mutual_compatibility", "planning_for_future"],
              "title": "Budgeting Buddies",
              "description": "Get insights into each other’s approach to saving, budgeting, and financial priorities. Seeing where you converge or differ helps you collaborate on a financial plan that fits both of your lifestyles and ambitions.",
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
            }
        ]"""},
        {"role": "user",
         "content": f"Generate 6 unique, varied, and creative games for the job: {job} Requirements:1. Games must be unique and tailored to this specific job, at the same time, every game must have 1-3 jobs assosicated with it (only the jobs from the provided list!)2. Include a mix of light and deep games, every game must have 5 questions, and 4 options each for each questions, exteremelly important!!3. Games can reference other relevant jobs from this list: {', '.join(JOBS)} and no others 4. Return exactly 6 games in valid JSON STRING format, no prefix, no suffix, just a string5. Make sure games are diverse and don't resemble each other. 6. NEVER OUTPUT 'json```' and '```' delimeters, return simply json string that can be parsed with json.loads(), nothing else"}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call for job '{job}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            print(response)
            content = response.choices[0].message.content.strip("json```")
            content = content.strip("```")

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
