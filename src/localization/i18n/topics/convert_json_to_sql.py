import os
import json

def json_to_sql_insert(json_data):
    values = []
    for item in json_data:
        job_slug = item.get('job_slug', '')
        topic = item.get('topic', '')
        language = item.get('language', '')
        values.append(f"('{job_slug}', '{topic}', '{language}')")
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
                                sql_file.write(f"delete from job_topics where language='{language}';\n")
                                sql_file.write("insert into job_topics\n    (\"job_slug\", \"topic\", \"language\") \nvalues\n")
                                sql_file.write(",\n".join(values) + ";\n")

if __name__ == "__main__":
    main()
