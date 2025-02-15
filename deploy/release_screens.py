import os
import re
import time
import json
import requests
import jwt
import concurrent.futures
import hashlib

APP_STORE_KEY_ID = os.getenv("APP_STORE_KEY_ID")
APP_STORE_ISSUER_ID = os.getenv("APP_STORE_ISSUER_ID")
APP_STORE_KEY_FILE = os.getenv("APP_STORE_KEY_FILE")

def read_app_json() -> dict:
    with open("../app.json", "r") as f:
        data = json.load(f)
    return {
        "version": data.get("expo", {}).get("version", ""),
        "ios": {"bundleIdentifier": data.get("expo", {}).get("ios", {}).get("bundleIdentifier", "")}
    }

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
    with open(path, "r") as f:
        return f.read()

def create_appstore_token() -> str:
    pk = read_private_key(APP_STORE_KEY_FILE)
    payload = {
        "iss": APP_STORE_ISSUER_ID,
        "exp": int(time.time()) + 20 * 60,
        "aud": "appstoreconnect-v1"
    }
    return jwt.encode(payload, pk, algorithm="ES256", headers={"kid": APP_STORE_KEY_ID})

def get_appstore_headers() -> dict:
    token = create_appstore_token()
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def get_ios_app_id() -> str:
    app_data = read_app_json()
    ios_bundle_id = app_data["ios"]["bundleIdentifier"]
    url = f"https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]={ios_bundle_id}"
    r = requests.get(url, headers=get_appstore_headers())
    r.raise_for_status()
    data = r.json()
    if data.get("data") and len(data["data"]) > 0:
        return data["data"][0]["id"]
    raise Exception("App not found for bundle id")

def create_or_update_ios_version(app_id: str, ver: str) -> str:
    url = (
        f"https://api.appstoreconnect.apple.com/v1/apps/{app_id}/appStoreVersions"
        f"?filter[versionString]={ver}&filter[platform]=IOS"
    )
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
            "relationships": {"app": {"data": {"id": app_id, "type": "apps"}}},
        }
    }
    r = requests.post(url, headers=get_appstore_headers(), json=payload)
    r.raise_for_status()
    return r.json()["data"]["id"]

def get_ios_version_localization_id(version_id: str, locale: str) -> str:
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

def create_ios_screenshot_set(localization_id: str, display_type: str) -> str:
    url = "https://api.appstoreconnect.apple.com/v1/appScreenshotSets"
    payload = {
        "data": {
            "type": "appScreenshotSets",
            "attributes": {"screenshotDisplayType": display_type},
            "relationships": {
                "appStoreVersionLocalization": {
                    "data": {"type": "appStoreVersionLocalizations", "id": localization_id}
                }
            },
        }
    }
    r = requests.post(url, headers=get_appstore_headers(), json=payload)
    r.raise_for_status()
    return r.json()["data"]["id"]

def get_existing_ios_screenshot_set(localization_id: str, display_type: str) -> str:
    url = (
        f"https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/{localization_id}"
        f"?include=appScreenshotSets&fields[appScreenshotSets]=screenshotDisplayType"
    )
    r = requests.get(url, headers=get_appstore_headers())
    r.raise_for_status()
    data = r.json()
    included = data.get("included", [])
    for item in included:
        if item.get("type") == "appScreenshotSets":
            if item.get("attributes", {}).get("screenshotDisplayType") == display_type:
                return item.get("id")
    print(f"No screenshot set found for display type {display_type} in localization {localization_id}. Creating one.")
    return create_ios_screenshot_set(localization_id, display_type)

def upload_ios_screenshot(file_path: str, screenshot_set_id: str) -> bool:
    filename = os.path.basename(file_path)
    filesize = os.path.getsize(file_path)
    reservation_url = "https://api.appstoreconnect.apple.com/v1/appScreenshots"
    payload = {
        "data": {
            "type": "appScreenshots",
            "attributes": {"fileName": filename, "fileSize": filesize},
            "relationships": {"appScreenshotSet": {"data": {"type": "appScreenshotSets", "id": screenshot_set_id}}},
        }
    }
    res = requests.post(reservation_url, headers=get_appstore_headers(), json=payload)
    if res.status_code not in (200, 201):
        print(f"Reservation creation failed for {file_path}")
        return False
    data = res.json()["data"]
    reservation_id = data["id"]
    ops = data.get("attributes", {}).get("uploadOperations", [])
    if not ops:
        print(f"No upload operations returned for {file_path}")
        return False
    with open(file_path, "rb") as f:
        file_data = f.read()

    def upload_chunk(op):
        upload_url = op.get("url")
        method = op.get("method")
        offset = op.get("offset", 0)
        length = op.get("length", len(file_data))
        req_headers = op.get("requestHeaders", {})
        chunk = file_data[offset : offset + length]
        r = requests.request(method, upload_url, headers=req_headers, data=chunk)
        return r.status_code in (200, 201, 204)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(upload_chunk, ops))
    if not all(results):
        print(f"One or more upload operations failed for {file_path}")
        return False

    checksum = hashlib.md5(file_data).hexdigest()
    commit_url = f"https://api.appstoreconnect.apple.com/v1/appScreenshots/{reservation_id}"
    commit_payload = {
        "data": {
            "type": "appScreenshots",
            "id": reservation_id,
            "attributes": {"sourceFileChecksum": checksum, "isUploaded": True},
        }
    }
    commit_resp = requests.patch(commit_url, headers=get_appstore_headers(), json=commit_payload)
    if commit_resp.status_code not in (200, 201):
        print(f"Commit failed for {file_path}")
        return False
    return True

def upload_ios_screenshots_en_gb(grouped: dict, version: str):
    try:
        app_id = get_ios_app_id()
        version_id = create_or_update_ios_version(app_id, version)
        localization_id = get_ios_version_localization_id(version_id, "en-GB")
    except Exception as e:
        print("Error during setup:", e)
        return
    mapping = {"6.5": "IPHONE_6_5", "12.9": "IPAD_PRO_12_9"}
    overall_results = {}
    for size, display_type in mapping.items():
        if "en-GB" not in grouped or size not in grouped["en-GB"]:
            continue
        try:
            screenshot_set_id = get_existing_ios_screenshot_set(localization_id, display_type)
        except Exception as e:
            print(f"Error retrieving screenshot set for {display_type}: {e}")
            continue
        file_paths = grouped["en-GB"][size]
        results = {}
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_path = {
                executor.submit(upload_ios_screenshot, fp, screenshot_set_id): fp for fp in file_paths
            }
            for future in concurrent.futures.as_completed(future_to_path):
                fp = future_to_path[future]
                try:
                    res = future.result()
                    results[fp] = res
                    print(f"en-GB {size} {fp}: {'Success' if res else 'Failed'}")
                except Exception as e:
                    results[fp] = False
                    print(f"en-GB {size} {fp}: Exception {e}")
        overall_results[size] = results
    return overall_results

def main():
    app_data = read_app_json()
    version = app_data["version"]
    grouped = gather_screens()
    print("Starting iOS upload for en-GB")
    results = upload_ios_screenshots_en_gb(grouped, version)
    print("Upload Summary for en-GB:")
    if results:
        for size, files in results.items():
            for fp, status in files.items():
                print(f"{size} {fp}: {'Success' if status else 'Failed'}")
    else:
        print("No screenshots uploaded.")

if __name__ == "__main__":
    main()
