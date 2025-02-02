import glob
import json
import os
from collections import OrderedDict


def process_json_files():
    # Get all files with "*with*_content" in the name from journeys directory
    file_pattern = os.path.join('./journeys', '*with*_content.json')
    json_files = glob.glob(file_pattern)

    # List to store all processed content
    combined_content = []

    for file_path in json_files:
        try:
            # Extract the job name from the file name
            filename = os.path.basename(file_path)
            # Remove '_journey_with_content.json' and split by underscore
            job_name = filename.replace('_journey_with_content.json', '')
            job_parts = [job_name]

            # Read and parse the JSON file
            with open(file_path, 'r', encoding='utf-8') as file:
                content = json.load(file)

                # Create new OrderedDict with job first, then all other content
                ordered_content = OrderedDict()
                ordered_content['job'] = job_parts

                # Add all other keys from the original content
                for key in content:
                    ordered_content[key] = content[key]

                # Add to our combined content list
                combined_content.append(ordered_content)

            print(f"Processed: {filename}")

        except json.JSONDecodeError as e:
            print(f"Error processing {file_path}: Invalid JSON format - {str(e)}")
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")

    # Write the combined content to final_content.json
    try:
        with open('./final_content.json', 'w', encoding='utf-8') as outfile:
            json.dump(combined_content, outfile, indent=2, ensure_ascii=False)
        print("\nSuccessfully created final_content.json")

    except Exception as e:
        print(f"Error writing final_content.json: {str(e)}")


if __name__ == "__main__":
    process_json_files()
