import en from './en';
import hi from './hi';
import te from './te';

// Import other languages as needed
// import ta from './ta';
// import kn from './kn';
// import ml from './ml';
// import mr from './mr';
// import gu from './gu';
// import bn from './bn';
// import pa from './pa';
// import ur from './ur';

const translations = {
  en,
  hi,
  te,
  // Add other languages here
  // ta,
  // kn,
  // ml,
  // mr,
  // gu,
  // bn,
  // pa,
  // ur,
};

export const getTranslation = (key, language = 'en') => {
  try {
    const langTranslations = translations[language];
    if (!langTranslations) {
      // Fallback to English if language not found
      return translations.en[key] || key;
    }
    
    // Get translation from selected language
    const translated = langTranslations[key];
    if (translated) {
      return translated;
    }
    
    // Fallback to English if key not found in selected language
    return translations.en[key] || key;
  } catch (error) {
    console.error('Translation lookup error:', error);
    return key;
  }
};

export default translations;

