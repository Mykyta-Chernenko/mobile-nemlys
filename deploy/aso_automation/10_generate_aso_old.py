import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List
from general import SKIP_LANGUAGES, IOS_LANGUAGES, ANDROID_LANGUAGES

import openai

logging.basicConfig(level=logging.INFO)

openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = "o3-mini"
MAX_RETRIES = 8
RETRY_DELAY = 2


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

do not use competitors in the app name and subtitle on IOS/short description on Android only in keywords on IOS/full description on Android

do not repeat the same word in title, subtitle, short description and keywords

description must be precisely 3500 characters, follow other character counts with extreme precision

produce json object
"""
APP_STORE_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how App Store ASO works, now create the following content:

- App Name — 28 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Couple app Nemlys” or “Nemlys: couple app”. no competitors here!
- App Subtitle — 28 characters, the second biggest ASO ranking factor. This can either be a tagline or a call-to-action. no competitors here!
- Keywords field - 95 characters, not visible to users, keywords separated by commas BUT without space between commas (e.g. “couple,partner,kinky,wild… …”, here you can put competitors).

Lower are the fields that are visible and important for users, but are NOT working on ASO optimisation and do not counts in ranking, so it is needs to be well-writtena nd describe the app so user can better understand the usecase:
- Short description - 43 characters, a quick overview of what your app offers. The copy should be enticing enough for potential users to expand by clicking “see more” to read the full app description.
- App Description - 3500 characters, “The ideal description is a concise, informative paragraph followed by a short list of main features. Let potential users know what makes your app unique and why they’ll love it.”. separate long description with \n

Other:

- iOS only factors one keyword once, so avoid duplication of the keywords on the App Store.
- Keywords like “app” and “game” in general shouldn’t be used as keywords, as they are already indexed by App Store.

you have to produce json object with the following fields
title,subtitle,keywords,short_description,description

"""
PLAY_MARKET_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how Play Market ASO works, now create the following content:

- App Name — 25 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Music Creation JussMus”. No competitors here!
- Short description - 75 characters. This should be a quick overview of what your app offers. The short description is like a one- or two-line hook below the app title to describe and drive interest in the app. Examples of this are “Listen to original stories & podcasts. Take your audio book library anywhere” for Audible and “Tackle everyday stress and anxiety. Self-care and sound sleep through meditation” for Calm. no competitors here!
- App Description - 3500 characters.  (competitors possible) separate long description with \n
Other: 

- Keep the best description content in the first 255 characters (one or two sentences) appear in the app listing preview, so make your first lines compelling.
- Aim that each of top 3 most scored works selected for keywords category to be integrated 5-10 times naturally in the description. Other keywords must be met at least 3 times at different places. The description must be still very easy to read, no keyword stuffing, natural language.
- Avoid keyword stuffing in the description. Striking a balance between optimal keyword density and natural readability is crucial. Keyword stuffing can be punishable by Google and negatively impact the user experience, so do not do things like  Couple game, couple game, couple game. Spicy questions, spicy questions, spicy questions in the description, all text must be natural and readable to user and not stuffed.
- If a keyword has no score, it is enough to repeat it 5 times in the description      
      
