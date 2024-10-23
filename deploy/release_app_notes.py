import json
import os
import re
from typing import Dict
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import requests
import jwt
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables
GOOGLE_PLAY_JSON_KEY = os.getenv('GOOGLE_PLAY_JSON_KEY')
APP_STORE_KEY_ID = os.getenv('APP_STORE_KEY_ID')
APP_STORE_ISSUER_ID = os.getenv('APP_STORE_ISSUER_ID')
APP_STORE_KEY_FILE = os.getenv('APP_STORE_KEY_FILE')


def read_private_key(key_file: str) -> str:
    with open(key_file, 'r') as file:
        return file.read()

def create_token(key_id: str, issuer_id: str, private_key: str) -> str:
    token = jwt.encode(
        {
            'iss': issuer_id,
            'exp': int(time.time()) + 20 * 60,  # 20 minute expiration
            'aud': 'appstoreconnect-v1'
        },
        private_key,
        algorithm='ES256',
        headers={
            'kid': key_id
        }
    )
    return token

class CustomApi:
    BASE_URL = "https://api.appstoreconnect.apple.com/v1"

    def __init__(self, key_id: str, issuer_id: str, private_key: str):
        self.key_id = key_id
        self.issuer_id = issuer_id
        self.private_key = private_key

    def _get_headers(self):
        token = create_token(self.key_id, self.issuer_id, self.private_key)
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

    def get_app_id(self, bundle_id: str) -> str:
        url = f"{self.BASE_URL}/apps"
        params = {"filter[bundleId]": bundle_id}
        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()
        data = response.json()
        return data['data'][0]['id']

    def get_app_version(self, app_id: str, version: str) -> str:
        url = f"{self.BASE_URL}/apps/{app_id}/appStoreVersions"
        params = {
            "filter[versionString]": version,
            "filter[platform]": "IOS"
        }
        response = requests.get(url, headers=self._get_headers(), params=params)
        response.raise_for_status()
        data = response.json()
        if data['data']:
            return data['data'][0]['id']
        return None

    def delete_app_version(self, version_id):
        delete_url = f"{self.BASE_URL}/appStoreVersions/{version_id}"
        delete_response = requests.delete(delete_url, headers=self._get_headers())
        delete_response.raise_for_status()

    def create_or_update_app_version(self, app_id: str, version: str) -> str:
        existing_version_id = self.get_app_version(app_id, version)
        if existing_version_id:
