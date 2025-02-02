import json
import os

# Directories containing final_content.json files
directories = ["./article", "./game", "./test", "./journey", "./checkup", "./question", "./exercise"]

for directory in directories:
    file_path = os.path.join(directory, "final_content.json")

    try:
        # Open and load the JSON file
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        # Check if data is a list of objects
        if isinstance(data, list):
            slug_count = {}
            for item in data:
                slug = item.get("slug")
                if slug:
                    slug_count[slug] = slug_count.get(slug, 0) + 1

            # Find duplicates
            duplicates = {slug: count for slug, count in slug_count.items() if count > 1}

            if duplicates:
                print(f"Duplicates found in {file_path}:")
                for slug, count in duplicates.items():
                    print(f"  Slug: {slug} - Occurrences: {count}")
            else:
                print(f"No duplicates found in {file_path}.")
        else:
            print(f"The file {file_path} does not contain a list of objects.")

    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON in file {file_path}: {e}")
