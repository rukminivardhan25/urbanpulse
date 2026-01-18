import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  MessageCircle,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { getAdminIssues, updateIssueStatus, getUnreadMessageCounts } from '../utils/api';

const reportTypes = {
  water: { label: 'Water Issue', icon: '💧', color: theme.colors.info },
  garbage: { label: 'Garbage Issue', icon: '🗑️', color: theme.colors.warning },
  power: { label: 'Power / Electricity', icon: '⚡', color: theme.colors.warning },
  road: { label: 'Road Damage', icon: '🛣️', color: theme.colors.error },
  drainage: { label: 'Drainage / Sewage', icon: '🌊', color: theme.colors.info },
  streetlight: { label: 'Street Light', icon: '💡', color: theme.colors.warning },
  other: { label: 'Other', icon: '📋', color: theme.colors.textLight },
};

// Map backend status to frontend status
const mapBackendStatus = (backendStatus) => {
  const statusMap = {
    'Pending': 'new',
    'Assigned': 'new',
    'In Progress': 'in_progress',
    'Resolved': 'resolved',
  };
  return statusMap[backendStatus] || 'new';
};

// Map frontend status to backend status
const mapFrontendToBackendStatus = (frontendStatus) => {
  const statusMap = {
    'new': 'Assigned',
    'in_progress': 'In Progress',
    'resolved': 'Resolved',
  };
  return statusMap[frontendStatus] || 'Assigned';
};

