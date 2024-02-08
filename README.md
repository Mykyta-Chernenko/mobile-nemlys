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
4. brew install direnv; 
For zsh, add this to the end of ~/.zshrc:
eval "$(direnv hook zsh)"
npm install -g dotenv-cli

5. Start the environtment

   ```jsx
   expo start
   ```




## Tips
When you start developing from a new network for oauth to work, you need to add your local ip to 
- https://app.supabase.com/project/rpqzwvkyzulmvvldkqse/auth/url-configuration (add your ip to the Redirect URLs, in the format 'exp://192.168.1.15:19000')
- and src/navigation/index.tsx linking prefixes (if you want to have redirect emails)


## Deploy changes without store
- export production envs
- eas update --channel production  


## important
When you rotate a secret key in apple, you need to also generate new jwt out of this key for supabase
https://supabase.com/docs/guides/auth/social-login/auth-apple