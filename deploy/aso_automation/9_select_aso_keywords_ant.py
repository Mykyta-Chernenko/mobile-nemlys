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
MAX_RETRIES = 8
RETRY_DELAY = 2

GENERAL_SYSTEM_PROMPT = """
You are a senior ASO Product Manager, your task is to create great and relevant ASO based on the keywords, product and info I provide.

ASO must be in the target locale, your translation must be localized and sound natural for the target language and country
"keywords" must be used at they are, without translation
it will looks like this
{"term": $originalDefaultKeyword, "final_score": $finalScore,  "category": $category}
"default_keywords" must be translated to the target locale with good natural equivalent. When you pick a keyword, from default keywords, the structure you return for it is 
{"term": $translatedToLocateDefaultKeyword, "original": $originalDefaultKeyword,  "category": $category}


"keywords" that are not relevant to the app description, must be ignored. Like "share ass" and "home exercise" and "sex chat" and "message" have nothing to do with an app to improve couple relationship, those keywords belong to completely different apps.
if a keyword is duplicated, use it only once
keywords with higher final_score have greater priority. THe higher the final_score is, the better of a keyword it is, this is by far the most important criterium you have to use to choose which words you include and at which place

You must use the keyword completely, you cannot break a keyword of 2 words in 2 separate words, use them as they are, this is important.

do not use competitors in the app name and subtitle/short description, but  us them in keywords/full description it is amazing if you do that, just fine

DO not to prioritize default words above words with scores that are relevant, any scored word if much more important (if it is relevant) than a defautl word
YOU MUST ALWAYS USE THE SCORED WORDS in title and short description/subtitle NOT DEFAULT KEYWORDS (if there are relevant non-competitor scored words)
Produce valid and complete json, nothing else
"""
APP_STORE_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how App Store ASO works, no create the following content:

- App Name — 20-29 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Couple app Nemlys” or “Nemlys: couple app”. no competitors here!
- App Subtitle — 20-29 characters, the second biggest ASO ranking factor. This can either be a tagline or a call-to-action. no competitors here!
- Keywords field - 85-95 characters, not visible to users, keywords separated by commas BUT without space between commas (e.g. “couple,partner,kinky,wild… …”, here you can put competitors).

These are the fields that are visible and important for users, but are NOT working on ASO optimisation and do not counts in ranking, so it is needs to be well-writtena nd describe the app so user can better understand the usecase:

- Short description - 35-44 characters, a quick overview of what your app offers. The copy should be enticing enough for potential users to expand by clicking “see more” to read the full app description.
- App Description - 3500-3,800 characters, “The ideal description is a concise, informative paragraph followed by a short list of main features. Let potential users know what makes your app unique and why they’ll love it.”. separate long description with \n

Other:

- iOS only factors one keyword once, so avoid duplication of the keywords on the App Store.
- Keywords like “app” and “game” in general shouldn’t be used as keywords, as they are already indexed by App Store.

you have to produce json object with the following fields
selected_keywords
you need to select up to 12 keywords from provided keywords + default_keywords in selected_keywords
categories for selected_keywords are title, subtitle, keywords
you must select 1-2 words for 'title', 2-4 for 'subtitle', and 6-9 for 'keywords'
how many words you select for each section depends on the length of the word. E.g. if there are 2 good very short keywords, you can select them for title, but if 1 keyword is long, only 1 will match in the title field.
The same logic applies to subtitle
"""
PLAY_MARKET_SYSTEM_PROMPT = """
You Know all of the details and peculiarities of how Play Market ASO works, no create the following content:

- App Name — 20-29 characters, most important field. Should use the most promising keyword as long as a brand name. Example: “Music Creation JussMus”. No competitors here!
- Short description - 65-78 characters. This should be a quick overview of what your app offers. The short description is like a one- or two-line hook below the app title to describe and drive interest in the app. Examples of this are “Listen to original stories & podcasts. Take your audio book library anywhere” for Audible and “Tackle everyday stress and anxiety. Self-care and sound sleep through meditation” for Calm. no competitors here!
- App Description - 3500-3,800 characters.  (competitors possible) 


