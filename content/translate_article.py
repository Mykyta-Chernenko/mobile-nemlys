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
MAX_RETRIES = 4

# Delay between retries
RETRY_DELAY = 0

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

TRANSLATED = [
    "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "tr", "uk", "ru", "vi", "no", "af", "sq",
    "hy",
    "az", "eu", "be", "bg", "my", "ca", "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu", "he", "hu", "is", "kn",
    "kk", "km", "ko", "ky", "lv", "lt", "mk", "ms",
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
            "building_trust",
            "improving_communication",
            "understanding_mutual_compatibility"
        ],
        "title": "Trust Through Open Communication",
        "test_question": "What is essential for building trust in communication?",
        "correct_answer": "Consistently honest and transparent dialogue",
        "all_answers": [
            "Sharing your favorite movies regularly",
            "Consistently honest and transparent dialogue",
            "Avoiding difficult topics to keep peace",
            "Having separate communication channels",
            "Using humor to deflect serious conversations"
        ],
        "content": "Trust is the bedrock of any strong relationship, and open communication is one of its most vital components.<br><br>When we talk about trust, we're not just talking about big secrets or major issues. It's about the everyday exchanges that build a sense of reliability and safety between partners. According to attachment theory, proposed by psychologist John Bowlby, secure attachments are formed through consistent and honest communication.<br><br>But how exactly can you foster this kind of communication? Start by creating a safe space where both partners feel comfortable sharing their thoughts and feelings without fear of judgment or reprisal. This means actively listening, validating each other's experiences, and responding with empathy.<br><br>Integrating open communication into your relationship involves more than just talking; it's about how you talk. Practicing active listening, where you fully concentrate, understand, respond, and then remember what is being said, can significantly enhance trust.<br><br>Here are some actionable steps to build trust through communication:<br>• Schedule regular check-ins to discuss your feelings and experiences<br>• Practice active listening without interrupting<br>• Share both positive and negative feelings honestly<br>• Use “I” statements to express your emotions without blaming<br>• Resolve conflicts respectfully and constructively<br><br>By prioritizing honest and transparent dialogue, you lay a strong foundation of trust that can weather any storm your relationship might face.",
        "slug": "trust-through-open-communication"
    }
    example_output_1_es = {
        "job": [
            "building_trust",
            "improving_communication",
            "understanding_mutual_compatibility"
        ],
        "title": "Confianza a través de la comunicación abierta",
        "test_question": "¿Qué es esencial para generar confianza en la comunicación?",
        "correct_answer": "Diálogo constante y transparente",
        "all_answers": [
            "Compartir tus películas favoritas regularmente",
            "Diálogo constante y transparente",
            "Evitar temas difíciles para mantener la paz",
            "Tener canales de comunicación separados",
            "Usar el humor para desviar conversaciones serias"
        ],
        "content": "La confianza es la base de cualquier relación sólida, y la comunicación abierta es uno de sus componentes más importantes.<br><br>Cuando hablamos de confianza, no nos referimos solo a los grandes secretos o problemas importantes. Se trata de los intercambios cotidianos que generan una sensación de fiabilidad y seguridad entre ambos. Según la teoría del apego propuesta por el psicólogo John Bowlby, los vínculos seguros se forman a través de una comunicación constante y honesta.<br><br>Pero, ¿cómo fomentar este tipo de comunicación? Empieza creando un espacio seguro donde ambos se sientan cómodos compartiendo sus pensamientos y sentimientos sin temor a ser juzgados. Esto implica escuchar activamente, validar las experiencias mutuas y responder con empatía.<br><br>Integrar la comunicación abierta en tu relación no solo se trata de hablar; se trata de cómo hablar. Practicar la escucha activa, donde prestas toda tu atención, entiendes, respondes y luego recuerdas lo que se dijo, puede mejorar significativamente la confianza.<br><br>A continuación, algunos pasos prácticos para generar confianza a través de la comunicación:<br>• Programa charlas regulares para hablar de tus sentimientos y experiencias<br>• Practica la escucha activa sin interrumpir<br>• Comparte tanto lo positivo como lo negativo de forma honesta<br>• Utiliza enunciados en primera persona para expresar tus emociones sin culpar<br>• Resuelve los conflictos de manera respetuosa y constructiva<br><br>Al priorizar un diálogo honesto y transparente, estableces una base sólida de confianza capaz de enfrentar cualquier dificultad que surja en tu relación.",
        "slug": "trust-through-open-communication"
    }

    # -- Example #2: Input & Spanish output
    example_input_2 = {
        "job": [
            "building_trust",
            "solving_relationship_problems",
            "improving_honesty_and_openness"
        ],
        "title": "Consistency: Trust's Best Friend",
        "test_question": "Why is consistency important in building trust?",
        "correct_answer": "It creates predictability and reliability in the relationship",
        "all_answers": [
            "It makes the relationship feel monotonous",
            "It allows partners to surprise each other often",
            "It creates predictability and reliability in the relationship",
            "It shows that one partner is dominating the relationship",
            "It helps in avoiding any form of conflict"
        ],
        "content": "Consistency might not be the most glamorous aspect of a relationship, but it's absolutely crucial for building trust.<br><br>Research in relationship psychology highlights that partners who are consistent in their actions and behaviors are more likely to develop a strong sense of trust. When you consistently show up for your partner, whether it's through small daily gestures or bigger commitments, it reinforces reliability and dependability.<br><br>So, how can you ensure consistency in your relationship? It starts with being mindful of your promises and following through on them. This builds a track record of dependability that your partner can rely on.<br><br>Integrating consistency involves both partners committing to predictable and trustworthy behaviors. This doesn't mean being rigid, but rather showing that your partner can count on you to be there in meaningful ways.<br><br>Here are some actionable steps to enhance consistency and build trust:<br>• Keep your promises, no matter how small<br>• Establish and maintain regular routines together<br>• Be punctual and respect each other's time<br>• Show up emotionally by being present during conversations and important moments<br>• Maintain transparency in your actions and decisions<br><br>By embracing consistency, you create a dependable environment where trust can flourish, making your relationship stronger and more resilient.",
        "slug": "consistency-trusts-best-friend"
    }
    example_output_2_ukraine = {
        "job": [
            "building_trust",
            "solving_relationship_problems",
            "improving_honesty_and_openness"
        ],
        "title": "Послідовність: найкращий друг довіри",
        "test_question": "Чому послідовність важлива у побудові довіри?",
        "correct_answer": "Це створює передбачуваність і надійність у відносинах",
        "all_answers": [
            "Це робить відносини одноманітними",
            "Це дає партнерам змогу часто дивувати одне одного",
            "Це створює передбачуваність і надійність у відносинах",
            "Це свідчить про те, що один партнер домінує у відносинах",
            "Це допомагає уникати будь-яких конфліктів"
        ],
        "content": "Послідовність може й не бути найяскравішим аспектом стосунків, але вона вкрай важлива для побудови довіри.<br><br>Дослідження з психології стосунків показують, що партнери, які поводяться послідовно, швидше розвивають міцне відчуття довіри. Коли ти стабільно підтримуєш свого партнера, чи то через маленькі щоденні жести, чи через більші зобов’язання, це підсилює надійність та довіру.<br><br>Тож, як забезпечити послідовність у стосунках? Все починається з уважного ставлення до своїх обіцянок і їх виконання. Це формує історію надійності, на яку може покластися твій партнер.<br><br>Впровадження послідовності означає, що обоє партнерів зобов’язуються до передбачуваної та щирої поведінки. Це не означає бути надто жорсткими, але свідчить про те, що на тебе можна покластися у важливі моменти.<br><br>Ось кілька практичних кроків, щоб підсилити послідовність і розвивати довіру:<br>• Виконуй свої обіцянки, навіть якщо вони невеликі<br>• Встановлюйте та підтримуйте регулярні спільні звички<br>• Приходьте вчасно й поважайте час одне одного<br>• Будьте емоційно присутні під час розмов і важливих подій<br>• Зберігайте прозорість у своїх діях і рішеннях<br><br>Завдяки послідовності ти створюєш надійну атмосферу, де довіра розквітає, роблячи ваші стосунки міцнішими та більш стійкими.",
        "slug": "consistency-trusts-best-friend"
    }

    # -- System message: Contains the instruction prompt and rules
    system_prompt = f"""
You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish).
2. Preserve JSON structure: do not change key names. Only modify relevant text fields (title, test_question, content, all_answers).
3. Keep 'job' as it is (unchanged).
4. Keep 'slug' as it is (unchanged).
5. 'correct_answers' MUST be exactly one of the items present in 'all_answers' after translation, 100% match.
6. Preserve <br> and <br><br> in 'content'.
7. If you have to use quotes like "", use singular quotes '' or « », NEVER double "" quotes in content as it ruins JSON, you will be banned for it.
8. Output valid JSON (no extra text) with the same keys as the input. god forbids you not to output valid JSON, simple json string as the response, the only option you can take
9. If something doesn't need translation (like 'job', 'slug'), keep it in English.
10. translation MUST be to {language_full_name[target_language]} not to Ukrainian or Spanish
Ensure that the final translation meets these criteria exactly.
"""

    # Build the 5-message conversation array
    messages = [
        {"role": "system", "content": system_prompt},

        {"role": "user",
         "content": f"Example input #1: translate this actual item to es:Spanish: \n{json.dumps(example_input_1, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output_1_es, indent=2, ensure_ascii=False)},

        {"role": "user",
         "content": f"Example input #2: : translate this actual item to uk:Ukrainian: \n  \n{json.dumps(example_input_2, indent=2, ensure_ascii=False)}"},
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
    pattern = r'("content"\s*:\s*")(.*?)("(?=\s*,|\s*}))'

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
            print('got response')
            content_text = response.choices[0].message.content.strip()

            content_text = content_text.replace("\n", "")
            content_text = content_text.replace("\\", "")
            content_text = content_text.replace("```", "")
            content_text = content_text.replace("*", "")
            content_text = content_text.replace("json", "")
            content_text = fix_quotes_in_content(content_text.strip())

            translated_data = json.loads(content_text)

            # Validate mandatory fields exist and apply rules:
            # 1. Keep job as is
            translated_data["job"] = content_item.get("job", [])

            # 2. Keep slug as is
            translated_data["slug"] = content_item.get("slug", "")

            # 3. Ensure correct_answers is in all_answers
            if "correct_answer" not in translated_data or "all_answers" not in translated_data or "test_question" not in translated_data or "content" not in translated_data or "title" not in translated_data:
                raise Exception("correct_answers or all_answers or test_question or content or title is not present")

            if len(translated_data["all_answers"]) != len(content_item['all_answers']):
                raise Exception("Translated 'all_answers' was not same size")

            if translated_data["correct_answer"] not in translated_data["all_answers"]:
                raise Exception("Translated 'correct_answers' was not in 'all_answers'")

            if "<br>" not in translated_data["content"]:
                raise Exception("Translated 'content' has not <br>")
            return translated_data

        except Exception as e:
            logging.error(f"Error translating '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            print(content_text)
            if attempt == MAX_RETRIES:
                if target_language == 'am' or target_language == 'ml' or target_language == 'rm':
                    return content_item
                raise Exception(f"could not translate '{content_item.get('title', 'Untitled')}', {target_language}")
            time.sleep(RETRY_DELAY)

    # If fails all attempts, return original
    if target_language == 'am':
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
    content_type = "article"
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
            raise Exception(f"language {lang}, unsuccessful")

    logging.info("All translations completed successfully.")


if __name__ == "__main__":
    main()
