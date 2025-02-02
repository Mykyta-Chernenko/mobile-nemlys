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
    "model": "gpt-4o-mini",  # TODO change
    "max_tokens": 12000,
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

# Content types
CONTENT_TYPES = ["questions", "tests", "games", "exercises", "articles", "checkups"]

if not OPENAI_API_KEY:
    logging.error("OPENAI_API_KEY not found in environment variables.")
    exit(1)

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY


def read_content_json(path: str) -> List[Dict]:
    """
    Reads a JSON file and returns its content.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logging.error(f"Error reading {path}: {e}")
        return []


def write_json_file(path: str, data: List[Dict]):
    """
    Writes data to a JSON file.
    """
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logging.info(f"Successfully wrote to {path}")
    except Exception as e:
        logging.error(f"Error writing to {path}: {e}")


def call_gpt(job: str, content_titles: Dict[str, List[str]]) -> str:
    system_prompt = """
    You are a professional relationship coach, psychotherapist in CBT practice.
    You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.
    """
    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": """{
                                           "job": "getting_to_know_partner",
                                           "questions": [
                                             "How do you envision spending holidays together?",
                                             "How do you recharge after a long day?",
                                             "How do you feel about surprise conversations versus planned discussions?",
                                             "How do you feel about surprise date nights? What's your ideal surprise?",
                                             "How do you feel about surprise dates or planned outings?",
                                             "How do you feel about surprise romantic gestures?",
                                             "How do you feel about using humor to ease tense conversations?",
                                             "How do you feel about writing love notes to each other? Want to give it a try?",
                                             "Can boredom be helpful?",
                                             "Do you prefer mornings or nights? What's your favorite thing about them?",
                                             "Do you prefer solo workouts or exercising together?",
                                             "Do you prefer spontaneous adventures or planned activities for our future fun?",
                                             "Do you prefer spontaneous adventures or planned outings?",
                                             "Do you prefer spontaneous adventures or planned outings? How can we mix both?",
                                             "Do you prefer working out at home or hitting the gym?",
                                             "How do you express your creativity?",
                                             "How do you feel about dancing together, even if it's just in the living room?",
                                             "How do you feel about exploring new places or settings?",
                                             "If we could go on a crazy themed road trip, what would our theme be?",
                                             "If we could have a silly superpower as a couple, what would it be?",
                                             "What's a fun way to explore and embrace our differences together?",
                                             "What's a fun way we can explore each other's fantasies together?",
                                             "What's a funny memory from your childhood you'd like to share with me?",
                                             "What's a funny memory that helps us get through tough times?",
                                             "What's a funny nickname you'd like to have for me, and why?",
                                             "What's a new form of exercise you'd like to do together regularly?",
                                             "What's a new hobby we can start together to strengthen our bond?",
                                             "What's a new hobby we can try together that honors both our interests?",
                                             "What's a new hobby we could pick up together?",
                                             "What's a new hobby we could start together to improve our relationship?",
                                             "What's a new hobby we could start together to spice things up?",
                                             "What's a new sport or physical activity you'd like to try as a team?",
                                             "What's a new technology or gadget you'd like to explore together?",
                                             "What's a new way you'd like to give back to your community as a couple?",
                                             "If you could have dinner with any fictional character, who would it be and why?",
                                             "If you could have dinner with any three people, dead or alive, who would they be and why?",

                                             "If you could teleport anywhere right now, where would you both go and why?",
                                             "If you were a superhero, what would your power be?",
                                             "If you were the opposite sex for an hour, what would you like to try?",
                                             "If you won the lottery tomorrow, what would you do?",
                                             "If you won the lottery tomorrow, what's the first thing you'd do?",
                                             "If your current mood was a weather forecast, what would it be?",
                                             "What smartphone app do you mostly use?",
                                             "What topic could you talk about for hours?",
                                             "How important is it for us to have regular date nights, and why?",
                                             "What's a funny or sweet nickname you'd like to have for each other?",
                                             "What's a funny situation where trust played a key role?",
                                             "What's a game we could play to improve our conflict resolution skills?",
                                             "What's a hobby you'd like us to try together?",
                                             "What's a hobby you've always wanted to try together but haven't yet?",
                                             "Which Disney character was your most favorite?",
                                             "Which art form would you like to experience or create together?",
                                             "Which cuisine would you love to explore together and why?",
                                             "Which famous person would you invite over for dinner?",
                                             "Which festival or event would you like to experience together?",
                                             "Which outdoor activity would you love to try together, like hiking or kayaking?"
                                           ],
                                           "tests": [
                                             "Unwind Together: Discover Your Relaxation Style",
                                             "Discover Your Shared and Unique Hobbies!",
                                             "Ignite Your Creative Sparks",
                                             "Discover Your Perfect Date Night Dynamics",
                                             "Discover Your Playful Connection Style!",
                                             "Discover Your Relationship's Thrill-Seeking Style!",
                                             "How Does Humor Hold Your Relationship Together?"
                                           ],
                                           "games": [
                                             "Movie Match-Up Madness",
                                             "Adventure Awaits",
                                             "Laugh & Learn Quiz",
                                             "Compatibility Carnival",
                                             "Love & Laughter",
                                             "Trust Builders",
                                             "Hobby Harmony",
                                             "Cultural Quest",
                                             "Decor Dilemma",
                                             "Spice It Up!",
                                             "Faith & Fun",
                                             "Fitness Frenzy",
                                             "Fun Fact Hunt",
                                             "Date Night Planner",
                                             "Fun with Futures - Kids Edition"
                                           ],
                                           "exercises": [
                                             "Dance It Out",
                                             "Scavenger Hunt for Two",
                                             "Karaoke Session",
                                             "Teamwork Building Activities",
                                             "Cooking New Recipes",
                                             "Creative Drawing Contest",
                                             "Unusual Food Tasting",
                                             "Fitness Routine Together",
                                             "Passionate Dance Sessions",
                                             "Rebuilding Intimacy As Parents"
                                           ],
                                           "articles": [
                                             "Crafting Memorable Date Nights",
                                             "Exploring Shared Hobbies Together",
                                             "Laughing Together Keeps Love Strong",
                                             "Cultivating Daily Joy Together",
                                             "Fun Rituals to Strengthen Bonds"
                                           ],
                                           "checkups": [
                                             "Feelings Fiesta",
                                             "Balancing Our Unique Interests",
                                             "Truth Time Fun",
                                             "Balancing Fun and Intimacy in Sex",
                                             "Lifestyle and Interests Alignment",
                                             "Balancing Fun and Responsibilities",
                                             "Creative Date Designers"
                                           ]
                                         }
