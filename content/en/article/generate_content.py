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
MAX_RETRIES = 5
RETRY_DELAY = 0
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 16000,
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

    Generate aritcles that will not potentially overlap with other jobs. For example, if the topic is "explore_new_experience", do not produce articles about "how would you like to move in together" because this naturally belongs to "prepare_for_moving_in_together".
    
    Write in a relaxed, friend-like, and light-hearted way, but ensure content is highly valuable, professional and useful.

    The idea of the articles you will create is that you will generate is that you will create a educative content for a couple around some topic,
    in the end of the articles you will ask a check question with multiple options and 1 right answer
    """

    messages = [
        {"role": "user", "content": system_prompt},
        {"role": "user", "content": "preparing_for_cohabitation"},
        {"role": "assistant", "content": """[
                {
                  "job": ["preparing_for_cohabitation", "overcoming_differences"],
                  "title": "Partner in life format",
                  "test_question": "How do gender roles play out in your home life?",
                  "correct_answer": "We share chores equally",
                  "all_answers": [
                    "We share chores equally",
                    "I feel resentful that I have to do most of the domestic chores",
                    "We like ‘husband and wife' and it suits us, who cares!",
                    "My partner thinks they do more than they do around the house",
                    "I'd like us to redistribute domestic chores and/or childcare",
                    "None of the above, let's discuss"
                  ],
                  "content": "Are you holding on to stereotypes when it comes to chores and childcare?<br><br>Whose job is it to take the bins out in your relationship? Or do the laundry, or childcare? Turns out, whether you're in a straight or same-sex couple, the traditional division of labor might still apply. Why?<br><br>Heteronormative tendencies<br><br>When sociology researchers examined responses from a nationally representative survey of over 1,000 adults in the United States to determine which characteristics shape ideas about how married couples should divide household labor and childcare.<br><br>For same-sex couples, people substituted heterogender norms — that is, femininity and masculinity — to rationalize their decisions.<br><br>In other words, it was the heterosexual norm that determined which partner was associated with certain kinds of chores and roles. They reasoned that it was the “more masculine” partner who would do DIY and car maintenance, for example, while the “more feminine” partner should be responsible for cooking, cleaning, and childcare.<br><br>Despite the fact that LGBTQ+ couples generally share household chores more equally than those in heterosexual relationships, their desire to do things differently contrasts with the circumstances within which they live. If one person is the primary carer of the children and the other one works full-time away from the home, these circumstances get mapped onto traditional heterogender roles.<br><br>Redefining gender roles<br><br>This may leave you thinking, can we buck the trend? Can we do things ‘our' way? The answer is a resounding “yes”! In my research with LGBTQ+ and heterosexual couples, many partners spoke about putting the time and effort into making things feel fair.<br><br>Make a list including your most and least liked chores. If taking out the recycling is high on both of your ‘disliked' lists, then take it in turns. If bedtime stories or taking out the dog for a walk are both highly cherished, then share out who does these activities or do them together if possible.<br><br>Equality and fairness should not be conflated. Gender roles are yours to redefine. LGBTQ+ partners do not need to follow the paths of the least resistance. It's worth putting in the time and energy to find our own routes to domestic harmony."
                }
            ...
        ]"""},
        {"role": "user", "content": "having_and_discussing_sex"},
        {"role": "assistant", "content": """[
            {
              "job": ['having_and_discussing_sex']
              "title": "Why You Should Schedule Sex",
              "test_question": "Would you like to try scheduling sex?",
              "correct_answer": "Definitely! I'd love to prioritize intimacy by making time for sex",
              "all_answers": [
                "We already set aside regular time in the calendar for sex",
                "Definitely! I'd love to prioritize intimacy by making time for sex",
                "Yes, it might allow us to be more sexually adventurous",
                "Yes, we have different sex drives and this could help us manage that",
                "With so many other responsibilities, I don't know how we'd find the time",
                "None of the above, let's discuss"
              ],
              "content": "Boost your sexual satisfaction by intentionally making time for intimacy.<br><br>You might think scheduling sex would make it less... sexy. But for many couples, it's the opposite. Scheduling intimate time in their calendars makes them feel more comfortable and able to experience desire and intimacy. Experts agree that intentionally making time for sex is a valuable way to prioritize your partner and your relationship. It can make you feel closer and boost your sexual satisfaction, too.<br><br>Here's why:<br><br>It can help you manage mismatched sex drives<br><br>Studies consistently show that discrepancies in sexual desire are common in relationships. For long-term partners, the 'sexual spark' often dwindles as work and parenting responsibilities increase — this is especially true for busy working mothers. Scheduling sex can help to manage different sex drives and relieve the pressure that both partners may feel. The partner with the higher sex drive may not feel the need to 'beg for sex' and manage their disappointment and feelings of rejection when their advances are turned down. The partner with lower desire may feel less anxious about sex being initiated out of the blue because they know that time has been set aside for intimacy.<br><br>It can create anticipation — and anticipation is sexy<br><br>Having sex scheduled means you can look forward to it. It gives you time to think about your fantasies and desires. For example, if you've always wanted to explore kink, having a date in your diary allows you to set the scene and plan your outfit. Or if you've been longing for a sensual massage, you've got enough lead time to find the perfect candles and oils. This preparation, along with sexting, sexual innuendo, and sharing knowing looks across a crowded room, can all build anticipation and heighten your desire for sex.<br><br>Planning for sexual intimacy also fosters communication which strengthens your connection. Research finds a strong association between communication, emotional intimacy, sexual satisfaction, and relationship satisfaction.<br><br>How to schedule sex:<br><br>1) Create a slot in your calendar<br><br>Scheduling sex means creating a slot in your calendar to focus on each other and spend quality time together away from distractions such as kids, work, chores, and friends, which often fill our days and squeeze intimacy out of the frame.<br><br>2) Decide on a timeframe<br><br>Whether it's weekly, monthly, quarterly, or on vacation, the regularity of your scheduled sex time is up to you. Remember, it's also only a starting point. If it works and you feel closer and more sexually satisfied, then you can always agree to increase the frequency. Think about when you're more likely to feel most emotionally engaged and physically turned on. If you're a night owl and your partner's an early bird, you'll need to identify a time when you both feel open to intimacy. This could be an afternoon or during time away from the daily grind, such as a vacation.<br><br>3) Remove the pressure of expectation<br><br>Psychologist and sex therapist Dustin Schepler suggests that couples remove the burden of expectation from scheduled intimacy. It's not about having sex, but about facilitating intimacy. It's a way to reconnect on a physical and emotional level with your partner. So, you don't just have to use your scheduled sex time to have sex. Holding hands, gentle caresses, sensual massage, and listening to each other are all valid ways to connect intimately, too."
            },
            {
              "job": ["having_and_discussing_sex", "improving_relationship_satisfaction", "solving_relationship_problems"]
              "title": "The Orgasm Gap",
              "test_question": "What could make you feel more comfortable when talking about your orgasms?",
              "correct_answer": "My partner asking me how I like to be touched",
              "all_answers": [
                "My partner asking me how I like to be touched",
                "Having a conversation about it outside of the bedroom",
                "A gentle start to the conversation, as I can feel intimidated by sex talk",
                "My partner being open to trying new ways of touching me",
                "We feel very comfortable as it is",
                "None of the above, let's discuss"
              ],
              "content": "New study sheds light on why heterosexual women have less orgasms than anyone else.<br><br>The 'orgasm gap' — also known as 'orgasm inequality' or the 'pleasure gap' — refers to the disparity between the number of orgasms men and women experience in heterosexual relationships.<br><br>Edward O. Laumann's study of sexual activity in the 1990s found the difference between the amount of men who had orgasms with their spouses was almost 50% higher than those reported by their female partners. That's quite the gap!<br><br>The orgasm gap doesn't indicate a lack of female desire or passion. David A. Frederick and colleagues found that lesbian and bisexual women have significantly more orgasms than heterosexual women. Further research has found that single women are more likely to orgasm without any partner being involved, with one study reporting that single women are 33% more likely to orgasm during masturbation than during sex with a partner.<br><br>Why is this?<br><br>Last month, a study published in Social Psychological and Personality Science found the orgasm gap phenomenon could be down to social beliefs around entitlement. The researchers concluded that it's the in-built perceptions by both men and women that men are more entitled to orgasms and sexual pleasure than women, causing these gender inequalities in sexual pleasure.<br><br>How to close the gap:<br><br>The amount of orgasms you both have isn't necessarily an accurate measure of a good and healthy sex life, however for some couples it can lead to distance in the bedroom.<br><br>It's reported that only 20% of women are able to orgasm from penetration alone, so it's important to listen to your body. Talk to your partner about the amount and type of foreplay that works for you, and explore other ways of climaxing which don't involve penetrative sex if that's not doing it for you.<br><br>Some couples find their best sexual engagement happens before they climax and handle their orgasms individually. Such solutions should not be experienced as rejection or some kind of personal failing — it's just about sharing and learning about each other's likes and dislikes and finding out what's right for both of you."
            }

            ...
        ]"""},
        {"role": "user",
         "content": f"Generate unique, varied, educative, and scientific articles for the job: {job}<br><br>Requirements:1. Articles must be unique and tailored to this specific job, at the same time, every article must have 1-3 jobs assosicated with it (only the jobs from the provided list!)2. Include a mix of deep, science-research-psychology articles, but sound extremely friendly and light, funny, not fancy or commercial, as if you were talking to a buddy but still useful, easy-to-read, simple words 3. every articles MUST at least 5 or more paragraphs  and 6-8 sentences every paraphrap, around 150 words per paraphrap, extremely important, IT IS LONG ARTICLES!!, separate paragraphs with <br><br> and bullet list point with <br>, list point must be a bullet list point started with •  3. Articles can reference other relevant jobs from this list: {', '.join(JOBS)} and no others 4. Return exactly 3 articles in valid JSON STRING format, no prefix, no suffix, just a string5. Make sure articles are diverse and don't resemble each other 6. Provide solid research references and scientific psychology references, you can include names of the authors, scientific theories, journals, and the description of the research, but do not include the name or the years of the research, do not make up things that do not exist, integrate them naturally in the 'content' part of the article, make conclusions on the research. Title must be 4-7 words. The article MUST have actionable steps and clear suggestion on how to act on the content that will improve the relationship, make the up to the point and with a specific goal in mind through the goal article with the structure: introducing the topic, introducing the discussiong point, introducing how the topic can be approached, talking how it can be integrated in your  relationship, provide specific actionable steps how to integrate the articles point of discussiong in your relationship. do not hesitate to provide suggestions and advice instead of general references. 7. write at least 6 sentences in every paragraph"}
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
            content = content.replace("\n", "")
            content = content.replace("```", "")
            content = content.replace("*", "")
            content = content.replace("json", "")
            content = content.strip()

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