export default function ViewReportsScreen() {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch issues from API
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const [issuesResult, unreadResult] = await Promise.all([
        getAdminIssues(),
        getUnreadMessageCounts().catch(() => ({ success: true, data: {} })),
      ]);
      
      if (issuesResult && issuesResult.success && Array.isArray(issuesResult.data)) {
        // Map backend issues to frontend report format
        const mappedReports = issuesResult.data.map((issue) => {
          const submittedDate = new Date(issue.submittedDate);
          return {
            id: issue.id,
            complaintId: issue.complaintId,
            type: issue.issueType,
            message: issue.description,
            userLocation: issue.location?.summary || `${issue.location?.area || ''}, ${issue.location?.city || ''}`.trim(),
            userName: issue.user?.name || 'Unknown',
            userPhone: issue.user?.phone || '',
            status: mapBackendStatus(issue.status),
            date: submittedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: submittedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            priority: issue.priority,
            // Store backend status for API calls
            backendStatus: issue.status,
            // Store full location data for detailed view
            location: issue.location || {},
            // Store assignedAdminId to check if can chat
            assignedAdminId: issue.assignedAdminId,
          };
        });
        setReports(mappedReports);
      } else {
        setReports([]);
      }

      // Set unread counts
      if (unreadResult && unreadResult.success && unreadResult.data) {
        setUnreadCounts(unreadResult.data || {});
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      const errorMessage = error.message || 'Failed to fetch reports. Please try again.';
      Alert.alert('Error', errorMessage);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchIssues();
  }, []);

  // Refresh on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchIssues();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const filteredReports =
    selectedStatus === 'all'
      ? reports
      : reports.filter((r) => r.status === selectedStatus);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const backendStatus = mapFrontendToBackendStatus(newStatus);
      await updateIssueStatus(reportId, backendStatus);
      
      // Refresh the reports list to get updated data from server
      // This ensures status filters and buttons update correctly
      await fetchIssues();
      
      Alert.alert('Success', 'Report status updated successfully');
    } catch (error) {
      console.error('Error updating issue status:', error);
      Alert.alert('Error', error.message || 'Failed to update status. Please try again.');
    }
  };

  // Handle mark as seen (assigns admin)
  const handleMarkAsSeen = async (report) => {
    try {
      console.log('Marking report as seen:', report.id, report.complaintId);
      // Update status to "Assigned" which will auto-assign the admin
      const result = await updateIssueStatus(report.id, 'Assigned');
      console.log('Update result:', result);
      
      // Refresh the reports list to get updated data
      await fetchIssues();
      
      Alert.alert('Success', 'Report marked as seen. You can now chat with the user.');
    } catch (error) {
      console.error('Error marking report as seen:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        reportId: report.id,
      });
      Alert.alert('Error', error.message || 'Failed to mark as seen. Please try again.');
    }
  };

  // Handle open chat
  const handleOpenChat = (report) => {
    // Chat is only available if admin is assigned
    if (!report.assignedAdminId) {
      Alert.alert('Not Assigned', 'Please mark this report as seen first to assign it to you.');
      return;
    }
    
    navigation.navigate('AdminChat', {
      complaintId: report.complaintId,
      issueType: report.type,
    });
  };

  // Handle view full address
  const handleViewFullAddress = (report) => {
    const loc = report.location || {};
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
        : report.userLocation || 'Not specified';
    }
    
    Alert.alert(
      'Location Details',
      locationDetails,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return theme.colors.info;
      case 'in_progress':
        return theme.colors.warning;
      case 'resolved':
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return AlertCircle;
      case 'in_progress':
        return Clock;
      case 'resolved':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

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
        <Text style={styles.headerTitle}>View Reports</Text>
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
        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {['all', 'new', 'in_progress', 'resolved'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    selectedStatus === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedStatus === status && styles.filterTextActive,
                    ]}
                  >
                    {status === 'all' ? 'All' : getStatusLabel(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Reports Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Reports List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'all'
                ? 'No reports from users yet'
                : `No ${getStatusLabel(selectedStatus).toLowerCase()} reports`}
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => {
            const reportType = reportTypes[report.type] || reportTypes.other;
            const StatusIcon = getStatusIcon(report.status);
            const statusColor = getStatusColor(report.status);

            return (
              <View key={report.id} style={styles.reportCard}>
                {/* Report Header */}
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeContainer}>
                    <View
                      style={[
                        styles.reportIconContainer,
                        { backgroundColor: reportType.color + '20' },
                      ]}
                    >
                      <Text style={styles.reportIcon}>{reportType.icon}</Text>
                    </View>
                    <View style={styles.reportTypeContent}>
                      <Text style={styles.reportType}>{reportType.label}</Text>
                      <View style={styles.reportStatusRow}>
                        <StatusIcon size={14} color={statusColor} />
                        <Text style={[styles.reportStatus, { color: statusColor }]}>
                          {getStatusLabel(report.status)}
                        </Text>
                      </View>
                      {report.complaintId && (
                        <Text style={styles.complaintId}>ID: {report.complaintId}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.headerRightIcons}>
                    {/* Red dot for unassigned reports */}
                    {!report.assignedAdminId && (
                      <View style={styles.unreadDot} />
                    )}
                    {/* Chat Icon - Only show if assigned */}
                    {report.assignedAdminId && (
                      <TouchableOpacity
                        style={styles.chatIconButton}
                        onPress={() => handleOpenChat(report)}
                      >
                        <MessageCircle size={20} color={theme.colors.primary} />
                        {(unreadCounts[report.complaintId] || 0) > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {unreadCounts[report.complaintId] > 99 ? '99+' : unreadCounts[report.complaintId]}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Report Message */}
                <Text style={styles.reportMessage}>{report.message}</Text>

                {/* User Info */}
                <View style={styles.userInfoContainer}>
                  <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoLabel}>User:</Text>
                    <Text style={styles.userInfoText}>{report.userName}</Text>
                  </View>
                  <View style={[styles.userInfoRow, styles.locationRow]}>
                    <View style={styles.locationLeft}>
                      <MapPin size={14} color={theme.colors.textLight} />
                      <Text style={styles.userInfoText}>{report.userLocation}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleViewFullAddress(report)}
                      style={styles.viewAddressButton}
                    >
                      <Text style={styles.viewAddressText}>View Full Address</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.userInfoRow}>
                    <Clock size={14} color={theme.colors.textLight} />
                    <Text style={styles.userInfoText}>
                      {report.date} at {report.time}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons - Sequential flow */}
                {report.status !== 'resolved' && (
                  <View style={styles.actionsContainer}>
                    {/* Mark as Seen - Show for unassigned reports */}
                    {!report.assignedAdminId && (
                      <PrimaryButton
                        title="Mark as Seen"
                        onPress={() => handleMarkAsSeen(report)}
                        style={styles.actionButton}
                      />
                    )}
                    
                    {/* Mark In Progress - Show for assigned reports with status 'new' */}
                    {report.assignedAdminId && report.status === 'new' && (
                      <PrimaryButton
                        title="Mark In Progress"
                        onPress={() => handleStatusChange(report.id, 'in_progress')}
                        variant="secondary"
                        style={styles.actionButton}
                      />
                    )}
                    
                    {/* Mark Resolved - Show for status 'in_progress' */}
                    {report.status === 'in_progress' && (
                      <PrimaryButton
                        title="Mark Resolved"
                        onPress={() => handleStatusChange(report.id, 'resolved')}
                        style={styles.actionButton}
                      />
                    )}
                  </View>
                )}
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
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  filterTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  countContainer: {
    marginBottom: theme.spacing.md,
  },
  countText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  complaintId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs / 2,
  },
  reportCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
    marginTop: 4,
  },
  chatIconButton: {
    position: 'relative',
    padding: theme.spacing.xs,
    marginTop: 4,
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
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  reportIcon: {
    fontSize: 24,
  },
  reportTypeContent: {
    flex: 1,
  },
  reportType: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  reportStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reportStatus: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  reportMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  userInfoContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs / 2,
    gap: theme.spacing.xs,
  },
  locationRow: {
    justifyContent: 'space-between',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  userInfoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  userInfoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  markAsSeenButton: {
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    marginTop: theme.spacing.xs,
  },
  viewAddressButton: {
    paddingVertical: theme.spacing.xs,
  },
  viewAddressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});