you have to produce json object with the following fields  
selected_keywords 
you need to select up to 20 keywords from provided keywords + default_keywords in selected_keywords
categories for selected_keywords are title, short_description, description
you must select 1-2 words for 'title', 2-4 for 'short_description', and 14-17 for 'description'
how many words you select for each section depends on the length of the word. E.g. if there are 2 good very short keywords, you can select them for title, but if 1 keyword is long, only 1 will match in the title field.
The same logic applies to short_description
"""

# Few-shot examples for App Store
FEW_SHOT_EXAMPLES_INPUTS = [
    {
        "product": "BuzzFeed Guitar app helps you master guitar, improve technique, explore chords, and learn new songs. It’s perfect for beginners, advanced players, acoustic and electric enthusiasts. You can access lessons, tutorials, quizzes, interactive games, exercises, and in-depth articles based on music theory and guitar research. Helps you perfect finger placement, strumming patterns, and timing, while keeping practice engaging and fun. Jam along with backing tracks, overcome musical challenges, and boost your confidence. It also works as a daily practice starter, creative widget, fun challenge tool for exploring riffs, solos, and techniques, enhancing your passion for music, daily practice, concert prep, and even guitar therapy.",
        "locale": "en-US",
        "name": "BuzzFeed Guitar",
        "keywords": [
            {"keyword_term": "spotify music", "final_score": 97},  # Irrelevant, not selected
            {"keyword_term": "yousician", "final_score": 96},  # Known competitor
            {"keyword_term": "guitar", "final_score": 95},
            {"keyword_term": "learn guitar", "final_score": 90},
            {"keyword_term": "guitar lessons", "final_score": 85},
            {"keyword_term": "chords", "final_score": 80},
            {"keyword_term": "songs", "final_score": 75},
            {"keyword_term": "technique", "final_score": 70},
            {"keyword_term": "practice", "final_score": 65},
            {"keyword_term": "tutorials", "final_score": 60},
            {"keyword_term": "exercises", "final_score": 55},
            {"keyword_term": "music theory", "final_score": 50},
            {"keyword_term": "fender play", "final_score": 40},  # Known competitor
            {"keyword_term": "chat", "final_score": 35},  # Irrelevant
            {"keyword_term": "social network", "final_score": 30},  # Irrelevant
            {"keyword_term": "games", "final_score": 25},  # Irrelevant
            {"keyword_term": "sports", "final_score": 20}  # Irrelevant
        ],
        "default_keywords": ["guitar", "music", "learn", "practice", "chords", "songs", "technique", "lessons",
                             "tutorials", "exercises", "theory", "finger placement", "strumming", "timing",
                             "backing tracks", "challenges", "confidence", "passion", "concert", "therapy"],
        "known_competitors": ["Yousician", "Fender Play"],
        "irrelevant_competitors": ["Spotify", "Netflix"]
    },
    {
        "product": "Medity Meditation app helps you discover calm, enhance mindfulness, and explore diverse meditation practices. It’s perfect for beginners, experienced meditators, and anyone seeking inner balance. Access guided sessions, breathing exercises, soothing soundscapes, interactive challenges, reflective journals, and insightful articles based on mindfulness research and mental wellness. Cultivate focus, reduce stress, and improve sleep, all while making meditation a joyful daily habit. Enjoy personalized meditation plans, mood check-ins, and progress tracking that empower you to overcome anxiety and foster emotional resilience. It also serves as a daily mindfulness starter, creative wellness widget, engaging mood booster, and supportive tool for mental therapy for lasting wellbeing.",
        "locale": "nb",
        "name": "Medity Meditation",
        "keywords": [
            {"keyword_term": "meditasjon", "final_score": 95},
            {"keyword_term": "meditasjon", "final_score": 95},  # Duplicate
            {"keyword_term": "mindfulness", "final_score": 90},
            {"keyword_term": "mindfulness", "final_score": 90},  # Duplicate
            {"keyword_term": "avslapning", "final_score": 85},
            {"keyword_term": "stressmestring", "final_score": 80},
            {"keyword_term": "ro", "final_score": 75},
            {"keyword_term": "fokus", "final_score": 70},
            {"keyword_term": "søvn", "final_score": 65},
            {"keyword_term": "velvære", "final_score": 60},
            {"keyword_term": "chat", "final_score": 55},  # Irrelevant
            {"keyword_term": "spill", "final_score": 50},  # Irrelevant
            {"keyword_term": "headspace", "final_score": 45},  # Known competitor
            {"keyword_term": "calm", "final_score": 40},  # Known competitor
            {"keyword_term": "youtube", "final_score": 35},  # Irrelevant competitor
            {"keyword_term": "instagram", "final_score": 30},  # Irrelevant competitor
            {"keyword_term": "trening", "final_score": 15},  # Irrelevant
            {"keyword_term": "mat", "final_score": 10}  # Irrelevant
        ],
        "default_keywords": ["meditation", "mindfulness", "relax", "stress relief", "calm", "focus", "sleep",
                             "wellbeing", "mental health", "breathing", "anxiety", "emotional resilience",
                             "daily habit", "progress", "journal", "articles", "research", "therapy", "widget",
                             "challenge"],
        "known_competitors": ["Headspace", "Calm"],
        "irrelevant_competitors": ["YouTube", "Instagram"]
    }
]
PLAY_MARKET_FEW_SHOT_OUTPUTS = [
    {
        "selected_keywords": [
            {"term": "learn guitar", "category": "title", "final_score": 90},
            {"term": "guitar lessons", "category": "short_description", "final_score": 85},
            {"term": "chords", "category": "short_description", "final_score": 80},
            {"term": "songs", "category": "short_description", "final_score": 75},
            {"term": "yousician", "category": "description", "final_score": 96},
            {"term": "technique", "category": "short_description", "final_score": 70},
            {"term": "practice", "category": "description", "final_score": 65},
            {"term": "tutorials", "category": "description", "final_score": 60},
            {"term": "exercises", "category": "description", "final_score": 55},
            {"term": "music theory", "category": "description", "final_score": 50},
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

    },
    {
        "selected_keywords": [
            {"term": "mindfulness", "category": "title", "final_score": 90},
            {"term": "meditasjon", "category": "title", "final_score": 95},
            {"term": "avslapning", "category": "short_description", "final_score": 85},
            {"term": "stressmestring", "category": "short_description", "final_score": 80},
            {"term": "fokus", "category": "short_description", "final_score": 70},
            {"term": "søvn", "category": "short_description", "final_score": 65},
            {"term": "ro", "category": "description", "final_score": 75},
            {"term": "velvære", "category": "description", "final_score": 60},
            {"term": "pusteøvelser", "original": "breathing", "category": "description"},
            {"term": "daglig vane", "original": "daily habit", "category": "description"},
            {"term": "progress", "original": "progress", "category": "description"},
            {"term": "journal", "original": "journal", "category": "description"},
            {"term": "mental helse", "original": "mental health", "category": "description"},
            {"term": "angst", "original": "anxiety", "category": "description"},
            {"term": "emosjonell resiliens", "original": "emotional resilience", "category": "description"},
            {"term": "artikler", "original": "articles", "category": "description"},
            {"term": "forskning", "original": "research", "category": "description"},
            {"term": "terapi", "original": "therapy", "category": "description"},
            {"term": "utfordring", "original": "challenge", "category": "description"},
            {"term": "widget", "original": "widget", "category": "description"}
        ],
    }
]
APP_STORE_FEW_SHOT_OUTPUTS = [
    {
        "selected_keywords": [
            {"term": "learn guitar", "category": "title", "final_score": 90},
            {"term": "guitar lessons", "category": "subtitle", "final_score": 85},
            {"term": "chords", "category": "subtitle", "final_score": 80},
            {"term": "songs", "category": "subtitle", "final_score": 75},
            {"term": "yousician", "category": "keywords", "final_score": 96},
            {"term": "technique", "category": "keywords", "final_score": 70},
            {"term": "practice", "category": "keywords", "final_score": 65},
            {"term": "tutorials", "category": "keywords", "final_score": 60},
            {"term": "exercises", "category": "keywords", "final_score": 55},
            {"term": "music theory", "category": "keywords", "final_score": 50},
            {"term": "fender play", "category": "keywords", "final_score": 40},
            {"term": "music", "original": "music", "category": "keywords"}
        ], },
    {
        "selected_keywords": [
            {"term": "mindfulness", "category": "title", "final_score": 90},
            {"term": "meditasjon", "category": "title", "final_score": 95},
            {"term": "avslapning", "category": "subtitle", "final_score": 85},
            {"term": "fokus", "category": "subtitle", "final_score": 70},
            {"term": "søvn", "category": "subtitle", "final_score": 65},
            {"term": "stressmestring", "category": "keywords", "final_score": 80},
            {"term": "ro", "category": "keywords", "final_score": 75},
            {"term": "velvære", "category": "keywords", "final_score": 60},
            {"term": "pusteøvelser", "original": "breathing", "category": "keywords"},
            {"term": "daglig vane", "original": "daily habit", "category": "keywords"},
            {"term": "progress", "original": "progress", "category": "keywords"},
            {"term": "journal", "original": "journal", "category": "keywords"}
        ],
    }
]


def validate_field_lengths(store_type: str, aso: Dict) -> None:
    """Validate the length of fields based on store type."""
    if store_type == "app_store":
        for w in aso['selected_keywords']:
            assert w['category'] in ['title', 'subtitle', 'keywords']
    elif store_type == "play_market":
        for w in aso['selected_keywords']:
            assert w['category'] in ['title', 'short_description', 'description']


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


def generate_aso(store_type: str, name: str, product_desc: str, keywords: List[Dict], default_keywords: List[str],
                 known_competitors: List[str], irrelevant_competitors: List[str], locale: str) -> Dict:
    selected_keywords, selected_default = select_keywords(keywords, default_keywords, irrelevant_competitors)

    if store_type == "app_store":
        system_prompt = GENERAL_SYSTEM_PROMPT + APP_STORE_SYSTEM_PROMPT
        examples = zip(FEW_SHOT_EXAMPLES_INPUTS, APP_STORE_FEW_SHOT_OUTPUTS)
    elif store_type == "play_market":
        system_prompt = GENERAL_SYSTEM_PROMPT + PLAY_MARKET_SYSTEM_PROMPT
        examples = zip(FEW_SHOT_EXAMPLES_INPUTS, PLAY_MARKET_FEW_SHOT_OUTPUTS)
    else:
        raise Exception(store_type)
    messages = [{"role": "user", "content": system_prompt}]

    # Add few-shot examples
    for [example, output] in examples:
        messages.append({"role": "user", "content": json.dumps({
            "name": example["name"],
            "product": example["product"],
            "locale": example["locale"],
            "keywords": example["keywords"],
            "default_keywords": example["default_keywords"],
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
        "default_keywords": selected_default,
        "known_competitors": known_competitors,
        "irrelevant_competitors": irrelevant_competitors
    })})
    print(json.dumps({
        "name": name,
        "product": product_desc,
        "locale": locale,
        "keywords": selected_keywords,
        "default_keywords": selected_default,
        "known_competitors": known_competitors,
        "irrelevant_competitors": irrelevant_competitors
    }))

    return call_llm(messages, store_type)


def main():
    if len(sys.argv) < 2 or not sys.argv[1]:
        logging.error("No product provided in arguments")
        raise Exception('No product provided')
    product = sys.argv[1]

    product_data = load_json("product_description.json")[product]
    iteration = product_data['iteration']

    keywords_data = load_json(f"keywords_{product}_{iteration}_final_score.json")

    name = product_data['name']
    product_desc = product_data["description"]
    default_keywords = product_data["default_keywords"]
    known_competitors = product_data["known_competitors"]
    irrelevant_competitors = product_data["irrelevant_competitors"]

    output_data = {"app_store": {}, "play_market": {}}
    output_file = f"9_{product}_{iteration}_aso_keywords.json"

    with ThreadPoolExecutor(max_workers=2) as executor:
        future_to_task = {}
        for store, locales in keywords_data.items():
            for locale, keywords in locales.items():
                if locale[:2] in SKIP_LANGUAGES:
                    logging.info(f"Skipping locale {locale}")
                    continue
                if not keywords or len(keywords) < 3:
                    logging.info(f"Skipping locale {locale}, too few keywords")
                    continue

                future = executor.submit(generate_aso, store, name, product_desc, keywords[:20], default_keywords,
                                         known_competitors, irrelevant_competitors, locale)
                future_to_task[future] = (store, locale)

        for future in as_completed(future_to_task):
            store, locale = future_to_task[future]
            try:
                result = future.result()
                output_data[store][locale] = result
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(output_data, f, ensure_ascii=False, indent=2)
            except Exception as e:
                raise e
                logging.error(f"Failed to generate ASO for {store} - {locale}: {e}")

    logging.info(f"Saved ASO to {output_file}")


if __name__ == "__main__":
    main()