#             print(f"Version {version} already exists {existing_version_id}. removing existing version.")
#             self.delete_app_version(existing_version_id)

            print(f"Version {version} already exists {existing_version_id}. Updating existing version.")
            return existing_version_id

        url = f"{self.BASE_URL}/appStoreVersions"
        payload = {
            "data": {
                "type": "appStoreVersions",
                "attributes": {
                    "platform": "IOS",
                    "versionString": version
                },
                "relationships": {
                    "app": {
                        "data": {
                            "id": app_id,
                            "type": "apps"
                        }
                    }
                }
            }
        }
        response = requests.post(url, headers=self._get_headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        return data['data']['id']

    def update_app_version_localization(self, version_id: str, locale: str, what_s_new: str):
        url = f"{self.BASE_URL}/appStoreVersionLocalizations"
        app_store_locale = locale

        # Attempt to create a new localization
        payload = {
            "data": {
                "type": "appStoreVersionLocalizations",
                "attributes": {
                    "locale": app_store_locale,
                    "whatsNew": what_s_new
                },
                "relationships": {
                    "appStoreVersion": {
                        "data": {
                            "id": version_id,
                            "type": "appStoreVersions"
                        }
                    }
                }
            }
        }
        response = requests.post(url, headers=self._get_headers(), json=payload)

        if response.status_code == 409:  # Conflict error, localization already exists
            print(f"Localization for {app_store_locale} already exists. Updating...")
            # Get the existing localizations for this version
            get_url = f"{self.BASE_URL}/appStoreVersions/{version_id}/appStoreVersionLocalizations"
            get_response = requests.get(get_url, headers=self._get_headers())
            get_response.raise_for_status()
            localizations = get_response.json()['data']

            # Find the ID of the existing localization for this locale
            existing_localization = next(
                (loc['id'] for loc in localizations if loc['attributes']['locale'] == app_store_locale), None)

            if existing_localization:
                # Update the existing localization
                update_url = f"{self.BASE_URL}/appStoreVersionLocalizations/{existing_localization}"
                update_payload = {
                    "data": {
                        "type": "appStoreVersionLocalizations",
                        "id": existing_localization,
                        "attributes": {
                            "whatsNew": what_s_new
                        }
                    }
                }
                response = requests.patch(update_url, headers=self._get_headers(), json=update_payload)
            else:
                print(f"Couldn't find existing localization for {app_store_locale}")
                return

        if response.status_code not in [200, 201]:
            print(f"Error updating localization for {app_store_locale}: {response.status_code}")
            print(f"Response content: {response.content}")
        else:
            print(f"Successfully updated localization for {app_store_locale}")
def read_app_json() -> Dict[str, str]:
    with open('../app.json', 'r') as f:
        data = json.load(f)
    return {
        'version': data.get('expo', {}).get('version', ''),
        'a_version': data.get('expo', {}).get('android', {}).get('versionCode', ''),
        'notes': data.get('expo', {}).get('releaseNotes', ''),
        'ios': {
            'bundleIdentifier': data.get('expo', {}).get('ios', {}).get('bundleIdentifier', '')
        },
        'android': {
            'package': data.get('expo', {}).get('android', {}).get('package', '')
        }
    }

def read_languages_json() -> Dict[str, Dict[str, str]]:
    with open('./languages.json', 'r') as f:
        return json.load(f)

def update_play_store(package_name: str, version: str, release_notes: Dict[str, str]):
    credentials = service_account.Credentials.from_service_account_file(
        GOOGLE_PLAY_JSON_KEY, scopes=['https://www.googleapis.com/auth/androidpublisher'])

    service = build('androidpublisher', 'v3', credentials=credentials)

    try:
        edit_request = service.edits().insert(body={}, packageName=package_name)
        result = edit_request.execute()
        edit_id = result['id']

        service.edits().tracks().update(
            editId=edit_id,
            track='production',
            packageName=package_name,
            body={
                "releases": [{
                    "versionCodes": [version],
                    "status": "completed",
                    "releaseNotes": [{"language": lang, "text": notes} for lang, notes in release_notes.items()]
                }]
            }
        ).execute()

        service.edits().commit(editId=edit_id, packageName=package_name).execute()
        print(f"Successfully updated Play Store for version {version}")
    except HttpError as e:
        print(f"Error updating Play Store: {e}")

def update_app_store(bundle_id: str, version: str, release_notes: Dict[str, str]):
    try:
        private_key = read_private_key(APP_STORE_KEY_FILE)
        api = CustomApi(APP_STORE_KEY_ID, APP_STORE_ISSUER_ID, private_key)

        app_id = api.get_app_id(bundle_id)
        version_id = api.create_or_update_app_version(app_id, version)

        def update_localization(lang_notes):
            lang, notes = lang_notes
            try:
                cleaned_notes = remove_emojis(notes)
                api.update_app_version_localization(version_id, lang, cleaned_notes)
            except Exception as e:
                print(f"Error updating localization for {lang}: {str(e)}")
                if hasattr(e, 'response'):
                    print(f"Response content: {e.response.content}")

        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(update_localization, item) for item in release_notes.items()]
            for future in as_completed(futures):
                future.result()  # This will raise any exceptions that occurred during execution

        print(f"Finished updating App Store for version {version}")
    except Exception as e:
        print(f"Error updating App Store: {e}")
        if hasattr(e, 'response'):
            print(f"Response content: {e.response.content}")

def remove_emojis(text):
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F" # emojis
       u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)
def main():
    app_data = read_app_json()
    version = app_data['version']
    a_version = app_data['a_version']
    ios_bundle_id = app_data['ios']['bundleIdentifier']
    android_package = app_data['android']['package']

    languages_data = read_languages_json()
    play_market_notes = languages_data['play_market']
    app_store_notes = languages_data['app_store']

    update_play_store(android_package, a_version, play_market_notes)
    update_app_store(ios_bundle_id, version, app_store_notes)

if __name__ == "__main__":
    main()