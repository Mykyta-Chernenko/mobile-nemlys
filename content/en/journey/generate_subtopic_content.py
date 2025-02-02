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


def call_gpt(job: str, content_titles: Dict[str, List[str]], subtopics) -> List[Dict]:
    system_prompt = """
    You are a professional relationship coach, psychotherapist in CBT practice.
    You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.
    your taks is to generate array of objects which are content types for a paragraph
    """
    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": """{
                                           "job": "getting_to_know_partner",
                                             "questions": [
                                               { "type": "question", "title": "How do you envision spending holidays together?", "id": 1001 },
                                               { "type": "question", "title": "How do you recharge after a long day?", "id": 1002 },
                                               { "type": "question", "title": "How do you feel about surprise conversations versus planned discussions?", "id": 1003 },
                                               { "type": "question", "title": "How do you prefer to communicate your needs and desires?", "id": 1004 },
                                               { "type": "question", "title": "How do you feel about surprise date nights? What's your ideal surprise?", "id": 1005 },
                                               { "type": "question", "title": "How do you feel about surprise dates or planned outings?", "id": 1006 },
                                               { "type": "question", "title": "How do you feel about surprise romantic gestures?", "id": 1007 },
                                               { "type": "question", "title": "How do you feel about using humor to ease tense conversations?", "id": 1008 },
                                               { "type": "question", "title": "How do you feel about writing love notes to each other? Want to give it a try?", "id": 1009 },
                                               { "type": "question", "title": "Can boredom be helpful?", "id": 1010 },
                                               { "type": "question", "title": "Do you prefer mornings or nights? What's your favorite thing about them?", "id": 1011 },
                                               { "type": "question", "title": "Do you prefer solo workouts or exercising together?", "id": 1012 },
                                               { "type": "question", "title": "Do you prefer spontaneous adventures or planned activities for our future fun?", "id": 1013 },
                                               { "type": "question", "title": "Do you prefer spontaneous adventures or planned outings?", "id": 1014 },
                                               { "type": "question", "title": "Do you prefer spontaneous adventures or planned outings? How can we mix both?", "id": 1015 },
                                               { "type": "question", "title": "Do you prefer working out at home or hitting the gym?", "id": 1016 },
                                               { "type": "question", "title": "How do you express your creativity?", "id": 1017 },
                                               { "type": "question", "title": "What's your favorite childhood memory?", "id": 1018 },
                                               { "type": "question", "title": "How do you feel about dancing together, even if it's just in the living room?", "id": 1019 },
                                               { "type": "question", "title": "How do you feel about exploring new places or settings?", "id": 1020 },
                                               { "type": "question", "title": "If we could go on a crazy themed road trip, what would our theme be?", "id": 1021 },
                                               { "type": "question", "title": "If we could have a silly superpower as a couple, what would it be?", "id": 1022 },
                                               { "type": "question", "title": "What's a fun way to explore and embrace our differences together?", "id": 1023 },
                                               { "type": "question", "title": "What's a fun way we can explore each other's fantasies together?", "id": 1024 },
                                               { "type": "question", "title": "What's a funny memory from your childhood you'd like to share with me?", "id": 1025 },
                                               { "type": "question", "title": "What's a funny memory that helps us get through tough times?", "id": 1026 },
                                               { "type": "question", "title": "What's a funny nickname you'd like to have for me, and why?", "id": 1027 },
                                               { "type": "question", "title": "What's a new form of exercise you'd like to do together regularly?", "id": 1028 },
                                               { "type": "question", "title": "What's a new hobby we can start together to strengthen our bond?", "id": 1029 },
                                               { "type": "question", "title": "What's a new hobby we can try together that honors both our interests?", "id": 1030 },
                                               { "type": "question", "title": "What's a new hobby we could pick up together?", "id": 1031 },
                                               { "type": "question", "title": "What's a new hobby we could start together to improve our relationship?", "id": 1032 },
                                               { "type": "question", "title": "What's a new hobby we could start together to spice things up?", "id": 1033 },
                                               { "type": "question", "title": "What's a new sport or physical activity you'd like to try as a team?", "id": 1034 },
                                               { "type": "question", "title": "What's a new technology or gadget you'd like to explore together?", "id": 1035 },
                                               { "type": "question", "title": "What's a new way you'd like to give back to your community as a couple?", "id": 1036 },
                                               { "type": "question", "title": "If you could have dinner with any fictional character, who would it be and why?", "id": 1037 },
                                               { "type": "question", "title": "If you could have dinner with any three people, dead or alive, who would they be and why?", "id": 1038 },
                                               { "type": "question", "title": "If you could teleport anywhere right now, where would you both go and why?", "id": 1039 },
                                               { "type": "question", "title": "If you were a superhero, what would your power be?", "id": 1040 },
                                               { "type": "question", "title": "If you were the opposite sex for an hour, what would you like to try?", "id": 1041 },
                                               { "type": "question", "title": "If you won the lottery tomorrow, what would you do?", "id": 1042 },
                                               { "type": "question", "title": "If you won the lottery tomorrow, what's the first thing you'd do?", "id": 1043 },
                                               { "type": "question", "title": "If your current mood was a weather forecast, what would it be?", "id": 1044 },
                                               { "type": "question", "title": "What smartphone app do you mostly use?", "id": 1045 },
                                               { "type": "question", "title": "What's your favorite memory of us having a great conversation?", "id": 1046 },
                                               { "type": "question", "title": "What topic could you talk about for hours?", "id": 1047 },
                                               { "type": "question", "title": "How important is it for us to have regular date nights, and why?", "id": 1048 },
                                               { "type": "question", "title": "What's a funny or sweet nickname you'd like to have for each other?", "id": 1049 },
                                               { "type": "question", "title": "What's a funny situation where trust played a key role?", "id": 1050 },
                                               { "type": "question", "title": "What's a game we could play to improve our conflict resolution skills?", "id": 1051 },
                                               { "type": "question", "title": "What's a hobby you'd like us to try together?", "id": 1052 },
                                               { "type": "question", "title": "What's a hobby you've always wanted to try together but haven't yet?", "id": 1053 },
                                               { "type": "question", "title": "What were the childhood situations that formed you the most?", "id": 1054 },
                                               { "type": "question", "title": "Which Disney character was your most favorite?", "id": 1055 },
                                               { "type": "question", "title": "Which art form would you like to experience or create together?", "id": 1056 },
                                               { "type": "question", "title": "Which cuisine would you love to explore together and why?", "id": 1057 },
                                               { "type": "question", "title": "Which famous person would you invite over for dinner?", "id": 1058 },
                                               { "type": "question", "title": "Which festival or event would you like to experience together?", "id": 1059 },
                                               { "type": "question", "title": "Which outdoor activity would you love to try together, like hiking or kayaking?", "id": 1060 }
                                             ],
                                             "tests": [
                                               { "type": "test", "title": "Unwind Together: Discover Your Relaxation Style", "id": 2000 },
                                               { "type": "test", "title": "Discover Your Shared and Unique Hobbies!", "id": 2001 },
                                               { "type": "test", "title": "Life Stories Unveiled: Discover Each Other's Journeys!", "id": 2002 },
                                               { "type": "test", "title": "Ignite Your Creative Sparks", "id": 2003 },
                                               { "type": "test", "title": "Discover Your Perfect Date Night Dynamics", "id": 2004 },
                                               { "type": "test", "title": "Discover Your Playful Connection Style!", "id": 2005 },
                                               { "type": "test", "title": "Discover Your Relationship's Thrill-Seeking Style!", "id": 2006 },
                                               { "type": "test", "title": "How Does Humor Hold Your Relationship Together?", "id": 2007 },
                                               { "type": "test", "title": "Discover Your Communication Style", "id": 2008 }
                                             ],
                                             "games": [
                                               { "type": "game", "title": "Movie Match-Up Madness", "id": 3000 },
                                               { "type": "game", "title": "Adventure Awaits", "id": 3001 },
                                               { "type": "game", "title": "Laugh & Learn Quiz", "id": 3002 },
                                               { "type": "game", "title": "Compatibility Carnival", "id": 3003 },
                                               { "type": "game", "title": "Love & Laughter", "id": 3004 },
                                               { "type": "game", "title": "Communication Clues", "id": 3005 },
                                               { "type": "game", "title": "Trust Builders", "id": 3006 },
                                               { "type": "game", "title": "Hobby Harmony", "id": 3007 },
                                               { "type": "game", "title": "Memory Lane Mixer", "id": 3008 },
                                               { "type": "game", "title": "Cultural Quest", "id": 3009 },
                                               { "type": "game", "title": "Decor Dilemma", "id": 3010 },
                                               { "type": "game", "title": "Spice It Up!", "id": 3011 },
                                               { "type": "game", "title": "Faith & Fun", "id": 3012 },
                                               { "type": "game", "title": "Fitness Frenzy", "id": 3013 },
                                               { "type": "game", "title": "Fun Fact Hunt", "id": 3014 },
                                               { "type": "game", "title": "Date Night Planner", "id": 3015 },
                                               { "type": "game", "title": "Fun with Futures - Kids Edition", "id": 3016 }
                                             ],
                                             "exercises": [
                                               { "type": "exercise", "title": "Dance It Out", "id": 4000 },
                                               { "type": "exercise", "title": "Scavenger Hunt for Two", "id": 4001 },
                                               { "type": "exercise", "title": "Karaoke Session", "id": 4002 },
                                               { "type": "exercise", "title": "Teamwork Building Activities", "id": 4003 },
                                               { "type": "exercise", "title": "Cooking New Recipes", "id": 4004 },
                                               { "type": "exercise", "title": "Creative Drawing Contest", "id": 4005 },
                                               { "type": "exercise", "title": "Unusual Food Tasting", "id": 4006 },
                                               { "type": "exercise", "title": "Fitness Routine Together", "id": 4007 },
                                               { "type": "exercise", "title": "Passionate Dance Sessions", "id": 4008 },
                                               { "type": "exercise", "title": "Rebuilding Intimacy As Parents", "id": 4009 },
                                               { "type": "exercise", "title": "Active Listening Practice", "id": 4010 }
                                             ],
                                             "articles": [
                                               { "type": "article", "title": "Crafting Memorable Date Nights", "id": 5000 },
                                               { "type": "article", "title": "Exploring Shared Hobbies Together", "id": 5001 },
                                               { "type": "article", "title": "Laughing Together Keeps Love Strong", "id": 5002 },
                                               { "type": "article", "title": "Cultivating Daily Joy Together", "id": 5003 },
                                               { "type": "article", "title": "Fun Rituals to Strengthen Bonds", "id": 5004 },
                                               { "type": "article", "title": "Mastering Communication Techniques", "id": 5005 }
                                             ],
                                             "checkups": [
                                               { "type": "checkup", "title": "Feelings Fiesta", "id": 6000 },
                                               { "type": "checkup", "title": "Balancing Our Unique Interests", "id": 6001 },
                                               { "type": "checkup", "title": "Mastering Communication Skills", "id": 6002 },
                                               { "type": "checkup", "title": "Truth Time Fun", "id": 6003 },
                                               { "type": "checkup", "title": "Balancing Fun and Intimacy in Sex", "id": 6004 },
                                               { "type": "checkup", "title": "Lifestyle and Interests Alignment", "id": 6005 },
                                               { "type": "checkup", "title": "Balancing Fun and Responsibilities", "id": 6006 },
                                               { "type": "checkup", "title": "Creative Date Designers", "id": 6007 },
                                               { "type": "checkup", "title": "Exploring Childhood Memories", "id": 6008 }
                                             ]


                                         {"title": "Building Communication Foundations", "description": "Learn the basics of the communication together through understanding what you communication style is and improving it"},
                                         {"title": "Get to know each other's childhood", "description": "The the stories from the childhood that formed you today"}

"""},
        {"role": "assistant", "content": """[
            [
                                                  {"type":"test": "Discover Your Communication Style", "id": 2008},
                                                  {"type":"question": "How do you prefer to communicate your needs and desires?", "id": 1004},
                                                  {"type":"article": "Mastering Communication Techniques", "id": 5005},
                                                  {"type":"game": "Communication Clues", "id": 3005},
                                                  {"type":"checkup": "Mastering Communication Skills", "id": 6002},
                                                  {"type":"exercise": "Active Listening Practice", "id": 4010},
                                                  {"type":"question": "What's your favorite memory of us having a great conversation?", "id": 1046},
                                                ],
                                                [
                                                   {"type": "question", "title":"What's your favorite childhood memory?", "id": 1018},
                                                   {"type": "test", "title":"Life Stories Unveiled: Discover Each Other's Journeys!" "id": 2002}},
                                                   {"type": "game", "title": "Memory Lane Mixer" "id": 3008}},
                                                   {"type": "question", "title":"What were the childhood situations that formed you the most?" "id": 1054}},
                                                   {"type": "checkup", "title": "Exploring Childhood Memories" "id": 6008}},
                                                ]
                                                ]

                                                """},
        {"role": "user", "content": f"""
            your jobs is to generate the conte type array for all the paragraph we will provide
            This is the job you are generating the content for the job: {job}
            here is the content we have, all_content: {json.dumps(content_titles)}
            here is the paragraph you will generate the content for {json.dumps(subtopics)}
            out of all this content select 1 article, 1 test, 1 game, 1 checkup, 1 exercise and 2 questions that are highly relevant for this paragraph, if you cannot find a piece of content type that is relevant, simply omit it.
            they must be in the order that makes sense of a progression, for example: [test, question, article, game, checkup, question, exercise] or [game, test, question, exercise, question, article, checkup]. Follow different order for every paraphra, do not stuck questions right after each other
            Requirements:
            Content must highly match the subgroup title and idea
            You must select content from the provided content
            the content selection order must provide a logical buildup
            you must reutn array of objects with keys 'type' (question|test|game|exercise|article|checkup) and 'title', nothing else like [ {{"type": "question", "title":"What's your favorite childhood memory?"}},  {{"type": "test", "title":"..."}}
            1. if not content type is relevant, do not include the content type at all, rather be sure than including something you are unsure in
            6. NEVER OUTPUT 'json```' and '```' delimeters,
               IF a specific content used in one paragraph, it CANNOT be used again in other paraphras, all selected content must be unique across all paragraphs
              7. You must return array of the content type object, in the order that makes sense to ask couples in
                          return simply json string that can be parsed with json.loads(), nothing else
                          always start with test or checkup
                          generate as many content blocks and we provide subtopics, e.g. if there are 3 subtopics, return with array of 3 elements. You can also select content for the paragraphs, available from all_content and NOTHING ELSE, NEVER MAKE UP non-existent content you have not seen in the prompt, you can be punished for including non-existant content
                          for every content piece, output 'type', 'title' and the 'id' of the content part that matches the id provided from the overall content, like {{"title":"What's your favorite childhood memory?", "type":"question", "id":132}} ID MUST BE REAL and provided in the all_content
             """}
    ]
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages,
            )
            content = response.choices[0].message.content.strip()
            content = content.replace("\n", "")
            content = content.replace("```", "")
            content = content.replace("*", "")
            content = content.replace("json", "")
            logging.info(f"API call successful {content}")
            return json.loads(content)
        except Exception as e:
            logging.error(f"Error during API call: {e}")
            if attempt < MAX_RETRIES:
                logging.info(f"Retrying after {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                logging.error("Max retries reached. Moving on.")
                return ""


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


def gather_content_titles(job: str) -> Dict[str, List[str]]:
    """
    Gathers all relevant content titles for a given job from different content types.
    """
    content_titles = {ctype: [] for ctype in CONTENT_TYPES}
    for i, ctype in enumerate(CONTENT_TYPES):
        path = f'../{ctype}/final_content.json'
        contents = read_content_json(path)
        for ind, item in enumerate(contents):
            if ctype == 'questions':
                # Assuming each question item has a 'job' field as a list
                if 'job' in item and job in item['job']:
                    content_titles[ctype].append({"title": item['title'], "type": ctype, "id": (i + 1) * 1000 + ind})
            else:
                # For other content types, assume all items are relevant
                content_titles[ctype].append({"title": item['title'], "type": ctype, "id": (i + 1) * 1000 + ind})
    return content_titles


def process_journey_file(path: str, job: str, content_titles: Dict[str, List[str]]):
    """
    Processes a single journey JSON file by adding content to each subtopic.
    """
    journey = read_content_json(path)
    if not journey:
        logging.error(f"Journey file {path} is empty or invalid.")
        return

    subtopics = journey.get('subtopics', [])
    if not subtopics:
        logging.warning(f"No subtopics found in {path}.")
        return
    all_subtopics = [{"title": x["title"], "description": x["description"]} for x in subtopics]
    logging.info(f"Generating content for subtopic {all_subtopics}")
    content = call_gpt(job, content_titles, all_subtopics)
    if content and len(content) == len(all_subtopics):
        for topic, c in zip(all_subtopics, content):
            topic['content'] = c
        journey['subtopics'] = all_subtopics
        write_json_file(path.replace('_journey.json', '_journey_with_content.json'), journey)
        logging.info(f"Content added to subtopic '{all_subtopics}' in '{path}'")
    else:
        logging.warning(f"No content generated for subtopic '{subtopic_title}' in '{path}'")


def main():
    logging.info("Starting journey content generation process")

    journey_dir = './journeys'
    if not os.path.exists(journey_dir):
        logging.error(f"Journey directory '{journey_dir}' does not exist.")
        exit(1)

    # List all journey JSON files
    journey_files = [f for f in os.listdir(journey_dir) if f.endswith('_journey.json')]
    if not journey_files:
        logging.error(f"No journey JSON files found in '{journey_dir}'.")
        exit(1)

    # Process journeys in parallel
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_journey = {}
        for journey_file in journey_files:
            path = os.path.join(journey_dir, journey_file)
            # Extract job name from filename, assuming format '{job}_journey.json'
            job = journey_file.replace('_journey.json', '')
            if job not in JOBS:
                logging.warning(f"Job '{job}' extracted from '{journey_file}' is not in the predefined JOBS list.")
                continue
            content_titles = gather_content_titles(job)
            future = executor.submit(process_journey_file, path, job, content_titles)
            future_to_journey[future] = journey_file

        for future in as_completed(future_to_journey):
            journey_file = future_to_journey[future]
            try:
                future.result()
                logging.info(f"Completed content generation for journey '{journey_file}'")
            except Exception as exc:
                logging.error(f"Journey generation for '{journey_file}' generated an exception: {exc}")

    logging.info("Journey content generation process completed")


if __name__ == "__main__":
    main()
