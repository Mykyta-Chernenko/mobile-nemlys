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

    Generate checkups that will not potentially overlap with other jobs. For example, if the topic is "explore_new_experience", do not produce check-ups about "how would you like to move in together" because this naturally belongs to "prepare_for_moving_in_together".
    
    Be entertaining and laid-back. Write in a funny and light-hearted way, but ensure content is highly valuable and useful.
    Questions must vary in difficulty level - include both deeper and lighter check-ups, and be extremely creative.

    The idea of the check-up you will create is that you will generate 7-10 questions for a check-up, partner will first answers the questions how much they agree to the following stance,
    which will show how much they are satisfied with the relationships, then their partner will answer the same, and we will show them the overall results of how they are both satisfied.
    Your job is to create the check-up title, research and the questions content
    """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": "discussing_finances"},
        {"role": "assistant", "content": """[
                {
                    "job": ["discussing_finances", "discussing_difficult_topics"]
                    "title": "Discussing Money Worries",
                    "description": "This checkup helps you tackle financial concerns openly and directly. By rating statements on money communication, partners can see where they excel and where they need improvement. Reducing financial tension through honest dialogue builds trust, security, and a healthier partnership.",
                    "research": "Dr. Terri Orbuch found that when couples avoid difficult discussions about topics including money, they're less happy. The 2022 research project 'Money On My Mind: Investigating the Dynamics of Financial Worry' states that higher levels of financial worry aren't only detrimental to our sense of mental well-being but can also negatively impact the growth of our social networks and relationships. According to several studies, including two 2023 ones by Peetz et al. published in the Journal of Social and Personal Relationships, money can be one of the most persistent and ultimately destructive types of stress.",
                    "questions": [
                        "We're able to discuss our money worries together without fighting",
                        "I feel comfortable bringing up financial concerns with my partner",
                        "We agree on which finances to share and what to keep private",
                        "I trust that I can count on my partner for emotional support when I'm worried about money",
                        "Discussing any money worries together helps us feel more secure",
                        "We can resolve our money disagreements efficiently",
                    ]
                }
            ...
        ]"""},
        {"role": "user", "content": "having_and_discussing_sex"},
        {"role": "assistant", "content": """[
        {
            "job": ["having_and_discussing_sex"],
            "title": "Talking About Sex",
            "description": "This checkup evaluates how openly you two discuss their sexual experiences and boundaries. By reflecting on comfort levels with sexual communication, partners can identify ways to enhance intimacy. Strengthening sexual dialogue fosters emotional connection and a more satisfying sex life.",
            "research": "Studies consistently show that couples who speak openly about sex are the most satisfied — emotionally, physically, and sexually. Yet a study from Paired found that 1 in 5 people find sex to be the hardest topic to discuss with their partner.",
            "questions": [
                "We talk about the sex we're having",
                "I feel comfortable articulating which sexual acts I like and dislike",
                "I know which words my partner prefers to use to describe their body parts and specific sex acts",
                "My partner knows which words I prefer to use to describe my body parts and specific sex acts",
                "We've agreed which details of our sex life it is, and isn't, OK to discuss with others",
                "Talking about sex together improves our sex life"
            ]
        },
        {
            "job": ["having_and_discussing_sex", "having_fun_and_entertainment"],
            "title": "Navigating Our Kinks",
            "description": "This checkup explores how each partner shares and embraces their unique sexual interests. By rating communication and comfort around kinks, you can maintain consent and deepen their bond. Embracing personal preferences together builds trust, excitement, and a more fulfilling connection.",
            "research": "Do you and your partner define yourselves as 'kinky'? Even though it's typically associated with BDSM and fetish, 'kinky' doesn't actually have an official clinical definition. What's kinky for one couple might be totally vanilla for another, and vice versa! A study in the Journal of Psychology and Sexuality found that those with positive associations with the word 'kinky' were more likely to self-identify with the term. Either way, communicating how you define sex acts, and how you feel about them, helps champion consent in your relationship.",
            "questions": [
                "We know how kinky we are as a couple",
                "I have spoken to my partner about my kinks",
                "My partner has spoken to me about their kinks",
                "The thought of trying new things in bed with my partner excites me",
                "Embracing our kinks benefits our sex life",
                "Thinking about our sex life excites us, regardless of whether it's kinky or not!"
            ]
        },
        {
            "job": ["having_and_discussing_sex", "building_trust"],
            "title": "Physical Comfort During Sex",
            "description": "This checkup centers on ensuring you two can feel physically at ease during sexual activity. By assessing how you communicate pain, pleasure, and preparation, you can proactively address concerns. Prioritizing comfort promotes trust, reduces discomfort, and enhances mutual satisfaction.",
            "research": "If you've experienced pain during sex, you're not alone. Alongside speaking to your doctor to rule out underlying medical conditions, Moraya Seeger DeGeare, a relationship therapist, also recommends talking to your partner about it. That encompasses communicating when you experience any unintentional pain or discomfort during sex itself, but Moraya also recommends setting time aside to discuss it separately. If you're struggling to know what does and doesn't feel good, Moraya recommends trying masturbation if that's something you're comfortable with. 'One of the main benefits of self-exploration is that it's a pressure-free way to learn more about your body,' she shares. 'Plus, sharing what you've learned can lead to better conversations and a more satisfying sex life.'",
            "questions": [
              "My partner's comfort is my priority during sex.",
              "If sex starts to feel painful, I tell my partner instead of pushing through the pain.",
              "If my partner expresses pain or discomfort during sex, I ask if and how they'd like to proceed.",
              "If I can't tell if my partner is feeling pleasure or pain, I ask them to check.",
              "We regularly engage in the right amount of 'foreplay' or preparation for me to find sex as pleasurable as possible.",
              "Ensuring each other's comfort during sex makes our sex life more satisfying."
            ]
          }
            ...
        ]"""},
        {"role": "user",
         "content": f"Generate 5 unique, varied, and creative check-ups for the job: {job} Requirements:1. Check-up must be unique and tailored to this specific job, at the same time, every check-up must have 1-3 jobs assosicated with it (only the jobs from the provided list!)2. Include a mix of light and deep check-ups, every check-up must have 5-10 questions, extremely important!!3. Checkups can reference other relevant jobs from this list: {', '.join(JOBS)} and no others 4. Return exactly 5 check-ups in valid JSON STRING format, no prefix, no suffix, just a string 5. Make sure checkups are diverse and don't resemble each other. 6. NEVER OUTPUT 'json```' and '```' delimeters, return simply json string that can be parsed with json.loads(), nothing else. For the 'research' key you must provide  either researches you are referring to or journals or psychology theories, and also description of the study, no need to include the exact name of the research or the year, then include the findings that are relevant for the check-up and what conclusions you can draw, make it 3-6 sentences. Questions/statements you generate MUST be answerable with the scale from 1 to 5 (strongly disagree -> strongly agree), only ask such questions. Generate 7-10 questions/statements for every check-up, not less"}
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
            content = content.replace("\n", "")
            content = content.replace("```", "")
            content = content.replace("*", "")
            content = content.replace("json", "")

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
