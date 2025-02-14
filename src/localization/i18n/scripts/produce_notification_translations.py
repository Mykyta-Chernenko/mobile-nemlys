import json
import re
# Define the mapping of locales to file names
locale_mapping = {
'en': 'english',
'es': 'spanish',
'nl': 'dutch',
'de': 'german',
'it': 'italian',
'fr': 'french',
'ar': 'arabic_modern',
'bn': 'bengali',
'zh_cn': 'chinese_simplified',
'zh_tw': 'chinese_traditional',
'zh_hk': 'chinese_hk',
'hi': 'hindi',
'ja': 'japanese',
'pt': 'portugese',
'fil': 'filipino',
'id': 'indonesian',
'pl': 'polish',
'ro': 'romanian',
'tr': 'turkish',
'uk': 'ukranian',
'ru': 'russian',
'vi': 'vietnamese',
'no': 'norwegian',
'af': 'afrikaans',
'sq': 'albanian',
'am': 'amharic',
'hy': 'armenian',
'az': 'azerbaijani',
'eu': 'basque',
'be': 'belarusian',
'bg': 'bulgarian',
'my': 'burmese',
'ca': 'catalan',
'hr': 'croatian',
'cs': 'czech',
'da': 'danish',
'et': 'estonian',
'fi': 'finnish',
'gl': 'galician',
'ka': 'georgian',
'el': 'greek',
'gu': 'gujarati',
'he': 'hebrew',
'hu': 'hungarian',
'is': 'icelandic',
'kn': 'kannada',
'kk': 'kazakh',
'km': 'khmer',
'ko': 'korean',
'ky': 'kyrgyz',
'lv': 'latvian',
'lt': 'lithuanian',
'mk': 'macedonian',
'ms': 'malay',
'ml': 'malayalam',
'mr': 'marathi',
'mn': 'mongolian',
'ne': 'nepali',
'fa': 'persian',
'pa': 'punjabi',
'rm': 'romansh',
'sr': 'serbian',
'si': 'sinhala',
'sk': 'slovak',
'sl': 'slovenian',
'sw': 'swahili',
'sv': 'swedish',
'ta': 'tamil',
'te': 'telugu',
'th': 'thai',
'ur': 'urdu',
'zu': 'zulu'
}

# Function to read JSON file
def read_json_file(filename):
    with open(f'../lang/{filename}.json',
'r',
encoding='utf-8') as file:
        return json.load(file)

# Function to create notification dictionary for a language
def create_notification_dict(data):
    def replace_placeholder(text):
        text = re.sub(r'\{\{partnerName\}\}', '${partnerName}', text)
        text = re.sub(r'\{\{title\}\}', '${title}', text)
        text = re.sub(r'\{\{action\}\}', '${action}', text)
        return text

    return f"""
'partner_joined': {{
    't': (partnerName) => `{replace_placeholder(data['notification_partner_joined_title'])}`,
    'd': (_) => `{data['notification_partner_joined_description']}`,
    }},
'partner_answered': {{
    't': (partnerName) => `{replace_placeholder(data['notification_partner_answered_title'])}`,
    'd': (question) => question,
    }},
'partner_replied': {{
    't': (partnerName) => `{replace_placeholder(data['notification_partner_replied_title'])}`,
    'd': (reply) => reply,
    }},
'remind_answer': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_answer_title'])}`,
    'd': (question) => question,
    }},
'remind_test': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_test_title'])}`,
    'd': (title) => `{replace_placeholder(data['notification_remind_test_description'])}`,
    }},
'remind_checkup': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_checkup_title'])}`,
    'd': (title) => `{replace_placeholder(data['notification_remind_checkup_description'])}`,
    }},
'remind_game': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_game_title'])}`,
    'd': (title) => `{replace_placeholder(data['notification_remind_game_description'])}`,
    }},
'remind_exercise': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_exercise_title'])}`,
    'd': (title) => `{replace_placeholder(data['notification_remind_exercise_description'])}`,
    }},
'remind_article': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_article_title'])}`,
    'd': (title) => `{replace_placeholder(data['notification_remind_article_description'])}`,
    }},
'remind_question': {{
    't': (partnerName) => `{replace_placeholder(data['notification_remind_question_title'])}`,
    'd': (reply) => reply,
    }},
'love_note': {{
    't': (partnerName, action) => `{replace_placeholder(data['notification_love_note_title'])}`,
    'd': (_) => `{data['notification_love_note_description']}`,
    }},
    'love_note_sorry': \"{data['love_note_sorry']}\",
    'love_note_sex': \"{data['love_note_sex']}\",
    'love_note_miss': \"{data['love_note_miss']}\",
    'love_note_date': \"{data['love_note_date']}\",
    'love_note_talk': \"{data['love_note_talk']}\",
    'love_note_attention': \"{data['love_note_attention']}\",
    'love_note_love': \"{data['love_note_love']}\",
    'love_note_hug': \"{data['love_note_hug']}\"
    """

# Main string to store all language notifications
all_notifications = ["export const translations = {"]

# Process each language
for locale, filename in locale_mapping.items():
    try:
        data = read_json_file(filename)
        notification_dict = create_notification_dict(data)
        all_notifications.append(f"'{locale}': {{{notification_dict}}},")
    except FileNotFoundError:
        print(f"Warning: File for {locale} ({filename}.json) not found. Skipping.")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {filename}.json. Skipping.")
    except KeyError as e:
        print(f"Error: Missing key {e} in {filename}.json. Skipping.")

# Close the translations object
all_notifications.append("}")

# Write the result to notifications.txt
with open('notifications.txt',
'w',
encoding='utf-8') as outfile:
    outfile.write('\n'.join(all_notifications))

print("notifications.txt has been created successfully.")