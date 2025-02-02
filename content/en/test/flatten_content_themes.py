import json
import os

# Define the base directory
base_dir = './themes'

# File to store combined content
output_file = './themes.json'

# List to store all JSON objects
combined_data = []

# Traverse through all folders and files in the base directory
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.json'):  # Process only JSON files
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)  # Load the JSON content
                    combined_data.extend(data['themes'])
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON in file: {file_path}, Error: {e}")

# Write the combined data to the output file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(combined_data, f, indent=4)

print(f"Combined content has been written to {output_file}")
