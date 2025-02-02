import json
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

import openai

PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 0,
    "max_tokens": 4000,
    "top_p": 1,
    "n": 1,
    "stop": None
}

# Maximum number of concurrent workers
MAX_WORKERS = 100

# Number of attempts to call the GPT API before giving up
MAX_RETRIES = 5

# Delay between retries
RETRY_DELAY = 0

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

TRANSLATED = [
    "uk", "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil",
    "id", "pl", "ro", "tr", "ru", "vi", "no", "af", "sq", "hy",
    "az", "eu", "be", "bg", "my", "ca", "hr", "cs", "da", "et", "fi", "gl",
    "ka", "el", "gu", "he", "hu", "is", "kn", "kk", "km", "ko", "ky", "lv", "lt", "mk", "ms",
    "mr", "mn",
    "ne", "fa", "pa", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te", "th", "ur", "zu", "am", "ml", "rm",
]
# List of all target languages
LANGUAGES = [

]

language_full_name = {
    "uk": "Ukrainian",
    "es": "Spanish",
    "nl": "Dutch",
    "de": "German",
    "it": "Italian",
    "fr": "French",
    "ar": "Arabic",
    "bn": "Bengali",
    "zh_cn": "Chinese (Simplified)",
    "zh_tw": "Chinese (Traditional)",
    "zh_hk": "Chinese (Hong Kong)",
    "hi": "Hindi",
    "ja": "Japanese",
    "pt": "Portuguese",
    "fil": "Filipino",
    "id": "Indonesian",
    "pl": "Polish",
    "ro": "Romanian",
    "tr": "Turkish",
    "ru": "Russian",
    "vi": "Vietnamese",
    "no": "Norwegian",
    "af": "Afrikaans",
    "sq": "Albanian",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bg": "Bulgarian",
    "my": "Burmese",
    "ca": "Catalan",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "et": "Estonian",
    "fi": "Finnish",
    "gl": "Galician",
    "ka": "Georgian",
    "el": "Greek",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hu": "Hungarian",
    "is": "Icelandic",
    "kn": "Kannada",
    "kk": "Kazakh",
    "ko": "Korean",
    "ky": "Kyrgyz",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "ms": "Malay",
    "mr": "Marathi",
    "mn": "Mongolian",
    "ne": "Nepali",
    "fa": "Persian",
    "pa": "Punjabi",
    "sr": "Serbian",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sw": "Swahili",
    "sv": "Swedish",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "ur": "Urdu",
    "zu": "Zulu",
    "am": "Amharic",
    "ml": "Malayalam",
    "rm": "Romansh",
    "km": "Khmer"
}

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


# ------------------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------------------

