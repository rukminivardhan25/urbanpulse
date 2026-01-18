import { useLanguage } from '../contexts/LanguageContext';

/**
 * Simple hook for translations
 * Usage: const { t } = useTranslation();
 * Then: t('landing.welcome')
 * 
 * This hook ensures components re-render when language changes
 */
export const useTranslation = () => {
  const { t, currentLanguage, updateTrigger } = useLanguage();
  // Return t function and include language/trigger in return to force re-renders
  return { 
    t,
    currentLanguage, // Include to trigger re-render when language changes
    updateTrigger, // Include to trigger re-render when language changes
  };
};

