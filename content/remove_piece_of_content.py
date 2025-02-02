import os
import json



LANGUAGES = [
 "en", "es", "nl", "de", "it", "fr",
    "ar", "bn", "zh_cn", "zh_tw", "zh_hk", "hi",
    "ja", "pt", "fil", "id", "pl", "ro", "tr", "uk", "ru", "vi", "no", "af", "sq",
    "hy",
    "az", "eu", "be", "bg", "my", "ca", "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu", "he", "hu", "is", "kn",
    "kk", "km", "ko", "ky", "lv", "lt", "mk", "ms",
    "mr", "mn",
    "ne", "fa", "pa", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te", "th", "ur", "zu", "am", "ml", "rm",
]

def remove_item_from_json(language, content_type, slug, filename='final_content.json'):
    content_dir = os.path.join('.', language, content_type)
    file_path = os.path.join(content_dir, filename)

    print(f"\nProcessing language: {language}, Content Type: {content_type}")
    print(f"File path: {file_path}")

    if not os.path.isfile(file_path):
        print(f"File does not exist: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded JSON data from {file_path}")

        original_count = len(data)
        data = [item for item in data if item.get('slug') != slug]
        removed_count = original_count - len(data)

        if removed_count == 1:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"Removed {removed_count} item(s) with slug '{slug}' from {file_path}")
        else:
            print(f"No items with slug '{slug}' found in {file_path} or too many pieces remove")

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {file_path}: {e}")
    except Exception as e:
        print(f"An error occurred while processing {file_path}: {e}")

def main():
    # Parameters
    content_type = 'game'          # Set to 'game'
    slug = 'fun-fact-hunt'         # Set to 'fun-fact-hunt'

    # Iterate through each language and remove the specified item
    for language in LANGUAGES:
        remove_item_from_json(language, content_type, slug)

if __name__ == "__main__":
    main()