import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


import authEN from './locales/en/auth.json';
import commonEN from './locales/en/common.json';
import chatEN from './locales/en/chat.json';
import musicEN from './locales/en/music.json';
import profileEN from './locales/en/profile.json';
import postsEN from './locales/en/posts.json';
import commentsEN from './locales/en/comments.json';
import uiEN from './locales/en/ui.json';
import searchProfilesEN from './locales/en/searchProfiles.json';
import profileGroupEN from './locales/en/profileGroup.json'; 
import adsEN from './locales/en/ads.json'; 
import settingsEN from './locales/en/settings.json'; 

import authES from './locales/es/auth.json';
import commonES from './locales/es/common.json';
import chatES from './locales/es/chat.json';
import musicES from './locales/es/music.json';
import profileES from './locales/es/profile.json';
import postsES from './locales/es/posts.json';
import commentsES from './locales/es/comments.json';
import uiES from './locales/es/ui.json';
import searchProfilesES from './locales/es/searchProfiles.json';
import profileGroupES from './locales/es/profileGroup.json';
import adsES from './locales/es/ads.json';
import settingsES from './locales/es/settings.json';

const resources = {
  en: {
    auth: authEN,
    common: commonEN,
    chat: chatEN,
    music: musicEN,
    profile: profileEN,
    posts: postsEN,
    comments: commentsEN,
    ui: uiEN,
    searchProfiles: searchProfilesEN,
    profileGroup: profileGroupEN,
    ads: adsEN,
    settings: settingsEN
  },
  es: {
    auth: authES,
    common: commonES,
    chat: chatES,
    music: musicES,
    profile: profileES,
    posts: postsES,
    comments: commentsES,
    ui: uiES,
    searchProfiles: searchProfilesES,
    profileGroup: profileGroupES,
    ads: adsES,
    settings: settingsES
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'common', 
    ns: [
      'common', 
      'auth', 
      'chat', 
      'music', 
      'profile', 
      'posts', 
      'comments', 
      'ui', 
      'searchProfiles', 
      'profileGroup', 
      'ads',
      'settings'
    ],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
