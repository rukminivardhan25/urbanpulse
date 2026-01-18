/**
 * Supported Indian Languages
 */
export const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
  },
];

export const getLanguageByCode = (code) => {
  return languages.find(lang => lang.code === code) || languages[0];
};

export const defaultLanguage = 'en';





