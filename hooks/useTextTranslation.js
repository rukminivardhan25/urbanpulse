import { useState, useCallback } from 'react';
import { translateText, translateMultiple, detectLanguage } from '../utils/translationService';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook for text translation
 * 
 * Usage:
 * const { translate, translateBatch, isTranslating, detectedLanguage } = useTextTranslation();
 * 
 * const translated = await translate('Hello world', 'en', 'hi');
 * const batch = await translateBatch(['Hello', 'World'], 'en', 'hi');
 */
export const useTextTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Translate a single text
   * @param {string} text - Text to translate
   * @param {string} sourceLang - Source language (optional, will detect if not provided)
   * @param {string} targetLang - Target language (defaults to current app language)
   */
  const translate = useCallback(async (text, sourceLang = null, targetLang = null) => {
    if (!text || !text.trim()) {
      return text;
    }

    setIsTranslating(true);
    setError(null);

    try {
      // If source language not provided, detect it
      let detected = sourceLang;
      if (!detected) {
        detected = await detectLanguage(text);
        setDetectedLanguage(detected);
      }

      // Use target language or current app language
      const target = targetLang || currentLanguage;

      const translated = await translateText(text, detected, target);
      return translated;
    } catch (err) {
      setError(err.message);
      console.error('Translation error:', err);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);

  /**
   * Translate multiple texts at once
   * @param {string[]} texts - Array of texts to translate
   * @param {string} sourceLang - Source language
   * @param {string} targetLang - Target language
   */
  const translateBatch = useCallback(async (texts, sourceLang = 'en', targetLang = null) => {
    if (!Array.isArray(texts) || texts.length === 0) {
      return texts;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const target = targetLang || currentLanguage;
      const translated = await translateMultiple(texts, sourceLang, target);
      return translated;
    } catch (err) {
      setError(err.message);
      console.error('Batch translation error:', err);
      return texts; // Return original texts on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);

  /**
   * Detect language of text
   * @param {string} text - Text to detect language for
   */
  const detect = useCallback(async (text) => {
    if (!text || !text.trim()) {
      return 'en';
    }

    setIsTranslating(true);
    setError(null);

    try {
      const detected = await detectLanguage(text);
      setDetectedLanguage(detected);
      return detected;
    } catch (err) {
      setError(err.message);
      console.error('Language detection error:', err);
      return 'en';
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return {
    translate,
    translateBatch,
    detect,
    isTranslating,
    detectedLanguage,
    error,
  };
};




