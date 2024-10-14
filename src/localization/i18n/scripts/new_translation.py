import os
import json

languages = [
    'afrikaans', 'albanian', 'amharic', 'armenian', 'azerbaijani', 'basque', 'belarusian',
    'bulgarian', 'burmese', 'catalan', 'chinese_hk', 'croatian', 'czech', 'danish', 'estonian',
    'finnish', 'galician', 'georgian', 'greek', 'gujarati', 'hebrew', 'hungarian', 'icelandic',
    'kannada', 'kazakh', 'khmer', 'korean', 'kyrgyz', 'lao', 'latvian', 'lithuanian', 'macedonian',
    'malay', 'malayalam', 'marathi', 'mongolian', 'nepali', 'norwegian', 'persian', 'punjabi',
    'romansh', 'serbian', 'sinhala', 'slovak', 'slovenian', 'swahili', 'swedish', 'tamil',
    'telugu', 'thai', 'urdu', 'zulu'
]

# Create the 'lang' directory if it doesn't exist
os.makedirs('../lang', exist_ok=True)

# Create each JSON file and write an empty dictionary into it
for lang in languages:
    file_path = f'../lang/{lang}.json'
    with open(file_path, 'w') as f:
        json.dump({}, f)

print("All files created successfully.")