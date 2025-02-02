import json
import logging
import os
import time
from typing import Dict, List

import openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 0
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 12000,
}
MAX_WORKERS = 20

jobs_with_titles = {
    "getting_to_know_partner": [
        "Find Out Your Love Language",
        "Attachment Style Identification",
        "Hobbies and Interests Exercise",
        "Role Reversal Exercise",
        "Soul Gazing",
        "Significant Life Events Game",
        "Ideal Day Exercise",
    ],
    "having_fun_and_entertainment": [
        "Dance It Out",
        "Scavenger Hunt for Two",
        "Karaoke Session",
        "Cooking New Recipes",
        "Creative Drawing Contest"
    ],
    "having_and_discussing_sex": [
        "Talking About Sex Practice",
        "Sensual Exploration Night",
        "Sexual Bucket List Creation",
        "Fantasy Sharing Session",
        "Mutual Consent Practices",
        "Tantric Intimacy Exercise",
        "Extended Cuddle time",
        "Pleasure Mapping",
        "Erotic Massage Exchange",
        "Long Kisses Exercise",
        "Creating Arousal Map"
    ],
    "understanding_mutual_compatibility": [
        "Values Alignment Exercise",
        "Lifestyle Preferences Exercise",
        "Future Goals Compatibility",
        "Conflict Resolution Styles",
        "Emotional Needs Compatibility"
    ],
    "improving_communication": [
        "The CleverMemo PIT-STOP",
        "Positive Language Exercise",
        "I Statement Practice",
        "'I Feel __ when __\' Exercises",
        "Active Listening Practice",
        "Nonviolent Communication Practice",
        "Expressing Gratitude Session",
        "Mirroring Exercises",
        "Feedback Exchange Session",
        "Empathy Building Activities",
        "Body Language Awareness",
    ],
    "solving_relationship_problems": [
        "Learning To Say Sorry Practice",
        "Emotional Regulation Techniques",
        "Root Cause Analysis",
        "Conflict Resolution Strategies Practice",
        "Issue Prioritization Exercise",
        "Pros and Cons Listing",
        "Apology and Forgiveness Practice",
        "Stress Management Techniques",
        "Unresolved Issues Addressing Practice",
    ],
    "having_meaningful_conversations": [
        "What If Game",
        "Life Purpose Session",
        "Current Events Debate",
    ],
    "discussing_difficult_topics": [
        "Tough Talks Toolkit",
        "Sensitive Subjects Dialogue Practice",
        "Crisis Management Discussion Practice",
        "Conflict Triggers Identification",
        "Jealously Navigation Technique"
    ],
    "planning_for_future": [
        "SMART Goals Planning",
        "Short-Term Goal Setting Date",
        "Financial Planning Session",
        "Retirement Dreams Mapping",
        "Long-Term Goal Planning",
        "Family Planning Exercise",
        "Children Planning Exercise",
        "Moving-in Exercise",
        "Health and Wellness Goals",
    ],
    "building_trust": [
        "Trust Fall",
        "Transparency Talks",
        "Honesty Commitment Ritual",
        "Forgiveness Practices",
        "Confidentiality Agreements",
        "Cheating Alignment Session",
        "Rebuild Trust Session"
    ],
    "overcoming_differences": [
        "Cultural Exchange Day",
        "Mutual Respect Workshops",
        "Difference Identification and Acceptance",
        "Conflict Style Analysis",
        "Empathy Development Exercises",
        "Tolerance Building Activities",
        "Flexible Role Playing"
    ],
    "improving_relationship_satisfaction": [
        "Positive Reinforcement Practices",
        "Quality Time Planning",
        "Affectionate Gestures Exchange",
        "Celebrating Milestones Together",
        "Balancing Give and Take Exercise",
    ],
    "exploring_feelings": [
        "Vulnerability Exploration Session",
        "Feelings Journal Sharing",
        "Mood Tracking Together",
        "Emotional Expression Sessions",
        "Feelings Identification Game",
        "Mindful Emotional Awareness",
        "Shared Mood Boards",
        "Feelings Validation Practices",
        "Emotional Support Exercises"
    ],
    "having_new_experiences": [
        "Try Something New Day",
        "Adventure Challenge",
        "Outdoor Exploration Adventures",
        "Unusual Food Tasting",
        "Artistic Expression Days",
    ],
    "preparing_for_cohabitation": [
        "Home Organization Planning",
        "Shared Responsibilities Mapping",
        "Living Space Design",
        "Household Budgeting Session",
        "Personal Space Respect Practices",
        "Shared Calendar Setup",
        "House Rules Creation",
        "Decorating Together"
    ],
    "preparing_for_intimacy": [
        "Boundaries Practice",
        "Kiss Mapping",
        "Emotional Closeness Exercises",
        "Sensual Awareness Workshops",
        "Comfort Zone Expansion",
        "Non-Sexual Touch Exploration",
        "Intimate Story Sharing",
        "Affectionate Gestures Practice",
    ],
    "discussing_religions": [
        "Belief Systems Sharing",
        "Spiritual Practices Exchange",
        "Interfaith Understanding Sessions",
        "Sacred Texts Exploration",
        "Faith-Based Goal Setting",
        "Religious Boundaries Discussion",
        "Interfaith Celebration Planning"
    ],
    "improving_honesty_and_openness": [
        "Truth-Telling Exercises",
        "Openness Commitment Ritual",
        "Honesty Challenges",
        "Transparent Communication Practices",
        "Sharing Secrets Safely",
        "Complete Honesty Sessions",
        "Full Disclosure Practices",
        "Truth and Lies Game",
    ],
    "learning_relationship_skills": [
        "Relationship Journal",
        "Negotiation Skills Exercises",
        "Teamwork Building Activities",
        "Healthy Argument Techniques",
        "Cognitive Restructuring Together"
    ],
    "discussing_finances": [
        "Budget Planning Session",
        "Spending Habits Review",
        "Investment Strategies Discussion",
        "Debt Management Planning",
        "Savings Goals Alignment",
        "Joint Bank Account Setup",
        "Emergency Fund Planning",
        "Tax Planning Discussion",
    ],
    "enhancing_love_and_affection": [
        "'I Appreciate You' Exercise",
        "Daily Love Notes",
        "Compliment Exchange",
        "Spontaneous Acts of Kindness",
        "Cuddle Sessions",
        "Love Letter Writing"
    ],
    "rekindling_passion": [
        "Creating Passion Renewal Date",
        "Sensual Reconnection Activities",
        "Intimate Conversation Starters",
        "Passionate Dance Sessions",
        "Sensory Stimulation Activities",
        "Affectionate Touch Intensification",
        "Rebuilding Intimacy As Parents"
    ],
    "introducing_healthy_habits": [
        "Fitness Routine Together",
        "Healthy Eating Plans",
        "Mindfulness Meditation Sessions",
        "Stress Management Techniques",
        "Positive Habit Tracking",
        "Self-Care Routine Sharing"
    ],
    "preparing_for_children": [
        "Parenting Styles Discussion",
        "Future Family Planning",
        "Childcare Responsibilities Mapping",
        "Parenting Goals Setting",
        "Family Values Alignment",
        "Discipline Strategy Development",
        "Parenting Resources Sharing",
        "Family Budgeting for Kids",
        "Health and Safety Planning",
        "Work-Life Balance for Parents Session",
        "Parenting Support Networks",
        "Parenting Expectations Alignment"
    ],
    "preparing_for_marriage": [
        "Marriage Readiness Assessment",
        "Wedding Planning Workshops",
        "Commitment Rituals",
        "Prenuptial Agreement Discussions",
        "Marriage Goals Setting",
        "Financial Planning for Marriage",
        "Marriage Roles and Responsibilities Mapping",
        "Intimacy Building for Marriage",
        "Marriage Expectations Sharing"
    ]
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


def call_gpt(job: str, titles: List[str]) -> List[Dict]:
    data = json.dumps({"job": job, "titles": titles})
    system_prompt = """
    You are a professional relationship coach, psychotherapist in CBT practice.
    You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.

    Generate exercises that will not potentially overlap with other jobs. For example, if the topic is "explore_new_experience", do not produce exercises about "how would you like to move in together" because this naturally belongs to "prepare_for_moving_in_together".

    The idea of the practice you will create is that you will create an exercise that a couple can follow step by step and learn something about their partner, have fun, or have deep experience.
    """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user",
         "content": '{"job": having_and_discussing_sex, "titles": ["Tantric Intimacy Exercise", "Establish Emotional Connection"]}'},
        {"role": "assistant", "content": """[
                {
                  "job": ["having_and_discussing_sex"],
                  "title": "Tantric Intimacy Exercise",
                  "purpose": "This intimate practice fosters deeper intimacy and present-moment awareness by engaging in mindful intimacy with your partner.",
                  "steps": [
                    {
                      "title": "Establish Emotional Connection",
                      "description": "Begin by connecting emotionally through conversation.<br>Ask and answer the following questions together: How do you feel toward your partner today? What do you need more from your partner? What can you do better for your partner?<br>Express gratitude: Share one thing about your partner that you are grateful for today.<br>Reflection: Score your feelings about the relationship today and share five things you like about the time spent together."
                    },
                    {
                      "title": "Eye-Gazing Exercise",
                      "description": "Develop nonverbal intimacy and presence through focused eye contact.<br>Set a timer for 5 minutes.<br>Sit facing your partner, maintain eye contact, and sync your breathing.<br>Move your body slightly as you breathe to maintain comfort and rhythm.<br>Bow to your partner at the end to close the session."
                    },
                    {
                      "title": "Sensual Massage",
                      "description": "Enhance tactile awareness and presence through mindful touch.<br>One partner gives a gentle, sensual massage to the other's arms, legs, neck, and body for 5 minutes.<br>The giver focuses on being fully present while giving, and the receiver focuses on being fully present while receiving.<br>Switch roles after 5 minutes."
                    },
                    {
                      "title": "Mindful Kissing",
                      "description": "Deepen connection through intentional, present-moment kissing.<br>Spend 5 minutes kissing with full awareness, focusing solely on the act of kissing.<br>Avoid rushing or overthinking; simply be in the moment."
                    },
                    {
                      "title": "Mindful Sex",
                      "description": "Transition into physical intimacy while maintaining a deep connection.<br>Begin in a comfortable position where you can see each other's eyes, sitting positions fit very well here.<br>Sync your breathing and focus on slow, deliberate movements.<br>Use your senses fully—notice touch, sounds, and sensations.<br>Pause if needed to share feelings or reflections with your partner."
                    }
                  ]
                }
            ...
        ]"""},
        {"role": "user",
         "content": '{"job": "learning_relationship_skills", "titles": ["I Statements Practice", "Find Out Your Love Language"]}'},
        {"role": "assistant", "content": """[
               {
               "job": [
                  "learning_relationship_skills",
                  "improving_communication"
                ],
                 "title": "I Statements Practice",
                 "purpose": "This practice teaches you both to express feelings and needs constructively using 'I' statements.",
                 "steps": [
                   {
                     "title": "Learn About I Statements",
                     "description": "What Are I Statements?: 'I' statements are a way to express your feelings and needs without blaming or criticizing your partner. The structure typically follows: 'I feel ___ when ___ because ___.'<br> Instead of saying, 'You never listen to me,' try, 'I feel unheard when conversations are interrupted because it makes me feel undervalued.'<br>Focus on your own feelings and avoid using accusatory language to keep the conversation positive."
                   },
                   {
                     "title": "Identify a Situation",
                     "description": "Choose a recent situation where you felt a strong emotion towards your partner.<br>Examples: Maybe you felt neglected when your partner was late for a date, or frustrated when chores weren't shared.<br>Pick a situation that's fresh in your mind but not so heated that it might derail the conversation. The goal is to practice, not to vent."
                   },
                   {
                     "title": "Construct I Statements",
                     "description": "Each of you takes time to formulate their own 'I' statements about the chosen situation.<br>1. Identify Your Emotion: What are you feeling? (e.g., frustrated, happy, anxious)<br>2. Describe the Behavior: What did your partner do? (e.g., arrived late, didn't help with dinner)<br>3. Explain the Impact: Why did it affect you? (e.g., felt unappreciated, stressed out)<br>Example: 'I feel anxious when you come home late because I worry about your safety.'<br>Write down your statements beforehand to organize your thoughts and ensure clarity."
                   },
                   {
                     "title": "Share and Listen",
                     "description": "Take turns sharing your 'I' statements while your partner listens actively without interrupting.<br>How to Share: You share your 'I' statement, and your partner listens attentively.<br>Active Listening Tips: Nod, maintain eye contact, and refrain from planning your response while your partner is speaking.<br>After each 'I' statement, paraphrase what your partner said to ensure understanding, like, 'So, you're saying you felt anxious when I came home late because you were worried about me.'"
                   },
                   {
                     "title": "Reflect and Discuss",
                     "description": "After you both have shared, discuss how using 'I' statements impacted the conversation.<br>Discussion Points: How did it feel to express your feelings this way? Did it make the conversation more constructive?<br>Example Questions: 'Did using 'I' statements help you feel heard?' or 'What could we do differently next time to improve our communication?'"
                   }
                 ]
               },
               {
                 "job": [
                   "learning_relationship_skills",
                   "getting_to_know_partner"
                 ],
                 "title": "Find Out Your Love Language",
                   "purpose": "Help you understand and express love in ways that resonate most with each other.",
                   "steps": [
                     {
                       "title": "Explore the Five Love Languages",
                       "description": "First things first, let's get to know the five love languages that people commonly use to express and receive love.<br>1. Words of Affirmation: Compliments, kind words, and verbal encouragement.<br>2. Acts of Service: Helping out with tasks, doing something thoughtful.<br>3. Receiving Gifts: Thoughtful presents, surprise gestures.<br>4. Quality Time: Undivided attention, shared activities.<br>5. Physical Touch: Hugs, kisses, holding hands.<br>"
                     },
                     {
                       "title": "Identify Your Love Languages",
                       "description": "Here's how to pinpoint your individual love languages:<br>Reflect on What Makes You Feel Loved: Think about the actions or words from your partner that make you feel most appreciated and cherished. Do heartfelt compliments make your day, or is it when they lend a hand with something you dislike?<br><br>Observe Your Reactions: Pay attention to how you respond when your partner expresses love. Do you feel a surge of happiness when they give you a gift, or do you cherish the moments when you spend uninterrupted time together?<br>Example: If you feel most appreciated when your partner writes you a heartfelt note, your love language might be Words of Affirmation.<br>Pro Tip: Share your findings with each other in a relaxed setting, such as over a cozy dinner or during a quiet evening at home. This fosters understanding and sets the stage for deeper emotional connections.""
                     },
                     {
                       "title": "Share and Discuss Your Love Languages",
                       "description": "Share your identified love languages with each other.<br>Take turns explaining what your primary love language is and why it resonates with you.<br>You can talk about specific instances where you felt loved and how they relate to your love languages.<br>Example: 'I realized that Quality Time makes me feel most connected because I cherish our uninterrupted conversations. <br> Now, as you both know your language, discuss how could you both integrate this knowledge in your daily life and give life in the best way to your pratner."
                     }
                 ]
               }

                    ...
                ]"""},
        {"role": "user", "content": f"""Every practice must have 1-5 jobs assosicated with it (only the jobs from the provided list!)2.
        every practices must have 2-7 steps, every step MUST be 4-10 sentences.
          Return exactly the number of practices are there are titles practices in valid JSON STRING format, no prefix, no suffix, just a string
           3. Practices can reference other relevant jobs from this list: {', '.join(JOBS)} and no others
             Do not use marketing or fancy words, simple words, be interesting to read, but professional
             Be very precise in the steps you are mentioning with your instrurctions, keep the useless things and fluff, focus on in-depth explanations and provide multiple examples in every step so that it is very clear what to do.
             Be very specific, instead of giving users space for making up thing, make up the things for themselves and let them choose. Remove steps that do not enhance the practice or contribute greatly to it, focus on the essentials.
             Everything you mention in the practice must be easily available for the couple. don't repeat the world "Example:" over and over, instead of saying partners refer to the reader "you", "you and your partner", "you two" 1 partner will read it, write it and address them as "you", "your couple", "you two", not in a third-person way.
             DO NOT refer to the external tools, quizzes, tests, games. Provide all the content and knowledge required for the practice or the exercise, external tools/info MUST NOT be needed.  For example, if you talk about attachment style or languages of love, you need to mention all fo them, and explain how each one behaves and how to identify it
             YOU MUST ALWAYS GIVE ALL THE INFORMATION AND KNOWLEDGE NEEDED TO COMPLETE THE PRACTICE, NEVER ASK USERS TO READ SOMETHING UP, GIVE ALL DESCRIPTIONS YOURSELF, e.g. if the user need to answer something about themselves, like their values, provide questions that they can ask themselves to understand their values. Return list with 1 object.
             {data}
             """}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call for data '{data}' (attempt {attempt}/{MAX_RETRIES})")
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
                if not isinstance(questions, list) or len(questions) != 1:
                    raise Exception("incorrect content type")
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