you have to produce json object with the following fields  
title,short_description,description  
"""

# Few-shot examples for App Store
PLAY_MARKET_FEW_SHOT_EXAMPLES_INPUTS = [
    {
        "product": "BuzzFeed Guitar app helps you master guitar, improve technique, explore chords, and learn new songs. It’s perfect for beginners, advanced players, acoustic and electric enthusiasts. You can access lessons, tutorials, quizzes, interactive games, exercises, and in-depth articles based on music theory and guitar research. Helps you perfect finger placement, strumming patterns, and timing, while keeping practice engaging and fun. Jam along with backing tracks, overcome musical challenges, and boost your confidence. It also works as a daily practice starter, creative widget, fun challenge tool for exploring riffs, solos, and techniques, enhancing your passion for music, daily practice, concert prep, and even guitar therapy.",
        "locale": "en-US",
        "name": "BuzzFeed Guitar",
        "selected_keywords": [
            {"term": "learn guitar", "category": "title", "final_score": 90},
            {"term": "guitar lessons", "category": "short_description", "final_score": 85},
            {"term": "chords", "category": "short_description", "final_score": 80},
            {"term": "songs", "category": "short_description", "final_score": 75},
            {"term": "technique", "category": "short_description", "final_score": 70},
            {"term": "practice", "category": "description", "final_score": 65},
            {"term": "tutorials", "category": "description", "final_score": 60},
            {"term": "exercises", "category": "description", "final_score": 55},
            {"term": "music theory", "category": "description", "final_score": 50},
            {"term": "yousician guitar", "category": "description", "final_score": 45},
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
        "known_competitors": ["Yousician guitar player", "Fender Play"],
        "irrelevant_competitors": ["Spotify", "Netflix"]
    }
]
PLAY_MARKET_FEW_SHOT_OUTPUTS = [
    {
        "title": "BuzzFeed: learn guitar",
        "short_description": "Interactive guitar lessons, chords, songs, and technique tutorials.",
        "description": "Master guitar with BuzzFeed Guitar, the app to learn guitar for all levels. Unlock your potential with lessons and tutorials made just for you. Whether you are a beginner strumming your first chords or an advanced player refining skills, this app has it all. Learn guitar your way with interactive guitar lessons and tutorials. Our curriculum covers basic chords, strumming, and timing to advanced music theory and technique. Improve finger placement and build confidence with clear guidance. Practice is key to success. BuzzFeed Guitar gives you interactive guitar lessons with feedback to improve your practice. Explore a huge library of songs to practice and master, from old classics to new hits. Tutorials on technique, like fingerpicking and solos, sharpen your skills. Exercises boost speed, strength, and finger placement precision. Music theory lessons on scales and harmony deepen your knowledge. Backing tracks let you practice improvisation and jam with virtual bands. Challenges test your timing and strumming to grow confidence daily. More features fuel your passion. Quizzes and games make learning chords and music theory fun. Exercises and articles from guitar research enhance your practice. A community lets you connect, share songs, and inspire your journey. Personalized practice plans track progress and set goals for gigs. Unlike Yousician Guitar or Fender Play, BuzzFeed Guitar mixes tutorials, strong practice tools, and music theory for all skill levels. It suits acoustic or electric players chasing passion or therapy. Practice daily with backing tracks, master songs, and explore technique. Users say, 'The tutorials and practice tools changed my strumming,' says Chris. 'Music theory is simple now; I write songs,' says Mia. 'Challenges and exercises grew my confidence fast,' says Sam. Why choose BuzzFeed Guitar? Learn guitar fully, from chords to advanced skills. Practice with exercises, backing tracks, and tutorials anytime. Master music theory with engaging lessons. Build confidence and passion with community and challenges. Start now. Whether it is your first chord or a tough solo, BuzzFeed Guitar makes you shine. Download it and spark your musical passion. Extra perks include daily practice reminders to stay on track. Tutorials on finger placement and strumming patterns help you grow. Music theory quizzes test what you know. Backing tracks span genres to practice with. Challenges lift your timing and confidence. Exercises strengthen your fingers and technique. A song library lets you learn and master tunes. A community shares progress and feedback. Personalized practice plans push you toward goals. Unlike Yousician Guitar or Fender Play, it blends tutorials and exercises for all. Yousician Guitar may lack the depth of music theory we offer. Fender Play might miss our interactive practice edge. Yousician Guitar and Fender Play are great, but BuzzFeed Guitar stands out. Practice with us, learn with us, and play music with passion. Download BuzzFeed Guitar today and kick off your musical journey with tutorials, exercises, and more."
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
            {"term": "chords", "category": "subtitle", "final_score": 80},
            {"term": "songs", "category": "subtitle", "final_score": 75},
            {"term": "technique", "category": "keywords", "final_score": 70},
            {"term": "guitar practice", "category": "keywords", "final_score": 65},
            {"term": "tutorials", "category": "keywords", "final_score": 60},
            {"term": "exercises", "category": "keywords", "final_score": 55},
            {"term": "music theory", "category": "keywords", "final_score": 50},
            {"term": "yousician guitar", "category": "keywords", "final_score": 45},
            {"term": "fender play", "category": "keywords", "final_score": 40},
            {"term": "music", "original": "music", "category": "keywords"}
        ],
        "known_competitors": ["Yousician guitar app", "Fender Play"],
        "irrelevant_competitors": ["Spotify", "Netflix"]
    }
]
APP_STORE_FEW_SHOT_OUTPUTS = [
    {
        "title": "BuzzFeed: learn guitar",
        "subtitle": "Guitar lessons & chords",
        "keywords": "technique,practice,tutorials,exercises,music theory,yousician guitar,fender play",
        "short_description": "Master guitar with fun lessons & songs",
        "description": "If you’ve been wanting to get better at guitar—or even just start from scratch—BuzzFeed Guitar is something for you. It’s an app that helps you figure out guitar playing in a way that doesn’t feel like a chore. Whether you’re into acoustic vibes or electric riffs, this is for anyone who wants to improve their skills, no matter where you’re at. BuzzFeed breaks things down with lessons and tutorials that actually make sense, even if you’re totally new to it.\n\nOne thing that’s cool is how BuzzFeed walks you through finger placement and strumming patterns—things that used to trip me up all the time. You get quizzes and little interactive games to keep your practice interesting, plus exercises to build up your technique over time. Timing’s a big deal too, and the app’s got tools to help you nail that. There are backing tracks you can jam along with, which honestly makes it feel like you’re playing with a band. For us, that’s been a game-changer—it keeps things fun and not just repetitive.\n\nIf you’re curious about chords or want to learn new songs, it’s all here. There’s a bunch of content based on music theory and guitar research, but it’s not overwhelming—just enough to help you understand what you’re doing. We’ve found the articles really handy when we wanted to dig deeper into how it all works. And if you’re prepping for a concert or just want to mess around with riffs and solos, there’s stuff for that too.\n\nIt’s also great for keeping up a daily practice habit. The app has this creative widget that throws quick challenges your way—like a fun little nudge to pick up your guitar. We’ve used it to work on my confidence, especially when we are tackling something tricky like a solo. There’s even a vibe to it that feels almost like guitar therapy—great for unwinding while still getting better. Oh, and it’s got features for both beginners and advanced players, so you won’t outgrow it.\n\nHere’s what you’ll find inside:\n- Lessons and tutorials that fit your level, whether you’re starting out or refining your skills\n- Interactive games and exercises to keep your fingers sharp and your timing tight\n- Chords and songs to play around with, plus backing tracks for that live-band feel\n- Music theory and research articles if you’re into the why behind the notes\n- Daily practice starters and creative challenges to explore riffs, solos, and techniques\n- Tools to boost your confidence and prep for gigs or just jamming at home\n\nWe think it’s a solid way to make guitar part of your routine—keeps your passion going without feeling forced!"
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
            response = openai.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = json.loads(response.choices[0].message.content.strip())
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
    messages = [{"role": "system", "content": system_prompt}]

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
    product_data = load_json("product_description.json")[product]
    iteration = product_data['iteration']

    keywords_data = load_json(f"9_{product}_{iteration}_aso_keywords.json")
    output_file = f"9_{product}_{iteration}_aso.json"

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
        c = 0
        for store, locales in keywords_data.items():
            # Ensure the store exists in the output data
            if store not in existing_output_data:
                existing_output_data[store] = {}

            for locale, keywords in locales.items():
                # Skip if locale is in the skip list
                if locale[:2] in SKIP_LANGUAGES:
                    logging.info(f"Skipping locale {locale}")
                    continue

                # Skip if no keywords or already processed
                if not keywords or (
                        locale in existing_output_data.get(store, {}) and existing_output_data[store][locale]):
                    if not keywords:
                        logging.info(f"No keywords for {store} - {locale}")
                    else:
                        logging.info(f"Locale already processed: {store} - {locale}")
                    continue

                # Limit processing for testing
                c += 1
                if c > 2:  # TODO: Remove this limit in production
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

    logging.info(f"ASO generation completed. Results saved to {output_file}")


if __name__ == "__main__":
    main()