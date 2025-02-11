// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...getDefaultConfig(__dirname),
  ...getSentryExpoConfig(__dirname, {
    annotateReactComponents: true,
  }),
};

module.exports = config;
