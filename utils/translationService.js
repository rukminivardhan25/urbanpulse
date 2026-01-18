import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

const TRANSLATION_CACHE_KEY = '@urbanpulse_translation_cache';
const TRANSLATION_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Translation Service
 * Provides text translation functionality with caching
 */

/**
 * Get cached translation
 */
const getCachedTranslation = async (text, sourceLang, targetLang) => {
  try {
    const cache = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!cache) return null;

    const cacheData = JSON.parse(cache);
    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    const cached = cacheData[cacheKey];

    if (cached && Date.now() - cached.timestamp < TRANSLATION_CACHE_EXPIRY) {
      return cached.translation;
    }

    return null;
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return null;
  }
};

/**
 * Save translation to cache
 */
const saveCachedTranslation = async (text, sourceLang, targetLang, translation) => {
  try {
    const cache = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    const cacheData = cache ? JSON.parse(cache) : {};

    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    cacheData[cacheKey] = {
      translation,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving translation cache:', error);
  }
};

/**
 * Translate text using Google Translate API (free tier available)
 * For production, you'll need a Google Cloud API key
 * Alternative: Use LibreTranslate (free, open-source) or MyMemory API
 */
const translateWithAPI = async (text, sourceLang, targetLang) => {
  if (!text || sourceLang === targetLang) {
    return text;
  }

  try {
    // Option 1: Google Translate API (requires API key)
    // Uncomment and configure if you have a Google Cloud API key
    /*
    const GOOGLE_TRANSLATE_API_KEY = 'YOUR_API_KEY_HERE';
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
    */

    // Option 2: MyMemory Translation API (free, no API key required)
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(myMemoryUrl);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }

    throw new Error('Translation API failed');
  } catch (error) {
    console.error('Translation API error:', error);
    // Fallback: return original text
    return text;
  }
};

/**
 * Translate text with caching
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (e.g., 'en', 'hi', 'te')
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, sourceLang = 'en', targetLang = 'en') => {
  if (!text || !text.trim()) {
    return text;
  }

  if (sourceLang === targetLang) {
    return text;
  }

  // Check cache first
  const cached = await getCachedTranslation(text, sourceLang, targetLang);
  if (cached) {
    return cached;
  }

  // Translate using API
  const translation = await translateWithAPI(text, sourceLang, targetLang);

  // Save to cache
  if (translation && translation !== text) {
    await saveCachedTranslation(text, sourceLang, targetLang, translation);
  }

  return translation;
};

/**
 * Translate multiple texts at once
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} Array of translated texts
 */
export const translateMultiple = async (texts, sourceLang = 'en', targetLang = 'en') => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return texts;
  }

  const translations = await Promise.all(
    texts.map(text => translateText(text, sourceLang, targetLang))
  );

  return translations;
};

/**
 * Detect language of text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} Detected language code
 */
export const detectLanguage = async (text) => {
  if (!text || !text.trim()) {
    return 'en';
  }

  try {
    // Using MyMemory API for language detection
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseData && data.responseData.detectedSourceLanguage) {
      return data.responseData.detectedSourceLanguage;
    }

    return 'en'; // Default fallback
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = async () => {
  try {
    await AsyncStorage.removeItem(TRANSLATION_CACHE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing translation cache:', error);
    return false;
  }
};




