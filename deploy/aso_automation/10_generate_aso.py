import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List

from anthropic import Anthropic

from general import SKIP_LANGUAGES, IOS_LANGUAGES, ANDROID_LANGUAGES

logging.basicConfig(level=logging.INFO)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-3-7-sonnet-20250219"
# MODEL = "o3-mini"
MAX_RETRIES = 2
RETRY_DELAY = 2

# Languages to skip

GENERAL_SYSTEM_PROMPT = """
You are a senior ASO Product Manager, your task is to create great and relevant ASO based on the keywords, product and info I provide.

ASO must be in the target locale, your translation must be localized and sound natural for the target language and country
"keywords" must be used at they are, without translation

"keywords" that are not relevant to the app description, must be ignored. Like "share ass" and "home exercise" and "sex chat" and "message" have nothing to do with an app to improve couple relationship, those keywords belong to completely different kinds of apps.
if a keyword is duplicated, use it only once
category of a keyword tells you where to use it in the final ASO
so category "title" goes in the aso title, subtitle, goes precisely into the subtitle, and so on. crucial!!

You must use the keyword completely, you cannot break a keyword of 2 words in 2 separate words, use them as they are, this is important.

Descriptions must never sounds like a promotion, sounds more relxaed, casual (but still professional) do not sound like a marketing special, sound like you care about the app, and showcase all of the features that come from the product info

do not use competitors in the app name and subtitle on IOS/short description on Android, you can only use them in keywords on IOS and full description on Android
do not include competitors in final result if they are not present in the selected keywords

do not repeat the same word in title, subtitle, short description and keywords

description must be precisely 3000 characters, follow other character counts with extreme precision, line separator is \n, NEVER PRODUCE MULTILINE STRING, ITIS NOT A VALID JSON

produce correct and valid json object, nothing else
in the length field, you show precisely what is the length of the fields you produced
IMPORTANT! if some field (title, subtitle, keywords, short_description, desrciption)  becomes longer length than the hard limits, you are allowed to trim its content, because no field by any means can get longer that the provided constraints


When you contract a title and subtitle/short_description, words should not repeat, you can also combine the words in a well-structured phrase if the character count allow
if you use competitors, it is typically enough to use their brand name, for example, no need to add "agape couple relationship" to the keyword as it is, just add "agape"
if in 1 field some parts overlap, for example guitar lessons and guitar songs go in title, do not repeat the common word, use something and guitar songs & lessons. Minimize the character count to include all unique words present in a category.
"""
APP_STORE_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how App Store ASO works, now create the following content:

- App Name — 25 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Couple app Nemlys” or “Nemlys: couple app”. no competitors here!
- App Subtitle — 25 characters, the second biggest ASO ranking factor. This can either be a tagline or a call-to-action. no competitors here!
- Keywords field - 85 characters, not visible to users, keywords separated by commas BUT without space between commas (e.g. “couple,partner,kinky,wild… …”, here you can put competitors if they are present in the selected kwyrods).

Lower are the fields that are visible and important for users, but are NOT working on ASO optimisation and do not counts in ranking, so it is needs to be well-writtena nd describe the app so user can better understand the usecase:
- Short description - 40 characters, a quick overview of what your app offers. The copy should be enticing enough for potential users to expand by clicking “see more” to read the full app description.
- App Description - 3000 characters, “The ideal description is a concise, informative blocks followed by a short list of main features. Let potential users know what makes your app unique and why they’ll love it.”, 1 line with \n separartors.
never use illegal json characters in app Description
Other:

- iOS only factors one keyword once, so avoid duplication of the keywords on the App Store.
- Keywords like “app” and “game” in general shouldn’t be used as keywords, as they are already indexed by App Store.

do not output illegal characters for app store aso in the fields

