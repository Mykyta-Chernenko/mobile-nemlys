import os
import re
import time
import json
import requests
import jwt
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import google.auth.transport.requests

GOOGLE_PLAY_JSON_KEY = os.getenv('GOOGLE_PLAY_JSON_KEY')
APP_STORE_KEY_ID = os.getenv('APP_STORE_KEY_ID')
APP_STORE_ISSUER_ID = os.getenv('APP_STORE_ISSUER_ID')
APP_STORE_KEY_FILE = os.getenv('APP_STORE_KEY_FILE')

def read_app_json() -> dict:
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

def read_languages_json() -> dict:
    with open('./languages.json', 'r') as f:
        return json.load(f)

app_data = read_app_json()
version = app_data['version']
a_version = app_data['a_version']
ios_bundle_id = app_data['ios']['bundleIdentifier']
android_package = app_data['android']['package']
languages_data = read_languages_json()
app_store_notes = languages_data['app_store']
play_market_notes = languages_data['play_market']
ios_locales = list(app_store_notes.keys())
android_locales = list(play_market_notes.keys())

def gather_screens() -> dict:
    screens_dir = "./screens"
    pattern = re.compile(r"^([a-zA-Z0-9\-]+)_(6\.5|12\.9)_\d+\.png$")
    grouped = {}
    for f in os.listdir(screens_dir):
        if not f.endswith(".png"):
            continue
        m = pattern.match(f)
        if not m:
            continue
        loc, size = m.group(1), m.group(2)
        path = os.path.join(screens_dir, f)
        grouped.setdefault(loc, {}).setdefault(size, []).append(path)
    return grouped

def read_private_key(path: str) -> str:
    with open(path, 'r') as f:
        return f.read()

def create_appstore_token() -> str:
    pk = read_private_key(APP_STORE_KEY_FILE)
    payload = {"iss": APP_STORE_ISSUER_ID, "exp": int(time.time()) + 20 * 60, "aud": "appstoreconnect-v1"}
    return jwt.encode(payload, pk, algorithm="ES256", headers={"kid": APP_STORE_KEY_ID})

def get_appstore_headers() -> dict:
    token = create_appstore_token()
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def get_ios_app_id() -> str:
    url = f"https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]={ios_bundle_id}"
    r = requests.get(url, headers=get_appstore_headers())
    r.raise_for_status()
    data = r.json()
    if data.get("data") and len(data["data"]) > 0:
        return data["data"][0]["id"]
    raise Exception("App not found for bundle id")

def create_or_update_ios_version(app_id: str, ver: str) -> str:
    url = f"https://api.appstoreconnect.apple.com/v1/apps/{app_id}/appStoreVersions?filter[versionString]={ver}&filter[platform]=IOS"
    r = requests.get(url, headers=get_appstore_headers())
    r.raise_for_status()
    data = r.json()
    if data.get("data") and len(data["data"]) > 0:
        return data["data"][0]["id"]
    url = "https://api.appstoreconnect.apple.com/v1/appStoreVersions"
    payload = {
        "data": {
            "type": "appStoreVersions",
            "attributes": {"platform": "IOS", "versionString": ver},
            "relationships": {"app": {"data": {"id": app_id, "type": "apps"}}}
        }
    }
    r = requests.post(url, headers=get_appstore_headers(), json=payload)
    r.raise_for_status()
    return r.json()["data"]["id"]

def get_or_create_ios_screenshot_set(app_id: str, version_localization_id: str, display_type: str) -> str:
    base_url = "https://api.appstoreconnect.apple.com/v1/appScreenshotSets"
    payload = {
        "data": {
            "type": "appScreenshotSets",
            "attributes": {"screenshotDisplayType": display_type},
            "relationships": {
                "appStoreVersionLocalization": {
                    "data": {"type": "appStoreVersionLocalizations", "id": version_localization_id}
                }
            }
        }
    }

    headers = get_appstore_headers()
    response = requests.post(base_url, headers=headers, json=payload)

    if response.status_code == 201:
        return response.json()["data"]["id"]

    elif response.status_code == 409:
        params = {
            "filter[appStoreVersionLocalization]": version_localization_id,
            "filter[screenshotDisplayType]": display_type
        }
        get_response = requests.get(base_url, headers=headers, params=params)
        get_response.raise_for_status()
        data = get_response.json().get("data", [])
        if data:
            return data[0]["id"]
        else:
            raise Exception("Conflict detected but no existing screenshot set found.")

    else:
        response.raise_for_status()


