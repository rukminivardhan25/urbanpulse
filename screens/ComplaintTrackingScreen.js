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
  AlertCircle,
  ChevronRight,
  Trash2,
  MessageCircle,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getUserIssues, getIssueById, deleteIssue, getUnreadMessageCounts } from '../utils/api';

// Issue type labels mapping
const issueTypeLabels = {
  garbage: 'Garbage / Waste',
  water: 'Water Supply',
  power: 'Power / Electricity',
  road: 'Road Damage',
  drainage: 'Drainage / Sewage',
  streetlight: 'Street Light',
  other: 'Other',
};

// Map backend status to frontend status
const mapBackendStatus = (backendStatus) => {
  const statusMap = {
    'Pending': 'pending',
    'Assigned': 'pending', // Treat assigned as pending for display
    'In Progress': 'in_progress',
    'Resolved': 'resolved',
  };
  return statusMap[backendStatus] || 'pending';
};

const statusConfig = {
  pending: {
    label: 'Pending',
    color: theme.colors.accent,
    bgColor: `${theme.colors.accent}20`,
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    color: theme.colors.info,
    bgColor: `${theme.colors.info}20`,
    icon: AlertCircle,
  },
  resolved: {
    label: 'Resolved',
    color: theme.colors.success,
    bgColor: `${theme.colors.success}20`,
    icon: CheckCircle,
  },
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format date for timeline (short format)
const formatTimelineDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

// Build timeline updates from issue data
const buildTimelineUpdates = (issue) => {
  const updates = [];
  
  // Add complaint registered
  updates.push({
    date: formatTimelineDate(issue.submittedDate),
    message: 'Complaint registered',
  });

  // Add status-based updates
  if (issue.status === 'Assigned' || issue.status === 'In Progress' || issue.status === 'Resolved') {
    if (issue.status === 'Assigned') {
      updates.push({
        date: formatTimelineDate(issue.updatedAt || issue.submittedDate),
        message: 'Assigned to admin',
      });
    }
    if (issue.status === 'In Progress') {
      updates.push({
        date: formatTimelineDate(issue.updatedAt || issue.submittedDate),
        message: 'Work in progress',
      });
    }
    if (issue.status === 'Resolved') {
      updates.push({
        date: formatTimelineDate(issue.updatedAt || issue.submittedDate),
        message: 'Issue resolved',
      });
    }
  }

  return updates;
};

export default function ComplaintTrackingScreen() {
  const navigation = useNavigation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch complaints from API
  const fetchComplaints = async () => {
    try {
      setError(null);
      const [issuesResult, unreadResult] = await Promise.all([
        getUserIssues(),
        getUnreadMessageCounts().catch(() => ({ success: true, data: {} })),
      ]);
      
      if (issuesResult && issuesResult.success && Array.isArray(issuesResult.data)) {
        // Transform API data to match frontend format
        const transformedComplaints = issuesResult.data.map((issue) => ({
          id: issue.id,
          complaintId: issue.complaintId,
          type: issueTypeLabels[issue.issueType] || issue.issueType,
          location: issue.location?.summary || `${issue.location?.area || ''}, ${issue.location?.city || ''}`.trim(),
          date: formatDate(issue.submittedDate),
          status: mapBackendStatus(issue.status),
          updates: buildTimelineUpdates(issue),
          priority: issue.priority,
          description: issue.description,
          // Store backend data for detail view
          backendData: issue,
        }));
        
        setComplaints(transformedComplaints);
      } else {
        setComplaints([]);
      }

      // Set unread counts
      if (unreadResult && unreadResult.success && unreadResult.data) {
        setUnreadCounts(unreadResult.data || {});
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError(error.message || 'Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Refresh on focus (when navigating back to this screen)
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchComplaints();
      }
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  // Handle view full address
  const handleViewFullAddress = (complaint) => {
    const loc = complaint.backendData?.location || {};
    let locationDetails = '';
    
    // First, show Full Address if provided
    if (loc.fullAddress) {
      locationDetails = `Full Address:\n${loc.fullAddress}\n`;
    }
    
    // Then, show Detailed Address fields if any are provided
    const detailedParts = [];
    if (loc.houseNumber) detailedParts.push(`House/Flat: ${loc.houseNumber}`);
    if (loc.streetNumber) detailedParts.push(`Street: ${loc.streetNumber}`);
    if (loc.landmark) detailedParts.push(`Landmark: ${loc.landmark}`);
    
    if (detailedParts.length > 0) {
      if (locationDetails) {
        locationDetails += '\nDetailed Address:\n';
      } else {
        locationDetails = 'Detailed Address:\n';
      }
      locationDetails += detailedParts.join('\n') + '\n';
    }
    
    // If no full address or detailed address, show basic location
    if (!locationDetails) {
      const basicParts = [];
      if (loc.area) basicParts.push(`Area: ${loc.area}`);
      if (loc.city) basicParts.push(`City: ${loc.city}`);
      if (loc.mandal) basicParts.push(`Mandal: ${loc.mandal}`);
      if (loc.district) basicParts.push(`District: ${loc.district}`);
      if (loc.state) basicParts.push(`State: ${loc.state}`);
      if (loc.pincode) basicParts.push(`Pincode: ${loc.pincode}`);
      
      locationDetails = basicParts.length > 0 
        ? basicParts.join('\n') 
        : complaint.location || 'Not specified';
    }
    
    Alert.alert(
      'Location Details',
      locationDetails,
      [{ text: 'OK' }]
    );
  };

  // Handle view details
  const handleViewDetails = async (complaint) => {
    try {
      // Build detailed location string from backend data
      const loc = complaint.backendData?.location || {};
      let locationDetails = '';
      
      // First, show Full Address if provided
      if (loc.fullAddress) {
        locationDetails = `Full Address:\n${loc.fullAddress}\n`;
      }
      
      // Then, show Detailed Address fields if any are provided
      const detailedParts = [];
      if (loc.houseNumber) detailedParts.push(`House/Flat: ${loc.houseNumber}`);
      if (loc.streetNumber) detailedParts.push(`Street: ${loc.streetNumber}`);
      if (loc.landmark) detailedParts.push(`Landmark: ${loc.landmark}`);
      
      if (detailedParts.length > 0) {
        if (locationDetails) {
          locationDetails += '\nDetailed Address:\n';
        } else {
          locationDetails = 'Detailed Address:\n';
        }
        locationDetails += detailedParts.join('\n') + '\n';
      }
      
      // If no full address or detailed address, show basic location
      if (!locationDetails) {
        const basicParts = [];
        if (loc.area) basicParts.push(`Area: ${loc.area}`);
        if (loc.city) basicParts.push(`City: ${loc.city}`);
        if (loc.mandal) basicParts.push(`Mandal: ${loc.mandal}`);
        if (loc.district) basicParts.push(`District: ${loc.district}`);
        if (loc.state) basicParts.push(`State: ${loc.state}`);
        if (loc.pincode) basicParts.push(`Pincode: ${loc.pincode}`);
        
        locationDetails = basicParts.length > 0 
          ? basicParts.join('\n') 
          : complaint.location || 'Not specified';
      }
      
      // Format location section - always show "Location Details" header
      const locationSection = locationDetails 
        ? `Location Details\n\n${locationDetails}`
        : `Location Details\n\n${complaint.location || 'Not specified'}`;
      
      const details = `Complaint ID: ${complaint.complaintId}\n\nType: ${complaint.type}\n\nStatus: ${statusConfig[complaint.status].label}\n\n${locationSection}\n\nSubmitted: ${complaint.date}\n\nDescription: ${complaint.description || 'N/A'}`;
      
      Alert.alert(
        'Complaint Details',
        details,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      Alert.alert('Error', 'Failed to load complaint details');
    }
  };

  // Handle open chat
  const handleOpenChat = (complaint) => {
    const backendStatus = complaint.backendData?.status;
    const allowedStatuses = ['Assigned', 'In Progress', 'Resolved'];
    
    // Check if admin is assigned
    if (!complaint.backendData?.assignedAdminId) {
      Alert.alert('No Admin Assigned', 'Chat is only available after an admin is assigned to your complaint.');
      return;
    }

    // Check if status allows messaging
    if (!allowedStatuses.includes(backendStatus)) {
      Alert.alert('Chat Not Available', 'Chat is only available for assigned, in progress, or resolved complaints.');
      return;
    }

    navigation.navigate('Chat', {
      complaintId: complaint.complaintId,
      issueType: complaint.backendData?.issueType,
      complaintType: complaint.type,
    });
  };

  // Handle delete complaint
  const handleDeleteComplaint = (complaint) => {
    Alert.alert(
      'Delete Complaint',
      `Are you sure you want to delete complaint #${complaint.complaintId}? This action cannot be undone.`,
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
              await deleteIssue(complaint.id);
              // Remove from local state
              setComplaints(complaints.filter((c) => c.id !== complaint.id));
              Alert.alert('Success', 'Complaint deleted successfully');
            } catch (error) {
              console.error('Error deleting complaint:', error);
              Alert.alert('Error', error.message || 'Failed to delete complaint');
            }
          },
        },
      ]
    );
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Complaints</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${complaints.length} total complaint${complaints.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchComplaints}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : complaints.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No complaints found</Text>
          <Text style={styles.emptySubtext}>
            Submit a complaint from the dashboard to see it here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {complaints.map((complaint) => {
            const config = statusConfig[complaint.status];
            const StatusIcon = config.icon;

            // Check if chat should be shown
            // Chat is only available when:
            // 1. An admin is assigned (assignedAdminId is not null/undefined)
            // 2. Status is Assigned, In Progress, or Resolved
            const backendStatus = complaint.backendData?.status;
            const allowedStatuses = ['Assigned', 'In Progress', 'Resolved'];
            const hasAssignedAdmin = complaint.backendData?.assignedAdminId != null && complaint.backendData?.assignedAdminId !== '';
            const canChat = hasAssignedAdmin && allowedStatuses.includes(backendStatus);
            const unreadCount = unreadCounts[complaint.complaintId] || 0;

            return (
              <View key={complaint.id} style={styles.complaintCard}>
                {/* Header */}
                <View style={styles.complaintHeader}>
                  <View style={styles.complaintInfo}>
                    <Text style={styles.complaintId}>#{complaint.complaintId}</Text>
                    <Text style={styles.complaintType}>{complaint.type}</Text>
                    <Text style={styles.complaintLocation}>
                      {complaint.location}
                    </Text>
                  </View>
                  <View style={styles.headerRight}>
                    {canChat && (
                      <TouchableOpacity
                        style={styles.chatIconButton}
                        onPress={() => handleOpenChat(complaint)}
                      >
                        <MessageCircle size={20} color={theme.colors.primary} />
                        {unreadCount > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
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
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.timeline}>
                  <Text style={styles.timelineTitle}>Updates</Text>
                  <View style={styles.timelineContent}>
                    {complaint.updates.map((update, updateIndex) => (
                      <View key={updateIndex} style={styles.timelineItem}>
                        <View style={styles.timelineDot}>
                          <View
                            style={[
                              styles.dot,
                              updateIndex === complaint.updates.length - 1 &&
                                styles.dotActive,
                            ]}
                          />
                          {updateIndex < complaint.updates.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <View style={styles.timelineText}>
                          <Text style={styles.timelineMessage}>
                            {update.message}
                          </Text>
                          <View style={styles.timelineMeta}>
                            <Text style={styles.timelineDate}>{update.date}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(complaint)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <ChevronRight size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteComplaint(complaint)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.medium,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  complaintCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  complaintType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  complaintLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  chatIconButton: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  timeline: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  timelineTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  timelineContent: {
    gap: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timelineDot: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.border,
    marginTop: 2,
  },
  timelineText: {
    flex: 1,
    marginTop: -2,
  },
  timelineMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timelineDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewDetailsText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  deleteButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },
});
