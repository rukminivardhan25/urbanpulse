import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  Heart,
  AlertCircle,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getApprovedRequests } from '../utils/api';

// Legacy mock data removed - using API now
const legacyMockRequests = [
  {
    id: 'REQ001',
    title: 'Blood Donation Needed',
    category: 'Blood Donation',
    location: 'Hyderabad, Kukatpally',
    urgency: 'high',
    description: 'Need O+ blood group urgently for surgery. Patient in critical condition.',
    needed: '2 units of O+ blood',
    createdAt: '2 hours ago',
    contactPreference: 'call',
  },
  {
    id: 'REQ002',
    title: 'Food Help for Orphanage',
    category: 'Orphanage Support',
    location: 'Hyderabad, Secunderabad',
    urgency: 'medium',
    description: 'We need food supplies for 50 children. Rice, dal, vegetables needed.',
    needed: 'Food supplies for 50 children',
    createdAt: '5 hours ago',
    contactPreference: 'whatsapp',
  },
  {
    id: 'REQ003',
    title: 'Education Help - Books Needed',
    category: 'Education Help',
    location: 'Hyderabad, Charminar',
    urgency: 'low',
    description: 'School children need textbooks and notebooks for this academic year.',
    needed: '50 textbooks, 100 notebooks',
    createdAt: '1 day ago',
    contactPreference: 'inapp',
  },
  {
    id: 'REQ004',
    title: 'Medical Help - Medicine',
    category: 'Medical Help',
    location: 'Hyderabad, HITEC City',
    urgency: 'emergency',
    description: 'Need specific medicines for elderly patient. Doctor prescribed.',
    needed: 'Prescription medicines',
    createdAt: '3 hours ago',
    contactPreference: 'call',
  },
  {
    id: 'REQ005',
    title: 'Clothes Donation',
    category: 'Clothes Donation',
    location: 'Hyderabad, Banjara Hills',
    urgency: 'medium',
    description: 'Need winter clothes for homeless people. All sizes welcome.',
    needed: 'Winter clothes (all sizes)',
    createdAt: '6 hours ago',
    contactPreference: 'whatsapp',
  },
  {
    id: 'REQ006',
    title: 'Volunteering Help - Old Age Home',
    category: 'Old Age Home Support',
    location: 'Hyderabad, Gachibowli',
    urgency: 'low',
    description: 'Need volunteers to spend time with elderly residents on weekends.',
    needed: 'Weekend volunteers',
    createdAt: '2 days ago',
    contactPreference: 'inapp',
  },
];

const categories = [
  { label: 'All', emoji: '📂' },
  { label: 'Volunteering Help', emoji: '🤝' },
  { label: 'Blood Donation', emoji: '🩸' },
  { label: 'Money Help', emoji: '💰' },
  { label: 'Food Help', emoji: '🍲' },
  { label: 'Clothes Donation', emoji: '👕' },
  { label: 'Medical Help', emoji: '🏥' },
  { label: 'Old Age Home Support', emoji: '👵' },
  { label: 'Orphanage Support', emoji: '👶' },
  { label: 'Disaster Relief', emoji: '🌪' },
  { label: 'Education Help', emoji: '🎓' },
];

const urgencyLevels = [
  { value: 'all', label: 'All' },
  { value: 'emergency', label: 'Emergency', color: theme.colors.error || '#DC2626' },
  { value: 'high', label: 'High', color: theme.colors.accent },
  { value: 'medium', label: 'Medium', color: theme.colors.warning },
  { value: 'low', label: 'Low', color: theme.colors.success },
];