def upload_ios_screenshot(file_path: str, screenshot_set_id: str) -> bool:
    filename = os.path.basename(file_path)
    filesize = os.path.getsize(file_path)
    url = "https://api.appstoreconnect.apple.com/v1/appScreenshots"
    payload = {
        "data": {
            "type": "appScreenshots",
            "attributes": {"fileName": filename, "fileSize": filesize},
            "relationships": {"appScreenshotSet": {"data": {"type": "appScreenshotSets", "id": screenshot_set_id}}}
        }
    }
    r = requests.post(url, headers=get_appstore_headers(), json=payload)
    if r.status_code not in (200, 201):
        return False
    data = r.json()["data"]
    ops = data.get("attributes", {}).get("uploadOperations", [])
    if not ops:
        return False
    with open(file_path, "rb") as f:
        file_data = f.read()
    success = True
    for op in ops:
        upload_url = op.get("url")
        method = op.get("method")
        offset = op.get("offset", 0)
        length = op.get("length", len(file_data))
        req_headers = op.get("requestHeaders", {})
        chunk = file_data[offset:offset+length]
        resp = requests.request(method, upload_url, headers=req_headers, data=chunk)
        if resp.status_code not in (200, 201, 204):
            success = False
    return success

def get_ios_version_localization_id(version_id: str, locale: str) -> str:
    """
    Retrieve the App Store version localization ID for a given version and locale.
    """
    url = (
        f"https://api.appstoreconnect.apple.com/v1/appStoreVersions/{version_id}/appStoreVersionLocalizations"
        f"?filter[locale]={locale}"
    )
    r = requests.get(url, headers=get_appstore_headers())
    r.raise_for_status()
    data = r.json().get("data", [])
    if not data:
        raise Exception(f"No localization found for locale '{locale}' and version '{version_id}'.")
    return data[0]["id"]

def upload_ios_screenshots(grouped: dict, summary: dict):
    try:
        app_id = get_ios_app_id()
        version_id = create_or_update_ios_version(app_id, version)
    except Exception as e:
        print("Error getting app or version:", e)
        for loc in ios_locales:
            summary[loc] = False
        return

    mapping = {"6.5": "IPHONE_6_5", "12.9": "IPAD_PRO_12_9"}
    for loc in ios_locales:
        # Get the localization ID for this locale and version.
        try:
            localization_id = get_ios_version_localization_id(version_id, loc)
        except Exception as e:
            print(f"Localization not found for {loc}: {e}")
            summary[loc] = False
            continue

        for size, disp in mapping.items():
            if loc not in grouped or size not in grouped[loc]:
                continue
            try:
                # Pass the localization ID (not the version_id) to the screenshot set call.
                ss_set = get_or_create_ios_screenshot_set(app_id, localization_id, disp)
            except Exception as e:
                print(e)
                summary.setdefault(loc, {})[size] = False
                continue
            for file_path in grouped[loc][size]:
                res = upload_ios_screenshot(file_path, ss_set)
                summary.setdefault(loc, {})[size] = res
                print(f"iOS {loc} {size}: {'Success' if res else 'Failed'}")

def build_android_service():
    creds = service_account.Credentials.from_service_account_file(
        GOOGLE_PLAY_JSON_KEY, scopes=["https://www.googleapis.com/auth/androidpublisher"]
    )
    return build('androidpublisher', 'v3', credentials=creds)

def create_android_edit(service, package: str) -> (str, object):
    edit = service.edits().insert(body={}, packageName=package).execute()
    return edit["id"], service

def upload_android_screenshots(grouped: dict, summary: dict):
    service = build_android_service()
    try:
        edit_id, svc = create_android_edit(service, android_package)
    except Exception:
        for loc in android_locales:
            summary[loc] = False
        return
    mapping = {"6.5": "phoneScreenshots", "12.9": "tenInchScreenshots"}
    for loc in android_locales:
        if loc not in grouped:
            continue
        success = True
        for size, image_type in mapping.items():
            if size not in grouped[loc]:
                continue
            for file_path in grouped[loc][size]:
                media = MediaFileUpload(file_path, mimetype='image/png')
                try:
                    svc.edits().images().upload(
                        packageName=android_package,
                        editId=edit_id,
                        language=loc,
                        imageType=image_type,
                        media_body=media
                    ).execute()
                    print(f"Android {loc} {size}: Success")
                except Exception as e:
                    success = False
                    print(f"Android {loc} {size}: Failed - {e}")
        summary[loc] = success
    try:
        svc.edits().commit(packageName=android_package, editId=edit_id).execute()
    except Exception as e:
        print("Commit failed:", e)

def main():
    grouped = gather_screens()
    ios_summary = {}
    android_summary = {}
    print("Starting iOS upload")
    upload_ios_screenshots(grouped, ios_summary)
    print("Starting Android upload")
    upload_android_screenshots(grouped, android_summary)
    print("Upload Summary:")
    print("iOS Screenshots:")
    for loc in ios_locales:
        if loc in ios_summary:
            for size, status in ios_summary[loc].items():
                print(f"{loc} {size}: {'Success' if status else 'Failed'} (version: {version})")
    print("Android Screenshots:")
    for loc in android_locales:
        if loc in android_summary:
            print(f"{loc}: {'Success' if android_summary[loc] else 'Failed'} (version: {a_version})")

if __name__ == "__main__":
    main()