import json
from typing import Dict, List, Any

LANGUAGES = [
    "en",
]


def validate_quiz_structure(data: List[Dict[str, Any]]) -> List[str]:
    errors = []

    for index, quiz in enumerate(data):
        prefix = f"Quiz {index + 1} ({quiz.get('title', 'Untitled')})"

        # Check required keys
        required_strings = ['title', 'research', 'description']
        for key in required_strings:
            if key not in quiz:
                errors.append(f"{prefix}: Missing required key '{key}'")
            elif not isinstance(quiz[key], str):
                errors.append(f"{prefix}: '{key}' must be a string")

        # Validate job array
        if 'job' not in quiz:
            errors.append(f"{prefix}: Missing 'job' array")
        elif not isinstance(quiz['job'], list):
            errors.append(f"{prefix}: 'job' must be an array")
        elif len(quiz['job']) < 1:
            errors.append(f"{prefix}: 'job' array must have at least 1 entry")
        elif not all(isinstance(j, str) for j in quiz['job']):
            errors.append(f"{prefix}: All 'job' entries must be strings")

        # Validate questions
        if 'questions' not in quiz:
            errors.append(f"{prefix}: Missing 'questions' array")
        elif not isinstance(quiz['questions'], list):
            errors.append(f"{prefix}: 'questions' must be an array")
        elif len(quiz['questions']) != 10:
            errors.append(f"{prefix}: Must have exactly 10 questions, found {len(quiz['questions'])}")
        else:
            for q_idx, question in enumerate(quiz['questions']):
                q_prefix = f"{prefix} - Question {q_idx + 1}"

                if not isinstance(question, dict):
                    errors.append(f"{q_prefix}: Question must be an object")
                    continue

                if 'question' not in question:
                    errors.append(f"{q_prefix}: Missing 'question' field")
                elif not isinstance(question['question'], str):
                    errors.append(f"{q_prefix}: 'question' must be a string")

                if 'options' not in question:
                    errors.append(f"{q_prefix}: Missing 'options' array")
                elif not isinstance(question['options'], list):
                    errors.append(f"{q_prefix}: 'options' must be an array")
                elif len(question['options']) != 5:
                    errors.append(f"{q_prefix}: Must have exactly 5 options, found {len(question['options'])}")
                elif not all(isinstance(opt, str) for opt in question['options']):
                    errors.append(f"{q_prefix}: All options must be strings")

        # Validate evaluation_method
        if 'evaluation_method' not in quiz:
            errors.append(f"{prefix}: Missing 'evaluation_method'")
        elif not isinstance(quiz['evaluation_method'], dict):
            errors.append(f"{prefix}: 'evaluation_method' must be an object")
        else:
            eval_method = quiz['evaluation_method']
            for key in ['explanation', 'example']:
                if key not in eval_method:
                    errors.append(f"{prefix}: 'evaluation_method' missing required key '{key}'")
                elif not isinstance(eval_method[key], str):
                    errors.append(f"{prefix}: 'evaluation_method.{key}' must be a string")

        if 'outcome_interpretation' not in quiz:
            errors.append(f"{prefix}: Missing 'outcome_interpretation'")
        elif not isinstance(quiz['outcome_interpretation'], dict):
            errors.append(f"{prefix}: 'outcome_interpretation' must be an object")
        else:
            outcome = quiz['outcome_interpretation']
            # Check for all 5 options (1-5)
            for i in range(1, 6):
                key = str(i)
                if key not in outcome:
                    errors.append(f"{prefix}: 'outcome_interpretation' missing option {key}")
                elif not isinstance(outcome[key], dict):
                    errors.append(f"{prefix}: 'outcome_interpretation.{key}' must be an object")
                else:
                    required_keys = ['label', 'description', 'advice']
                    for req_key in required_keys:
                        if req_key not in outcome[key]:
                            errors.append(f"{prefix}: 'outcome_interpretation.{key}' missing required key '{req_key}'")
                        elif not isinstance(outcome[key][req_key], str):
                            errors.append(f"{prefix}: 'outcome_interpretation.{key}.{req_key}' must be a string")

        # Validate combination
        if 'combination' not in quiz:
            errors.append(f"{prefix}: Missing 'combination'")
        elif not isinstance(quiz['combination'], dict):
            errors.append(f"{prefix}: 'combination' must be an object")
        else:
            combination = quiz['combination']
            # Generate all valid combination keys (1_1, 1_2, ..., 5_5)
            valid_combinations = [f"{i}_{j}" for i in range(1, 6) for j in range(i, 6)]

            # Check if all required combinations exist
            for combo_key in valid_combinations:
                if combo_key not in combination:
                    errors.append(f"{prefix}: 'combination' missing key '{combo_key}'")
                elif not isinstance(combination[combo_key], dict):
                    errors.append(f"{prefix}: 'combination.{combo_key}' must be an object")
                else:
                    required_keys = ['description', 'advice']
                    for req_key in required_keys:
                        if req_key not in combination[combo_key]:
                            errors.append(f"{prefix}: 'combination.{combo_key}' missing required key '{req_key}'")
                        elif not isinstance(combination[combo_key][req_key], str):
                            errors.append(f"{prefix}: 'combination.{combo_key}.{req_key}' must be a string")

            # Check for any invalid combination keys
            invalid_keys = set(combination.keys()) - set(valid_combinations)
            if invalid_keys:
                errors.append(f"{prefix}: 'combination' contains invalid keys: {', '.join(invalid_keys)}")

    return errors


def main():
    for l in LANGUAGES:
        try:
            with open(f'../../{l}/test/final_content.json', 'r') as f:
                data = json.load(f)

            if not isinstance(data, list):
                print("Error: Root element must be an array")
                return

            errors = validate_quiz_structure(data)

            if errors:
                print("\nValidation errors found:")
                for error in errors:
                    print(f"- {error}")
            else:
                print("JSON structure is valid!")
                print(f"Number of quizzes validated: {len(data)}")

        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON format - {str(e)}")
        except FileNotFoundError:
            print("Error: content.json file not found")


if __name__ == "__main__":
    main()
