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
    # Example #1: Input & Spanish output
    example_input_1 = {
        "title": "Future Financial Adventures",
        "research": "Research in financial planning for couples shows that aligned financial goals significantly enhance relationship satisfaction. Couples who actively discuss and plan their financial future together tend to experience less stress and more harmony. Understanding each other's financial aspirations and concerns can prevent conflicts and foster a sense of teamwork.",
        "questions": [
            "We have discussed our long-term financial goals together.",
            "I feel confident in our ability to achieve our financial goals as a couple.",
            "We have a shared vision for how we want to manage our finances in the future.",
            "I feel comfortable discussing money matters related to our future with my partner.",
            "We regularly review and adjust our financial plans together.",
            "Our financial planning aligns with both of our personal values and goals.",
            "We have addressed how we will handle financial challenges in the future."
        ],
        "job": [
            "discussing_finances",
            "planning_for_future",
            "improving_relationship_satisfaction"
        ],
        "slug": "future-financial-adventures",
        "description": "Evaluate how you and your partner plan and communicate about your long-term finances. By assessing your alignment on financial goals and collaboration, you can identify strengths and areas needing improvement. Effective financial planning together will reduce stress and enhance your relationship harmony."
    }
    example_output_1_es = {
        "title": "Aventuras financieras futuras",
        "research": "La investigación en planificación financiera para parejas muestra que establecer metas financieras alineadas mejora significativamente la satisfacción en la relación. Las parejas que discuten y planifican activamente su futuro financiero juntas suelen experimentar menos estrés y más armonía. Comprender las aspiraciones y preocupaciones financieras de la otra persona puede prevenir conflictos y fomentar un sentido de trabajo en equipo.",
        "questions": [
            "Hemos hablado sobre nuestras metas financieras a largo plazo juntos.",
            "Me siento seguro(a) de nuestra capacidad para alcanzar nuestras metas financieras como pareja.",
            "Tenemos una visión compartida de cómo queremos manejar nuestras finanzas en el futuro.",
            "Me siento cómodo(a) hablando de asuntos monetarios relacionados con nuestro futuro con mi pareja.",
            "Revisamos y ajustamos regularmente nuestros planes financieros juntos.",
            "Nuestra planificación financiera está alineada con los valores y metas personales de ambos.",
            "Hemos abordado cómo enfrentaremos los desafíos financieros en el futuro."
        ],
        "job": [
            "discussing_finances",
            "planning_for_future",
            "improving_relationship_satisfaction"
        ],
        "slug": "future-financial-adventures",
        "description": "Evalúa cómo tú y tu pareja planifican y se comunican sobre sus finanzas a largo plazo. Al revisar su alineación en metas financieras y colaboración, pueden identificar fortalezas y áreas que necesitan mejorar. Una planificación financiera conjunta efectiva reducirá el estrés y fortalecerá la armonía en la relación."
    }

    # Example #2: Input & Ukrainian output
    example_input_2 = {
        "title": "Conflict Connoisseurs",
        "research": "Research in relationship psychology indicates that how couples handle conflicts is more important than the frequency of disagreements. Constructive problem-solving during conflicts leads to better relationship outcomes and increased mutual respect. Couples who view conflicts as opportunities for growth rather than threats tend to have stronger, more enduring relationships. Effective conflict resolution skills are essential for maintaining harmony and ensuring that both partners feel heard and valued.",
        "questions": [
            "We approach conflicts as opportunities to grow together.",
            "I feel confident in our ability to resolve disagreements.",
            "We work together to find solutions during conflicts.",
            "Our conflicts are resolved in a way that satisfies both of us.",
            "We avoid letting past conflicts influence new disagreements.",
            "I feel respected during our arguments.",
            "We can disagree without damaging our relationship."
        ],
        "job": [
            "solving_relationship_problems",
            "improving_communication",
            "overcoming_differences"
        ],
        "slug": "conflict-connoisseurs",
        "description": "You will evaluate how you handle disagreements and resolve conflicts with your partner. By assessing each statement, you can identify effective strategies and pinpoint areas that need improvement. Strengthening your conflict resolution skills will build mutual respect and enhance the harmony in your relationship."
    }
    example_output_2_ukraine = {
        "title": "Знавці конфліктів",
        "research": "Дослідження в галузі психології стосунків вказують, що те, як пари вирішують конфлікти, важливіше за частоту суперечок. Конструктивне розв'язання проблем під час конфліктів призводить до кращих результатів у відносинах і посилення взаємної поваги. Пари, які сприймають конфлікти як можливості для зростання, а не як загрози, зазвичай мають міцніші та триваліші стосунки. Ефективні навички розв'язання конфліктів є ключовими для підтримання гармонії та забезпечення того, щоб обидва партнери почувалися почутими й цінними.",
        "questions": [
            "Ми розглядаємо конфлікти як можливості розвиватися разом.",
            "Я відчуваю впевненість у нашій здатності вирішувати непорозуміння.",
            "Ми співпрацюємо, щоб знайти рішення під час конфліктів.",
            "Наші конфлікти вирішуються так, що обидва залишаються задоволеними.",
            "Ми намагаємося не дозволяти минулим конфліктам впливати на нові суперечки.",
            "Я відчуваю повагу під час наших суперечок.",
            "Ми можемо не погоджуватися, не завдаючи шкоди нашим стосункам."
        ],
        "job": [
            "solving_relationship_problems",
            "improving_communication",
            "overcoming_differences"
        ],
        "slug": "conflict-connoisseurs",
        "description": "Ви оціните, як ви вирішуєте незгоди та конфлікти зі своїм партнером. Переглядаючи кожне твердження, ви можете визначити ефективні стратегії й виявити аспекти, що потребують покращення. Розвиток навичок розв'язання конфліктів сприятиме зміцненню взаємної поваги та посиленню гармонії у ваших стосунках."
    }

    # System message: Contains the instruction prompt and rules
    system_prompt = f"""
You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish).
2. Preserve JSON structure: do not change key names. Only modify relevant text fields (title, research, questions, description).
3. Keep 'job' as is (unchanged).
4. Keep 'slug' as is (unchanged).
5. 'questions' MUST have the same number of items as the original, and each translated question should correspond to the original one.
6. Preserve <br> and <br><br> in 'description' and 'research'.
7. If you have to use quotes like "", use singular quotes '' or « », NEVER double "" quotes in content as it ruins JSON, you will be banned for it.
8. Output valid JSON (no extra text) with the same keys as the input. God forbid you do not output valid JSON, simple json string as the response, the only option you can take.
9. If something doesn't need translation (like 'job', 'slug'), keep it in English.
10. translation MUST be to {language_full_name[target_language]} not to Ukrainian or Spanish
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


def fix_quotes_in_content(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the content field value of a JSON string.

    Args:
        json_str (str): The JSON string containing a content field

    Returns:
        str: The JSON string with all internal quotes removed from the content field

    Example:
        Input:  {"content": "text "with" some "quotes" inside"}
        Output: {"content": "text with some quotes inside"}
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "content": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Simply remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    # Pattern matches: 1) "content": " 2) the content itself 3) the closing quote
    pattern = r'("description"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def fix_quotes_in_content_research(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the content field value of a JSON string.

    Args:
        json_str (str): The JSON string containing a content field

    Returns:
        str: The JSON string with all internal quotes removed from the content field

    Example:
        Input:  {"content": "text "with" some "quotes" inside"}
        Output: {"content": "text with some quotes inside"}
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # "content": "
        content = match.group(2)  # everything between the main quotes
        suffix = match.group(3)  # " (closing quote)

        # Simply remove all double quotes from the content
        clean_content = content.replace('"', '')

        return f'{prefix}{clean_content}{suffix}'

    # Pattern matches: 1) "content": " 2) the content itself 3) the closing quote
    pattern = r'("research"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

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
            content_text = fix_quotes_in_content(content_text)
            content_text = fix_quotes_in_content_research(content_text)

            translated_data = json.loads(content_text)

            # Validate mandatory fields exist and apply rules:
            # 1. Keep job as is
            translated_data["job"] = content_item.get("job", [])

            # 2. Keep slug as is
            translated_data["slug"] = content_item.get("slug", "")

            # 3. Ensure 'questions' have the same length
            if "questions" not in translated_data:
                raise Exception("'questions' field is missing in the translated data.")

            if len(translated_data["questions"]) != len(content_item.get("questions", [])):
                raise Exception("Translated 'questions' do not match the original count.")

            # 4. Validate other required fields
            required_fields = ["title", "research", "description"]
            for field in required_fields:
                if field not in translated_data:
                    raise Exception(f"'{field}' field is missing in the translated data.")

            return translated_data

        except Exception as e:
            logging.error(f"Error translating '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            if attempt == MAX_RETRIES:
                # Remove the output file if it exists
                if target_language == 'am' or target_language == 'ml' or target_language == 'rm':
                    return content_item
                output_folder = os.path.join(target_language, "checkup")
                output_file = os.path.join(output_folder, "final_content.json")
                if os.path.exists(output_file):
                    os.remove(output_file)
                    logging.info(f"Removed failed translation file: {output_file}")
                raise Exception(f"Could not translate '{content_item.get('title', 'Untitled')}', {target_language}")
            time.sleep(RETRY_DELAY)

    # If fails all attempts, return original
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
    content_type = "checkup"  # Changed from "article" to "checkup"
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
