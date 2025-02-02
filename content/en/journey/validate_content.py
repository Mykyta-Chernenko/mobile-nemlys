import json
import logging
from copy import deepcopy
from pathlib import Path
from typing import Dict, List, Any, Tuple


class ContentValidatorUpdater:
    def __init__(self, base_path: str, journey_path: str, journey_path_new: str):
        """
        Initialize the validator and updater with necessary paths and setup logging.

        Args:
            base_path (str): Base directory path where content type folders are located
            journey_path (str): Path to the journey JSON file
        """
        self.base_path = Path(base_path)
        self.journey_path = Path(journey_path)
        self.journey_path_new = Path(journey_path_new)
        self.content_by_title: Dict[str, Dict[str, Any]] = {}
        self.content_by_slug: Dict[str, Dict[str, Any]] = {}
        self.setup_logging()

    def setup_logging(self):
        """Configure logging with detailed formatting"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def load_content_by_type(self, content_type: str) -> Dict[str, Any]:
        """
        Load content from a specific content type's final_content.json file.

        Args:
            content_type (str): The type of content to load (e.g., 'test', 'article')

        Returns:
            Dict[str, Any]: Dictionary with both title and slug mappings to content
        """
        try:
            content_path = self.base_path / content_type / 'final_content.json'
            if not content_path.exists():
                self.logger.warning(f"Content file not found: {content_path}")
                return {}

            with open(content_path, 'r', encoding='utf-8') as f:
                content_data = json.load(f)

            # Create mappings for both title and slug
            content_dict = {}
            for item in content_data:
                title = item.get('title', '')
                slug = item.get('slug', '')
                if title and slug:
                    content_dict[title + content_type] = {
                        'content': item,
                        'type': content_type,
                        'slug': slug
                    }
                    self.content_by_slug[slug] = {
                        'content': item,
                        'type': content_type,
                        'title': title
                    }
            return content_dict
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON parsing error in {content_path}: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading content from {content_path}: {e}")
            return {}

    def load_all_content(self):
        """
        Load content for all known content types into master dictionaries.
        """
        content_types = ['test', 'question', 'article', 'exercise', 'game', 'checkup']

        for content_type in content_types:
            content_dict = self.load_content_by_type(content_type)
            self.content_by_title.update(content_dict)

        self.logger.info(f"Loaded {len(self.content_by_title)} total content items")

    def validate_and_prepare_updates(self, journey_data: List[Dict[str, Any]]) -> Tuple[
        List[str], List[Dict[str, Any]]]:
        """
        Validate content references and prepare updated journey data with slugs.

        Args:
            journey_data: List of journey dictionaries

        Returns:
            Tuple containing list of validation errors and updated journey data
        """
        validation_errors = []
        updated_journeys = []

        for journey in journey_data:
            updated_journey = deepcopy(journey)
            journey_title = journey.get('title', 'Unknown Journey')

            updated_subtopics = []
            for subtopic in journey.get('subtopics', []):
                updated_subtopic = deepcopy(subtopic)
                subtopic_title = subtopic.get('title', 'Unknown Subtopic')

                updated_content = []
                for content_item in subtopic.get('content', []):
                    content_title = content_item.get('title')
                    content_type = content_item.get('type')

                    if not content_title:
                        validation_errors.append(
                            f"Missing title in content item under {journey_title} -> {subtopic_title}"
                        )
                        continue

                    # Verify content exists and get slug
                    if content_title + content_type not in self.content_by_title:
                        validation_errors.append(
                            f"Missing content: '{content_title}' ({content_type}) "
                            f"referenced in {journey_title} -> {subtopic_title}"
                        )
                        continue

                    # Update content reference with slug
                    content_info = self.content_by_title[content_title + content_type]
                    updated_content_item = {
                        'type': content_type,
                        'slug': content_info['slug'],  # Replace title with slug, remove id
                    }
                    updated_content.append(updated_content_item)

                updated_subtopic['content'] = updated_content
                updated_subtopics.append(updated_subtopic)

            updated_journey['subtopics'] = updated_subtopics
            updated_journeys.append(updated_journey)

        return validation_errors, updated_journeys

    def save_updated_journey(self, updated_data: List[Dict[str, Any]]):
        """
        Save the updated journey data with backup of original file.

        Args:
            updated_data: List of updated journey dictionaries
        """
        try:
            # Save updated data
            with open(self.journey_path_new, 'w', encoding='utf-8') as f:
                json.dump(updated_data, f, indent=2, ensure_ascii=False)
            self.logger.info(f"Successfully saved updated journey data to {self.journey_path_new}")

        except Exception as e:
            self.logger.error(f"Error saving updated journey data: {e}")
            raise

    def process(self) -> bool:
        """
        Main processing function to validate and update content references.

        Returns:
            bool: True if processing was successful, False otherwise
        """
        try:
            # Load all content
            self.logger.info("Loading content from all content types...")
            self.load_all_content()

            # Load journey data
            self.logger.info("Loading journey data...")
            with open(self.journey_path, 'r', encoding='utf-8') as f:
                journey_data = json.load(f)

            # Validate and prepare updates
            self.logger.info("Validating content references and preparing updates...")
            validation_errors, updated_journeys = self.validate_and_prepare_updates(journey_data)

            # Handle validation results
            if validation_errors:
                self.logger.error("Found the following content reference errors:")
                for error in validation_errors:
                    self.logger.error(error)
                return False

            # Save updates
            self.logger.info("All content references are valid. Saving updates...")
            self.save_updated_journey(updated_journeys)
            return True

        except Exception as e:
            self.logger.error(f"Error during processing: {e}")
            return False


def main():
    """
    Main function to run the content validation and update process.
    """
    # Define paths
    base_path = ".."  # Parent directory containing content type folders
    journey_path = "./final_content_init.json"
    journey_path_new = "./final_content.json"

    # Initialize and run the validator/updater
    validator = ContentValidatorUpdater(base_path, journey_path, journey_path_new)
    success = validator.process()

    if success:
        print("Successfully validated and updated content references!")
    else:
        print("Failed to complete validation and updates. Check the logs for details.")


if __name__ == "__main__":
    main()
