import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, User, Phone, MessageCircle, Clock } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getHelpersByRequest } from '../utils/api';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${year} at ${hours}:${minutes}`;
};

export default function HelpersListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params || {};

  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHelpers = async () => {
    if (!request) return;

    try {
      setError(null);
      const response = await getHelpersByRequest(request.id || request._id || request.requestId);
      
      if (response && response.success && Array.isArray(response.data)) {
        setHelpers(response.data);
      } else {
        setError(response.message || 'Failed to load helpers');
      }
    } catch (err) {
      console.error('Error fetching helpers:', err);
      setError(err.message || 'Failed to load helpers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHelpers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHelpers();
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
          <Text style={styles.headerTitle}>Helpers</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Request not found</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Helpers</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading helpers...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : helpers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Helpers Yet</Text>
            <Text style={styles.emptyText}>
              No one has offered help for this request yet. Share the request to get more visibility.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                {helpers.length} {helpers.length === 1 ? 'person has' : 'people have'} offered to help
              </Text>
            </View>

            {helpers.map((helper) => (
              <View key={helper.id} style={styles.helperCard}>
                <View style={styles.helperHeader}>
                  <View style={styles.helperIcon}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.helperName}>{helper.helperName}</Text>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => {
                      navigation.navigate('RequesterChat', {
                        helper: helper,
                        request: request,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.helperInfo}>
                  <View style={styles.infoRow}>
                    <Phone size={16} color={theme.colors.textLight} />
                    <Text style={styles.infoText}>{helper.helperPhone}</Text>
                  </View>

                  {helper.helperMessage && (
                    <View style={styles.messageRow}>
                      <MessageCircle size={16} color={theme.colors.textLight} />
                      <Text style={styles.messageText}>{helper.helperMessage}</Text>
                    </View>
                  )}

                  <View style={styles.timeRow}>
                    <Clock size={14} color={theme.colors.textLight} />
                    <Text style={styles.timeText}>
                      Offered help on {formatDateTime(helper.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  infoCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  infoText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  helperCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  helperIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  chatButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  helperInfo: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  messageText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