you have to produce correct json object with the following fields, every key must contain 1 line-value, correct json
length,title,subtitle,keywords,short_description,description (description is 1 long line no line break, just\n inside "", be craeful not to break json quotes with other symbols)
if keywords field becomes too (more than 85 characters) you can exclude some words, the same ideas works for title and subtitle.
KEYWORDS MUST BE 1 word separated with commas, no prepositions, so 'sexy game for couple' becomes sexy,game,couple, keywords must not repeat
if keyword is in title or subtlte already, no need to add it again
"""
PLAY_MARKET_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how Play Market ASO works, now create the following content:

- App Name — 20 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Music Creation JussMus”. No competitors here!
- Short description - 65 characters. This should be a quick overview of what your app offers. The short description is like a one- or two-line hook below the app title to describe and drive interest in the app. Examples of this are “Listen to original stories & podcasts. Take your audio book library anywhere” for Audible and “Tackle everyday stress and anxiety. Self-care and sound sleep through meditation” for Calm. no competitors here!
- App Description - 3000 characters.  (competitors possible) 1 line with \n separators. never use illegal json characters in app Description
Other: 
- Keep the best description content in the first 255 characters (one or two sentences) appear in the app listing preview, so make your first lines compelling.
- Aim that each of top 3 most scored works selected for keywords category to be integrated 15 times naturally in the description. Other keywords must be met at least 10 times at different places. The description must be still very easy to read, no keyword stuffing, natural language.
- Avoid keyword stuffing in the description. Striking a balance between optimal keyword density and natural readability is crucial. Keyword stuffing can be punishable by Google and negatively impact the user experience, so do not do things like  Couple game, couple game, couple game. Spicy questions, spicy questions, spicy questions in the description, all text must be natural and readable to user and not stuffed.
- If a keyword has no score, it is enough to repeat it 8 times in the description      
      
you have to produce correct json object with the following fields, every key must contain 1 line-value, correct json
length,title,short_description,description  (description is 1 long line no line break, just\n inside "", be craeful not to break json quotes with other symbols)
"""

