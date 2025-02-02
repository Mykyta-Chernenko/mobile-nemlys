import json


def extract_questions(input_file, output_file):
    """
    Reads questions from a JSON file, sorts them alphabetically, and saves them as a list to a new JSON file.

    Args:
        input_file (str): Path to the input JSON file
        output_file (str): Path to save the output JSON file
    """
    try:
        # Read the input JSON file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract questions into a list and sort them alphabetically
        questions = []
        for x in data:
            del x['job']
            questions.append(x)

        # Write the sorted questions to the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)

        print(f"Successfully processed and sorted {len(questions)} questions")
        print(f"Output saved to {output_file}")

    except FileNotFoundError:
        print(f"Error: Could not find the input file {input_file}")
    except json.JSONDecodeError:
        print(f"Error: The input file {input_file} is not valid JSON")
    except KeyError:
        print("Error: Some items in the JSON file don't have a 'question' field")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")


if __name__ == "__main__":
    input_file = "./content.json"
    output_file = "./content_without_jobs.json"
    extract_questions(input_file, output_file)
