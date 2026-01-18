import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Languages, Mic } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { TranslationInput } from '../components/TranslationInput';
import { VoiceTranscription } from '../components/VoiceTranscription';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Translation and Transcription Screen
 * Demonstrates both text translation and voice transcription features
 */
export default function TranslationTranscriptionScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('translation'); // 'translation' or 'transcription'

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translation & Transcription</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'translation' && styles.tabActive]}
          onPress={() => setActiveTab('translation')}
        >
          <Languages size={20} color={activeTab === 'translation' ? theme.colors.primary : theme.colors.textLight} />
          <Text
            style={[
              styles.tabText,
              activeTab === 'translation' && styles.tabTextActive,
            ]}
          >
            Translation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transcription' && styles.tabActive]}
          onPress={() => setActiveTab('transcription')}
        >
          <Mic size={20} color={activeTab === 'transcription' ? theme.colors.primary : theme.colors.textLight} />
          <Text
            style={[
              styles.tabText,
              activeTab === 'transcription' && styles.tabTextActive,
            ]}
          >
            Transcription
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'translation' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Text Translation</Text>
            <Text style={styles.sectionDescription}>
              Enter text in any language and translate it to your preferred language
            </Text>
            <TranslationInput
              placeholder="Type or paste text to translate..."
              onTranslated={(text) => {
                console.log('Translated text:', text);
              }}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Transcription</Text>
            <Text style={styles.sectionDescription}>
              Record your voice and convert it to text. Make sure to grant microphone permissions.
            </Text>
            <VoiceTranscription
              onTranscribed={(text) => {
                console.log('Transcribed text:', text);
              }}
              maxDuration={60}
            />
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          {activeTab === 'translation' ? (
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Enter text in any language{'\n'}
                • Select target language{'\n'}
                • Get instant translation{'\n'}
                • Swap languages easily
              </Text>
            </View>
          ) : (
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Tap "Start Recording"{'\n'}
                • Speak clearly into your device{'\n'}
                • Tap "Stop" when finished{'\n'}
                • View transcribed text
              </Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoContent: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 22,
  },
});




