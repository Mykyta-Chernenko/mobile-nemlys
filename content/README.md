en folder is the source folder for the content

the scripts in this folder are intended and working as a one-off script, and are not intended to be run continuously.
If they are run again, they will over write the content in the database, which will remove the use responses to the content.
so DO NOT RUN THEM. Only user for reference if you want to create more content.

but for the reference, the order of them is about the following:

in en folder in a dedicated content type, we first generate content, sometimes with multiple scripts in multiple steps:
for example

[generate_content.py](en/test/generate_content.py)
[generate_content_with_interpretation.py](en/test/generate_content_with_interpretation.py)

then we copy the content into the file (manually)
[final_content.json](en/test/final_content.json)

then we add slugs with 
[add_slugs.py](en/add_slugs.py)

then we use script from the root content folder to translate
[translate_test.py](translate_test.py)

then we insert (CAREFUL,THIS OVERWRITES DB)
[insert_content.py](insert_content.py)