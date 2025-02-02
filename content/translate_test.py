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
    "max_tokens": 12000,
    "top_p": 1,
    "n": 1,
    "stop": None
}

MAX_WORKERS = 75

# Number of attempts to call the GPT API before giving up
MAX_RETRIES = 5

# Delay between retries
RETRY_DELAY = 0

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

TRANSLATED = [
    "uk", "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "tr", "ru", "vi", "no", "af", "sq",
    "hy",
    "az", "eu", "be", "bg", "my",
    "ca", "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu", "he", "hu", "is",
    "kn", "kk",
    "ko", "ky", "lv", "lt", "mk", "ms",
    "mr", "mn",
    "ne", "fa", "pa", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te", "th", "ur", "zu", "am", "ml", "rm", "km",
    'zh_tw', 'zh_hk', 'fil', 'id', 'uk',

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

# List of all target languages
LANGUAGES = [
]

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


def build_translation_prompt(part: str, content_item: Dict[str, Any], target_language: str) -> List[Dict[str, str]]:
    """
    Builds the translation prompt for a specific part of the content.

    Args:
        part (str): The part of the content to translate ('title_research_description', 'questions', 'outcome_interpretation', 'combination').
        content_item (Dict[str, Any]): The content item to translate.
        target_language (str): The target language code.

    Returns:
        List[Dict[str, str]]: The list of messages to send to the GPT API.
    """
    # Placeholder for example input and output. Replace these with your actual examples.
    example_input_full = {
        "job": [
            "rekindling_passion",
            "enhancing_love_and_affection"
        ],
        "title": "Sensory Intimacy Style",
        "research": "Grounded in sensory-focused intimacy exercises from sexual health research.",
        "description": "Explore how your senses play a role in connecting with your partner. This quiz helps you discover the primary ways you experience and express intimacy, fostering renewed passion through touch, scent, sound, sight, and taste.",
        "questions": [
            {
                "question": "When you want to feel closer to your partner, which sensory experience do you seek the most?",
                "options": [
                    "A warm hug or a gentle touch.",
                    "A pleasant fragrance or scented candle.",
                    "Listening to soothing music together.",
                    "Watching a beautiful sunset or a captivating movie.",
                    "Sharing a favorite meal or sweet treats."
                ]
            },
            {
                "question": "How do you prefer to start your day with your partner?",
                "options": [
                    "Cuddling or holding hands in the morning.",
                    "Enjoying a morning coffee with a nice aroma.",
                    "Talking or listening to uplifting music together.",
                    "Watching the sunrise or engaging in a visual activity.",
                    "Sharing a special breakfast or favorite snacks."
                ]
            },
            {
                "question": "What kind of environment helps you feel most relaxed with your partner?",
                "options": [
                    "A space where you can touch and embrace freely.",
                    "A room filled with your favorite scents.",
                    "A place with calming or favorite sounds.",
                    "A visually pleasing setting with nice décor.",
                    "A place where you can enjoy delicious food together."
                ]
            },
            {
                "question": "When preparing a surprise for your partner, which sensory element do you focus on?",
                "options": [
                    "Planning a cozy evening with physical activities.",
                    "Choosing a gift with a lovely scent.",
                    "Creating a playlist of meaningful songs.",
                    "Decorating the space beautifully.",
                    "Cooking their favorite meal or dessert."
                ]
            },
            {
                "question": "How do you express affection most naturally?",
                "options": [
                    "Through physical touch like hugging or kissing.",
                    "By bringing them their favorite scented item.",
                    "Playing or sharing music you both love.",
                    "Creating visually memorable moments together.",
                    "Preparing or sharing tasty treats."
                ]
            },
            {
                "question": "What makes you feel most appreciated by your partner?",
                "options": [
                    "Receiving a comforting embrace.",
                    "Being given a thoughtful scented gift.",
                    "Enjoying a song or musical moment together.",
                    "Seeing a beautiful gesture or visual display.",
                    "Sharing a delicious meal or sweet surprise."
                ]
            },
            {
                "question": "When winding down in the evening, what do you prefer to do with your partner?",
                "options": [
                    "Snuggling on the couch or giving a back rub.",
                    "Lighting scented candles and relaxing.",
                    "Listening to soft music or having a heart-to-heart talk.",
                    "Watching a visually engaging show or movie.",
                    "Enjoying a favorite dessert or a special drink together."
                ]
            },
            {
                "question": "How do you like to celebrate a special occasion with your partner?",
                "options": [
                    "Having a romantic physical connection, cuddling, and saying 'I love you'.",
                    "Gifting something with a delightful scent.",
                    "Enjoying a live music event or singing together.",
                    "Planning a visually stunning experience.",
                    "Sharing a gourmet meal or sweet treats."
                ]
            },
            {
                "question": "What type of date makes you feel most connected?",
                "options": [
                    "A hands-on activity like dancing or hiking.",
                    "A visit to a place with wonderful aromas, like a bakery.",
                    "Attending a concert or listening to your favorite band.",
                    "Going to an art gallery or a scenic viewpoint.",
                    "Eating at a favorite restaurant or trying new cuisines."
                ]
            },
            {
                "question": "How do you prefer to resolve a stressful day with your partner?",
                "options": [
                    "Through comforting physical closeness.",
                    "By enjoying a soothing scent together.",
                    "Listening to calming or favorite music.",
                    "Watching a favorite visual show or movie.",
                    "Sharing a favorite food or cooking together, for example 'Naruto'."
                ]
            }
        ],
        "evaluation_method": {
            "explanation": "Each answer corresponds to one of the following sensory intimacy styles: 1) Touch-Master, 2) Scent Aficionado, 3) Sound Lover, 4) Visual Explorer, 5) Taste Enthusiast.",
            "example": "For example, if you selected option 1) most frequently, your primary sensory intimacy style is Touch-Master, indicating you feel most connected through physical touch and tactile experiences."
        },
        "outcome_interpretation": {
            "1": {
                "label": "Touch-Master",
                "description": "You deeply value physical touch as a primary way to connect and feel close to your partner. Whether it's a warm hug, holding hands, or a gentle touch, physical affection makes you feel secure and loved. Your preference for tactile experiences fosters a strong emotional bond and enhances intimacy in your relationship. You are likely to express affection through physical means, which can be both comforting and reassuring to your partner.",
                "advice": "Incorporate regular physical touch into your daily interactions with your partner to maintain closeness and affection. Communicate your need for physical connection to ensure it's reciprocated and appreciated. Explore different ways of expressing touch, such as massages, cuddling, or simply holding hands, to keep the physical connection varied and fulfilling. Additionally, be mindful of your partner's comfort levels with physical touch and respect their boundaries to foster mutual understanding and respect."
            },
            "2": {
                "label": "Scent Aficionado",
                "description": "Scents play a crucial role in how you experience and express intimacy with your partner. You find comfort and connection in pleasant fragrances, whether it's your partner's favorite perfume, scented candles, or the natural scents of your environment together. Aromas can evoke strong emotional responses and memories, enhancing your sense of closeness and well-being in the relationship. Your appreciation for scents adds a unique and subtle layer to your emotional connection.",
                "advice": "Incorporate pleasing scents into your shared spaces to create a comforting and inviting atmosphere. Experiment with different fragrances together to discover what you both enjoy and find meaningful. Use scented candles, essential oils, or fresh flowers to enhance your intimate moments and create lasting associations with positive experiences. Additionally, be attentive to your partner's scent preferences and sensitivities to ensure that the scents you choose contribute positively to your relationship."
            },
            "3": {
                "label": "Sound Lover",
                "description": "Sound and music are essential to how you connect and feel intimate with your partner. Whether it's listening to your favorite songs together, engaging in meaningful conversations, or enjoying the ambient sounds of your environment, auditory experiences play a significant role in your relationship. Sound can set the mood, enhance emotional connections, and create memorable moments that strengthen your bond. Your love for sound-driven experiences adds depth and vibrancy to your intimacy.",
                "advice": "Create shared playlists that reflect both of your musical tastes to enjoy together during various activities. Incorporate music into your daily routines, such as playing soft tunes during meals or relaxing evenings. Use sound as a tool to enhance your emotional connection, whether through dancing, singing together, or simply enjoying quiet moments accompanied by your favorite melodies. Additionally, explore new genres or attend live music events to keep your auditory experiences fresh and engaging."
            },
            "4": {
                "label": "Visual Explorer",
                "description": "Visual elements are key to how you experience and express intimacy in your relationship. You find beauty and connection in shared visual experiences, such as watching sunsets, enjoying art, or creating visually memorable moments together. Aesthetically pleasing environments and activities that engage your sense of sight enhance your emotional bond and make your relationship feel vibrant and alive. Your appreciation for visual stimuli adds a rich and dynamic layer to your connection.",
                "advice": "Plan activities that engage your visual senses, such as visiting art galleries, watching movies, or spending time in scenic locations together. Create a visually appealing space at home with décor that reflects both of your tastes and enhances your shared experiences. Take time to appreciate the beauty in everyday moments, whether it's a sunrise, a well-decorated room, or a colorful sunset. Additionally, engage in creative projects together, like painting or photography, to further deepen your visual connection."
            },
            "5": {
                "label": "Taste Enthusiast",
                "description": "Taste and culinary experiences are central to how you connect and express intimacy with your partner. Sharing meals, cooking together, or enjoying your favorite foods enhances your sense of closeness and creates meaningful memories. The act of savoring delicious flavors together fosters a sense of partnership and enjoyment in your relationship. Your passion for taste-driven experiences adds a flavorful and enjoyable dimension to your intimacy.",
                "advice": "Explore new cuisines and cooking together to create shared culinary experiences that strengthen your bond. Plan regular date nights centered around trying new restaurants or preparing special meals at home. Share your favorite recipes and enjoy the process of cooking and tasting together, fostering teamwork and collaboration. Additionally, celebrate special occasions with favorite foods and treats to create lasting positive associations with your shared culinary adventures."
            }
        },
        "combination": {
            "1_1": {
                "description": "Both of you primarily value physical touch as your main way of experiencing intimacy, resulting in a deeply connected and affectionate relationship. Your mutual appreciation for tactile connection fosters a strong emotional bond and a comforting sense of closeness. You naturally understand each other's need for physical affection, making it easy to express love and support through touch. However, you might face challenges if one partner desires more or less physical contact than the other, potentially leading to feelings of imbalance.",
                "advice": "Continue to prioritize physical touch in your relationship by finding varied ways to express affection, such as hugging, holding hands, or cuddling. Communicate openly about your physical needs to ensure that both partners feel adequately loved and connected. Explore new forms of touch together, like massages or dancing, to keep your physical connection fresh and exciting. Additionally, be mindful of each other's boundaries and comfort levels to maintain a balanced and harmonious relationship."
            },
            "1_2": {
                "description": "One of you is a Touch-Master while the other is a Scent Aficionado, creating a unique blend of physical and olfactory intimacy. This combination enhances your relationship by incorporating both tactile affection and pleasing scents, making your interactions rich and multi-sensory. You can enjoy physical closeness while also creating a fragrant and comforting atmosphere together. However, you might face challenges if one prioritizes touch over scent or vice versa, potentially leading to misunderstandings about each other's needs.",
                "advice": "Combine your love for physical touch with the appreciation of pleasant scents by incorporating scented candles or essential oils during your affectionate moments. Communicate openly about the importance of both touch and scent in feeling connected, ensuring that neither is neglected. Explore activities that engage both senses, such as giving each other massages with aromatic oils or creating a beautifully scented and comfortable space for your physical interactions. Additionally, ensure that you respect and accommodate each other's sensory preferences to maintain a balanced and fulfilling relationship."
            },
            "1_3": {
                "description": "One of you is a Touch-Master and the other is a Sound Lover, resulting in a relationship that blends physical affection with auditory experiences. You can enjoy both the comfort of physical closeness and the enjoyment of music or meaningful conversations together. This combination allows for a dynamic and emotionally rich connection, as you engage each other's primary sensory preferences. However, you might struggle if one partner prioritizes touch while the other seeks more auditory engagement, leading to potential mismatches in fulfilling each other's intimacy needs.",
                "advice": "Find ways to integrate both physical touch and sound into your interactions, such as cuddling while listening to your favorite music or having heartfelt conversations during quiet moments of closeness. Communicate your needs clearly to ensure that both sensory preferences are being met. Explore activities that engage both senses, like dancing to music or enjoying audio books together while relaxing. Additionally, be flexible and attentive to each other's preferences to create a harmonious and balanced sensory experience in your relationship."
            },
            "1_4": {
                "description": "One of you is a Touch-Master and the other is a Visual Explorer, creating a relationship that combines physical affection with visually engaging experiences. You can enjoy both the warmth of physical closeness and the beauty of shared visual activities, enhancing your emotional bond through multiple sensory channels. This combination allows for a rich and diverse intimacy, as you engage in activities that satisfy both your tactile and visual preferences. However, you might face challenges if one partner desires more physical touch while the other seeks more visual stimulation, potentially leading to feelings of disconnect.",
                "advice": "Incorporate both physical touch and visual activities into your relationship by creating visually appealing and comfortable spaces for your affectionate moments, such as arranging cozy lighting for cuddling or watching visually stimulating movies together. Communicate openly about your sensory needs to ensure that both touch and visual experiences are valued and prioritized. Engage in joint activities that satisfy both preferences, such as painting while sitting close or enjoying scenic walks hand-in-hand. Additionally, respect and balance each other's sensory preferences to maintain a harmonious and fulfilling relationship."
            },
            "1_5": {
                "description": "One of you is a Touch-Master and the other is a Taste Enthusiast, resulting in a relationship that blends physical affection with culinary experiences. You can enjoy both the comfort of physical closeness and the joy of sharing delicious meals or cooking together, creating a multi-sensory connection. This combination allows for a balanced intimacy where both tactile and gustatory preferences are met, enhancing your overall bond. However, you might encounter challenges if one partner prioritizes physical touch while the other focuses more on taste, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Combine your love for physical touch with the appreciation of shared meals by creating cozy dining experiences, such as cooking together while enjoying each other's company or sharing affectionate gestures during meals. Communicate openly about the importance of both touch and taste in feeling connected, ensuring that both sensory preferences are addressed. Explore activities that engage both senses, such as preparing and enjoying special recipes together while expressing physical affection. Additionally, be attentive to each other's needs and preferences to maintain a balanced and harmonious sensory connection in your relationship."
            },
            "2_2": {
                "description": "Both of you are Scent Aficionados, leading to a relationship enriched by shared appreciation for pleasant fragrances and aromas. Your mutual love for scents creates a comforting and inviting atmosphere, enhancing your emotional connection through olfactory experiences. You likely enjoy creating spaces filled with your favorite scents, whether through candles, perfumes, or freshly baked goods, making your relationship feel warm and harmonious. However, you might face challenges if you become too focused on scents, potentially neglecting other forms of intimacy and connection.",
                "advice": "Continue to explore and share your favorite scents together to maintain a fragrant and comforting environment in your relationship. Experiment with different fragrances and aromatic activities, such as baking together or using essential oils, to keep your olfactory experiences varied and enjoyable. Communicate openly about the scents you both love and any sensitivities you might have to ensure a pleasant and harmonious sensory experience. Additionally, balance your focus on scents with other forms of intimacy to create a well-rounded and fulfilling connection."
            },
            "2_3": {
                "description": "One of you is a Scent Aficionado and the other is a Sound Lover, creating a relationship that blends olfactory and auditory sensory intimacy. You can enjoy both the pleasant aromas and the soothing sounds, enhancing your connection through multiple sensory channels. This combination allows for a rich and diverse intimacy, as you engage in experiences that satisfy both your scent and sound preferences. However, you might face challenges if one partner prioritizes scents while the other seeks more auditory engagement, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Integrate both pleasant scents and soothing sounds into your shared experiences by creating a multi-sensory environment, such as playing your favorite music while enjoying a scented candle. Communicate openly about your sensory preferences to ensure that both olfactory and auditory needs are being met. Explore activities that engage both senses, like cooking with aromatic ingredients while listening to music or enjoying a scented bath with calming sounds. Additionally, be flexible and attentive to each other's preferences to create a harmonious and balanced sensory experience in your relationship."
            },
            "2_4": {
                "description": "One of you is a Scent Aficionado and the other is a Visual Explorer, resulting in a relationship that combines olfactory and visual sensory intimacy. You can enjoy both the pleasant aromas and the beauty of shared visual experiences, enhancing your emotional bond through multiple sensory channels. This combination allows for a vibrant and harmonious intimacy, as you engage in activities that satisfy both your scent and visual preferences. However, you might encounter challenges if one partner prioritizes scents while the other seeks more visual stimulation, potentially leading to feelings of disconnect.",
                "advice": "Incorporate both pleasant scents and visually engaging activities into your relationship by creating aesthetically pleasing and fragrant spaces together. Communicate openly about your sensory needs to ensure that both olfactory and visual experiences are valued and prioritized. Engage in joint activities that satisfy both preferences, such as visiting a florist while enjoying a visually stunning environment or creating a beautifully scented and decorated space at home. Additionally, respect and balance each other's sensory preferences to maintain a harmonious and fulfilling relationship."
            },
            "2_5": {
                "description": "One of you is a Scent Aficionado and the other is a Taste Enthusiast, creating a relationship that blends olfactory and gustatory sensory intimacy. You can enjoy both the pleasant aromas and the joy of sharing delicious meals or cooking together, creating a multi-sensory connection. This combination allows for a balanced intimacy where both olfactory and gustatory preferences are met, enhancing your overall bond. However, you might face challenges if one partner prioritizes scents while the other focuses more on taste, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Combine your love for pleasant scents with shared culinary experiences by cooking together while enjoying aromatic spices or baking treats with delightful fragrances. Communicate openly about the importance of both scents and tastes in feeling connected, ensuring that both sensory preferences are addressed. Explore activities that engage both senses, such as hosting a scented and delicious dinner party or creating a fragrant and tasty meal together. Additionally, be attentive to each other's needs and preferences to maintain a balanced and harmonious sensory connection in your relationship."
            },
            "3_3": {
                "description": "Both of you are Sound Lovers, resulting in a relationship enriched by shared appreciation for music, conversations, and ambient sounds. Your mutual love for auditory experiences creates a harmonious and emotionally connected partnership, where sound plays a significant role in your intimacy. You likely enjoy activities like listening to music together, attending concerts, or having deep conversations, strengthening your bond through sound-driven interactions. However, you might face challenges if you become too focused on auditory experiences, potentially neglecting other forms of intimacy and connection.",
                "advice": "Continue to explore and share your love for music and sounds together to maintain a harmonious and engaging environment in your relationship. Attend concerts, create shared playlists, or enjoy quiet moments listening to your favorite tunes to keep your auditory experiences varied and enjoyable. Communicate openly about your sound preferences and any sensitivities you might have to ensure a pleasant and balanced sensory experience. Additionally, balance your focus on sounds with other forms of intimacy to create a well-rounded and fulfilling connection."
            },
            "3_4": {
                "description": "One of you is a Sound Lover and the other is a Visual Explorer, creating a relationship that blends auditory and visual sensory intimacy. You can enjoy both soothing sounds and beautiful visual experiences, enhancing your connection through multiple sensory channels. This combination allows for a rich and diverse intimacy, as you engage in experiences that satisfy both your sound and visual preferences. However, you might face challenges if one partner prioritizes sounds while the other seeks more visual stimulation, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Integrate both soothing sounds and beautiful visual activities into your shared experiences by attending live performances in visually appealing venues or watching visually stunning movies with your favorite soundtracks. Communicate openly about your sensory preferences to ensure that both auditory and visual needs are being met. Explore activities that engage both senses, such as dancing to music while enjoying a scenic view or creating art accompanied by your favorite tunes. Additionally, be flexible and attentive to each other's preferences to create a harmonious and balanced sensory experience in your relationship."
            },
            "3_5": {
                "description": "One of you is a Sound Lover and the other is a Taste Enthusiast, resulting in a relationship that blends auditory and gustatory sensory intimacy. You can enjoy both the joy of sharing delicious meals or cooking together and the pleasure of listening to music or meaningful conversations, creating a multi-sensory connection. This combination allows for a balanced intimacy where both auditory and gustatory preferences are met, enhancing your overall bond. However, you might encounter challenges if one partner prioritizes sounds while the other focuses more on taste, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Combine your love for shared meals with sound-driven activities by cooking together while listening to your favorite music or enjoying a meal accompanied by a live performance. Communicate openly about the importance of both sounds and tastes in feeling connected, ensuring that both sensory preferences are addressed. Explore activities that engage both senses, such as hosting a themed dinner with curated playlists or enjoying a quiet meal while listening to an audiobook together. Additionally, be attentive to each other's needs and preferences to maintain a balanced and harmonious sensory connection in your relationship."
            },
            "4_4": {
                "description": "Both of you are Visual Explorers, leading to a relationship rich in shared appreciation for beauty and visually engaging experiences. Your mutual love for visual stimuli creates a vibrant and dynamic partnership, where aesthetics play a significant role in your intimacy. You likely enjoy activities such as visiting art galleries, watching visually stunning movies, or creating art together, strengthening your bond through shared visual experiences. However, you might face challenges if you become too focused on visual elements, potentially neglecting other forms of intimacy and connection.",
                "advice": "Continue to explore and share your love for visual experiences together by visiting art exhibits, attending visually captivating performances, or enjoying scenic nature walks. Communicate openly about your visual preferences and any sensitivities you might have to ensure a pleasant and balanced sensory experience. Engage in creative projects that satisfy both of your visual interests, such as painting, photography, or designing together. Additionally, balance your focus on visual activities with other forms of intimacy to create a well-rounded and fulfilling connection."
            },
            "4_5": {
                "description": "One of you is a Visual Explorer and the other is a Taste Enthusiast, creating a relationship that blends visual and gustatory sensory intimacy. You can enjoy both the beauty of shared visual experiences and the joy of sharing delicious meals or cooking together, creating a multi-sensory connection. This combination allows for a balanced intimacy where both visual and gustatory preferences are met, enhancing your overall bond. However, you might encounter challenges if one partner prioritizes visual experiences while the other focuses more on taste, potentially leading to mismatches in fulfilling each other's intimacy needs.",
                "advice": "Combine your love for visually engaging activities with shared culinary experiences by preparing and presenting beautiful meals together or enjoying gourmet dining in visually appealing settings. Communicate openly about the importance of both visual and gustatory experiences in feeling connected, ensuring that both sensory preferences are addressed. Explore activities that engage both senses, such as hosting a visually themed dinner with beautifully arranged dishes or taking cooking classes together that emphasize both the presentation and taste of food. Additionally, be attentive to each other's needs and preferences to maintain a balanced and harmonious sensory connection in your relationship."
            },
            "5_5": {
                "description": "Both of you are Taste Enthusiasts, resulting in a relationship enriched by shared appreciation for delicious meals, cooking together, and savoring your favorite flavors. Your mutual love for culinary experiences creates a strong and enjoyable emotional connection, as you bond over food and shared dining moments. You likely enjoy exploring new cuisines, preparing special dishes, and celebrating with your favorite foods, strengthening your relationship through taste-driven interactions. However, you might face challenges if you become too focused on culinary experiences, potentially neglecting other forms of intimacy and connection.",
                "advice": "Continue to explore and share your love for food together by trying new recipes, visiting diverse restaurants, or hosting themed dinner parties to keep your culinary experiences varied and enjoyable. Communicate openly about your taste preferences and any dietary needs to ensure that both partners feel satisfied and appreciated. Engage in joint cooking projects that foster teamwork and collaboration, enhancing your bond through shared culinary creativity. Additionally, balance your focus on taste-driven activities with other forms of intimacy to create a well-rounded and fulfilling relationship."
            }
        },
        "slug": "sensory-intimacy-style"
    }

    example_output_full = {
        "job": [
            "rekindling_passion",
            "enhancing_love_and_affection"
        ],
        "title": "Стиль Сенсорної Інтимності",
        "research": "Основано на вправах сенсорної інтимності з досліджень сексуального здоров'я.",
        "description": "Досліджуйте, як ваші почуття впливають на зв'язок з вашим партнером. Цей тест допоможе вам виявити основні способи, якими ви відчуваєте та виражаєте інтимність, сприяючи відновленню пристрасті через дотик, запах, звук, зір та смак.",
        "questions": [
            {
                "question": "Коли ти хочеш відчути більшу близькість зі своїм партнером, який сенсорний досвід ти шукаєш найбільше?",
                "options": [
                    "Теплий обійм або ніжний дотик.",
                    "Приємний аромат або ароматична свічка.",
                    "Слухати заспокійливу музику разом.",
                    "Дивитися красивий захід сонця або захоплюючий фільм.",
                    "Ділитися улюбленою стравою або солодощами."
                ]
            },
            {
                "question": "Як ти віддаєш перевагу починати свій день зі своїм партнером?",
                "options": [
                    "Обійматися або тримати за руки вранці.",
                    "Насолоджуватися ранковою кавою з приємним ароматом.",
                    "Говорити або слухати надихаючу музику разом.",
                    "Дивитися захід сонця або займатися візуальною діяльністю.",
                    "Ділитися особливим сніданком або улюбленими перекусами."
                ]
            },
            {
                "question": "Яке середовище допомагає тобі відчути себе найбільш розслаблено зі своїм партнером?",
                "options": [
                    "Простір, де ти можеш вільно торкатися та обійматися.",
                    "Кімната, наповнена твоїми улюбленими ароматами.",
                    "Місце з заспокійливими або улюбленими звуками.",
                    "Візуально приємне оточення з гарним декором.",
                    "Місце, де ви можете разом насолоджуватися смачною їжею."
                ]
            },
            {
                "question": "Готуючи сюрприз для свого партнера, на який сенсорний елемент ти зосереджуєшся?",
                "options": [
                    "Планування затишного вечора з фізичними активностями.",
                    "Вибір подарунка з прекрасним ароматом.",
                    "Створення плейлиста з важливими піснями.",
                    "Прикрашання простору.",
                    "Приготування улюбленої страви або десерту."
                ]
            },
            {
                "question": "Як ти найприродніше виражаєш свою прихильність?",
                "options": [
                    "Через фізичний дотик, такий як обійми або поцілунки.",
                    "Принести партнеру улюблений ароматизований предмет.",
                    "Грати або ділитися музикою, яку ми обидва любимо.",
                    "Створювати візуально запам'ятовуючі моменти разом.",
                    "Приготування або спільне насолодження смачними ласощами."
                ]
            },
            {
                "question": "Що змушує тебе відчути себе найбільш оціненим партнером?",
                "options": [
                    "Отримання заспокійливого обійму.",
                    "Отримання вдумливого ароматизованого подарунка.",
                    "Насолоджуватися піснею або музичним моментом разом.",
                    "Бачити красивий жест або візуальну демонстрацію.",
                    "Ділитися смачною їжею або солодким сюрпризом."
                ]
            },
            {
                "question": "Коли ти розслабляєшся ввечері, що ти віддаєш перевагу робити зі своїм партнером?",
                "options": [
                    "Пригорнутися на дивані або робити масаж спини.",
                    "Запалювати ароматичні свічки та розслаблятися.",
                    "Слухати м'яку музику або вести серйозну розмову.",
                    "Дивитися візуально захоплюючий шоу або фільм.",
                    "Насолоджуватися улюбленим десертом або особливим напоєм разом."
                ]
            },
            {
                "question": "Як ти любиш святкувати особливу подію зі своїм партнером?",
                "options": [
                    "Мати романтичний фізичний зв'язок, обійми і казати 'Я тебе кохаю'.",
                    "Дарувати щось з приємним ароматом.",
                    "Насолоджуватися живим музичним заходом або співати разом.",
                    "Планувати візуально приголомшливий досвід.",
                    "Ділитися гурманською стравою або солодощами."
                ]
            },
            {
                "question": "Який тип побачення змушує тебе відчути себе найбільш зв'язаним?",
                "options": [
                    "Практична діяльність, така як танці або піші походи.",
                    "Візит до місця з чудовими ароматами, наприклад, пекарні.",
                    "Відвідування концерту або прослуховування улюбленої групи.",
                    "Поїздка до художньої галереї або мальовничої оглядової точки.",
                    "Страва в улюбленому ресторані або куштування страв нової кухні."
                ]
            },
            {
                "question": "Як ти віддаєш перевагу вирішувати стресовий день зі своїм партнером?",
                "options": [
                    "Через заспокійливу фізичну близькість.",
                    "Насолоджуючись заспокійливим ароматом разом.",
                    "Слухаючи заспокійливу або улюблену музику.",
                    "Дивлячись улюблене візуальне шоу або фільм, наприклад 'Naruto'.",
                    "Ділячись улюбленою їжею або готуючи разом."
                ]
            }
        ],
        "evaluation_method": {
            "explanation": "Кожна відповідь відповідає одному з наступних стилів сенсорної інтимності: 1) Майстер Дотику, 2) Фаніа Ароматів, 3) Любитель Звуку, 4) Дослідник Візуальних Відчуттів, 5) Ентузіаст Смаку.",
            "example": "Наприклад, якщо ти найчастіше вибирав варіант 1), твій основний стиль сенсорної інтимності – Майстер Дотику, що означає, що ти найбільше відчуваєш зв'язок через фізичний дотик та тактильні відчуття."
        },
        "outcome_interpretation": {
            "1": {
                "label": "Майстер Дотику",
                "description": "Ти глибоко цінуєш фізичний дотик як основний спосіб зв'язку та близькості з партнером. Будь-який теплий обійм, тримання за руки або ніжний дотик роблять тебе відчуваючимся безпечно та кохано. Твоя пристрасть до тактильних відчуттів сприяє сильному емоційному зв'язку та посиленню інтимності у вашій стосунках. Ймовірно, ти виражаєш прихильність фізичними засобами, що може бути як заспокійливим, так і втішним для твого партнера.",
                "advice": "Включай регулярні фізичні дотики у свої щоденні взаємодії з партнером, щоб підтримувати близькість та прихильність. Спілкуйся про свою потребу в фізичному зв'язку, щоб забезпечити його взаємність та оцінку. Досліджуй різні способи вираження дотику, такі як масажі, обійми або просто тримання за руки, щоб підтримувати фізичний зв'язок різноманітним та задовольняючим. Крім того, будь уважним до рівня комфорту твого партнера з фізичним дотиком та поважай його межі, щоб сприяти взаєморозумінню та повазі."
            },
            "2": {
                "label": "Фаніа Ароматів",
                "description": "Запахи відіграють важливу роль у тому, як ти відчуваєш та виражаєш інтимність з партнером. Ти знаходиш комфорт та зв'язок у приємних ароматах, будь то улюблений парфум твого партнера, ароматичні свічки або природні запахи вашого оточення разом. Аромати можуть викликати сильні емоційні реакції та спогади, посилюючи твоє відчуття близькості та благополуччя у стосунках. Твоя вдячність за запахи додає унікальний та тонкий шар до твого емоційного зв'язку.",
                "advice": "Включай приємні запахи у спільні простори, щоб створити комфортну та запрошуючу атмосферу. Експериментуй з різними ароматами разом, щоб виявити, що вам обом подобається та має значення. Використовуй ароматичні свічки, ефірні олії або свіжі квіти, щоб покращити ваші інтимні моменти та створити тривалі асоціації з позитивними досвідом. Крім того, будь уважним до ароматичних уподобань та чутливості твого партнера, щоб забезпечити, що вибрані тобою аромати позитивно впливають на ваші стосунки."
            },
            "3": {
                "label": "Любитель Звуку",
                "description": "Звук та музика є невід'ємною частиною того, як ти зв'язуєшся та відчуваєш інтимність з партнером. Будь то слухання улюблених пісень разом, ведення глибоких розмов або насолодження атмосферними звуками вашого оточення, аудіо досвіди грають важливу роль у твоїх стосунках. Звук може встановлювати настрій, посилювати емоційні зв'язки та створювати незабутні моменти, які зміцнюють ваш зв'язок. Твоя любов до звукових досвідів додає глибину та яскравість твоїй інтимності.",
                "advice": "Створюй спільні плейлисти, що відображають обидва ваші музичні смаки, щоб насолоджуватися разом під час різних активностей. Включай музику у свої щоденні рутини, наприклад, грай м'які мелодії під час їжі або розслабляючі вечори. Використовуй звук як інструмент для покращення вашого емоційного зв'язку, будь то через танці, спів разом або просто насолода тихими моментами під улюблені мелодії. Крім того, досліджуй нові жанри або відвідуй живі музичні заходи, щоб тримати свої аудіо досвіди свіжими та захоплюючими."
            },
            "4": {
                "label": "Дослідник Візуальних Відчуттів",
                "description": "Візуальні елементи є ключовими до того, як ти відчуваєш та виражаєш інтимність у своїх стосунках. Ти знаходиш красу та зв'язок у спільних візуальних досвідах, таких як спостереження за заходами сонця, насолода мистецтвом або створення візуально запам'ятовуваних моментів разом. Естетично приємні середовища та активності, що залучають твій зір, посилюють ваш емоційний зв'язок та роблять ваші стосунки яскравими та живими. Твоя вдячність до візуальних стимулів додає багатий та динамічний шар до вашого зв'язку.",
                "advice": "Плануй активності, що залучають твої візуальні почуття, такі як відвідування художніх галерей, перегляд фільмів або проведення часу в мальовничих місцях разом. Створюй візуально приємний простір вдома з декором, що відображає обидва ваші смаки та покращує ваші спільні досвіди. Відведи час, щоб цінувати красу у повсякденних моментах, будь то захід сонця, добре прикрашена кімната або яскравий захід сонця. Крім того, займайся творчими проектами разом, такими як малювання або фотографія, щоб ще більше поглибити ваш візуальний зв'язок."
            },
            "5": {
                "label": "Ентузіаст Смаку",
                "description": "Смак та кулінарні досвіди є центральними до того, як ти зв'язуєшся та виражаєш інтимність з партнером. Спільне харчування, готування разом або насолода улюбленими стравами покращують твоє відчуття близькості та створюють значущі спогади. Акт насолоди смачними смаками разом сприяє відчуттю партнерства та задоволення у твоїх стосунках. Твоя пристрасть до смакових досвідів додає ароматний та приємний вимір до твоєї інтимності.",
                "advice": "Досліджуй нові кухні та готуй разом, щоб створити спільні кулінарні досвіди, які зміцнюють ваш зв'язок. Плануй регулярні вечори побачень, зосереджені на відвідуванні нових ресторанів або приготуванні особливих страв вдома. Ділися своїми улюбленими рецептами та насолоджуйся процесом готування та дегустації разом, сприяючи командній роботі та співпраці. Крім того, святкуй особливі події улюбленими стравами та ласощами, щоб створити тривалі позитивні асоціації з вашими спільними кулінарними пригодами."
            }
        },
        "combination": {
            "1_1": {
                "description": "Ви обидва переважно цінуєте фізичний дотик як основний спосіб відчуття інтимності, що призводить до глибоко зв'язаних та ніжних стосунків. Ваша взаємна вдячність за тактильний зв'язок сприяє сильному емоційному зв'язку та комфортному відчуттю близькості. Ви природно розумієте потребу один одного в фізичній прихильності, що полегшує вираження любові та підтримки через дотик. Однак ви можете зіткнутися з викликами, якщо один партнер бажає більше або менше фізичного контакту, ніж інший, що потенційно призведе до відчуття дисбалансу.",
                "advice": "Продовжуй пріоритетно ставитися до фізичного дотику у своїх стосунках, знаходячи різноманітні способи вираження прихильності, такі як обійми, тримання за руки або прилягання. Відверто спілкуйся про свої фізичні потреби, щоб забезпечити, що обидва партнери відчувають себе достатньо коханими та зв'язаними. Досліджуй нові форми дотику разом, такі як масажі або танці, щоб підтримувати фізичний зв'язок свіжим та захоплюючим. Крім того, будь уважним до меж та рівня комфорту один одного, щоб підтримувати збалансовані та гармонійні стосунки."
            },
            "1_2": {
                "description": "Один з вас є Майстром Дотику, а інший – Фанією Ароматів, створюючи унікальне поєднання фізичної та ольфакторної інтимності. Це поєднання покращує ваші стосунки, поєднуючи тактильну прихильність та приємні аромати, роблячи ваші взаємодії багатосенсорними. Ви можете насолоджуватися фізичною близькістю, одночасно створюючи ароматну та комфортну атмосферу разом. Однак ви можете зіткнутися з викликами, якщо один надає перевагу дотику над запахом або навпаки, що потенційно призведе до непорозумінь щодо потреб один одного.",
                "advice": "Поєднуй свою любов до фізичного дотику з вдячністю за приємні аромати, включаючи ароматичні свічки або ефірні олії під час ваших ніжних моментів. Відверто спілкуйся про важливість як дотику, так і запаху у відчутті зв'язку, забезпечуючи, що жоден з них не залишається поза увагою. Досліджуй активності, що залучають обидва почуття, такі як масаж з ароматичними оліями або створення красиво ароматизованого та комфортного простору для ваших фізичних взаємодій. Крім того, забезпечуй повагу та адаптацію до сенсорних уподобань один одного, щоб підтримувати збалансовані та задовольняючі стосунки."
            },
            "1_3": {
                "description": "Один з вас є Майстром Дотику, а інший – Любителем Звуку, створюючи стосунки, що поєднують фізичну прихильність з аудіо досвідами. Ви можете насолоджуватися як комфортом фізичної близькості, так і задоволенням музикою або змістовними розмовами разом. Це поєднання дозволяє динамічний та емоційно багатий зв'язок, оскільки ви залучаєте основні сенсорні уподобання один одного. Однак ви можете стикнутися з труднощами, якщо один партнер надає перевагу дотику, тоді як інший шукає більше аудіо взаємодії, що призведе до потенційних невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Знайди способи інтегрувати як фізичний дотик, так і звук у свої взаємодії, наприклад, прилягання під час слухання улюбленої музики або ведення сердечних розмов під час тихих моментів близькості. Чітко спілкуйся про свої потреби, щоб забезпечити, що обидва сенсорні уподобання задовольняються. Досліджуй активності, що залучають обидва почуття, такі як танці під музику або насолода аудіокнигами разом під час відпочинку. Крім того, будь гнучким та уважним до уподобань один одного, щоб створити гармонійний та збалансований сенсорний досвід у ваших стосунках."
            },
            "1_4": {
                "description": "Один з вас є Майстром Дотику, а інший – Дослідником Візуальних Відчуттів, створюючи стосунки, що поєднують фізичну прихильність з візуально привабливими досвідами. Ви можете насолоджуватися як теплом фізичної близькості, так і красою спільних візуальних активностей, посилюючи ваш емоційний зв'язок через кілька сенсорних каналів. Це поєднання дозволяє багату та різноманітну інтимність, оскільки ви займаєтеся активностями, що задовольняють як ваші тактильні, так і візуальні уподобання. Однак ви можете зіткнутися з викликами, якщо один партнер бажає більше фізичного дотику, тоді як інший шукає більше візуальної стимуляції, що потенційно призведе до відчуття роз'єднання.",
                "advice": "Включай як фізичний дотик, так і візуальні активності у свої стосунки, створюючи візуально привабливі та комфортні простори для ваших ніжних моментів, такі як організація затишного освітлення для прилягання або перегляд візуально стимулюючих фільмів разом. Відверто спілкуйся про свої сенсорні потреби, щоб забезпечити, що як дотик, так і візуальні досвіди цінуються та пріоритетизуються. Займайся спільними активностями, що задовольняють обидва уподобання, такими як малювання поруч або насолода мальовничими прогулянками за триманням за руки. Крім того, поважай та балансируй сенсорні уподобання один одного, щоб підтримувати гармонійні та задовольняючі стосунки."
            },
            "1_5": {
                "description": "Один з вас є Майстром Дотику, а інший – Ентузіастом Смаку, створюючи стосунки, що поєднують фізичну прихильність з кулінарними досвідами. Ви можете насолоджуватися як комфортом фізичної близькості, так і радістю спільного харчування або готування разом, створюючи багатосенсорний зв'язок. Це поєднання дозволяє збалансовану інтимність, де задовольняються як тактильні, так і смакові уподобання, посилюючи ваш загальний зв'язок. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу фізичному дотику, тоді як інший більше фокусується на смаку, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Поєднуй свою любов до фізичного дотику з вдячністю за спільні прийоми їжі, створюючи затишні обідні досвіди, такі як готування разом під час насолоди компанією один одного або ділення ніжними жестами під час їжі. Відверто спілкуйся про важливість як дотику, так і смаку у відчутті зв'язку, забезпечуючи, що обидва сенсорні уподобання враховуються. Досліджуй активності, що залучають обидва почуття, такі як приготування та насолода спеціальними рецептами разом під час вираження фізичної прихильності. Крім того, будь уважним до потреб та уподобань один одного, щоб підтримувати збалансований та гармонійний сенсорний зв'язок у ваших стосунках."
            },
            "2_2": {
                "description": "Ви обидва є Фаніями Ароматів, що призводить до стосунків, збагачених спільною вдячністю за приємні аромати та запахи. Ваша взаємна любов до запахів створює комфортну та запрошуючу атмосферу, посилюючи ваш емоційний зв'язок через ольфакторні досвіди. Ви, ймовірно, насолоджуєтеся створенням просторів, наповнених вашими улюбленими запахами, будь то через свічки, парфуми або свіжоспечені вироби, роблячи ваші стосунки теплими та гармонійними. Однак ви можете зіткнутися з викликами, якщо занадто зосередитеся на запахах, потенційно нехтуючи іншими формами інтимності та зв'язку.",
                "advice": "Продовжуй досліджувати та ділитися своїми улюбленими ароматами разом, щоб підтримувати ароматне та комфортне середовище у ваших стосунках. Експериментуй з різними ароматами та ароматичними активностями, такими як випічка разом або використання ефірних олій, щоб підтримувати ваші ольфакторні досвіди різноманітними та приємними. Відверто спілкуйся про аромати, які вам обом подобаються, та будь-які чутливості, які у вас можуть бути, щоб забезпечити приємний та гармонійний сенсорний досвід. Крім того, балансуй свою увагу на запахах з іншими формами інтимності, щоб створити всебічний та задовольняючий зв'язок."
            },
            "2_3": {
                "description": "Один з вас є Фанією Ароматів, а інший – Любителем Звуку, створюючи стосунки, що поєднують ольфакторну та аудіо сенсорну інтимність. Ви можете насолоджуватися як приємними ароматами, так і заспокійливими звуками, посилюючи ваш зв'язок через кілька сенсорних каналів. Це поєднання дозволяє багату та різноманітну інтимність, оскільки ви займаєтеся досвідами, що задовольняють як ваші запахові, так і звукові уподобання. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу запахам, тоді як інший шукає більше аудіо взаємодії, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Інтегруй як приємні запахи, так і заспокійливі звуки у свої спільні досвіди, створюючи багатосенсорне середовище, наприклад, граючи улюблену музику під час насолоди ароматичною свічкою. Відверто спілкуйся про свої сенсорні уподобання, щоб забезпечити, що обидва ольфакторні та аудіо потреби задовольняються. Досліджуй активності, що залучають обидва почуття, такі як готування з ароматичними інгредієнтами під час слухання музики або насолода ароматичною ванною з заспокійливими звуками. Крім того, будь гнучким та уважним до уподобань один одного, щоб створити гармонійний та збалансований сенсорний досвід у ваших стосунках."
            },
            "2_4": {
                "description": "Один з вас є Фанією Ароматів, а інший – Дослідником Візуальних Відчуттів, створюючи стосунки, що поєднують ольфакторну та візуальну сенсорну інтимність. Ви можете насолоджуватися як приємними ароматами, так і красою спільних візуальних досвідів, посилюючи ваш емоційний зв'язок через кілька сенсорних каналів. Це поєднання дозволяє яскраву та гармонійну інтимність, оскільки ви займаєтеся активностями, що задовольняють як ваші запахові, так і візуальні уподобання. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу запахам, тоді як інший шукає більше візуальної стимуляції, що потенційно призведе до відчуття роз'єднання.",
                "advice": "Включай як приємні запахи, так і візуально привабливі активності у свої стосунки, створюючи естетично приємні та ароматні простори разом. Відверто спілкуйся про свої сенсорні потреби, щоб забезпечити, що як ольфакторні, так і візуальні досвіди цінуються та пріоритетизуються. Займайся спільними активностями, що задовольняють обидва уподобання, такі як відвідування флориста під час насолоди візуально приголомшливим оточенням або створення красиво ароматизованого та прикрашеного простору вдома. Крім того, поважай та балансируй сенсорні уподобання один одного, щоб підтримувати гармонійні та задовольняючі стосунки."
            },
            "2_5": {
                "description": "Один з вас є Фанією Ароматів, а інший – Ентузіастом Смаку, створюючи стосунки, що поєднують ольфакторну та густатурну сенсорну інтимність. Ви можете насолоджуватися як приємними ароматами, так і радістю спільного харчування або готування разом, створюючи багатосенсорний зв'язок. Це поєднання дозволяє збалансовану інтимність, де задовольняються як ольфакторні, так і густатурні уподобання, посилюючи ваш загальний зв'язок. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу запахам, тоді як інший більше зосереджується на смаку, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Поєднуй свою любов до приємних запахів зі спільними кулінарними досвідами, готуючи разом під час насолоди ароматичними спеціями або випікаючи ласощі з приємними ароматами. Відверто спілкуйся про важливість як запахів, так і смаків у відчутті зв'язку, забезпечуючи, що обидва сенсорні уподобання враховуються. Досліджуй активності, що залучають обидва почуття, такі як організація ароматного та смачного вечері або створення ароматної та смачної страви разом. Крім того, будь уважним до потреб та уподобань один одного, щоб підтримувати збалансований та гармонійний сенсорний зв'язок у ваших стосунках."
            },
            "3_3": {
                "description": "Ви обидва є Любителями Звуку, що призводить до стосунків, збагачених спільною вдячністю за музику, розмови та атмосферні звуки. Ваша взаємна любов до аудіо досвідів створює гармонійне та емоційно зв'язане партнерство, де звук грає важливу роль у вашій інтимності. Ви, ймовірно, насолоджуєтеся активностями, такими як слухання музики разом, відвідування концертів або ведення глибоких розмов, зміцнюючи ваш зв'язок через звуково орієнтовані взаємодії. Однак ви можете зіткнутися з викликами, якщо занадто зосередитеся на аудіо досвідах, потенційно нехтуючи іншими формами інтимності та зв'язку.",
                "advice": "Продовжуй досліджувати та ділитися своєю любов'ю до музики та звуків разом, щоб підтримувати гармонійне та захоплююче середовище у ваших стосунках. Відвідуй концерти, створюй спільні плейлисти або насолоджуйся тихими моментами, слухаючи свої улюблені мелодії, щоб підтримувати різноманітність та приємність ваших аудіо досвідів. Відверто спілкуйся про свої звукові уподобання та будь-які чутливості, які у тебе можуть бути, щоб забезпечити приємний та збалансований сенсорний досвід. Крім того, балансуй свою увагу на звуках з іншими формами інтимності, щоб створити всебічний та задовольняючий зв'язок."
            },
            "3_4": {
                "description": "Один з вас є Любителем Звуку, а інший – Дослідником Візуальних Відчуттів, створюючи стосунки, що поєднують аудіо та візуальну сенсорну інтимність. Ви можете насолоджуватися як заспокійливими звуками, так і красивими візуальними досвідами, посилюючи ваш зв'язок через кілька сенсорних каналів. Це поєднання дозволяє багату та різноманітну інтимність, оскільки ви займаєтеся досвідами, що задовольняють як ваші звукові, так і візуальні уподобання. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу звукам, тоді як інший шукає більше візуальної стимуляції, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Інтегруй як заспокійливі звуки, так і красиві візуальні активності у свої спільні досвіди, відвідуючи живі виступи в візуально привабливих місцях або переглядаючи візуально захоплюючі фільми з улюбленими саундтреками. Відверто спілкуйся про свої сенсорні уподобання, щоб забезпечити, що обидва аудіо та візуальні потреби задовольняються. Досліджуй активності, що залучають обидва почуття, такі як танці під музику під час насолоди мальовничим видом або створення мистецтва у супроводі твоїх улюблених мелодій. Крім того, будь гнучким та уважним до уподобань один одного, щоб створити гармонійний та збалансований сенсорний досвід у ваших стосунках."
            },
            "3_5": {
                "description": "Один з вас є Любителем Звуку, а інший – Ентузіастом Смаку, створюючи стосунки, що поєднують аудіо та густатурну сенсорну інтимність. Ви можете насолоджуватися як радістю спільного харчування або готування разом, так і задоволенням слухання музики або змістовних розмов, створюючи багатосенсорний зв'язок. Це поєднання дозволяє збалансовану інтимність, де задовольняються як аудіо, так і густатурні уподобання, посилюючи ваш загальний зв'язок. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу звукам, тоді як інший більше зосереджується на смаку, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Поєднуй свою любов до спільних прийомів їжі з аудіо орієнтованими активностями, готуючи разом під час слухання улюбленої музики або насолоджуючись їжею у супроводі живого виступу. Відверто спілкуйся про важливість як звуків, так і смаків у відчутті зв'язку, забезпечуючи, що обидва сенсорні уподобання враховуються. Досліджуй активності, що залучають обидва почуття, такі як організація тематичної вечері з підібраними плейлистами або насолода тихою їжею під час прослуховування аудіокниги разом. Крім того, будь уважним до потреб та уподобань один одного, щоб підтримувати збалансований та гармонійний сенсорний зв'язок у ваших стосунках."
            },
            "4_4": {
                "description": "Ви обидва є Дослідниками Візуальних Відчуттів, що призводить до стосунків, багатих на спільну вдячність за красу та візуально привабливі досвіди. Ваша взаємна любов до візуальних стимулів створює яскраве та динамічне партнерство, де естетика грає важливу роль у вашій інтимності. Ви, ймовірно, насолоджуєтеся активностями, такими як відвідування художніх галерей, перегляд візуально захоплюючих фільмів або створення мистецтва разом, зміцнюючи ваш зв'язок через спільні візуальні досвіди. Однак ви можете зіткнутися з викликами, якщо занадто зосередитеся на візуальних елементах, потенційно нехтуючи іншими формами інтимності та зв'язку.",
                "advice": "Продовжуй досліджувати та ділитися своєю любов'ю до візуальних досвідів разом, відвідуючи художні виставки, відвідуючи візуально захоплюючі виступи або насолоджуючись мальовничими прогулянками на природі. Відверто спілкуйся про свої візуальні уподобання та будь-які чутливості, які у тебе можуть бути, щоб забезпечити приємний та збалансований сенсорний досвід. Займайся творчими проектами, що задовольняють обидва ваші візуальні інтереси, такими як малювання, фотографія або дизайн разом. Крім того, балансуй свою увагу на візуальних активностях з іншими формами інтимності, щоб створити всебічний та задовольняючий зв'язок."
            },
            "4_5": {
                "description": "Один з вас є Дослідником Візуальних Відчуттів, а інший – Ентузіастом Смаку, створюючи стосунки, що поєднують візуальну та густатурну сенсорну інтимність. Ви можете насолоджуватися як красою спільних візуальних досвідів, так і радістю спільного харчування або готування разом, створюючи багатосенсорний зв'язок. Це поєднання дозволяє збалансовану інтимність, де задовольняються як візуальні, так і густатурні уподобання, посилюючи ваш загальний зв'язок. Однак ви можете зіткнутися з викликами, якщо один партнер надає перевагу візуальним досвідам, тоді як інший більше зосереджується на смаку, що потенційно призведе до невідповідностей у задоволенні потреб інтимності один одного.",
                "advice": "Поєднуй свою любов до візуально привабливих активностей зі спільними кулінарними досвідами, готуючи та подаючи красиві страви разом або насолоджуючись гурманським харчуванням у візуально привабливих місцях. Відверто спілкуйся про важливість як візуальних, так і густатурних досвідів у відчутті зв'язку, забезпечуючи, що обидва сенсорні уподобання враховуються. Досліджуй активності, що залучають обидва почуття, такі як організація візуально тематичної вечері з красиво оформленими стравами або відвідування кулінарних курсів разом, які підкреслюють як презентацію, так і смак їжі. Крім того, будь уважним до потреб та уподобань один одного, щоб підтримувати збалансований та гармонійний сенсорний зв'язок у ваших стосунках."
            },
            "5_5": {
                "description": "Ви обидва є Ентузіастами Смаку, що призводить до стосунків, збагачених спільною вдячністю за смачні страви, спільне готування та насолоду улюбленими смаками. Ваша взаємна любов до кулінарних досвідів створює сильний та приємний емоційний зв'язок, оскільки ви зв'язуєтесь через їжу та спільні обідні моменти. Ви, ймовірно, насолоджуєтеся дослідженням нових кухонь, приготуванням особливих страв та святкуванням улюбленими стравами, зміцнюючи ваші стосунки через смакові взаємодії. Однак ви можете зіткнутися з викликами, якщо занадто зосередитеся на кулінарних досвідах, потенційно нехтуючи іншими формами інтимності та зв'язку.",
                "advice": "Продовжуй досліджувати та ділитися своєю любов'ю до їжі разом, пробуючи нові рецепти, відвідуючи різноманітні ресторани або організовуючи тематичні вечері, щоб підтримувати різноманітність та приємність ваших кулінарних досвідів. Відверто спілкуйся про свої смакові уподобання та будь-які дієтичні потреби, щоб забезпечити, що обидва партнери відчувають себе задоволеними та оціненими. Займайся спільними кулінарними проектами, що сприяють командній роботі та співпраці, посилюючи ваш зв'язок через спільну кулінарну творчість. Крім того, балансуй свою увагу на смакових активностях з іншими формами інтимності, щоб створити всебічні та задовольняючі стосунки."
            }
        },
        "slug": "sensory-intimacy-style"
    }

    # System message tailored for the specific part
    system_prompt = f"""You are a professional translator specializing in mobile app localization, particularly for a couples' app focusing on love and relationship discussions.
Translate from English to {target_language}:{language_full_name[target_language]} while following these rules:

  1. Maintain a friendly, informal tone. Prefer informal 'you' if relevant (e.g., 'tú' in Spanish, 'ти' in Ukrainian).
        2. Preserve JSON structure: do NOT change key names/number of elements,etc. Only modify relevant text fields (title, research, description, questions, etc).
        3. You MUST translate all the content, do not use untranslated English words in the final translations if there is a good translation or alternative concept in {language_full_name[target_language]} like the following alternatives in Ukranian: lap dance -> танець на колінах, public affection -> прояв ніжності на людях.
        6. If you have to use quotes inside the content like "term", use singular quotes 'term', NEVER double "" quotes inside content, title, description as it ruins JSON, you will be banned for it. All JSON keys and values are surrounded by double quotes though like "key": "value", it can also be "key": "value and some 'term' some text"
        9. You must keep the number of questions, options, outcome_interpretation, combination strictly the same in terms of number of items and the keys.
        10. You cannot make the content shorter or strip away some things, you have to translate absolutely everything and keep all the content.
        11. if you translate 'questions', you must produce exactly 10 questions back, no more, no less, it is 10 questions in the array, EXTREMELY IMPORTANT
        12. translation MUST be to {language_full_name[target_language]} not to Ukrainian
        """
    if part == "title_research_description":
        example_input = {key: example_input_full[key] for key in ['title', 'research', 'description']}
        example_output = {key: example_output_full[key] for key in ['title', 'research', 'description']}
        content_to_translate = {key: content_item[key] for key in ['title', 'research', 'description']}
    elif part == "questions":
        example_input = {"questions": example_input_full["questions"]}
        example_output = {"questions": example_output_full["questions"]}
        content_to_translate = {"questions": content_item["questions"]}
    elif part == "outcome_interpretation":
        example_input = {"outcome_interpretation": example_input_full["outcome_interpretation"]}
        example_output = {"outcome_interpretation": example_output_full["outcome_interpretation"]}
        content_to_translate = {"outcome_interpretation": content_item["outcome_interpretation"]}
    elif part == "combination":
        example_input = {"combination": example_input_full["combination"]}
        example_output = {"combination": example_output_full["combination"]}
        content_to_translate = {"combination": content_item["combination"]}
    else:
        raise ValueError(f"Unknown part '{part}' for translation.")
    messages = [
        {"role": "user",
         "content": f"Example input: translate this actual part to uk:Ukrainian :\n{json.dumps(example_input, indent=2, ensure_ascii=False)}"},
        {"role": "assistant", "content": json.dumps(example_output, indent=2, ensure_ascii=False)},
        {"role": "system", "content": system_prompt},
        {"role": "user",
         "content": f"translate this actual part to {target_language}:{language_full_name[target_language]} :\n{json.dumps(content_to_translate, indent=2, ensure_ascii=False)}"}
    ]

    return messages


def fix_quotes_in_text(json_str: str) -> str:
    """
    Removes all double quotes that appear inside the text fields of a JSON string.
    """

    def remove_internal_quotes(match):
        prefix = match.group(1)  # e.g., "title": "
        content = match.group(2)  # content with possible internal quotes
        suffix = match.group(3)  # closing quote

        # Replace double quotes with single quotes
        clean_content = content.replace('"', "'")

        return f'{prefix}{clean_content}{suffix}'

    # Regex pattern to find values with double quotes inside
    pattern = r'("(?P<key>\w+)"\s*:\s*")([^"]*?)("(?=\s*,|\s*}))'

    return re.sub(pattern, remove_internal_quotes, json_str, flags=re.DOTALL)


def validate_part(language: str, attempt, original_part: Any, translated_part: Any, part: str) -> None:
    """
    Validates the translated part based on the specified rules.
    Raises an Exception if validation fails.
    """
    if part == "title_research_description":
        required_keys = ['title', 'research', 'description']
        for key in required_keys:
            if key not in translated_part:
                raise Exception(f"Missing key '{key}' in translated {part}.")
    elif part == "questions":
        translated_part = translated_part["questions"]
        if not isinstance(translated_part, list):
            raise Exception(f"Translated {part} should be a list.")
        original_length = len(original_part)
        translated_length = len(translated_part)

        # Define acceptable lengths
        if attempt > 3:
            acceptable_lengths = {original_length, original_length - 1, original_length - 2}
        else:
            acceptable_lengths = {original_length}
        if translated_length not in acceptable_lengths:
            raise Exception(f"The number of questions does not match in translated {part}.")
        for orig_q, trans_q in zip(original_part, translated_part):
            for q_key in orig_q.keys():
                if q_key not in trans_q:
                    raise Exception(f"Missing key '{q_key}' in a translated question in {part}.")
            orig_options = orig_q.get('options', [])
            trans_options = trans_q.get('options', [])
            if len(orig_options) != len(trans_options):
                raise Exception(f"The number of options does not match in a translated question in {part}.")
    elif part == "outcome_interpretation":
        if not isinstance(translated_part, dict):
            raise TypeError(f"Translated {part} should be a dictionary.")
        if "outcome_interpretation" not in translated_part:
            raise ValueError(f"Missing 'outcome_interpretation' key in translated {part}.")

        outcome_interpretation = translated_part["outcome_interpretation"]
        if not isinstance(outcome_interpretation, dict):
            raise TypeError(f"Translated {part}['outcome_interpretation'] should be a dictionary.")

        original_keys = set(original_part.keys())
        translated_keys = set(outcome_interpretation.keys())
        if original_keys != translated_keys:
            missing = original_keys - translated_keys
            extra = translated_keys - original_keys
            error_messages = []
            if missing:
                error_messages.append(f"Missing keys: {missing}")
            if extra:
                error_messages.append(f"Unexpected keys: {extra}")
            raise ValueError(f"Mismatch in {part} keys. " + "; ".join(error_messages))

        # Validate each sub-dictionary
        for key in original_keys:
            orig_sub = original_part[key]
            trans_sub = outcome_interpretation.get(key)
            if not isinstance(trans_sub, dict):
                raise TypeError(f"Each entry in {part} should be a dictionary. Error at key '{key}'.")

            orig_sub_keys = set(orig_sub.keys())
            trans_sub_keys = set(trans_sub.keys())
            if orig_sub_keys != trans_sub_keys:
                missing = orig_sub_keys - trans_sub_keys
                extra = trans_sub_keys - orig_sub_keys
                error_messages = []
                if missing:
                    error_messages.append(f"Missing keys: {missing}")
                if extra:
                    error_messages.append(f"Unexpected keys: {extra}")
                raise ValueError(f"Mismatch in keys for '{key}' in {part}. " + "; ".join(error_messages))

    elif part == "combination":
        if not isinstance(translated_part, dict):
            raise TypeError(f"Translated {part} should be a dictionary.")
        if "combination" not in translated_part:
            raise ValueError(f"Missing 'combination' key in translated {part}.")

        combination = translated_part["combination"]
        if not isinstance(combination, dict):
            raise TypeError(f"Translated {part}['combination'] should be a dictionary.")

        original_keys = set(original_part.keys())
        translated_keys = set(combination.keys())
        if original_keys != translated_keys:
            missing = original_keys - translated_keys
            extra = translated_keys - original_keys
            error_messages = []
            if missing:
                error_messages.append(f"Missing keys: {missing}")
            if extra:
                error_messages.append(f"Unexpected keys: {extra}")
            raise ValueError(f"Mismatch in {part} keys. " + "; ".join(error_messages))

        # Validate each sub-dictionary
        for key in original_keys:
            orig_sub = original_part[key]
            trans_sub = combination.get(key)
            if not isinstance(trans_sub, dict):
                raise TypeError(f"Each entry in {part} should be a dictionary. Error at key '{key}'.")

            orig_sub_keys = set(orig_sub.keys())
            trans_sub_keys = set(trans_sub.keys())
            if orig_sub_keys != trans_sub_keys:
                missing = orig_sub_keys - trans_sub_keys
                extra = trans_sub_keys - orig_sub_keys
                error_messages = []
                if missing:
                    error_messages.append(f"Missing keys: {missing}")
                if extra:
                    error_messages.append(f"Unexpected keys: {extra}")
                raise ValueError(f"Mismatch in keys for '{key}' in {part}. " + "; ".join(error_messages))
    else:
        raise ValueError(f"Unknown part '{part}' for validation.")


def call_gpt_translation(part: str, content_item: Dict[str, Any], target_language: str) -> Any:
    """
    Calls GPT to translate a specific part of 'content_item' into 'target_language'.
    Returns the translated part or the original data if translation fails.
    """
    messages = build_translation_prompt(part, content_item, target_language)
    translated_text = ''
    # Attempt the GPT call with retries
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(
                f"Translating part '{part}' of '{content_item.get('title', 'Untitled')}' into '{target_language}' (attempt {attempt}/{MAX_RETRIES})")
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
            translated_text = response.choices[0].message.content.strip()

            # Clean the response
            translated_text = translated_text.replace("\n", "")
            translated_text = translated_text.replace("\\", "")
            translated_text = translated_text.replace("```", "")
            translated_text = translated_text.replace("*", "")
            translated_text = translated_text.replace("json", "")
            #             translated_text = fix_quotes_in_text(translated_text.strip())

            translated_data = json.loads(translated_text)

            # Validate the translated part
            original_part = None
            if part == "title_research_description":
                original_part = {key: content_item[key] for key in ['title', 'research', 'description']}
            else:
                original_part = content_item.get(part, None)
            validate_part(target_language, attempt, original_part, translated_data, part)

            return translated_data
        except Exception as e:
            except_languages = ['am', 'ml', 'rm', 'km', 'zh_tw', 'zh_hk', 'id', 'tr']
            logging.error(
                f"Error translating part '{part}' of '{content_item.get('title', 'Untitled')}' to '{target_language}': {e}")
            logging.info(f"Response content: {translated_text}")
            if (target_language in except_languages and attempt > 2) or (attempt >= MAX_RETRIES):
                if part == "title_research_description":
                    res = {key: content_item[key] for key in ['title', 'research', 'description']}
                elif part == "questions":
                    res = {"questions": content_item["questions"]}
                elif part == "outcome_interpretation":
                    res = {"outcome_interpretation": content_item["outcome_interpretation"]}
                elif part == "combination":
                    res = {"combination": content_item["combination"]}
                return res
            #               raise Exception(f"Could not translate part '{part}' of '{content_item.get('title', 'Untitled')}' to '{target_language}' after {MAX_RETRIES} attempts.")
            time.sleep(RETRY_DELAY)
    raise Exception(
        f"Could not translate part '{part}' of '{content_item.get('title', 'Untitled')}' to '{target_language}' after {MAX_RETRIES} attempts.")


def process_item_translation(content_item: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """
    Process a single item: translate all parts into the target language using the GPT API.
    """
    translated_item = {
        "job": content_item.get("job", []),
        "slug": content_item.get("slug", "")
    }

    parts = ["title_research_description", "questions", "outcome_interpretation", "combination"]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(call_gpt_translation, part, content_item, target_language): part
            for part in parts
        }

        for future in as_completed(futures):
            part = futures[future]
            try:
                translated_item_part = future.result()
                translated_item.update(translated_item_part)
            except Exception as exc:
                logging.error(
                    f"Translation error for part '{part}' in item '{content_item.get('title', 'Untitled')}': {exc}")
                raise exc

    return translated_item


# ------------------------------------------------------------------------------
# Main Function
# ------------------------------------------------------------------------------

def main():
    content_type = "test"  # Changed from "question" to "test"
    en_folder = os.path.join("en", content_type)
    input_file = os.path.join(en_folder, "final_content.json")

    logging.info(f"Reading content from: {input_file}")
    content_data = read_content_json(input_file)
    if not content_data:
        logging.warning("No content to translate. Exiting.")
        return

    # Translate for each language in LANGUAGES
    for lang in LANGUAGES:  # Adjust the slice as needed
        logging.info(f"Translating to '{lang}'...")

        translated_items = []
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(process_item_translation, item, lang): item
                for item in content_data  # Adjust the slice as needed
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
