# Nemlys mobile 

## Installation

1. Install [node.js](https://nodejs.org/en/)
2. Install Expo

   ```jsx
   npm install --global expo-cli
   ```

3. Download this repo
4. Install deps on your template folder

   ```jsx
   npm install
   ```

5. Start the environtment

   ```jsx
   expo start
   ```




## Tips
When you start developing from a new network for oauth to work, you need to add your local ip to 
- https://app.supabase.com/project/rpqzwvkyzulmvvldkqse/auth/url-configuration (add your ip to the Redirect URLs, in the format 'exp://192.168.1.15:19000')
- and src/navigation/index.tsx linking prefixes (if you want to have redirect emails)


## Deploy changes avoiding stores, it will require 2 launches to download the OTA update
- export production envs
- eas update --channel production  



build with expo builds
eas build --profile="development" --platform ios --local 
npx expo start --dev-client