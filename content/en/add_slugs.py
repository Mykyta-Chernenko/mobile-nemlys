import json
import re
from pathlib import Path


def slugify(text: str) -> str:
    """
    Convert a string into a URL-friendly slug.

    Args:
        text (str): The input text to slugify

    Returns:
        str: The slugified text

    Example:
        >>> slugify("Hello World! How are you?")
        'hello-world-how-are-you'
    """
    # Convert to lowercase
    text = text.lower()

    # Replace spaces with hyphens
    text = re.sub(r'[\s]+', '-', text)

    # Remove all characters except alphanumeric and hyphens
    text = re.sub(r'[^\w\-]', '', text)

    # Remove multiple consecutive hyphens
    text = re.sub(r'\-+', '-', text)

    # Remove leading and trailing hyphens
    text = text.strip('-')

    return text


def process_json_file(file_path: Path) -> None:
    """
    Process a JSON file by adding slugs to all entries.

    Args:
        file_path (Path): Path to the JSON file to process

    Raises:
        json.JSONDecodeError: If the JSON file is invalid
        FileNotFoundError: If the file doesn't exist
        PermissionError: If there are insufficient permissions
    """
    try:
        # Read the existing JSON content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = json.load(f)

        # Check if content is a list of entries
        if isinstance(content, list):
            # Process each entry
            for entry in content:
                if isinstance(entry, dict) and 'title' in entry and 'slug' not in entry:
                    entry['slug'] = slugify(entry['title'])
        else:
            print(f"Warning: Content in {file_path} is not a list of entries")
            return

        # Write the updated content back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False)

        print(f"Successfully processed {file_path}")

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {str(e)}")
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}")
    except PermissionError:
        print(f"Error: Permission denied accessing {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")


def process_content_folders(base_path: str) -> None:
    """
    Process all final_content.json files in the specified content folders.

    Args:
        base_path (str): Base path containing the content folders

    Returns:
        None
    """
    # List of content folders to process
    content_folders = ['article', 'game', 'test', 'exercise', 'question', 'checkup', 'journey']

    base_path = Path(base_path)

    if not base_path.exists():
        print(f"Error: Base path {base_path} does not exist")
        return

    # Process each content folder
    for folder in content_folders:
        folder_path = base_path / folder
        json_file = folder_path / 'content.json'

        if not folder_path.exists():
            print(f"Warning: Folder {folder_path} does not exist")
            continue

        if not json_file.exists():
            print(f"Warning: JSON file not found in {folder_path}")
            continue

        process_json_file(json_file)


def main():
    """
    Main entry point of the script.
    """
    # Get the content directory path
    script_dir = Path(__file__).parent
    content_dir = script_dir

    print(f"Starting content processing in: {content_dir}")
    process_content_folders(content_dir)
    print("Content processing completed")


if __name__ == "__main__":
    main()
