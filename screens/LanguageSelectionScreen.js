import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { languages, getLanguageByCode } from '../constants/languages';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguageSelectionScreen() {
  const navigation = useNavigation();
  const { currentLanguage, changeLanguage, isLoading: langLoading } = useLanguage();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const handleLanguageSelect = async (languageCode) => {
    if (languageCode === currentLanguage) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      await changeLanguage(languageCode);
      // Small delay to ensure translation completes
      await new Promise(resolve => setTimeout(resolve, 500));
      navigation.goBack();
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {saving && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t('language.updating')}</Text>
          </View>
        )}

        {languages.map((language) => {
          const isSelected = language.code === currentLanguage;
          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleLanguageSelect(language.code)}
              style={[
                styles.languageCard,
                isSelected && styles.languageCardSelected,
              ]}
              disabled={saving || langLoading}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <Text style={[
                  styles.languageName,
                  isSelected && styles.languageNameSelected,
                ]}>
                  {language.nativeName}
                </Text>
                <Text style={styles.languageCode}>
                  {language.name}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Check size={20} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: `${theme.colors.primary}05`,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  languageNameSelected: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  languageCode: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  checkIcon: {
    marginLeft: theme.spacing.md,
  },
});

