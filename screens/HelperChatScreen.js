import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Send,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { sendHelperMessage, getHelperMessages, getUserHelper } from '../utils/api';

export default function HelperChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params || {};
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [helper, setHelper] = useState(null);

  // Fetch helper record and messages on mount
  useEffect(() => {
    if (request) {
      fetchHelperAndMessages();
    }
  }, [request]);

  const fetchHelperAndMessages = async () => {
    try {
      setLoading(true);
      const requestId = request._id || request.id || request.requestId;
      
      // First, fetch helper record for current user and request
      const helperResult = await getUserHelper(requestId);
      if (helperResult && helperResult.success && helperResult.data) {
        setHelper(helperResult.data);
        const helperId = helperResult.data._id || helperResult.data.id;
        
        // Then fetch messages
        const messagesResult = await getHelperMessages(requestId, helperId);
        if (messagesResult && messagesResult.success && Array.isArray(messagesResult.data)) {
          setMessages(messagesResult.data);
        } else {
          setMessages([]);
        }
      } else {
        Alert.alert('Error', 'You need to offer help first before you can chat.');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching helper or messages:', error);
      Alert.alert('Error', error.message || 'Failed to load chat');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages only (after helper is set)
  const fetchMessages = async () => {
    if (!request || !helper) return;
    
    try {
      const requestId = request._id || request.id || request.requestId;
      const helperId = helper._id || helper.id;
      
      if (!requestId || !helperId) {
        return;
      }

      const result = await getHelperMessages(requestId, helperId);
      if (result && result.success && Array.isArray(result.data)) {
        setMessages(result.data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !helper) return;

    const messageToSend = messageText.trim();
    setMessageText(''); // Clear input immediately

    try {
      setSending(true);
      const requestId = request._id || request.id || request.requestId;
      const helperId = helper._id || helper.id;
      
      if (!requestId || !helperId) {
        throw new Error('Missing requestId or helperId');
      }

      await sendHelperMessage(requestId, helperId, messageToSend);
      
      // Refresh messages to get the new one
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
      // Restore message text on error
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!request) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Request not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {request.requestId ? (request.requestId.startsWith('REQ') ? `#${request.requestId}` : `#${request.requestId}`) : 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {request.requestType} - {request.subcategory}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation</Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isHelperMessage = msg.senderType === 'helper';
              return (
                <View
                  key={msg._id || index}
                  style={[
                    styles.messageWrapper,
                    isHelperMessage ? styles.userMessageWrapper : styles.otherMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isHelperMessage ? styles.userMessageBubble : styles.otherMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isHelperMessage ? styles.userMessageText : styles.otherMessageText,
                      ]}
                    >
                      {msg.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isHelperMessage ? styles.userMessageTime : styles.otherMessageTime,
                      ]}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textLight}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Send size={20} color={theme.colors.background} />
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 48,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginTop: 0,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.background,
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: theme.colors.textLight,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: theme.colors.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

