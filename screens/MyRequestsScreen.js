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
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Users,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getUserRequests, deleteRequest } from '../utils/api';

// Map backend status to display config - all requests are active by default
const statusConfig = {
  'Approved': {
    label: 'Active',
    color: theme.colors.success,
    bgColor: `${theme.colors.success}20`,
    icon: CheckCircle,
  },
  // Fallback for any other status
  'Active': {
    label: 'Active',
    color: theme.colors.success,
    bgColor: `${theme.colors.success}20`,
    icon: CheckCircle,
  },
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format time ago
const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const requestDate = new Date(date);
  const diffMs = now - requestDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return requestDate.toLocaleDateString();
};

export default function MyRequestsScreen() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setError(null);
      const response = await getUserRequests();
      
      if (response && response.success && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setError(response.message || 'Failed to load requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, []);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  // Handle delete request
  const handleDeleteRequest = (request) => {
    Alert.alert(
      'Delete Request',
      `Are you sure you want to delete request #${request.requestId}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRequest(request.id);
              // Refresh the list after deletion
              fetchRequests();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete request. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && requests.length === 0) {
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
          <Text style={styles.headerTitle}>My Requests</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
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
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRequests}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clock size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptyText}>
              You haven't created any help requests yet. Tap "Make a Request" to get started.
            </Text>
          </View>
        ) : (
          requests.map((request) => {
            const config = statusConfig[request.status] || statusConfig['Active'];
            const StatusIcon = config.icon;
            const displayCategory = request.customSubcategory || request.subcategory;

            return (
              <View key={request.id || request.requestId} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestId}>#{request.requestId}</Text>
                    <Text style={styles.requestType}>{request.requestType}</Text>
                    <Text style={styles.requestCategory}>{displayCategory}</Text>
                  </View>
                  <View style={styles.headerRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: config.bgColor },
                      ]}
                    >
                      <StatusIcon size={12} color={config.color} />
                      <Text style={[styles.statusText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRequest(request)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.requestBody}>
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>
                  {request.location && (
                    <View style={styles.locationContainer}>
                      <Text style={styles.locationLabel}>Location:</Text>
                      <Text style={styles.locationText}>
                        {(() => {
                          const locationParts = [
                            request.location.detailedAddress?.houseFlat && `House/Flat: ${request.location.detailedAddress.houseFlat}`,
                            request.location.detailedAddress?.street && `Street: ${request.location.detailedAddress.street}`,
                            request.location.detailedAddress?.landmark && `Landmark: ${request.location.detailedAddress.landmark}`,
                            request.location.area && `Area: ${request.location.area}`,
                            request.location.city && `City: ${request.location.city}`,
                            request.location.mandal && `Mandal: ${request.location.mandal}`,
                            request.location.district && `District: ${request.location.district}`,
                            request.location.state && `State: ${request.location.state}`,
                            request.location.pincode && `Pincode: ${request.location.pincode}`,
                          ].filter(Boolean);
                          return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
                        })()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.dateText}>
                    Created {formatTimeAgo(request.createdAt)}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  {(request.helperCount > 0 || request.helperCount === 0) && (
                    <TouchableOpacity
                      style={styles.helpersButton}
                      onPress={() => navigation.navigate('HelpersList', { request })}
                      activeOpacity={0.7}
                    >
                      <Users size={16} color={theme.colors.primary} />
                      <Text style={styles.helpersText}>
                        {request.helperCount || 0} {request.helperCount === 1 ? 'Helper' : 'Helpers'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
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
  errorContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
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
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  requestId: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  requestType: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  requestCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  requestBody: {
    marginBottom: theme.spacing.sm,
  },
  requestDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  locationContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  locationLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  locationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  helpersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  helpersText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
});

