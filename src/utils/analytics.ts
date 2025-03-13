import { IS_SUPABASE_DEV, LANGUAGE_CODE, MIXPANEL_TOKEN } from './constants';
import { Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import Constants from 'expo-constants';
import { Buffer } from 'buffer';
const { width, height } = Dimensions.get('window');
const MIXPANEL_API_URL = 'https://api.mixpanel.com';
const ASYNC_STORAGE_KEY = 'mixpanel:super:props';
import * as Application from 'expo-application';
import * as Network from 'expo-network';
export class ExpoMixpanelAnalytics {
  ready = false;
  token: string;
  userId?: string | null;
  deviceId?: string | null;
  clientId?: string;
  userAgent?: string | null;
  appName?: string;
  appId?: string;
  appVersion?: string;
  screenSize?: string;
  language?: string;
  screenHeight?: string;
  screenWidth?: string;
  deviceName?: string;
  platform?: string;
  ip?: string;
  model?: string;
  osVersion: string | number;
  queue: any[];
  superProps: any = {};

  constructor(token) {
    this.ready = false;
    this.queue = [];

    this.token = token;
    this.clientId = Constants.deviceName;
    this.osVersion = Platform.Version;
    this.language = LANGUAGE_CODE;
    this.appVersion = Constants.expoConfig?.version;
    this.superProps;
    void this.identify();
    void Network.getIpAddressAsync().then((ip) => {
      this.ip = ip;
    });

    void Constants.getWebViewUserAgentAsync().then((userAgent) => {
      this.userAgent = userAgent;
      this.appName = Application.applicationName || '';
      this.screenHeight = height.toString();
      this.screenWidth = width.toString();
      this.platform = Platform.OS;
      this.deviceName = Constants.deviceName;

      void AsyncStorage.getItem(ASYNC_STORAGE_KEY, (_, result) => {
        if (result) {
          try {
            this.superProps = JSON.parse(result) || {};
          } catch {
            /* empty */
          }
        }
        void this._flush()?.then(() => (this.ready = true));
      });
    });
  }

  register(props: any) {
    this.superProps = props;
    void AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(props));
  }

  track(name: string, props?: any) {
    void this._pushEvent({ name, props });
  }

  async identify(userId?: string) {
    this.userId = userId;

    const key = 'secure_deviceid';
    let deviceId = await AsyncStorage.getItem(key);
    if (!deviceId) {
      deviceId = uuidv4().toString();
      await AsyncStorage.setItem(key, deviceId as string);
    }
    this.deviceId = deviceId;
  }

  async reset() {
    await this.identify();
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({}));
  }

  people_set(props) {
    this._people('set', props);
  }

  people_set_once(props) {
    this._people('set_once', props);
  }

  people_unset(props) {
    this._people('unset', props);
  }

  people_increment(props) {
    this._people('add', props);
  }

  people_append(props) {
    this._people('append', props);
  }

  people_union(props) {
    this._people('union', props);
  }

  people_delete_user() {
    this._people('delete', '');
  }

  // ===========================================================================================

  _flush() {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop();
        return this._pushEvent(event)?.then(() => (event.sent = true));
      }
    }
  }

  _people(operation, props) {
    if (this.userId) {
      const data = {
        $token: this.token,
        $distinct_id: this.userId,
      };
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      data[`$${operation}`] = props;

      void this._pushProfile(data);
    }
  }

  async _pushEvent(event) {
    const data = {
      event: event.name,
      properties: {
        ...(event.props || {}),
        ...this.superProps,
      },
    };

    data.properties.$user_id = this.userId;
    data.properties.$device_id = this.deviceId;
    data.properties.$os = `${this.deviceName ?? ''}:${this.osVersion}`;
    data.properties.$screen_height = this.screenHeight;
    data.properties.$screen_width = this.screenWidth;

    data.properties.userId = undefined;
    data.properties.ip = this.ip;
    data.properties.token = this.token;
    data.properties.user_agent = this.userAgent;
    data.properties.app_name = this.appName;
    data.properties.app_id = this.appId;
    data.properties.app_version = this.appVersion;
    data.properties.client_id = this.clientId;
    data.properties.device_name = this.deviceName;
    data.properties.language = this.language;
    if (this.platform) {
      data.properties.platform = this.platform;
    }
    if (this.model) {
      data.properties.model = this.model;
    }
    if (this.osVersion) {
      data.properties.os_version = this.osVersion;
    }

    const buffer = new Buffer(JSON.stringify(data)).toString('base64');
    try {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await fetch(`${MIXPANEL_API_URL}/track/?data=${buffer}&ip=1`);
    } catch (error) {
      console.error('Failed to send Mixpanel event:', error);
    }
  }

  async _pushProfile(data) {
    data = new Buffer(JSON.stringify(data)).toString('base64');
    try {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await fetch(`${MIXPANEL_API_URL}/engage/?data=${data}&ip=1`);
    } catch (error) {
      console.error('Failed to send Mixpanel event:', error);
    }
  }
}

const mixpanel = new ExpoMixpanelAnalytics(MIXPANEL_TOKEN);
const realAnalytics = () => {
  return {
    logEvent: (message: string, properties: object) => {
      mixpanel.track(message, properties);
    },
    setLanguage: (language: string) => {
      mixpanel.language = language;
    },
  };
};
const devAnalytics = () => {
  return {
    logEvent: (message: string, properties: object) => {
      console.log(message, properties);
    },
    setLanguage: (language: string) => {
      console.log(language);
    },
  };
};
export const localAnalytics = IS_SUPABASE_DEV ? devAnalytics : realAnalytics;
export const analyticsIdentifyUser = (userId: string | undefined) => mixpanel.identify(userId);
export const analyticsForgetUser = () => mixpanel.reset();