"""},
        {"role": "assistant", "content": """[{
                                                  "title": "The Road to Knowing Us Better",
                                                  "description": "This journey is designed to help you and your partner deepen your understanding of each other, strengthen your connection, and build a foundation for a lasting, fulfilling relationship. Through a mix of articles, tests, games, exercises, and thoughtful questions, you'll explore various aspects of your relationship, and have fun along the way.",
                                                  "subtopics": [
                                                      { "title": "Love Languages", "description": "Discover each other's preferred ways of giving and receiving love. Understanding love languages enhances emotional connection and satisfaction."},
                                                      { "title": "Shared Interests", "description": "Find common hobbies and activities that you both enjoy. Sharing interests can enhance your bond and provide enjoyable ways to spend time together."},
                                                      { "title": "Communication Styles", "description": "Identify and adapt to each other's unique ways of communicating. This subtopic focuses on recognizing different communication preferences and developing strategies to ensure clear and effective interactions."},
                                                      { "title": "Personal Histories", "description": "Delve into each other's pasts to understand the experiences that have shaped who you are today. This subtopic encourages sharing personal stories and memories to build deeper empathy and connection."},
                                                      { "title": "Core Values", "description": "Understanding each other's core values is essential for building a strong and harmonious relationship. This subtopic will help you identify and appreciate the values that guide each of you, fostering mutual respect and alignment in your partnership."},
                                                      { "title": "Building Trust and Transparency", "description": "Cultivate honesty and reliability to build a strong foundation of trust. Trust and transparency are essential for a secure and valued partnership."},
                                                      { "title": "Enhancing Communication and Trust", "description": "Effective communication and trust are pillars of a healthy relationship. This subtopic focuses on developing skills to express yourselves clearly, listen actively, and build a deeper sense of trust and understanding."}
                                                    ]
                                                }]"""},
        {"role": "user", "content": f"""
                In our app we have tests, games, articles, exercises, checkups and questions
                Journey is a N-day course which gives you one piece of content every day, grouped on one topic, for example good example of journey topics coule be:
                "Mastering Good Communication", "Making Long Distance Relationship Work", "How To Be A Good Partner"

                Your job will be to generated as many journeys as it makes sense for the content we have and the given job

            Generate only 1 journey for the job: {job}
            here is the content we have {json.dumps(content_titles)}
            journey title must be closely resembling the job: {job}

            Requirements:
            Journey must be teaching the user something and follow some development progression that makes sense
            Journey subtopics must be in a logical progression starting from easier progressing to harder ones
            1. For every Journey generate 4-6 subtopics that is a group of content, for very general subtopic create title and description, the subtopic must be relevant some topics in the different content types I provided
            6. NEVER OUTPUT 'json```' and '```' delimeters,
            follow the structure of the example closely, keys are "title", "description", "subtopics" must contain array with keys "title" and "description", nothing else
             return simply json string that can be parsed with json.loads(), nothing else"""}
    ]
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages,
                max_tokens=PARAMS["max_tokens"]
            )
            content = response.choices[0].message.content.strip()
            logging.info("API call successful")
            return content
        except Exception as e:
            logging.error(f"Error during API call: {e}")
            if attempt < MAX_RETRIES:
                logging.info(f"Retrying after {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                logging.error("Max retries reached. Moving on.")
                return ""


def gather_content_titles(job: str) -> Dict[str, List[str]]:
    """
    Gathers all relevant content titles for a given job from different content types.
    """
    content_titles = {ctype: [] for ctype in CONTENT_TYPES}
    for ctype in CONTENT_TYPES:
        path = f'../{ctype}/final_content.json'
        contents = read_content_json(path)
        for item in contents:
            if ctype == 'questions' and not job in item.get('job', []):
                continue
            content_titles[ctype].append(item['title'])
    return content_titles


def generate_journey(job: str, content_titles: Dict[str, List[str]]) -> Dict:
    """
    Generates a journey for a given job by calling the OpenAI API.
    """

    response = call_gpt(job, content_titles)
    try:
        journeys = json.loads(response)
        logging.info(f"Generated journey for job '{job}' with '{journeys}'")
        return journeys
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse JSON response for journey '{job}': {e}")
        return {}


def process_journey(job: str):
    """
    Processes journey generation for a single job.
    """
    # Gather all relevant content titles
    content_titles = gather_content_titles(job)

    # Check if there is enough content to generate a journey
    total_content = sum(len(titles) for titles in content_titles.values())
    if total_content < 15:
        logging.warning(
            f"Not enough content to generate a full journey for job '{job}'. Required: 15, Available: {total_content}")

    # Generate the journey
    journeys = generate_journey(job, content_titles)
    if journeys:
        # Define journey output path
        journey_dir = './journeys'
        os.makedirs(journey_dir, exist_ok=True)
        journey_path = os.path.join(journey_dir, f'{job}_journey.json')
        # Write the journey to a JSON file
        write_json_file(journey_path, journeys)
    else:
        logging.error(f"Journey generation failed for job '{job}'.")


def main():
    logging.info("Starting game and journey generation process")

    # Initialize empty content.json if it doesn't exist
    if not os.path.exists('./content.json'):
        write_json_file('./content.json', [])

    # Process jobs in parallel for journey generation
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_job = {executor.submit(process_journey, job): job for job in JOBS}
        for future in as_completed(future_to_job):
            job = future_to_job[future]
            try:
                future.result()
                logging.info(f"Completed journey generation for job '{job}'")
            except Exception as exc:
                logging.error(f"Journey generation for job '{job}' generated an exception: {exc}")

    logging.info("Journey generation process completed")


if __name__ == "__main__":
    main()
