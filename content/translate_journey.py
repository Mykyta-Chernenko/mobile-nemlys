import json
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

import openai

# ------------------------------------------------------------------------------
# Script Configuration
# ------------------------------------------------------------------------------

# GPT Model Parameters
PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 0,
    "max_tokens": 4000,
    "top_p": 1,
    "n": 1,
    "stop": None
}

# Maximum number of concurrent workers
MAX_WORKERS = 25

# Number of attempts to call the GPT API before giving up
MAX_RETRIES = 5

# Delay between retries
RETRY_DELAY = 0

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

TRANSLATED = [
    "uk", "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "tr", "ru", "vi", "no", "af", "sq", "am", "hy",
    "az", "eu", "be", "bg", "my", "ca", "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu",
    "he", "hu", "is", "kn", "kk", "km", "ko", "ky", "lv", "lt", "mk", "ms", "ml", "mr", "mn",
    "ne", "fa", "pa", "rm", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te", "th", "ur", "zu"
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
    """
    Builds the conversation prompt for translating a 'journey' content item.
    Only includes the specified fields: title, description, and subtopics with their titles and descriptions.
    """
    # Replace the following examples with your actual examples
    example_input_1 = {
                          "job": [
                              "improving_honesty_and_openness"
                          ],
                          "title": "Improving Honesty and Openness",
                          "description": "This journey is designed to help you and your partner cultivate a deeper sense of honesty and openness in your relationship. Over the course of several days, you'll engage in activities, discussions, and exercises that build trust and transparency, allowing you to navigate sensitive topics and strengthen your bond.",
                          "subtopics": [
                              {
                                  "title": "Understanding Honesty",
                                  "description": "Explore the concept of honesty in relationships, including its importance and the different dimensions of being honest with your partner. Engage in questions that dig into your current perspectives on honesty."
                              },
                              {
                                  "title": "Addressing Fears Around Honesty",
                                  "description": "Identify common fears or concerns regarding openness in your relationship. Together, reflect on situations where you felt unable to be honest and discuss how you can create a safer environment for open communication."
                              },
                              {
                                  "title": "Cultivating Transparency",
                                  "description": "Learn about the benefits of transparency in a relationship and how it can enhance intimacy. Participate in activities and discussions that encourage sharing details and thoughts that you might usually keep private."
                              },
                              {
                                  "title": "Building Trust Through Openness",
                                  "description": "Discover strategies to cultivate trust by being open about your feelings, insecurities, and desires. Engage in exercises that promote sharing and vulnerability."
                              },
                              {
                                  "title": "Navigating Difficult Conversations",
                                  "description": "Explore techniques for tackling tough topics with honesty and openness. Practice using effective communication strategies to express your thoughts and feelings, aiming to resolve conflicts constructively."
                              },
                              {
                                  "title": "Creating an Honest Relationship Culture",
                                  "description": "Develop a shared agreement on honesty practices within your relationship. Discuss boundaries and intentions for maintaining a culture of openness, ensuring both partners feel secure in expressing themselves."
                              }
                          ]
                      },
    example_output_1_es = {
        "job": [
            "improving_honesty_and_openness"
        ],
        "title": "Mejorando la Honestidad y la Apertura",
        "description": "Este viaje está diseñado para ayudarte a ti y a tu pareja a cultivar un sentido más profundo de honestidad y apertura en su relación. A lo largo de varios días, participarás en actividades, discusiones y ejercicios que fomentan la confianza y la transparencia, permitiéndoles abordar temas sensibles y fortalecer su vínculo.",
        "subtopics": [
            {
                "title": "Entendiendo la Honestidad",
                "description": "Explora el concepto de honestidad en las relaciones, incluyendo su importancia y las diferentes dimensiones de ser honesto con tu pareja. Participa en preguntas que profundizan en tus perspectivas actuales sobre la honestidad."
            },
            {
                "title": "Abordando los Miedos en torno a la Honestidad",
                "description": "Identifica miedos o preocupaciones comunes respecto a la apertura en tu relación. Juntos, reflexionen sobre situaciones en las que sintieron que no podían ser honestos y discutan cómo pueden crear un entorno más seguro para la comunicación abierta."
            },
            {
                "title": "Cultivando la Transparencia",
                "description": "Aprende sobre los beneficios de la transparencia en una relación y cómo puede mejorar la intimidad. Participa en actividades y discusiones que fomenten compartir detalles y pensamientos que normalmente mantendrías privados."
            },
            {
                "title": "Construyendo Confianza a través de la Apertura",
                "description": "Descubre estrategias para cultivar la confianza siendo abierto sobre tus sentimientos, inseguridades y deseos. Participa en ejercicios que promuevan el compartir y la vulnerabilidad."
            },
            {
                "title": "Navegando Conversaciones Difíciles",
                "description": "Explora técnicas para abordar temas difíciles con honestidad y apertura. Practica el uso de estrategias de comunicación efectivas para expresar tus pensamientos y sentimientos, con el objetivo de resolver conflictos de manera constructiva."
            },
            {
                "title": "Creando una Cultura de Relación Honesta",
                "description": "Desarrolla un acuerdo compartido sobre prácticas de honestidad dentro de tu relación. Discute los límites y las intenciones para mantener una cultura de apertura, asegurando que ambos se sientan seguros al expresarse."
            }
        ]
    }

    example_input_2 = {
                          "title": "Preparing for Cohabitation",
                          "description": "This journey is designed to prepare you and your partner for cohabitation by addressing various aspects of living together. You'll learn how to communicate effectively, navigate responsibilities, and create a harmonious home environment, and how to watch 'Naruto'. Each day, you will explore vital topics that will help fortify your relationship and ease the transition to shared living.",
                          "subtopics": [
                              {
                                  "title": "Dreaming of Our Shared Space",
                                  "description": "Start by sharing your visions of what your home will look like. Discuss ideas about space, decor, and atmosphere. This sets the foundation for mutual understanding and shared dreams."
                              },
                              {
                                  "title": "Communication Essentials",
                                  "description": "Learn effective communication strategies that will help you navigate daily challenges. Explore ways to express needs, set expectations, and actively listen to one another."
                              },
                              {
                                  "title": "Household Responsibilities",
                                  "description": "Discuss and establish how you will divide household chores and responsibilities. Create a system that works for both of you to maintain a clean and organized living environment."
                              },
                              {
                                  "title": "Financial Foundations",
                                  "description": "Get aligned on financial management and budgeting as a couple. Discuss strategies for sharing expenses, making joint financial decisions, and maintaining transparency about finances."
                              },
                              {
                                  "title": "Handling Conflict with Grace",
                                  "description": "Prepare for inevitable disagreements by learning conflict resolution strategies. Explore how to manage differing opinions and find common ground in a healthy manner."
                              },
                              {
                                  "title": "Creating a Safe Space",
                                  "description": "Finalize your preparations by focusing on emotional and physical safety in your shared space. Discuss boundaries, privacy, and how to cultivate an environment where both feel secure and respected."
                              }
                          ],
                      },
    example_output_2_ukraine = {
        "title": "Підготовка до Спільного Життя",
        "description": "Ця подорож розроблена, щоб підготувати вас і вашого партнера до спільного життя, охоплюючи різні аспекти спільного проживання. Ви навчитеся ефективно спілкуватися, розподіляти обов'язки та створювати гармонійне домашнє середовище, та як дивитись 'Наруто'. Кожен день ви будете досліджувати важливі теми, які допоможуть зміцнити ваші стосунки та полегшити перехід до спільного життя.",
        "subtopics": [
            {
                "title": "Мрії про Наше Спільне Простір",
                "description": "Почніть з обміну баченнями того, як буде виглядати ваш дім. Обговоріть ідеї щодо простору, декору та атмосфери. Це створює основу для взаєморозуміння та спільних мрій."
            },
            {
                "title": "Основи Спілкування",
                "description": "Вивчайте ефективні стратегії спілкування, які допоможуть вам вирішувати щоденні виклики. Дослідіть способи вираження потреб, встановлення очікувань та активного слухання одне одного."
            },
            {
                "title": "Домашні Обов'язки",
                "description": "Обговоріть і встановіть, як ви розподілятимете домашні обов'язки та відповідальність. Створіть систему, яка працюватиме для вас обох, щоб підтримувати чисте та організоване житлове середовище."
            },
            {
                "title": "Фінансові Основи",
                "description": "Узгодьте управління фінансами та бюджетування як пара. Обговоріть стратегії спільного розподілу витрат, прийняття спільних фінансових рішень та підтримання прозорості щодо фінансів."
            },
            {
                "title": "Вирішення Конфліктів З Грацією",
                "description": "Підготуйтеся до неминучих непорозумінь, вивчаючи стратегії вирішення конфліктів. Дослідіть, як керувати різними думками та знаходити спільну мову здоровим способом."
            },
            {
                "title": "Створення Безпечного Простору",
                "description": "Завершіть підготовку, зосередившись на емоційній та фізичній безпеці у вашому спільному просторі. Обговоріть межі, приватність та те, як створити середовище, де обидва почуваються захищеними та поважаними."
            }
        ]
    }

    # System message: Contains the instruction prompt and rules
    system_prompt = f"""
You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish).
2. Preserve JSON structure: do not change key names. Only modify relevant text fields (title, description, subtopics).
3. Every subtopic must include both 'title' and 'description'.
4. The number of subtopics must remain the same as in the original.
5. Preserve <br> and <br><br> in 'description'.
6. If you have to use quotes like "", use singular quotes '' or « », NEVER double "" quotes in content as it ruins JSON; you will be banned for it.
7. Output valid JSON (no extra text) with the same keys as the input. God forbid you do not output valid JSON, simple json string as the response, the only option you can take.
8. translation MUST be to {language_full_name[target_language]} not to Ukrainian or Spanish
Ensure that the final translation meets these criteria exactly.
"""

    # Build the 5-message conversation array with examples
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


def fix_quotes_in_content(json_str: str, field: str) -> str:
    """
    Removes all double quotes that appear inside the specified field's value of a JSON string.

    Args:
        json_str (str): The JSON string containing the field.
        field (str): The field name to target (e.g., "description").

    Returns:
        str: The JSON string with all internal quotes removed from the specified field.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # e.g., "description": "
        content = match.group(2)  # content inside the quotes
        suffix = match.group(3)  # closing quote

        # Remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    # Pattern matches: e.g., "description": "content"
    pattern = rf'("{field}"\s*:\s*")(.*?)("(?=\s*,|\s*}}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


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
            content_text = response.choices[0].message.content.strip()
            content_text = content_text.replace("\n", "")
            content_text = content_text.replace("```", "")
            content_text = content_text.replace("*", "")
            content_text = content_text.replace("json", "")
            content_text = fix_quotes_in_content(content_text, "description")
            content_text = fix_quotes_in_content(content_text, "title")

            translated_data = json.loads(content_text)

            # Validate mandatory fields exist and apply rules:
            # 1. Keep 'job' and 'slug' as is if present
            if "job" in content_item:
                translated_data["job"] = content_item.get("job", [])
            if "slug" in content_item:
                translated_data["slug"] = content_item.get("slug", "")

            # 2. Validate required fields
            required_fields = ["title", "description", "subtopics"]
            for field in required_fields:
                if field not in translated_data:
                    raise Exception(f"'{field}' field is missing in the translated data.")

            # 3. Validate subtopics
            original_subtopics = content_item.get("subtopics", [])
            translated_subtopics = translated_data.get("subtopics", [])

            if not isinstance(translated_subtopics, list):
                raise Exception("'subtopics' should be a list.")

            if len(translated_subtopics) != len(original_subtopics):
                raise Exception("Number of subtopics does not match the original.")

            for idx, subtopic in enumerate(translated_subtopics):
                if "title" not in subtopic or "description" not in subtopic:
                    raise Exception(f"Subtopic at index {idx} is missing 'title' or 'description'.")
                translated_data["subtopics"][idx]["content"] = original_subtopics[idx]["content"]

            return translated_data

        except Exception as e:
            logging.error(f"Error translating '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            if attempt == MAX_RETRIES:
                # Remove the output file if it exists for specific languages
                if target_language in ['am', 'ml', 'rm']:
                    return content_item
                output_folder = os.path.join(target_language, "journey")
                output_file = os.path.join(output_folder, "final_content.json")
                if os.path.exists(output_file):
                    os.remove(output_file)
                    logging.info(f"Removed failed translation file: {output_file}")
                raise Exception(f"Could not translate '{content_item.get('title', 'Untitled')}', {target_language}")
            time.sleep(RETRY_DELAY)

    # If all attempts fail, raise an exception
    raise Exception(f"Cannot translate '{content_item.get('title', 'Untitled')}'")


def process_item_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Process a single item: translate it into the target language using the GPT API.
    """
    return call_gpt_translation(content_item, target_language)


# ------------------------------------------------------------------------------
# Main Function
# ------------------------------------------------------------------------------

def main():
    content_type = "journey"  # Changed from "checkup" to "journey"
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
                    translated_items.append(result)
                except Exception as exc:
                    logging.error(f"Translation error for item '{original_item.get('title', 'Untitled')}': {exc}")
                    # Remove the output file if translation fails for this language
                    output_folder = os.path.join(lang, content_type)
                    output_file = os.path.join(output_folder, "final_content.json")
                    if os.path.exists(output_file):
                        os.remove(output_file)
                        logging.info(f"Removed failed translation file: {output_file}")
                    break  # Exit the loop as the translation for this language has failed

        # Write the translations out only if all items were translated successfully
        if len(translated_items) == len(content_data):
            output_folder = os.path.join(lang, content_type)
            output_file = os.path.join(output_folder, "final_content.json")
            logging.info(f"Writing translated content to: {output_file}")
            write_content_json(output_file, translated_items)
        else:
            logging.error(f"Language '{lang}' translation incomplete. Output file removed if it existed.")

    logging.info("All translations completed successfully.")


if __name__ == "__main__":
    main()
