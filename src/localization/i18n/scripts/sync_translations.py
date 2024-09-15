import os
import json
import openai
import time
from typing import List, Dict

# Configuration
LANG_DIR = '../lang'
REFERENCE_FILE = 'english.json'
BATCH_SIZE = 20
MAX_RETRIES = 3
RETRY_DELAY = 0  # seconds

# OpenAI API configuration
openai.api_key = os.getenv("OPENAI_API_KEY")  # Ensure your API key is set in the environment
PARAMS = {
    "model": "gpt-4o-mini",
    "temperature": 0,
    "max_tokens": 4000,
    "top_p": 1,
    "n": 1,
    "stop": None,
}

def load_json(filepath: str) -> Dict:
    """Load JSON data from a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded '{filepath}' successfully.")
        return data
    except Exception as e:
        print(f"Error loading '{filepath}': {e}")
        return {}

def save_json(filepath: str, data: Dict):
    """Save JSON data to a file with proper formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved updates to '{filepath}'.")
    except Exception as e:
        print(f"Error saving '{filepath}': {e}")

def get_missing_keys(reference: Dict, target: Dict) -> Dict:
    """Identify keys present in reference but missing in target."""
    missing = {k: v for k, v in reference.items() if k not in target}
    print(f"Found {len(missing)} missing keys.")
    return missing

def chunk_dict(data: Dict, size: int) -> List[Dict]:
    """Yield successive chunks of the dictionary."""
    items = list(data.items())
    for i in range(0, len(items), size):
        yield dict(items[i:i + size])

import json

def build_prompt(batch: Dict[str, str], target_language: str) -> str:
    prompt = f"""
Translate the following key-value pairs from English to {target_language}. Maintain the JSON structure.
Here is an example of how to format the response:
{{
  "greeting": "Hola",
  "farewell": "Adiós"
}}
Now, translate these key-value pairs:
{json.dumps(batch, ensure_ascii=False, indent=2)}
"""
    return prompt.strip()

def call_gpt(prompt: str) -> str:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                temperature=PARAMS["temperature"],
                max_tokens=PARAMS["max_tokens"],
                top_p=PARAMS["top_p"],
                n=PARAMS["n"],
                stop=PARAMS["stop"],
                messages=[
                    {"role": "system", "content": "You are a professional translator. You translate i18n strings for a mobile app for couples where they discsuss love questions together, tone of voice is friendly"},
                    {"role": "user", "content": prompt}
                ]
            )
            content = response.choices[0].message.content.strip()
            return content
        except Exception as e:
            print(f"Error during API call: {e}. Attempt {attempt} of {MAX_RETRIES}. Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    print("Max retries exceeded. Skipping this batch.")
    return ""

def validate_json(response: str) -> Dict:
    """Validate and parse the JSON response from GPT."""
    try:
        data = json.loads(response)
        return data
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {}

def main():
    # Load reference English translations
    reference_path = os.path.join(LANG_DIR, REFERENCE_FILE)
    reference_data = load_json(reference_path)
    if not reference_data:
        print("Reference file is empty or could not be loaded. Exiting.")
        return

    # Iterate over all language files in the LANG_DIR
    for filename in os.listdir(LANG_DIR):
        if filename == REFERENCE_FILE or not filename.endswith('.json'):
            continue  # Skip the reference file and non-JSON files

        target_language = os.path.splitext(filename)[0].capitalize()  # e.g., 'dutch' -> 'Dutch'
        target_path = os.path.join(LANG_DIR, filename)
        target_data = load_json(target_path)

        # Identify missing keys
        missing_keys = get_missing_keys(reference_data, target_data)
        if not missing_keys:
            print(f"No missing keys for '{filename}'. Skipping translation.")
            continue

        # Process in batches
        batches = list(chunk_dict(missing_keys, BATCH_SIZE))
        total_batches = len(batches)
        print(f"Translating {len(missing_keys)} keys in {total_batches} batch(es) for '{filename}' '{json.dumps(missing_keys)}'.")
        for idx, batch in enumerate(batches, 1):
            print(f"Processing batch {idx}/{total_batches}...")
            prompt = build_prompt(batch, target_language)
            response = call_gpt(prompt)

            if not response:
                print(f"Failed to get a response for batch {idx}. Skipping.")
                continue

            translated = validate_json(response)
            if not translated:
                print(f"Invalid JSON received for batch {idx}. Retrying...")
                # Optionally, implement retry logic here
                response = call_gpt(prompt)
                translated = validate_json(response)
                if not translated:
                    print(f"Failed to parse JSON after retrying for batch {idx}. Skipping.")
                    continue

            # Update target data with translations
            target_data.update(translated)
            print(f"Batch {idx} translated successfully.")

        # Save the updated target language file
        save_json(target_path, target_data)
        print(f"Completed translations for '{filename}'.\n{'-'*50}")

    print("All translations completed.")

if __name__ == "__main__":
    main()