def read_content_json(filepath: str) -> List[Dict[str, Any]]:
    """
    Reads the JSON data from `filepath` and returns it as a list of dictionaries.
    Returns an empty list if the file does not exist or if JSON is invalid.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logging.warning(f"File '{filepath}' not found or invalid JSON. Returning empty list.")
        return []


def write_content_json(filepath: str, data: List[Dict[str, Any]]) -> None:
    """
    Writes the given list of dictionaries to `filepath` as a pretty-printed JSON.
    Creates directories if they do not exist.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def build_translation_prompt(content_item: Dict[str, Any], target_language: str) -> List[Dict[str, str]]:
    example_input_1 = {
        "job": [
            "exploring_feelings",
            "improving_communication"
        ],
        "title": "Vulnerability Exploration Session",
        "purpose": "This session helps you and your partner share your deepest feelings and fears, fostering a stronger emotional connection and understanding.",
        "steps": [
            {
                "title": "Create a Safe Space",
                "description": "Find a quiet and comfortable place where you won't be interrupted. Ensure that both of you feel relaxed and ready to share openly. Agree to listen without judgment or interruption. You might say, 'Let's take this time to really understand each other.' Setting this foundation helps both partners feel secure in expressing their true feelings."
            },
            {
                "title": "Share Personal Feelings",
                "description": "Take turns sharing something you haven't shared before or a deep feeling you often keep inside. For example, you might say, 'I sometimes feel anxious when we argue because I fear losing you.' Encourage honesty and openness, ensuring each person has ample time to speak without feeling rushed. This step allows both of you to reveal vulnerabilities in a controlled and supportive environment."
            },
            {
                "title": "Ask Open-Ended Questions",
                "description": "After each person shares, ask open-ended questions to further understand their partner's feelings. Questions like, 'Can you tell me more about when you feel this way?' or 'What can I do to support you during these times?' help to delve deeper into each other's emotions. This fosters a better understanding of each other's inner experiences and needs."
            },
            {
                "title": "Reflect and Acknowledge",
                "description": "After sharing, reflect back what you've heard to ensure understanding. For instance, say, 'It sounds like you feel overwhelmed when we have disagreements because you're afraid of our relationship ending.' Acknowledge your partner's feelings by validating them, such as, 'I understand why you'd feel that way, and I appreciate you sharing it with me.' This step reinforces that you are truly listening and valuing their emotions."
            },
            {
                "title": "Discuss Ways to Support Each Other",
                "description": "Together, brainstorm ways you can support each other's emotional needs. For example, agree to take a pause during heated moments or establish regular check-ins to discuss feelings. You might say, 'When you feel anxious, I can hold your hand to reassure you,' or 'Let's make time each week to talk about how we're both feeling.' Creating actionable steps ensures that the vulnerability shared leads to tangible improvements in your relationship."
            },
            {
                "title": "Close with Gratitude",
                "description": "End the session by expressing gratitude for each other's openness and trust. You could say, 'Thank you for sharing your feelings with me,' and 'I appreciate your honesty and vulnerability.' This reinforces a positive and supportive atmosphere, making it clear that sharing vulnerabilities was valuable and appreciated by both partners."
            }
        ],
        "slug": "vulnerability-exploration-session"
    }

    example_output_1_es = {
        "job": [
            "exploring_feelings",
            "improving_communication"
        ],
        "title": "Sesión de Exploración de Vulnerabilidad",
        "purpose": "Esta sesión ayuda a ti y a tu pareja a compartir sus sentimientos y miedos más profundos, fomentando una conexión emocional más fuerte y comprensión mutua.",
        "steps": [
            {
                "title": "Crear un Espacio Seguro",
                "description": "Encuentra un lugar tranquilo y cómodo donde no serán interrumpidos. Asegúrate de que ambos se sientan relajados y listos para compartir abiertamente. Acuerden escuchar sin juzgar o interrumpir. Podrías decir, 'Tomémonos este tiempo para realmente entendernos el uno al otro.' Establecer esta base ayuda a que ambos se sientan seguros al expresar sus verdaderos sentimientos."
            },
            {
                "title": "Compartir Sentimientos Personales",
                "description": "Tomen turnos para compartir algo que no hayan compartido antes o un sentimiento profundo que a menudo mantienen dentro. Por ejemplo, podrías decir, 'A veces me siento ansioso cuando discutimos porque temo perderte.' Fomenta la honestidad y apertura, asegurando que cada persona tenga tiempo suficiente para hablar sin sentirse apresurada. Este paso les permite revelar vulnerabilidades en un entorno controlado y de apoyo."
            },
            {
                "title": "Hacer Preguntas Abiertas",
                "description": "Después de que cada persona comparta, haz preguntas abiertas para entender mejor los sentimientos de tu pareja. Preguntas como, '¿Puedes contarme más sobre cuándo te sientes así?' o '¿Qué puedo hacer para apoyarte durante estos momentos?' ayudan a profundizar en las emociones de cada uno. Esto fomenta una mejor comprensión de las experiencias internas y necesidades de cada uno."
            },
            {
                "title": "Reflexionar y Reconocer",
                "description": "Después de compartir, reflexiona sobre lo que has escuchado para asegurar la comprensión. Por ejemplo, di, 'Parece que te sientes abrumado cuando tenemos desacuerdos porque temes que nuestra relación termine.' Reconoce los sentimientos de tu pareja validándolos, como 'Entiendo por qué te sientes así, y agradezco que lo hayas compartido conmigo.' Este paso refuerza que realmente estás escuchando y valorando sus emociones."
            },
            {
                "title": "Discutir Formas de Apoyarse Mutuamente",
                "description": "Juntos, piensen en formas en que pueden apoyar las necesidades emocionales de cada uno. Por ejemplo, acuerden hacer una pausa durante momentos acalorados o establecer chequeos regulares para discutir sentimientos. Podrías decir, 'Cuando te sientas ansioso, puedo tomarte de la mano para tranquilizarte,' o 'Hagamos tiempo cada semana para hablar sobre cómo nos sentimos ambos.' Crear pasos accionables asegura que la vulnerabilidad compartida lleve a mejoras tangibles en su relación."
            },
            {
                "title": "Cerrar con Gratitud",
                "description": "Termina la sesión expresando gratitud por la apertura y confianza de cada uno. Podrías decir, 'Gracias por compartir tus sentimientos conmigo,' y 'Aprecio tu honestidad y vulnerabilidad.' Esto refuerza un ambiente positivo y de apoyo, dejando claro que compartir vulnerabilidades fue valioso y apreciado por ambos."
            }
        ],
        "slug": "vulnerability-exploration-session"
    }

    # -- Example #2: Input & Ukrainian output (UPDATED)
    example_input_2 = {
        "job": [
            "planning_for_future"
        ],
        "title": "SMART Goals Planning",
        "purpose": "This exercise helps couples set clear, achievable goals for their future together by using the SMART criteria.",
        "steps": [
            {
                "title": "Understand SMART Goals",
                "description": "Begin by familiarizing yourselves with the SMART criteria to ensure your goals are Specific, Measurable, Achievable, Relevant, and Time-bound. Specific goals clearly define what you want to accomplish. Measurable goals include criteria to track progress. Achievable goals are realistic and attainable. Relevant goals align with your values and long-term plans. Time-bound goals have a deadline or timeframe. For example, instead of saying 'We want to save money,' a SMART goal would be 'We will save $5,000 for a vacation within the next 12 months.'"
            },
            {
                "title": "Identify Shared Goals",
                "description": "Take turns sharing your individual goals for the future and identify areas where they overlap. Discuss what you both want to achieve together, such as buying a home, traveling, or starting a family. Write down each goal and ensure it meets the SMART criteria. For instance, if both of you want to advance your careers, a SMART goal could be 'Each of us will complete a professional certification within the next six months to enhance our career prospects.'"
            },
            {
                "title": "Prioritize Your Goals",
                "description": "Once you have a list of shared goals, prioritize them based on importance and urgency. Discuss which goals are most critical to your relationship and long-term happiness. For example, if planning for children is a top priority, it might take precedence over saving for a vacation. Assign a priority level to each goal, such as high, medium, or low, to help focus your efforts effectively."
            },
            {
                "title": "Create Action Plans",
                "description": "Develop detailed action plans for each prioritized goal. Break down each goal into smaller, manageable steps that you can work on together. Assign responsibilities and set deadlines for each step. For example, if your goal is to buy a house, your action plan might include saving a certain amount each month, researching neighborhoods, and meeting with a financial advisor within the next three months."
            },
            {
                "title": "Monitor and Review Progress",
                "description": "Set regular check-ins to discuss your progress towards each goal. This could be weekly or monthly meetings where you review what has been accomplished and what still needs to be done. Use these meetings to stay accountable, adjust your action plans if necessary, and support each other in overcoming any challenges. For example, if you're behind on saving for a vacation, discuss ways to adjust your budget or find additional income sources to stay on track."
            },
            {
                "title": "Celebrate Achievements",
                "description": "Acknowledge and celebrate when you achieve your goals together. Recognizing your successes reinforces your commitment and strengthens your partnership. Whether it's a small reward for completing a step or a special celebration for reaching a major milestone, taking the time to celebrate helps maintain motivation and positivity in your relationship."
            }
        ],
        "slug": "smart-goals-planning"
    }

    example_output_2_ukraine = {
        "job": [
            "planning_for_future"
        ],
        "title": "Планування SMART-цілей",
        "purpose": "Ця вправа допомагає парам встановлювати чіткі, досяжні цілі для їхнього спільного майбутнього, використовуючи критерії SMART.",
        "steps": [
            {
                "title": "Зрозуміти SMART-цілі",
                "description": "Почніть з ознайомлення з критеріями SMART, щоб переконатися, що ваші цілі є Конкретними, Вимірюваними, Досяжними, Актуальними та Обмеженими в часі. Конкретні цілі чітко визначають, чого ви хочете досягти. Вимірювані цілі включають критерії для відстеження прогресу. Досяжні цілі є реалістичними та досяжними. Актуальні цілі відповідають вашим цінностям та довгостроковим планам. Обмежені в часі цілі мають крайній термін або часові рамки. Наприклад, замість того, щоб сказати «Ми хочемо заощадити гроші», SMART-ціль буде «Ми заощадимо 5000 доларів на відпустку протягом наступних 12 місяців»."
            },
            {
                "title": "Визначте спільні цілі",
                "description": "Почергово діляться своїми індивідуальними цілями на майбутнє та визначте сфери, де вони збігаються. Обговоріть, чого ви обидва хочете досягти разом, наприклад, купити дім, подорожувати або створити сім'ю. Запишіть кожну ціль і переконайтеся, що вона відповідає критеріям SMART. Наприклад, якщо ви обидва хочете розвивати свою кар'єру, SMART-ціль може бути «Кожен з нас завершить професійну сертифікацію протягом наступних шести місяців для покращення наших кар'єрних перспектив»."
            },
            {
                "title": "Пріоритизуйте ваші цілі",
                "description": "Після того, як у вас є список спільних цілей, пріоритизуйте їх за важливістю та терміновістю. Обговоріть, які цілі є найбільш критичними для ваших відносин та довгострокового щастя. Наприклад, якщо планування дітей є найвищим пріоритетом, воно може мати перевагу над заощадженням на відпустку. Присвойте кожній цілі рівень пріоритету, такий як високий, середній або низький, щоб ефективно зосередити свої зусилля."
            },
            {
                "title": "Створіть план дій",
                "description": "Розробіть детальні плани дій для кожної пріоритетної цілі. Розбийте кожну ціль на менші, керовані кроки, над якими ви можете працювати разом. Розподіліть обов'язки та встановіть терміни для кожного кроку. Наприклад, якщо ваша ціль – купити будинок, ваш план дій може включати заощадження певної суми щомісяця, дослідження районів та зустріч з фінансовим консультантом протягом наступних трьох місяців."
            },
            {
                "title": "Моніторинг та перегляд прогресу",
                "description": "Встановіть регулярні зустрічі для обговорення вашого прогресу щодо кожної цілі. Це можуть бути щотижневі або щомісячні зустрічі, де ви переглядаєте, що було досягнуто і що ще потрібно зробити. Використовуйте ці зустрічі, щоб залишатися відповідальними, при необхідності коригувати свої плани дій і підтримувати один одного в подоланні будь-яких викликів. Наприклад, якщо ви відстаєте у заощадженні на відпустку, обговоріть способи коригування бюджету або знаходження додаткових джерел доходу, щоб залишатися на правильному шляху."
            },
            {
                "title": "Святкуйте досягнення",
                "description": "Визнання та святкування спільних досягнень допомагає зміцнити вашу прихильність та партнерство. Незалежно від того, чи це невелика нагорода за завершення кроку, чи спеціальне святкування за досягнення великої віхи, витрачання часу на святкування допомагає підтримувати мотивацію та позитив у ваших відносинах."
            }
        ],
        "slug": "smart-goals-planning"
    }

    # -- System message: Contains the instruction prompt and rules
    system_prompt = f"""
You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish).
2. Preserve JSON structure: do not change key names. Only modify relevant text fields (title, purpose, description, steps.title, steps.description).
2. You MUST translate all the content apart from job and slug, do not use untranslated english words in the final translations if there is a good translations or alternative concept in {language_full_name[target_language]} like the following alternatives in Ukranian: lap dance -> танець на колінах, public affection -> прояв ніжності на людях.
3. Keep 'job' as it is (unchanged).
4. Keep 'slug' as it is (unchanged).
6. Preserve <br> and <br><br> in relevant fields if present.
7. If you have to use quotes inside the content like "term", use singular quotes 'term', NEVER double "" quotes inside content, title, description as it ruins JSON, you will be banned for it. All json keys and values are surrounded by double quotes though like "key": "value", it can also be "key": "value and some 'term' some text"
8. Output valid JSON (no extra text) with the same keys as the input. God forbid you do not output valid JSON, simple JSON string as the response, the only option you can take.
9. If something doesn't need translation (like 'job', 'slug'), keep it in English.
10. translation MUST be to {language_full_name[target_language]} not to Ukrainian or Spanish
Ensure that the final translation meets these criteria exactly.
"""

    # Build the 5-message conversation array
    messages = [
        {"role": "system", "content": system_prompt},

        {"role": "user",
         "content": f"Example input #1: translate this actual item to es:Spanish :\n{json.dumps(example_input_1, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output_1_es, indent=2, ensure_ascii=False)},

        {"role": "user",
         "content": f"Example input #2: translate this actual item to uk:Ukrainian :\n\n{json.dumps(example_input_2, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output_2_ukraine, indent=2, ensure_ascii=False)},

        {"role": "user",
         "content": f"translate this actual item to {target_language}:{language_full_name[target_language]} :\n{json.dumps(content_item, indent=2, ensure_ascii=False)}"}
    ]

    return messages


def fix_quotes_in_purpose(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the purpose field value of a JSON string.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "purpose": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    pattern = r'("purpose"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def fix_quotes_in_steps_title(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the steps.title field value of a JSON string.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "title": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    pattern = r'("title"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def fix_quotes_in_steps_description(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the steps.description field value of a JSON string.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "description": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    pattern = r'("description"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def fix_all_quotes(json_str: str) -> str:
    """
    Applies all quote-fixing functions to the JSON string.
    """
    json_str = fix_quotes_in_purpose(json_str)
    json_str = fix_quotes_in_steps_title(json_str)
    json_str = fix_quotes_in_steps_description(json_str)
    return json_str


def validate_translated_content(original_item: Dict[str, Any], translated_data: Dict[str, Any]) -> None:
    """
    Validates the translated content based on the specified rules for 'exercise' content type.
    Raises an Exception if validation fails.
    """
    required_keys = original_item.keys()
    translated_keys = translated_data.keys()

    # Check that all required keys are present
    for key in required_keys:
        if key not in translated_keys:
            raise Exception(f"Missing key '{key}' in translated data.")

    # Check that 'steps' length is the same
    if len(original_item.get('steps', [])) != len(translated_data.get('steps', [])):
        raise Exception("Translated 'steps' length does not match the original.")

    # Check that every step has 'title' and 'description'
    for index, step in enumerate(translated_data.get('steps', [])):
        if 'title' not in step or 'description' not in step:
            raise Exception(f"Step {index} is missing 'title' or 'description'.")


def call_gpt_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Calls GPT to translate the fields of 'content_item' into 'target_language'.
    Returns a new dictionary with the translated fields or the original data if translation fails.
    """
    messages = build_translation_prompt(content_item, target_language)
    content_text = ''
    # Attempt the GPT call with retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(
                f"Translating '{content_item.get('title', 'Untitled')}' into '{target_language}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages,
                temperature=PARAMS["temperature"],
                max_tokens=PARAMS["max_tokens"],
                top_p=PARAMS["top_p"],
                n=PARAMS["n"],
                stop=PARAMS["stop"],
                response_format={
                    "type": "json_object"
                }
            )
            logging.info('Got response from GPT API.')
            content_text = response.choices[0].message.content.strip()

            # Clean the response
            content_text = content_text.replace("\n", "")
            content_text = content_text.replace("\\", "")
            content_text = content_text.replace("```", "")
            content_text = content_text.replace("*", "")
            content_text = content_text.replace("json", "")
            content_text = fix_all_quotes(content_text.strip())

            translated_data = json.loads(content_text)

            # Validate mandatory fields exist and apply rules:
            validate_translated_content(content_item, translated_data)

            # Keep 'job' and 'slug' as is
            translated_data["job"] = content_item.get("job", [])
            translated_data["slug"] = content_item.get("slug", "")

            return translated_data

        except Exception as e:
            logging.error(f"Error translating '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            logging.info(f"Response content: {content_text}")
            if attempt == MAX_RETRIES:
                if target_language in ['am', 'ml', 'rm', 'he']:
                    return content_item
                raise Exception(
                    f"Could not translate '{content_item.get('title', 'Untitled')}' to '{target_language}' after {MAX_RETRIES} attempts.")
            time.sleep(RETRY_DELAY)

    # If fails all attempts, return original for specific languages or raise exception
    if target_language in ['am', 'ml', 'rm', 'he']:
        return content_item
    return None


def process_item_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Process a single item: translate it into the target language using the GPT API.
    """
    return call_gpt_translation(content_item, target_language)


# ------------------------------------------------------------------------------
# Main Function
# ------------------------------------------------------------------------------

def main():
    content_type = "exercise"  # Changed from "article" to "exercise"
    en_folder = os.path.join("en", content_type)
    input_file = os.path.join(en_folder, "final_content.json")

    logging.info(f"Reading content from: {input_file}")
    content_data = read_content_json(input_file)
    if not content_data:
        logging.warning("No content to translate. Exiting.")
        return

    # Translate for each language in LANGUAGES
    for lang in LANGUAGES:
        logging.info(f"Translating to '{lang}'...")

        translated_items = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(process_item_translation, item, lang): item
                for item in content_data
            }
            for future in as_completed(futures):
                original_item = futures[future]
                try:
                    result = future.result()
                    if result:
                        translated_items.append(result)
                except Exception as exc:
                    logging.error(f"Translation error for item '{original_item.get('title', 'Untitled')}': {exc}")
                    raise exc

        # Write the translations out
        output_folder = os.path.join(lang, content_type)
        output_file = os.path.join(output_folder, "final_content.json")
        if len(translated_items) > len(content_data) * 0.8:
            logging.info(f"Writing translated content to: {output_file}")
            write_content_json(output_file, translated_items)
        else:
            write_content_json(output_file, "")
            raise Exception(
                f"Language '{lang}': Translation unsuccessful. Only {len(translated_items)} out of {len(content_data)} items translated.")

    logging.info("All translations completed successfully.")


if __name__ == "__main__":
    main()
