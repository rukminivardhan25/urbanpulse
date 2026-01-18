import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../constants/theme';

const suggestedQuestions = [
  'When is my next garbage collection?',
  "How do I report a water leak?",
  "What's the power outage schedule?",
  'Find nearest hospital',
];

export default function AIChatAssistantScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your UrbanPulse AI assistant. I can help you with city services, report issues, find nearby facilities, and answer questions about your area. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        garbage:
          'Your next garbage collection is scheduled for tomorrow (January 13) between 6:00 AM - 8:00 AM. Please ensure your waste is segregated into dry and wet categories.',
        water:
          "To report a water leak, you can use the 'Report Issue' feature in the app. Select 'Water Supply' as the issue type and provide the exact location. Our team typically responds within 2-4 hours for leak reports.",
        power:
          "There's a scheduled power maintenance on January 15, 2:00 PM - 5:00 PM in Sector 15. No other outages are currently planned for your area.",
        hospital:
          'The nearest hospital to Sector 15 is the Government Hospital in Sector 16, about 1.5 km away. It\'s open 24/7. Contact: 0172-XXXXXX. For emergencies, call 108 for an ambulance.',
      };

      let response =
        "I understand you're asking about city services. Could you please provide more details about what you need help with? I can assist with garbage collection schedules, water supply, power updates, reporting issues, and finding nearby services.";

      const lowerText = messageText.toLowerCase();
      if (lowerText.includes('garbage') || lowerText.includes('waste')) {
        response = responses.garbage;
      } else if (lowerText.includes('water') || lowerText.includes('leak')) {
        response = responses.water;
      } else if (lowerText.includes('power') || lowerText.includes('outage')) {
        response = responses.power;
      } else if (
        lowerText.includes('hospital') ||
        lowerText.includes('medical')
      ) {
        response = responses.hospital;
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice input would be implemented here
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Sparkles size={20} color={theme.colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>City Assistant</Text>
            <Text style={styles.headerSubtitle}>AI-powered help</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.role === 'user' && styles.messageWrapperUser,
            ]}
          >
            <View
              style={[
                styles.message,
                message.role === 'user'
                  ? styles.messageUser
                  : styles.messageAssistant,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' && styles.messageTextUser,
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.role === 'user' && styles.messageTimeUser,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={styles.messageWrapper}>
            <View style={styles.messageAssistant}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                <View
                  style={[styles.typingDot, { animationDelay: '0.1s' }]}
                />
                <View
                  style={[styles.typingDot, { animationDelay: '0.2s' }]}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Suggested questions</Text>
          <View style={styles.suggestions}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSend(question)}
                style={styles.suggestionButton}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={toggleListening}
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
          ]}
        >
          {isListening ? (
            <MicOff size={20} color={theme.colors.white} />
          ) : (
            <Mic size={20} color={theme.colors.textLight} />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.textLight}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          multiline
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim()}
          style={[
            styles.sendButton,
            !input.trim() && styles.sendButtonDisabled,
          ]}
        >
          <Send
            size={20}
            color={input.trim() ? theme.colors.white : theme.colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.xs / 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  messageWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  message: {
    maxWidth: '85%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  messageUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  messageAssistant: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: theme.borderRadius.sm,
  },
  messageText: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
    color: theme.colors.text,
  },
  messageTextUser: {
    color: theme.colors.white,
  },
  messageTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textLight,
  },
  suggestionsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  suggestionsLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  suggestionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
  },
  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.textLight}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: theme.colors.emergency,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.textLight}10`,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: `${theme.colors.textLight}20`,
  },
});

