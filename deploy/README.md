fastlane folder is used to deploy ASO


this folder has 2 useful scripts:
[translate_notes.py](translate_notes.py)

[release_app_notes.py](release_app_notes.py)

the flow is the following
populate the correct env keys [.env.example](.env.example)
install the python deps from [requirements.txt](requirements.txt)

then, we change "notes": key in [languages.json](languages.json)

then we run [translate_notes.py](translate_notes.py)

then we run [release_app_notes.py](release_app_notes.py)