# Few-shot examples for App Store
PLAY_MARKET_FEW_SHOT_EXAMPLES_INPUTS = [
    {
        "product": "BuzzFeed Guitar app helps you master guitar, improve technique, explore chords, and learn new songs. It’s perfect for beginners, advanced players, acoustic and electric enthusiasts. You can access lessons, tutorials, quizzes, interactive games, exercises, and in-depth articles based on music theory and guitar research. Helps you perfect finger placement, strumming patterns, and timing, while keeping practice engaging and fun. Jam along with backing tracks, overcome musical challenges, and boost your confidence. It also works as a daily practice starter, creative widget, fun challenge tool for exploring riffs, solos, and techniques, enhancing your passion for music, daily practice, concert prep, and even guitar therapy.",
        "locale": "en-US",
        "name": "BuzzFeed Guitar",
        "selected_keywords": [
            {"term": "learn guitar", "category": "title", "final_score": 90},
            {"term": "guitar lessons", "category": "title", "final_score": 85},
            {"term": "chords", "category": "short_description", "final_score": 80},
            {"term": "songs", "category": "short_description", "final_score": 75},
            {"term": "technique", "category": "short_description", "final_score": 70},
            {"term": "practice", "category": "description", "final_score": 65},
            {"term": "tutorials", "category": "description", "final_score": 60},
            {"term": "exercises", "category": "description", "final_score": 55},
            {"term": "music theory", "category": "description", "final_score": 50},
            {"term": "yousician guitar app", "category": "description", "final_score": 45},
            {"term": "fender play", "category": "description", "final_score": 40},
            {"term": "music", "original": "music", "category": "description"},
            {"term": "learn", "original": "learn", "category": "description"},
            {"term": "finger placement", "original": "finger placement", "category": "description"},
            {"term": "strumming", "original": "strumming", "category": "description"},
            {"term": "timing", "original": "timing", "category": "description"},
            {"term": "backing tracks", "original": "backing tracks", "category": "description"},
            {"term": "challenges", "original": "challenges", "category": "description"},
            {"term": "confidence", "original": "confidence", "category": "description"},
            {"term": "passion", "original": "passion", "category": "description"}
        ],
        "known_competitors": ["Yousician guitar player", "Fender Play", "PlayNow", "GuitarHero"],
        "irrelevant_competitors": ["Spotify", "Netflix"]
    }
]
PLAY_MARKET_FEW_SHOT_OUTPUTS = [
    {
        "length": "title:22,short_description:67,description:3089",
        "title": "BuzzFeed: guitar lessons, learn",
        "short_description": "Learn chords, songs, and technique",
        "description": "Ready to master your guitar skills? The BuzzFeed Guitar app is your ultimate companion for learning and perfecting your craft, whether you’re a beginner picking up your first chords or an advanced player refining complex solos. Packed with engaging practice sessions, step-by-step tutorials, and challenging exercises, this app helps you improve every aspect of your playing—fingertip by fingertip. \n\n Dive into a world of guitar lessons designed to boost your technique with targeted practice routines, interactive tutorials, and hands-on exercises that focus on finger placement, strumming, and timing. Explore a vast library of songs and chords, paired with in-depth music theory insights, to fuel your passion for music. With daily practice starters, creative widgets, and fun challenges, you’ll stay motivated as you conquer riffs, solos, and backing tracks that make every session feel like a jam. \n\n What does BuzzFeed Guitar do? It delivers a dynamic mix of practice tools, tutorials, and exercises to perfect your skills—think of it as your personal guitar coach. Master finger placement with precision-focused exercises, nail strumming patterns through immersive tutorials, and lock in your timing with rhythmic practice drills. Jam along to backing tracks that bring songs to life, and tackle musical challenges that push your limits while building confidence. From acoustic enthusiasts to electric shredders, this app adapts to your style. \n\n With a blend of lessons, quizzes, and interactive games, your practice stays fresh and fun. Follow tutorials that break down complex techniques, complete exercises to sharpen your dexterity, and dive into music theory to understand the why behind the notes. Whether you’re prepping for a concert or unwinding with guitar therapy, BuzzFeed Guitar keeps you inspired. Unlike Yousician guitar app or Fender Play, our unique approach combines practice, tutorials, and exercises with a playful BuzzFeed twist—making every strum a step toward mastery. \n\n Boost your confidence with structured practice plans and creative exercises that spark your passion for music. Explore tutorials that teach you new songs, riffs, and solos, while daily practice widgets keep you on track. Overcome challenges with exercises tailored to your level, and enjoy backing tracks that turn practice into performance. Finger placement woes? Strumming struggles? Timing off? Our tutorials, practice sessions, and exercises have you covered—repeatedly refining your skills until they shine. \n\n Why choose BuzzFeed Guitar? It’s more than an app—it’s a journey. With countless tutorials, practice opportunities, and exercises, you’ll enhance your technique, deepen your music theory knowledge, and ignite your passion for guitar. Play along with backing tracks, master finger placement, and perfect your strumming through consistent practice. Tackle challenges that test your growth, and watch your confidence soar as you progress. Whether you’re here to learn music or elevate your skills, this app makes every practice session, tutorial, and exercise a rewarding experience. \n\n Download BuzzFeed Guitar now and start your musical adventure! With endless practice tools, tutorials, and exercises, you’ll transform from a novice to a pro, one chord at a time. Strum, pick, and play your way to greatness—your guitar journey begins here"
    }
]
APP_STORE_FEW_SHOT_EXAMPLES_INPUTS = [
    {
        "product": "BuzzFeed Guitar app helps you master guitar, improve technique, explore chords, and learn new songs. It’s perfect for beginners, advanced players, acoustic and electric enthusiasts. You can access lessons, tutorials, quizzes, interactive games, exercises, and in-depth articles based on music theory and guitar research. Helps you perfect finger placement, strumming patterns, and timing, while keeping practice engaging and fun. Jam along with backing tracks, overcome musical challenges, and boost your confidence. It also works as a daily practice starter, creative widget, fun challenge tool for exploring riffs, solos, and techniques, enhancing your passion for music, daily practice, concert prep, and even guitar therapy.",
        "locale": "en-US",
        "name": "BuzzFeed Guitar",
        "selected_keywords": [
            {"term": "learn guitar", "category": "title", "final_score": 90},
            {"term": "guitar lessons", "category": "subtitle", "final_score": 85},
            {"term": "guitar chords plays", "category": "subtitle", "final_score": 80},
            {"term": "songs", "category": "subtitle", "final_score": 75},
            {"term": "guitar for technique", "category": "keywords", "final_score": 70},
            {"term": "tutorials practice and technique", "category": "keywords", "final_score": 65},
            {"term": "exercises", "category": "keywords", "final_score": 55},
            {"term": "music for theory", "category": "keywords", "final_score": 50},
            {"term": "yousician guitar", "category": "keywords", "final_score": 45},
            {"term": "fender play", "category": "keywords", "final_score": 40},
            {"term": "music", "original": "music", "category": "keywords"}
        ],
        "known_competitors": ["Yousician guitar app", "Fender Play", "PlayNow", "GuitarHero"],
        "irrelevant_competitors": ["Spotify", "Netflix"]
    }
]
APP_STORE_FEW_SHOT_OUTPUTS = [
    {
        "length": "title:22, subtitle:23, keywords:80, short_description:38,description:2576",
        "title": "BuzzFeed: learn guitar",
        "subtitle": "Lessons & chord plays",
        "keywords": "technique,tutorials,technique,exercises,music,theory,yousician,fender",
        "short_description": "Master guitar with fun lessons & songs",
        "description": "If you’ve been wanting to get better at guitar—or even just start from scratch—BuzzFeed Guitar is something for you. It’s an app that helps you figure out guitar playing in a way that doesn’t feel like a chore. Whether you’re into acoustic vibes or electric riffs, this is for anyone who wants to improve their skills, no matter where you’re at. BuzzFeed breaks things down with lessons and tutorials that actually make sense, even if you’re totally new to it.  One thing that’s cool is how BuzzFeed walks you through finger placement and strumming patterns—things that used to trip me up all the time. You get quizzes and little interactive games to keep your practice interesting, plus exercises to build up your technique over time. Timing’s a big deal too, and the app’s got tools to help you nail that. There are backing tracks you can jam along with, which honestly makes it feel like you’re playing with a band. For us, that’s been a game-changer—it keeps things fun and not just repetitive.  If you’re curious about chords or want to learn new songs, it’s all here. There’s a bunch of content based on music theory and guitar research, but it’s not overwhelming—just enough to help you understand what you’re doing. We’ve found the articles really handy when we wanted to dig deeper into how it all works. And if you’re prepping for a concert or just want to mess around with riffs and solos, there’s stuff for that too.  It’s also great for keeping up a daily practice habit. The app has this creative widget that throws quick challenges your way—like a fun little nudge to pick up your guitar. We’ve used it to work on my confidence, especially when we are tackling something tricky like a solo. There’s even a vibe to it that feels almost like guitar therapy—great for unwinding while still getting better. Oh, and it’s got features for both beginners and advanced players, so you won’t outgrow it.  Here’s what you’ll find inside: - Lessons and tutorials that fit your level, whether you’re starting out or refining your skills - Interactive games and exercises to keep your fingers sharp and your timing tight - Chords and songs to play around with, plus backing tracks for that live-band feel - Music theory and research articles if you’re into the why behind the notes - Daily practice starters and creative challenges to explore riffs, solos, and techniques - Tools to boost your confidence and prep for gigs or just jamming at home  We think it’s a solid way to make guitar part of your routine—keeps your passion going without feeling forced!"
    }
]


