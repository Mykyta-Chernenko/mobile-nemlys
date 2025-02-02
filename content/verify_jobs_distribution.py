import json
import os
from typing import List, Dict

JOBS = [
    "getting_to_know_partner",
    "having_fun_and_entertainment",
    "having_and_discussing_sex",
    "understanding_mutual_compatibility",
    "improving_communication",
    "solving_relationship_problems",
    "having_meaningful_conversations",
    "discussing_difficult_topics",
    "planning_for_future",
    "building_trust",
    "overcoming_differences",
    "improving_relationship_satisfaction",
    "exploring_feelings",
    "having_new_experiences",
    "preparing_for_cohabitation",
    "preparing_for_intimacy",
    "discussing_religions",
    "improving_honesty_and_openness",
    "learning_relationship_skills",
    "discussing_finances",
    "enhancing_love_and_affection",
    "rekindling_passion",
    "introducing_healthy_habits",
    "preparing_for_children",
    "preparing_for_marriage"
]

LANGUAGES = [
    "en",
    "es",
    "nl",
    "de",
    "it",
    "fr",
    "ar",
    "bn",
    "zh_cn",
    "zh_tw",
    "zh_hk",
    "hi",
    "ja",
    "pt",
    "fil",
    "id",
    "pl",
    "ro",
    "tr",
    "uk",
    "ru",
    "vi",
    "no",
    "af",
    "sq",
    "hy",
    "az",
    "eu",
    "be",
    "bg",
    "my",
    "ca",
    "hr",
    "cs",
    "da",
    "et",
    "fi",
    "gl",
    "ka",
    "el",
    "gu",
    "he",
    "hu",
    "is",
    "kn",
    "kk",
    "km",
    "ko",
    "ky",
    "lv",
    "lt",
    "mk",
    "ms",
    "mr",
    "mn",
    "ne",
    "fa",
    "pa",
    "sr",
    "si",
    "sk",
    "sl",
    "sw",
    "sv",
    "ta",
    "te",
    "th",
    "ur",
    "zu",
    "am",
    "ml",
    "rm",
]

CONTENT_TYPES = [
    'question',
    'checkup',
    'article',
    'exercise',
    'test',
    'game',
]

content_per_job = {
    'question': 30,
    'checkup': 5,
    'article': 3,
    'exercise': 3,
    'test': 5,
    'game': 5,
}


def read_content_json(source_dir) -> List[Dict]:
    with open(source_dir, 'r', encoding='utf-8') as f:
        return json.load(f)


def check_first_job_has_enough_entires_for_content():
    for lang in LANGUAGES:
        print(f"\nProcessing language: {lang}")
        for content_type in CONTENT_TYPES:
            print(f"\nProcessing content_type: {content_type}")
            needed_content_per_job = content_per_job[content_type]
            source_dir = os.path.join('.', lang, content_type, 'final_content.json')
            with open(source_dir, 'r', encoding='utf-8') as f:
                content = json.load(f)
                jobs_dict = {key: 0 for key in JOBS}
                for item in content:
                    job: str = item['job'][0]
                    if job in jobs_dict:
                        jobs_dict[job] += 1
                    if len(item['job']) > 1:
                        second_job: str = item['job'][1]
                        if second_job in jobs_dict:
                            jobs_dict[second_job] += 1
                    # if len(item['job']) > 2:
                    #     third_job: str = item['job'][2]
                    #     jobs_dict[third_job] += 1
                print(jobs_dict)
                for key, value in jobs_dict.items():
                    if value < needed_content_per_job:
                        if (key == 'getting_to_know_partner' or key == 'having_meaningful_conversations' or key == 'preparing_for_cohabitation') and content_type == 'checkup':
                            continue
                        raise Exception(
                            f"language {lang}, content type {content_type}, job {key} has only {value} items")
    print('all fine')


def main():
    check_first_job_has_enough_entires_for_content()


main()
