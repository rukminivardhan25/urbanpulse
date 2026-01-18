import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultLanguage } from '../constants/languages';
import { getTranslation } from '../constants/translations';

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = '@urbanpulse_language';
const TRANSLATION_CACHE_KEY = '@urbanpulse_translation_cache';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [translationCache, setTranslationCache] = useState({});
  const [textRegistry, setTextRegistry] = useState(new Map());
  const [updateTrigger, setUpdateTrigger] = useState(0); // Force re-render trigger

  // Load language preference and cache on mount
  useEffect(() => {
    loadLanguagePreference();
    loadTranslationCache();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslationCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
      if (cached) {
        setTranslationCache(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading translation cache:', error);
    }
  };

  const saveTranslationCache = async (cache) => {
    try {
      await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  };

  // Generate cache key
  const getCacheKey = (text, sourceLang, targetLang) => {
    return `${sourceLang}_${targetLang}_${text}`;
  };

  // Translation engine (using local translations for now)
  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    if (sourceLang === targetLang || !text) return text;

    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    
    // Check cache first
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // For now, return text as-is (will be replaced with actual translation API)
    // In production, call translation API here
    const translated = await callTranslationAPI(text, sourceLang, targetLang);
    
    // Update cache
    const newCache = { ...translationCache, [cacheKey]: translated };
    setTranslationCache(newCache);
    saveTranslationCache(newCache);

    return translated;
  }, [translationCache]);

  // Translation using local translation files
  const callTranslationAPI = async (text, sourceLang, targetLang) => {
    // Try to find translation key from text
    // For now, we'll use a simple lookup
    // In production, you might want to maintain a reverse mapping
    
    // If text matches a known translation key pattern, use it
    // Otherwise, return text as-is (fallback)
    
    // For keys like 'landing.welcome', use translation files
    // For dynamic text, you might need API translation
    return text;
  };

  // Register text for translation tracking
  const registerText = useCallback((id, text) => {
    setTextRegistry(prev => {
      const newRegistry = new Map(prev);
      newRegistry.set(id, { text, timestamp: Date.now() });
      return newRegistry;
    });
  }, []);

  // Change language - main trigger
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;

    const previousLanguage = currentLanguage;
    
    // Step 1: Collect all visible texts from registry
    const visibleTexts = Array.from(textRegistry.entries()).map(([id, data]) => ({
      id,
      text: data.text,
    }));

    // Step 2: Translate all texts (with cache check)
    const translations = {};
    for (const { id, text } of visibleTexts) {
      const translated = await translateText(text, previousLanguage, newLanguage);
      translations[id] = translated;
    }

    // Step 3: Update language
    setCurrentLanguage(newLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    
    // Step 4: Force re-render of all components using translations
    setUpdateTrigger(prev => prev + 1);

    // Step 5: Trigger UI update (components will re-render with new language)
    // The translations are cached, so future renders will use cache
  };

  // Get translated text - direct function that always uses current language
  const t = (key, fallbackText = null) => {
    // If using translation key (e.g., 'landing.welcome')
    if (key && typeof key === 'string' && key.includes('.')) {
      try {
        const translated = getTranslation(key, currentLanguage);
        // Register if fallback provided
        if (fallbackText) {
          registerText(key, fallbackText);
        }
        // Return translated text or fallback
        if (translated && translated !== key) {
          return translated;
        }
        // If translation not found, return English fallback or key
        return getTranslation(key, 'en') || key;
      } catch (error) {
        console.error('Translation error:', error);
        return key;
      }
    }
    
    // If using plain text (fallback mode)
    if (currentLanguage === defaultLanguage) return key || fallbackText || '';
    if (!key && !fallbackText) return '';
    
    const text = key || fallbackText;
    const cacheKey = getCacheKey(text, defaultLanguage, currentLanguage);
    
    // Check cache
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    // For plain text, return as-is (would need API for translation)
    return text;
  };

  // Create context value object - this ensures re-renders when values change
  // Include updateTrigger to force re-renders when language changes
  const contextValue = useMemo(
    () => ({
      currentLanguage,
      changeLanguage,
      t,
      registerText,
      isLoading,
      updateTrigger, // This will change when language changes, forcing re-renders
    }),
    [currentLanguage, changeLanguage, registerText, isLoading, updateTrigger]
    // Note: 't' is not in dependencies because it's a regular function that reads currentLanguage
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

