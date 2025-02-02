import json
import os
import sys
import shutil
from typing import List, Dict

# Define your constants
CONTENT_TYPES = [
    'checkup',
    'question',
    'article',
    'exercise',
    'test',
    'game',
]

def load_json(file_path: str) -> List[Dict]:
    """
    Load a JSON file and return its content.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from file {file_path}: {e}")
        return []

def save_json(data: List[Dict], file_path: str):
    """
    Save data to a JSON file with pretty formatting.
    """
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Successfully updated {file_path}")
    except Exception as e:
        print(f"Error saving JSON to file {file_path}: {e}")

def backup_file(file_path: str):
    """
    Create a backup of the given file by copying it to the same directory with a .bak extension.
    """
    backup_path = file_path + '.bak'
    try:
        shutil.copyfile(file_path, backup_path)
        print(f"Backup created at {backup_path}")
    except Exception as e:
        print(f"Error creating backup for {file_path}: {e}")

def truncate_jobs(final_content: List[Dict]) -> List[Dict]:
    """
    Truncate the 'job' array in each item to only include the first two jobs.
    """
    for item in final_content:
        jobs = item.get('job', [])
        if not isinstance(jobs, list):
            print(f"Warning: 'job' is not a list in item: {item}")
            continue
        original_length = len(jobs)
        if original_length > 2:
            item['job'] = jobs[:2]
            print(f"Truncated 'job' from {original_length} to 2 for slug '{item.get('slug', 'N/A')}'")
    return final_content

def process_final_content(en_directory: str, content_type: str):
    """
    Process the final_content.json for a given content type in the English directory.
    """
    final_content_path = os.path.join(en_directory, content_type, 'final_content.json')

    if not os.path.exists(final_content_path):
        print(f"Warning: final_content.json does not exist for content type '{content_type}' at {final_content_path}")
        return

    # Backup the original final_content.json
    backup_file(final_content_path)

    # Load the final_content.json
    final_content = load_json(final_content_path)
    if not final_content:
        print(f"Warning: final_content.json is empty or invalid for content type '{content_type}'")
        return

    # Truncate the jobs arrays
    updated_final_content = truncate_jobs(final_content)

    # Save the updated final_content.json
    save_json(updated_final_content, final_content_path)

def main():
    # Define the English directory
    en_directory = os.path.join('.')

    for content_type in CONTENT_TYPES:
        print(f"\nProcessing content type: '{content_type}'")
        process_final_content(en_directory, content_type)

    print("\nAll content types have been processed.")

if __name__ == "__main__":
    main()
