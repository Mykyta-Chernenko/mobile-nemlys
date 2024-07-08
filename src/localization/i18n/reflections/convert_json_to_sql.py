import os
import json

def json_to_sql_insert(json_data):
    values = []
    for item in json_data:
        slug = item.get('slug', '')
        language = item.get('language', '')
        active = item.get('active', True)
        reflection = item.get('reflection', '').replace("'", "''")
        level = item.get('level', '')
        values.append(f"('{slug}', '{reflection}', '{language}', '{level}', {active})")
    return values

def main():
    json_files = [f for f in os.listdir('.') if f.endswith('.json')]

    for json_file in json_files:
        with open(json_file, 'r', encoding='utf-8') as file:
            data = json.load(file)
            if isinstance(data, list):
                values = json_to_sql_insert(data)
                language = data[0].get('language', 'unknown')
                with open(f"{language}_topics.sql", 'w', encoding='utf-8') as sql_file:
                                sql_file.write(f"delete from reflection_question where language='{language}';\n")
                                sql_file.write("insert into reflection_question\n    (\"slug\", \"reflection\", \"language\", \"level\", \"active\") \nvalues\n")
                                sql_file.write(",\n".join(values) + ";\n")

if __name__ == "__main__":
    main()
