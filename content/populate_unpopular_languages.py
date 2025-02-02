import os
import shutil


def copy_files_for_languages(languages, source_lang='en', target_dirs=None, filename='final_content.json'):
    """
    Copies specified files from the source language directories to target language directories.

    :param languages: List of language codes to process.
    :param source_lang: The source language code (default is 'en').
    :param target_dirs: List of directory names to process.
    :param filename: The name of the file to copy.
    """
    if target_dirs is None:
        target_dirs = ['test', 'game', 'exercise', 'journey', 'question', 'checkup', 'article']

    for lang in languages:
        print(f"\nProcessing language: {lang}")
        for dir_name in target_dirs:
            source_dir = os.path.join('.', source_lang, dir_name)
            target_dir = os.path.join('.', lang, dir_name)

            # Ensure the target directory exists
            os.makedirs(target_dir, exist_ok=True)
            print(f"Ensured directory exists: {target_dir}")

            source_file = os.path.join(source_dir, filename)
            target_file = os.path.join(target_dir, filename)

            # Check if the source file exists
            if os.path.isfile(source_file):
                try:
                    shutil.copy2(source_file, target_file)
                    print(f"Copied '{source_file}' to '{target_file}'")
                except Exception as e:
                    print(f"Failed to copy '{source_file}' to '{target_file}': {e}")
            else:
                print(f"Source file does not exist: {source_file}")


def main():
    # List of language codes
    languages = [
        'zu', 'ur', 'te', 'ta', 'sw', 'si', 'rm', 'pa',
        'ne', 'my', 'mr', 'mn', 'ml', 'ky', 'kn', 'km',
        'ka', 'hy', 'gu', 'gl', 'eu', 'be', 'am'
    ]

    # Call the copy function
    copy_files_for_languages(languages)


if __name__ == "__main__":
    main()
