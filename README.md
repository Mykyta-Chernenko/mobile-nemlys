# deploy
1) bump version in the app.json (version, buildNumber, versionCode), runtimeVersion in case a new native library is used, the version are important later for the OTA updates, so read up about it
2) `eas build --auto-submit` (you will need expo account for that, I used a free account with waiting times, the production build can be also done locally, but I've never done it)

# dev
ios and android folders are transient, they can be removed and recreated from scratch, therefore, they should not be changed, 
and it will be erased during the expo build and deploy process
1) `npm install`
2) `npx expo run:ios --device` or `npx expo run:android --device` (building a dev build and installing on a device)
3) `npx expo start`


# Intro
[MainStack.tsx](src/navigation/MainStack.tsx) is a good place to see the overview of the screens that are in use,
and comments which screens come from v2 and which come from v3


## auth
for google sign in to work in dev, do not forget to add the sha-1 of the debug.keystore to
https://console.firebase.google.com/u/0/project/nemlys-dev/settings/general/android:com.nemlys.app


# apple sign in
every half a year you need to rotate secret key and create secret out of it, here is the instruction for the p8 file
https://developer.apple.com/account/resources/authkeys/list
https://developer.apple.com/account/resources/authkeys/add
add a new sign in key
Account ID:
ZKX3P2M839
service id: 	
app.com.marakaci.nemlys
https://supabase.com/docs/guides/auth/social-login/auth-apple?queryGroups=platform&platform=flutter

## translations
to translate new in-app strings, you can do the following
1) `cd src/localization/i18n/scripts`
2) `python3.11 sync_translations.py`
`python3.11 show_unused_translations.py` will show you translations trings that are not in use

## revenue cat details
[nemlys-prod-b280691fe04e.json](nemlys-prod-b280691fe04e.json) is the android config key for revenuecat
[AuthKey_TZWR4NBM55.p8](AuthKey_TZWR4NBM55.p8) is the equivalent for ios