export default function HelpRequestsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch approved requests from API
  const fetchRequests = async () => {
    try {
      setError(null);
      const response = await getApprovedRequests();
      if (response.success && response.data) {
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
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  // Update filter logic to use category.label
  const selectedCategoryLabel = typeof selectedCategory === 'string' ? selectedCategory : selectedCategory.label;

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

  // Filter requests based on search, category, and urgency
  const filteredRequests = requests.filter((request) => {
    const locationSummary = request.location?.summary || `${request.location?.area || ''}, ${request.location?.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim();
    const matchesSearch =
      request.requestType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationSummary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'All' || selectedCategoryLabel === 'All' || request.requestType === selectedCategoryLabel;
    
    const matchesUrgency =
      selectedUrgency === 'all' || request.urgency === selectedUrgency;

    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return {
          bgColor: `${theme.colors.error || '#DC2626'}20`,
          textColor: theme.colors.error || '#DC2626',
        };
      case 'high':
        return {
          bgColor: `${theme.colors.accent}20`,
          textColor: theme.colors.accent,
        };
      case 'medium':
        return {
          bgColor: `${theme.colors.warning}20`,
          textColor: theme.colors.warning,
        };
      case 'low':
      default:
        return {
          bgColor: `${theme.colors.success}20`,
          textColor: theme.colors.success,
        };
    }
  };

  const handleWantToHelp = (request) => {
    navigation.navigate('HelpOffer', { request });
  };

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
        <Text style={styles.headerTitle}>Help Requests</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Filter size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={theme.colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textLight}
            />
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.label || (selectedCategory === 'All' && category.label === 'All');
                  return (
                    <TouchableOpacity
                      key={category.label}
                      style={[
                        styles.filterChip,
                        isSelected && styles.filterChipSelected,
                      ]}
                      onPress={() => setSelectedCategory(category.label)}
                    >
                      <Text style={styles.filterChipEmoji}>{category.emoji}</Text>
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Urgency Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Urgency</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
              >
                {urgencyLevels.map((level) => {
                  const urgencyStyles = level.color
                    ? getUrgencyStyles(level.value)
                    : null;
                  return (
                    <TouchableOpacity
                      key={level.value}
                      style={[
                        styles.filterChip,
                        selectedUrgency === level.value && styles.filterChipSelected,
                        selectedUrgency === level.value &&
                          level.color &&
                          { backgroundColor: urgencyStyles.bgColor, borderColor: level.color },
                      ]}
                      onPress={() => setSelectedUrgency(level.value)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedUrgency === level.value &&
                            level.color &&
                            { color: level.color },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={theme.colors.error} />
            <Text style={styles.emptyTitle}>Error Loading Requests</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRequests}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Results Count */}
            <Text style={styles.resultsCount}>
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request found' : 'requests found'}
            </Text>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Heart size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Requests Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or check back later for new requests.
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
            const urgencyStyles = getUrgencyStyles(request.urgency);

            return (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('RequestDetails', { request })}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestTitleRow}>
                    <Text style={styles.requestTitle}>{request.requestType}</Text>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { backgroundColor: urgencyStyles.bgColor },
                      ]}
                    >
                      <Text
                        style={[styles.urgencyBadgeText, { color: urgencyStyles.textColor }]}
                      >
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.requestCategory}>{request.subcategory || request.requestType}</Text>
                </View>


                <View style={styles.requestFooter}>
                  <View style={styles.timeRow}>
                    <Clock size={14} color={theme.colors.textLight} />
                    <Text style={styles.timeText}>{formatTimeAgo(request.createdAt)}</Text>
                  </View>
                  <View style={styles.footerButtons}>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('RequestDetails', { request });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.helpButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleWantToHelp(request);
                      }}
                      activeOpacity={0.7}
                    >
                      <Heart size={16} color={theme.colors.white} />
                      <Text style={styles.helpButtonText}>I Want to Help</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  filterButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterContent: {
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  filterChipEmoji: {
    fontSize: 14,
  },
  filterChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  resultsCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  requestTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs / 2,
  },
  requestTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  urgencyBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  requestCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  requestBody: {
    marginBottom: theme.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  requestDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  neededText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  neededLabel: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
  },
  requestFooter: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  viewDetailsButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  viewDetailsButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  helpButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
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
  retryButton: {
    marginTop: theme.spacing.md,
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
});