def validate_field_lengths(store_type: str, aso: Dict) -> None:
    """Validate the length of fields based on store type."""
    if store_type == "app_store":
        assert len(aso["title"]) <= 30, f"App Name exceeds 30 characters: {len(aso['title'])}"
        assert 10 <= len(aso["title"]) <= 30, f"App Name should be 15-30 characters: {len(aso['title'])}"
        assert len(aso["subtitle"]) <= 30, f"Subtitle exceeds 30 characters: {len(aso['subtitle'])}"
        assert len(aso["keywords"]) <= 100, f"Keywords exceed 100 characters: {len(aso['keywords'])}"
        assert len(
            aso["short_description"]) <= 45, f"Short description exceeds 45 characters: {len(aso['short_description'])}"
        assert len(aso["description"]) <= 4000, f"Description exceeds 4000 characters: {len(aso['description'])}"
    elif store_type == "play_market":
        assert len(aso["title"]) <= 30, f"App Name exceeds 30 characters: {len(aso['title'])}"
        assert len(
            aso["short_description"]) <= 80, f"Short description exceeds 80 characters: {len(aso['short_description'])}"
        assert len(aso["description"]) <= 4000, f"Description exceeds 4000 characters: {len(aso['description'])}"


def call_llm(messages: List[Dict], store_type: str) -> Dict:
    """Call the OpenAI API with retries."""
    for attempt in range(MAX_RETRIES):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=2000,
                messages=messages,
            )
            print(response.content[0].text)
            content = json.loads(response.content[0].text)
            print(content)
            validate_field_lengths(store_type, content)
            return content
        except Exception as e:
            logging.error(f"LLM call attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                raise Exception(f"Failed after {MAX_RETRIES} attempts: {e}")


def load_json(filepath: str) -> Dict:
    """Load JSON data from a file."""
    try:
        logging.info(f"Loading JSON file: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logging.error(f"Error loading {filepath}: {e}")
        raise


def select_keywords(keywords: List[Dict], default_keywords: List[str],
                    irrelevant_competitors: List[str]) -> List[Dict]:
    sorted_keywords = keywords
    selected, default_selected = [], []
    used_terms = set()

    # Filter out irrelevant competitors and ensure relevance
    for kw in sorted_keywords[:30]:
        term = kw["keyword_term"]
        if any(comp.lower() in term.lower() for comp in irrelevant_competitors):
            continue
        if term not in used_terms:
            selected.append({"term": term, "final_score": kw['final_score']})
            used_terms.add(term)

    if len(selected) < 30:
        for dk in default_keywords[:30 - len(selected)]:
            default_selected.append(dk)
            used_terms.add(dk)

    return selected, default_selected


def generate_aso(store_type: str, name: str, product_desc: str, selected_keywords: List[Dict],
                 known_competitors: List[str], irrelevant_competitors: List[str], locale: str) -> Dict:
    if store_type == "app_store":
        system_prompt = GENERAL_SYSTEM_PROMPT + APP_STORE_SYSTEM_PROMPT
        examples = zip(PLAY_MARKET_FEW_SHOT_EXAMPLES_INPUTS, APP_STORE_FEW_SHOT_OUTPUTS)
    elif store_type == "play_market":
        system_prompt = GENERAL_SYSTEM_PROMPT + PLAY_MARKET_SYSTEM_PROMPT
        examples = zip(PLAY_MARKET_FEW_SHOT_EXAMPLES_INPUTS, PLAY_MARKET_FEW_SHOT_OUTPUTS)
    else:
        raise Exception(store_type)
    messages = [{"role": "user", "content": system_prompt}]

    # Add few-shot examples
    for [example, output] in examples:
        messages.append({"role": "user", "content": json.dumps({
            "name": example["name"],
            "product": example["product"],
            "locale": example["locale"],
            "selected_keywords": example["selected_keywords"],
            "known_competitors": example["known_competitors"],
            "irrelevant_competitors": example["irrelevant_competitors"]
        })})
        messages.append({"role": "assistant", "content": json.dumps(output)})

    # Add current request
    messages.append({"role": "user", "content": json.dumps({
        "name": name,
        "product": product_desc,
        "locale": locale,
        "keywords": selected_keywords,
        "known_competitors": known_competitors,
        "irrelevant_competitors": irrelevant_competitors
    })})
    print(json.dumps({
        "name": name,
        "product": product_desc,
        "locale": locale,
        "keywords": selected_keywords,
        "known_competitors": known_competitors,
        "irrelevant_competitors": irrelevant_competitors
    }))

    return call_llm(messages, store_type)


def save_json(filepath: str, data: Dict) -> None:
    """Save JSON data to a file with pretty formatting."""
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logging.info(f"Successfully saved data to {filepath}")
    except Exception as e:
        logging.error(f"Error saving to {filepath}: {e}")
        raise


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product provided in arguments")
        raise Exception('No product provided')
    product = sys.argv[1]
    overwrite = False if len(sys.argv) < 3 else sys.argv[2].lower() == "true"
    product_data = load_json("product_description.json")[product]
    iteration = product_data['iteration']

    keywords_data = load_json(f"9_{product}_{iteration}_aso_keywords.json")
    output_file = f"10_{product}_{iteration}_aso.json"

    # Load existing output data if it exists
    existing_output_data = load_json(output_file)
    if not existing_output_data:
        existing_output_data = {"app_store": {}, "play_market": {}}

    name = product_data['name']
    product_desc = product_data["description"]
    known_competitors = product_data["known_competitors"]
    irrelevant_competitors = product_data["irrelevant_competitors"]

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_to_task = {}
        for store, locales in keywords_data.items():
            # Ensure the store exists in the output data
            if store not in existing_output_data:
                existing_output_data[store] = {}

            for locale, keywords in locales.items():
                # Skip if locale is in the skip list
                if locale[:2] in SKIP_LANGUAGES:
                    existing_output_data[store][locale] = {}
                    logging.info(f"Skipping locale {locale}")
                    continue
                if not keywords:
                    raise Exception(locale)
                allowed_languages = IOS_LANGUAGES if store == 'app_store' else ANDROID_LANGUAGES
                if locale not in allowed_languages:
                    logging.info(f"Skipping {store} - {locale}: locale is not in the languages")
                    if locale in existing_output_data[store]:
                        del existing_output_data[store][locale]
                    continue
                if not overwrite and (locale in existing_output_data[store] and existing_output_data[store][locale]):
                    logging.info(f"Locale already processed and overwrite is false: {store} - {locale}")
                    continue
                future = executor.submit(generate_aso, store, name, product_desc, keywords,
                                         known_competitors, irrelevant_competitors, locale)
                future_to_task[future] = (store, locale)

        for future in as_completed(future_to_task):
            store, locale = future_to_task[future]
            try:
                result = future.result()
                # Update the specific locale in our existing data
                existing_output_data[store][locale] = result
                # Save after each successful generation to preserve progress
                save_json(output_file, existing_output_data)
                logging.info(f"Successfully generated ASO for {store} - {locale}")
            except Exception as e:
                logging.error(f"Failed to generate ASO for {store} - {locale}: {e}")
                existing_output_data[store][locale] = {}
                save_json(output_file, existing_output_data)

    logging.info(f"ASO generation completed. Results saved to {output_file}")


if __name__ == "__main__":
    main()
