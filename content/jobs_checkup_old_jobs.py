import json
import os
import sys
from typing import List, Dict

def load_json(file_path: str) -> List[Dict]:
    """
    Load a JSON file and return its content.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from file {file_path}: {e}")
        sys.exit(1)

def save_json(data: List[Dict], file_path: str):
    """
    Save data to a JSON file.
    """
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Successfully updated {file_path}")
    except Exception as e:
        print(f"Error saving JSON to file {file_path}: {e}")
        sys.exit(1)

def build_content_map(content: List[Dict], key: str) -> Dict:
    """
    Build a mapping from a unique key to the jobs.
    """
    content_map = {}
    for item in content:
        if key not in item:
            print(f"Warning: Key '{key}' not found in item: {item}")
            continue
        content_map[item[key]] = item.get('job', [])
    return content_map

def update_jobs(final_content: List[Dict], content_map: Dict, key: str) -> List[Dict]:
    """
    Update the jobs in final_content based on content_map.
    """
    for item in final_content:
        if key not in item:
            print(f"Warning: Key '{key}' not found in item: {item}")
            continue
        question_key = item[key]
        if question_key in content_map:
            original_jobs = item.get('job', [])
            new_jobs = content_map[question_key]
            item['job'] = new_jobs
            print(f"Updated jobs for '{question_key}': {original_jobs} -> {new_jobs}")
        else:
            print(f"Warning: No matching entry found in content.json for '{question_key}'")
    return final_content

def main():
    # Define the directory and file paths
    directory = os.path.join('.', 'en', 'checkup')
    content_file = os.path.join(directory, 'content.json')
    final_content_file = os.path.join(directory, 'final_content.json')

    # Load JSON data
    content = load_json(content_file)
    final_content = load_json(final_content_file)

    # Define the key to match questions (e.g., 'id' or 'question_text')
    # Change this if your JSON structure uses a different unique identifier
    matching_key = 'slug'

    # Build a mapping from the content.json
    content_map = build_content_map(content, matching_key)

    # Update the final_content.json with jobs from content.json
    updated_final_content = update_jobs(final_content, content_map, matching_key)

    # Save the updated final_content.json
    save_json(updated_final_content, final_content_file)

if __name__ == "__main__":
    main()
