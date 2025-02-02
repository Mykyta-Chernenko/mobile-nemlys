import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from typing import Dict, List

import openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 1
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 12000,
}
MAX_WORKERS = 1

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


def call_gpt(content: str) -> List[Dict]:
    messages = [
        {"role": "user", "content": """{
                                         "job": "getting_to_know_partner",
                                         "title": "Personality Type",
                                         "research": "Based on personality psychology, including the Big Five traits framework.",
                                         "description": "This theme encourages couples to explore each other\u2019s personality traits, quirks, and habits, celebrating what makes each partner unique."
                                       }"""},
        {"role": "assistant", "content": """{
                                              "job": ["getting_to_know_partner", "exploring_feelings"],
                                              "title": "Main Personality Type",
                                              "research": "This quiz is based on personality psychology, including the Big Five traits framework, to help you understand and celebrate each other's unique personalities.",
                                              "description": "Explore your partner's personality traits, quirks, and habits with this fun and insightful quiz! Discover what makes each other unique and strengthen your bond through deeper understanding.",
                                              "questions": [
                                                {
                                                  "question": "When making plans for the weekend, how do you prefer to decide what to do?",
                                                  "options": [
                                                    "I love trying new and adventurous activities.",
                                                    "I like having a detailed schedule to follow.",
                                                    "I enjoy social gatherings and being around friends.",
                                                    "I prioritize harmony and choose activities everyone can enjoy.",
                                                    "I often worry about whether the plans are perfect."
                                                  ]
                                                },
                                                {
                                                  "question": "How do you usually handle your tasks and responsibilities?",
                                                  "options": [
                                                    "I'm always open to new methods and ideas.",
                                                    "I stay organized and stick to my plans.",
                                                    "I thrive in busy and interactive environments.",
                                                    "I cooperate well with others to get things done.",
                                                    "I get stressed if things don't go as planned."
                                                  ]
                                                },
                                                {
                                                  "question": "In a conversation, what is your typical behavior?",
                                                  "options": [
                                                    "I enjoy discussing a wide range of topics and ideas.",
                                                    "I focus on practical and specific subjects.",
                                                    "I love engaging and lively discussions.",
                                                    "I listen carefully and try to maintain a positive tone.",
                                                    "I might feel anxious if the conversation becomes intense."
                                                  ]
                                                },
                                                {
                                                  "question": "When facing a conflict, how do you respond?",
                                                  "options": [
                                                    "I'm open to creative solutions to resolve it.",
                                                    "I prefer to address it directly and systematically.",
                                                    "I seek support and advice from friends.",
                                                    "I aim to keep the peace and avoid arguments.",
                                                    "I often feel overwhelmed and unsure how to proceed."
                                                  ]
                                                },
                                                {
                                                  "question": "How do you express your feelings in a relationship?",
                                                  "options": [
                                                    "I enjoy sharing new and unique ways to show affection.",
                                                    "I express my feelings through reliable and consistent actions.",
                                                    "I'm expressive and often share my emotions openly.",
                                                    "I focus on being supportive and considerate.",
                                                    "I might hold back my feelings due to fear of judgment."
                                                  ]
                                                },
                                                {
                                                  "question": "What motivates you most in your personal goals?",
                                                  "options": [
                                                    "Exploring new possibilities and experiences.",
                                                    "Achieving my goals through careful planning and effort.",
                                                    "Connecting with others and gaining recognition.",
                                                    "Ensuring that my efforts benefit those around me.",
                                                    "Avoiding failure and managing my fears."
                                                  ]
                                                },
                                                {
                                                  "question": "How do you prefer to spend your free time?",
                                                  "options": [
                                                    "Trying out new hobbies or learning something different.",
                                                    "Organizing or completing personal projects.",
                                                    "Socializing and being around friends and family.",
                                                    "Engaging in activities that promote harmony and relaxation.",
                                                    "Spending time alone to reflect and recharge."
                                                  ]
                                                },
                                                {
                                                  "question": "When your partner shares their ideas, how do you react?",
                                                  "options": [
                                                    "I love brainstorming and expanding on their ideas.",
                                                    "I appreciate structured and well-thought-out plans.",
                                                    "I get excited and add my own energetic input.",
                                                    "I listen attentively and support their perspective.",
                                                    "I might feel hesitant if the ideas are too unconventional."
                                                  ]
                                                },
                                                {
                                                  "question": "How do you approach making important decisions together?",
                                                  "options": [
                                                    "We explore various creative options before deciding.",
                                                    "We create a step-by-step plan to reach a decision.",
                                                    "We discuss and decide based on what feels right at the moment.",
                                                    "We focus on what's best for both of us and compromise.",
                                                    "I often worry about making the wrong choice."
                                                  ]
                                                },
                                                {
                                                  "question": "What role do you usually take in your relationship?",
                                                  "options": [
                                                    "I bring new ideas and perspectives to the relationship.",
                                                    "I ensure things run smoothly and stay organized.",
                                                    "I keep the relationship lively and full of energy.",
                                                    "I maintain peace and support my partner's needs.",
                                                    "I often contemplate how to improve and manage my feelings."
                                                  ]
                                                }
                                              ],
                                              "evaluation_method": {
                                                "explanation": "Each answer corresponds to one of the Big Five personality traits: 1) Openness, 2) Conscientiousness, 3) Extraversion, 4) Agreeableness, and 5) Neuroticism",
                                                "example": "For example, if you selected option 1) most frequently, you likely have high Openness, meaning you enjoy new experiences and creativity in your relationship."
                                              },
                                            }"""},

        {"role": "user", "content": """{
                                         "job": "understanding_mutual_compatibility",
                                         "title": "Love Languages Discovered",
                                         "research": "Based on Gary Chapman\u2019s five love languages and relational psychology.",
                                         "description": "This theme helps couples discuss how they express and receive love, fostering a deeper understanding of each other's unique needs and affection styles."
                                       }"""},
        {"role": "assistant", "content": """{
                                                  "job": ["understanding_mutual_compatibility", "enhancing_love_and_affection", "exploring_feelings"],
                                                  "title": "Discover Your Love Language Connection",
                                                  "research": "This quiz is based on Gary Chapman's Five Love Languages, which explores the different ways people express and receive love. Understanding your love languages can enhance communication and strengthen your relationship.",
                                                  "description": "Ever wondered why you and your partner show love in different ways? Take this fun quiz to uncover your primary love languages and see how well you connect with each other's emotional needs!",
                                                  "questions": [
                                                    {
                                                      "question": "When your partner surprises you with a gift, how do you feel most loved?",
                                                      "options": [
                                                        "Thrilled and appreciated because you thought of me.",
                                                        "Happy to spend quality time together unwrapping it.",
                                                        "Grateful for their effort and the time spent choosing it.",
                                                        "Pleased to hear their words of affirmation about the gift.",
                                                        "Content knowing they understand my needs."
                                                      ]
                                                    },
                                                    {
                                                      "question": "How do you prefer to spend quality time with your partner?",
                                                      "options": [
                                                        "Engaging in deep conversations and sharing thoughts.",
                                                        "Participating in activities or hobbies together.",
                                                        "Enjoying physical closeness like cuddling or holding hands.",
                                                        "Receiving compliments and verbal affirmations.",
                                                        "Having uninterrupted time to connect without distractions."
                                                      ]
                                                    },
                                                    {
                                                      "question": "What makes you feel most appreciated by your partner?",
                                                      "options": [
                                                        "Hearing them say 'I love you' regularly.",
                                                        "Receiving thoughtful gifts that show they know me well.",
                                                        "Spending meaningful time together doing something we both enjoy.",
                                                        "Acts of service like helping with chores or tasks.",
                                                        "Physical touch such as hugs, kisses, or a gentle touch."
                                                      ]
                                                    },
                                                    {
                                                      "question": "When you're having a tough day, what do you prefer your partner to do?",
                                                      "options": [
                                                        "Listen to you talk about your feelings without judgment.",
                                                        "Surprise you with a small gift to lift your spirits.",
                                                        "Spend time with you, engaging in a favorite activity together.",
                                                        "Help you with tasks or responsibilities to reduce your stress.",
                                                        "Offer comforting hugs or hold your hand to show support."
                                                      ]
                                                    },
                                                    {
                                                      "question": "How do you express your love most naturally?",
                                                      "options": [
                                                        "Sharing heartfelt words and compliments.",
                                                        "Giving thoughtful gifts that show you care.",
                                                        "Spending quality time and creating memories together.",
                                                        "Performing acts of service to make their life easier.",
                                                        "Showing physical affection through touch."
                                                      ]
                                                    },
                                                    {
                                                      "question": "What type of gesture from your partner makes you feel closest to them?",
                                                      "options": [
                                                        "A sincere and heartfelt compliment.",
                                                        "A meaningful gift that reflects your interests.",
                                                        "A dedicated evening spent just the two of you.",
                                                        "Helping out with something important to you.",
                                                        "A warm embrace or a gentle touch."
                                                      ]
                                                    },
                                                    {
                                                      "question": "How do you like to celebrate special occasions with your partner?",
                                                      "options": [
                                                        "Exchanging heartfelt messages and expressing love verbally.",
                                                        "Receiving and giving thoughtful gifts that have significance.",
                                                        "Spending uninterrupted quality time together doing something fun.",
                                                        "Helping to plan and organize the celebration to make it perfect.",
                                                        "Sharing affectionate gestures like dancing or cuddling."
                                                      ]
                                                    },
                                                    {
                                                      "question": "What makes you feel most connected to your partner?",
                                                      "options": [
                                                        "Having deep and meaningful conversations.",
                                                        "Exchanging gifts that show you understand each other.",
                                                        "Engaging in activities or hobbies together.",
                                                        "Assisting each other with daily tasks and responsibilities.",
                                                        "Sharing physical intimacy and closeness."
                                                      ]
                                                    },
                                                    {
                                                      "question": "When thinking about a perfect date, what stands out the most to you?",
                                                      "options": [
                                                        "A heartfelt conversation over a cozy dinner.",
                                                        "Receiving a thoughtful gift during the date.",
                                                        "Doing an activity you both enjoy, like hiking or visiting a museum.",
                                                        "Your partner taking care of tasks or planning everything.",
                                                        "Being close and affectionate throughout the evening."
                                                      ]
                                                    },
                                                    {
                                                      "question": "How do you prefer to resolve conflicts with your partner?",
                                                      "options": [
                                                        "Talking it out and expressing your feelings openly.",
                                                        "Apologizing with a meaningful gift to make amends.",
                                                        "Spending time together to reconnect and move forward.",
                                                        "Taking actions that show you care and want to fix things.",
                                                        "Using physical affection to comfort and reconcile."
                                                      ]
                                                    }
                                                  ],
                                                  "evaluation_method": {
                                                    "explanation": "Each answer corresponds to one of Gary Chapman's Five Love Languages: 1) Words of Affirmation, 2) Gifts, 3) Quality Time, 4) Acts of Service, and 5) Physical Touch",
                                                    "example": "For example, if most of your answers are 1), your primary love language is Words of Affirmation. If your partner's answers are mostly 3), their primary love language is Quality Time."
                                                  }
                                                }
"""},
        {"role": "user", "content": f"""
        You are a professional relationship coach, psychotherapist in CBT practice.
            You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.


        you need to generate a test for the following content: {content}
        Generate unique, varied, educative, and scientific quizzes
        Requirements:1. Tests must be unique and tailored to this specific job, at the same time, every test must have 1-3 jobs assosicated with it (only the jobs from the provided list!)
        2. Include a mix of deep, science-research-psychology tests, but sound extremely friendly and light, funny, not fancy or commercial, as if you were talking to a buddy but still useful, easy-to-read, simple words
        3. every tests MUST have 5 options, and 10 questions, and 5 result options (in evaluation_method["explanation"])  3. Tests can reference other relevant jobs from this list: {', '.join(JOBS)} and no others 4. Return exactly 1 test in valid JSON STRING format, no prefix, no suffix, just a string5.
        6. Title must be 4-7 words and must be a proper name for a test connected to the result users can find out, it must be in format Something Style, Type of Something, it MUST ALWAYS show the result basically of the test what you will find out
        7. You need to develop a scientific test that is relevant to the provided content and helps couple to identify something about THEMSELVES in the couple.All the questions must refer to 1 person possibly in the couple dynamic or a situation NEVER to both partner.
        8. in "evaluation_method" only allowed keys are "explanation" and "example", you must give number to every result 1), 2), 3), 4), 5) in "explanation" field, "explanation" is a string like "Each answer corresponds to one of the following budgeting styles: 1) Planner, 2) Flexible Spender, 3) Saver, 4) Collaborative Partner, 5) Spontaneous Spender.", and "example" string refers to the results by numbers like "For example, if you selected option 1) most frequently, your Emotional Growth Style is Proactive Learner, indicating you actively seek to understand and develop emotional skills in the relationship."
        you must follow the structure of the previous examples, do no add or remove any keys
        """}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call for job '{content}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            print(response)
            content = response.choices[0].message.content.strip("json```")
            content = content.strip("```")

            # Parse the response as JSON
            try:
                question = json.loads(content)
                if question.get("title") and question.get("job"):
                    logging.info(f"Successfully generated {len(question)} questions for job '{content}'")
                    return [question]
                return []
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON response for job '{content}': {e}")
                if attempt == MAX_RETRIES:
                    return []

        except Exception as e:
            logging.error(f"Error during API call for job '{content}': {e}")
            if attempt == MAX_RETRIES:
                return []
            time.sleep(RETRY_DELAY)

    return []


file_lock = Lock()


def process_job(content) -> List[Dict]:
    questions = call_gpt(content)
    if questions:
        with file_lock:
            # Read current content
            current_content = read_content_json()

            # Add new questions
            current_content.extend(questions)

            # Write updated content
            write_content_json(current_content)

            logging.info(f"Successfully processed job '{content}' and updated content.json")
            return questions
    return []


def main():
    logging.info("Starting question generation process")

    # Initialize empty content.json if it doesn't exist
    if not os.path.exists('./content.json'):
        write_content_json([])
    themes = []
    with open('./themes_useful.json', 'r', encoding='utf-8') as f:
        themes = json.load(f)
    # Process jobs in parallel
    #     rnd_themes  = random.sample(themes, 8)
    rnd_themes = themes
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_job = {executor.submit(process_job, json.dumps(theme)): theme['title'] for theme in rnd_themes}
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
