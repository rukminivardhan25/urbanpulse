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
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
  FileText,
  Trash2,
  Filter,
  Bell,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from '../utils/api';

// Priority icons mapping
const getPriorityIcon = (priority) => {
  const icons = {
    emergency: AlertCircle,
    urgent: AlertCircle,
    normal: Info,
  };
  return icons[priority] || Info;
};

// Category icons mapping
const getCategoryIcon = (category) => {
  const icons = {
    complaint: FileText,
    alert: AlertCircle,
    request: MessageCircle,
    service: CheckCircle,
    message: MessageCircle,
    system: Info,
  };
  return icons[category] || Info;
};

// Category labels
const categoryLabels = {
  complaint: 'Complaint',
  alert: 'Alert',
  request: 'Request',
  service: 'Service',
  message: 'Message',
  system: 'System',
};

// Format time for display
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategory !== 'all') {
        params.category = filterCategory;
      }
      
      const result = await getNotifications(params);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date() } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      // Refresh unread count in dashboard
      navigation.setParams({ refreshNotifications: true });
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  // Handle notification tap (deep linking)
  const handleNotificationTap = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on related type
    if (notification.relatedType === 'issue' && notification.relatedId) {
      navigation.navigate('Complaints');
    } else if (notification.relatedType === 'request' && notification.relatedId) {
      navigation.navigate('MyRequests');
    } else if (notification.relatedType === 'alert' && notification.relatedId) {
      navigation.navigate('Alerts');
    } else if (notification.relatedType === 'message' && notification.relatedId) {
      // Navigate to chat if message-related
      if (notification.type === 'complaint_message') {
        navigation.navigate('Complaints');
      } else if (notification.type === 'request_message') {
        navigation.navigate('MyRequests');
      }
    }
  };

  // Fetch notifications on mount and when screen comes into focus
  useEffect(() => {
    fetchNotifications();
  }, [filterCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [filterCategory])
  );

  // Get filtered notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filterCategory === 'all') return true;
    return notif.category === filterCategory;
  });

  // Get unread count for current filter
  const unreadCount = filteredNotifications.filter((notif) => !notif.isRead).length;

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
            <TouchableOpacity
              style={[styles.filterChip, filterCategory === 'all' && styles.filterChipActive]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterChipText, filterCategory === 'all' && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {Object.keys(categoryLabels).map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, filterCategory === category && styles.filterChipActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterChipText, filterCategory === category && styles.filterChipTextActive]}>
                  {categoryLabels[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>
            {filterCategory === 'all'
              ? "You're all caught up!"
              : `No ${categoryLabels[filterCategory]?.toLowerCase() || filterCategory} notifications`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              colors={[theme.colors.primary]}
            />
          }
        >
          {filteredNotifications.map((notification) => {
            const PriorityIcon = getPriorityIcon(notification.priority);
            const CategoryIcon = getCategoryIcon(notification.category);
            const isUnread = !notification.isRead;

            // Priority colors
            const priorityColors = {
              emergency: theme.colors.emergency,
              urgent: theme.colors.accent,
              normal: theme.colors.textLight,
            };

            return (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
                onPress={() => handleNotificationTap(notification)}
              >
                {/* Left side - Icon */}
                <View style={[styles.iconContainer, { backgroundColor: `${priorityColors[notification.priority]}20` }]}>
                  <CategoryIcon size={20} color={priorityColors[notification.priority]} />
                </View>

                {/* Middle - Content */}
                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
                      {notification.title}
                    </Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.message} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.time}>{formatTimeAgo(notification.createdAt)}</Text>
                </View>

                {/* Right side - Actions */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(notification.id)}
                  >
                    <Trash2 size={18} color={theme.colors.textLight} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 48,
    backgroundColor: theme.colors.background,
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
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  markAllButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  markAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  filtersContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  filterChipTextActive: {
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: `${theme.colors.primary}05`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  titleUnread: {
    fontWeight: theme.fontWeight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  actionsContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});

