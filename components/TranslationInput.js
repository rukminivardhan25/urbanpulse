import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Languages, ArrowRightLeft } from 'lucide-react-native';
import { useTextTranslation } from '../hooks/useTextTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../constants/theme';
import { languages } from '../constants/languages';

/**
 * Translation Input Component
 * Allows users to input text and translate it to different languages
 * 
 * Usage:
 * <TranslationInput
 *   placeholder="Enter text to translate"
 *   onTranslated={(text) => console.log('Translated:', text)}
 * />
 */
export const TranslationInput = ({
  placeholder = 'Enter text to translate...',
  onTranslated,
  initialText = '',
  showLanguageSelector = true,
  style,
}) => {
  const { translate, isTranslating, detectedLanguage } = useTextTranslation();
  const { currentLanguage } = useLanguage();
  const [inputText, setInputText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(currentLanguage);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      return;
    }

    try {
      const translated = await translate(inputText, null, targetLanguage);
      setTranslatedText(translated);
      if (onTranslated) {
        onTranslated(translated);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const handleSwap = () => {
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeader}>
          <Text style={styles.label}>
            {detectedLanguage ? `Detected: ${languages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}` : 'Input'}
          </Text>
        </View>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Translate Button */}
      <TouchableOpacity
        style={[styles.translateButton, isTranslating && styles.translateButtonDisabled]}
        onPress={handleTranslate}
        disabled={!inputText.trim() || isTranslating}
      >
        {isTranslating ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Languages size={18} color={theme.colors.white} />
            <Text style={styles.translateButtonText}>Translate</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Language Selector */}
      {showLanguageSelector && (
        <View style={styles.languageSelector}>
          <Text style={styles.languageLabel}>Translate to:</Text>
          <View style={styles.languageButtons}>
            {languages.slice(0, 3).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  targetLanguage === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => setTargetLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    targetLanguage === lang.code && styles.languageButtonTextActive,
                  ]}
                >
                  {lang.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Output Section */}
      {translatedText ? (
        <View style={styles.outputSection}>
          <View style={styles.outputHeader}>
            <Text style={styles.label}>
              {languages.find(l => l.code === targetLanguage)?.name || targetLanguage}
            </Text>
            <TouchableOpacity onPress={handleSwap} style={styles.swapButton}>
              <ArrowRightLeft size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.outputBox}>
            <Text style={styles.outputText}>{translatedText}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 100,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  translateButtonDisabled: {
    opacity: 0.6,
  },
  translateButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  languageSelector: {
    marginBottom: 16,
  },
  languageLabel: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  languageButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  languageButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  outputSection: {
    marginTop: 16,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  swapButton: {
    padding: 4,
  },
  outputBox: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.background,
    minHeight: 100,
  },
  outputText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
});




