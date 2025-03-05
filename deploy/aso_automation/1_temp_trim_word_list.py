import json
import sys

if len(sys.argv) < 3:
    print("Usage: python script.py input_file.json output_file.json")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

for market in data:
    if isinstance(data[market], dict):
        for locale in data[market]:
            if isinstance(data[market][locale], list):
                data[market][locale] = data[market][locale][:200]

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
