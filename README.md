https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=318892102836-igq1mbtfae5v7th2cjlddiu7gdgc33n7.apps.googleusercontent.com&redirect_to=nemlys%3A%2F%2F&redirect_uri=https%3A%2F%2Fkenpblepcyvkwausergf.supabase.co%2Fauth%2Fv1%2Fcallback&response_type=code&scope=email profile&state=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTI5MzA3MzIsInNpdGVfdXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJmdW5jdGlvbl9ob29rcyI6bnVsbCwicHJvdmlkZXIiOiJnb29nbGUiLCJyZWZlcnJlciI6Im5lbWx5czovLyIsImZsb3dfc3RhdGVfaWQiOiIifQ.yXrETQ0QVJ-d7fUYew6JF4PL4-vuyFH8yG2FkQhULTQ&service=lso&o2v=2&theme=mn&ddm=0&flowName=GeneralOAuthFlow


eas build --auto-submit


# dev
to build a development build locally, use
`npx expo run:ios --device` or `npx expo run:android --device`

## auth
for google sign in to work in dev, do not forget to add the sha-1 of the debug.keystore to
https://console.firebase.google.com/u/0/project/nemlys-dev/settings/general/android:com.nemlys.app


# apple sign in
every half a year you need to rate secret key and create secret out of it, here is the instruction for the p8 file
https://developer.apple.com/account/resources/authkeys/list
https://supabase.com/docs/guides/auth/social-login/auth-apple?queryGroups=platform&platform=flutter

## translation guide
when introduce new language translate
language strings
topics
reflection questions
introduce new ASO