CONTENT_FILE = "./content.json"
from threading import Lock

file_lock = Lock()


def read_content_json() -> List[Dict]:
    if not os.path.exists(CONTENT_FILE):
        return []
    with open(CONTENT_FILE, 'r') as f:
        return json.load(f)


def write_content_json(content: List[Dict]):
    with open(CONTENT_FILE, 'w') as f:
        json.dump(content, f, indent=2)


def append_to_content(questions: List[Dict]):
    with file_lock:
        current = read_content_json()
        current.extend(questions)
        write_content_json(current)


from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Iterator
import logging


class ContentProcessor:
    def __init__(self, jobs_with_titles: Dict[str, List[str]], max_workers: int):
        self.jobs_with_titles = jobs_with_titles
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    def get_title_pairs(self, job: str) -> List[List[str]]:
        titles = self.jobs_with_titles.get(job, [])
        titles_per_job = 1
        return [titles[i:i + titles_per_job] for i in range(0, len(titles), titles_per_job)]

    def process_title_pair(self, job: str, titles: List[str]) -> List[Dict]:
        try:
            questions = call_gpt(job, titles)
            if questions:
                append_to_content(questions)
                logging.info(f"Processed titles {titles} for job '{job}'")
                return questions
        except Exception as exc:
            logging.error(f"Error processing titles {titles} for job '{job}': {exc}")
        return []

    def process_job(self, job: str) -> List[Dict]:
        title_pairs = self.get_title_pairs(job)
        all_questions = []

        for pair in title_pairs:
            try:
                questions = self.process_title_pair(job, pair)
                all_questions.extend(questions)
            except Exception as exc:
                logging.error(f"Error processing titles {pair} for job '{job}': {exc}")

        return all_questions

    def process_all_jobs(self) -> Iterator[tuple[str, List[Dict]]]:
        futures = {self.executor.submit(self.process_job, job): job for job in JOBS}

        for future in as_completed(futures):
            job = futures[future]
            try:
                questions = future.result()
                logging.info(f"Completed job '{job}': {len(questions)} questions")
                yield job, questions
            except Exception as exc:
                logging.error(f"Job '{job}' error: {exc}")

    def shutdown(self):
        self.executor.shutdown(wait=True)


# main.py
def main():
    logging.info("Starting question generation process")

    processor = ContentProcessor(jobs_with_titles, MAX_WORKERS)

    try:
        for job, questions in processor.process_all_jobs():
            pass  # Process results if needed
    finally:
        processor.shutdown()

    logging.info("Generation complete")


if __name__ == "__main__":
    main()
