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
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  AlertTriangle,
  Info,
  AlertCircle,
  Bell,
  CheckCircle,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getAlerts, getCurrentUser } from '../utils/api';
import { alertCategories } from '../constants/alertCategories';

const priorityIcons = {
  normal: Info,
  urgent: AlertTriangle,
  emergency: AlertCircle,
};

const READ_ALERTS_KEY = '@urbanpulse_read_alerts';

export default function AlertsScreen() {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Load read alerts from AsyncStorage
  const loadReadAlerts = async () => {
    try {
      const readAlertsJson = await AsyncStorage.getItem(READ_ALERTS_KEY);
      if (readAlertsJson) {
        return JSON.parse(readAlertsJson);
      }
      return [];
    } catch (error) {
      console.error('Error loading read alerts:', error);
      return [];
    }
  };

  // Save read alerts to AsyncStorage
  const saveReadAlerts = async (readAlertIds) => {
    try {
      await AsyncStorage.setItem(READ_ALERTS_KEY, JSON.stringify(readAlertIds));
    } catch (error) {
      console.error('Error saving read alerts:', error);
    }
  };

  // Fetch user data and alerts
  const fetchUserAndAlerts = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      if (userData.user) {
        setUser(userData.user);
        if (userData.user.city && userData.user.area) {
          await loadAlerts(userData.user.city, userData.user.area);
        } else {
          setAlerts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load alerts
  const loadAlerts = async (city, area) => {
    try {
      const result = await getAlerts(city, area);
      if (result.success && result.alerts) {
        // Load persisted read status
        const readAlertIds = await loadReadAlerts();
        
        // Sort by priority (emergency first) and then by date
        const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
        const sortedAlerts = result.alerts
          .sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          // Merge with persisted read status
          .map((alert) => ({
            ...alert,
            read: readAlertIds.includes(alert.id),
          }));
        setAlerts(sortedAlerts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchUserAndAlerts();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserAndAlerts();
    }, [])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.city && user?.area) {
      await loadAlerts(user.city, user.area);
    }
    setRefreshing(false);
  };

  const markAllRead = async () => {
    // Mark all alerts as read
    const updatedAlerts = alerts.map((alert) => ({
      ...alert,
      read: true,
    }));
    
    // Get all alert IDs to save as read
    const allAlertIds = updatedAlerts.map((alert) => alert.id);
    
    // Load existing read alerts and merge
    const existingReadAlerts = await loadReadAlerts();
    const mergedReadAlerts = [...new Set([...existingReadAlerts, ...allAlertIds])];
    
    // Save to AsyncStorage
    await saveReadAlerts(mergedReadAlerts);
    
    // Update state
    setAlerts(updatedAlerts);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'emergency':
        return {
          iconBg: `${theme.colors.error || '#DC2626'}20`,
          iconColor: theme.colors.error || '#DC2626',
          borderColor: theme.colors.error || '#DC2626',
          badgeBg: `${theme.colors.error || '#DC2626'}20`,
          badgeColor: theme.colors.error || '#DC2626',
        };
      case 'urgent':
        return {
          iconBg: `${theme.colors.warning || '#F59E0B'}20`,
          iconColor: theme.colors.warning || '#F59E0B',
          borderColor: theme.colors.warning || '#F59E0B',
          badgeBg: `${theme.colors.warning || '#F59E0B'}20`,
          badgeColor: theme.colors.warning || '#F59E0B',
        };
      case 'normal':
      default:
        return {
          iconBg: `${theme.colors.info || '#3B82F6'}20`,
          iconColor: theme.colors.info || '#3B82F6',
          borderColor: theme.colors.info || '#3B82F6',
          badgeBg: `${theme.colors.info || '#3B82F6'}20`,
          badgeColor: theme.colors.info || '#3B82F6',
        };
    }
  };

  const getCategoryLabel = (categoryKey) => {
    return alertCategories[categoryKey]?.label || categoryKey;
  };

  const getCategoryIcon = (categoryKey) => {
    return alertCategories[categoryKey]?.icon || '📢';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // For older alerts, show date
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
    } catch (error) {
      return '';
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>
            {loading 
              ? 'Loading...' 
              : unreadCount > 0 
                ? `${unreadCount} ${unreadCount === 1 ? 'unread alert' : 'unread alerts'}`
                : `${alerts.length} ${alerts.length === 1 ? 'alert' : 'alerts'}`}
          </Text>
        </View>
        <View style={styles.bellIcon}>
          <Bell size={20} color={theme.colors.white} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading State */}
        {loading && alerts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading alerts...</Text>
          </View>
        ) : alerts.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Bell size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyText}>
              {user?.city && user?.area
                ? 'No alerts for your area yet. Pull to refresh.'
                : 'Please set your location to see alerts.'}
            </Text>
          </View>
        ) : (
          /* Alerts List */
          alerts.map((alert) => {
            const PriorityIcon = priorityIcons[alert.priority] || Info;
            const priorityStyles = getPriorityStyles(alert.priority);
            const categoryLabel = getCategoryLabel(alert.category);
            const categoryIcon = getCategoryIcon(alert.category);

            const isUnread = !alert.read;

            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: priorityStyles.borderColor,
                    opacity: isUnread ? 1 : 0.7,
                  },
                ]}
              >
                {isUnread && <View style={styles.unreadDot} />}
                <View style={styles.alertContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: priorityStyles.iconBg },
                    ]}
                  >
                    <PriorityIcon size={20} color={priorityStyles.iconColor} />
                  </View>
                  <View style={styles.alertText}>
                    {/* Category and Priority Badge */}
                    <View style={styles.alertHeaderRow}>
                      <View style={styles.categoryContainer}>
                        <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                        <Text style={styles.categoryLabel}>{categoryLabel.replace(/[🌦🔥🚑🚦🌊🛡🏥⚡📢]/g, '').trim()}</Text>
                      </View>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: priorityStyles.badgeBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: priorityStyles.badgeColor },
                          ]}
                        >
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </Text>
                      </View>
                    </View>

                    {/* Alert Type */}
                    <Text style={styles.alertType}>{alert.alertType}</Text>

                    {/* Title */}
                    <Text 
                      style={[
                        styles.alertTitle,
                        isUnread && styles.alertTitleUnread,
                      ]}
                    >
                      {alert.title}
                    </Text>

                    {/* Message */}
                    <Text 
                      style={[
                        styles.alertMessage,
                        isUnread && styles.alertMessageUnread,
                      ]}
                    >
                      {alert.message}
                    </Text>

                    {/* Footer */}
                    <View style={styles.alertFooter}>
                      <Text style={styles.alertTime}>
                        {formatTimeAgo(alert.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Mark All Read */}
        {alerts.length > 0 && unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllRead}
            style={styles.markAllButton}
            activeOpacity={0.7}
          >
            <CheckCircle size={16} color={theme.colors.primary} />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
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
    flex: 1,
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
  bellIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
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
  alertCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  alertText: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  alertType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs / 2,
  },
  alertTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  alertTitleUnread: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  alertMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  alertMessageUnread: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  unreadDot: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  markAllText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
});
