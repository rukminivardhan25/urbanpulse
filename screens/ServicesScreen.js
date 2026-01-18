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
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Trash2,
  Droplets,
  Zap,
  Stethoscope,
  Building2,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getServices } from '../utils/api';
import { getCurrentUser } from '../utils/api';
import { convert24hrTo12hr, formatTimeRange12hr } from '../utils/timeUtils';

const tabs = [
  { id: 'all', label: 'All', icon: null },
  { id: 'garbage', label: 'Waste', icon: Trash2 },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'power', label: 'Power', icon: Zap },
  { id: 'health', label: 'Health', icon: Stethoscope },
  { id: 'road', label: 'Road', icon: Building2 },
  { id: 'other', label: 'Other', icon: Building2 },
];

// Service type to icon mapping
const getServiceIcon = (serviceType) => {
  const icons = {
    garbage: Trash2,
    water: Droplets,
    power: Zap,
    health: Stethoscope,
    road: Building2,
    other: Building2,
  };
  return icons[serviceType] || Building2;
};

// Service type to label mapping
const getServiceLabel = (serviceType) => {
  const labels = {
    garbage: 'Garbage Collection',
    water: 'Water Supply',
    power: 'Power Updates',
    health: 'Health Services',
    road: 'Road Work',
    other: 'Other Service',
  };
  return labels[serviceType] || serviceType;
};

// Format date to readable format (e.g., "Jan 20" or "20 Jan")
const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Get current year for comparison
    const currentYear = new Date().getFullYear();
    
    // If same year, don't show year
    if (year === currentYear) {
      return `${day} ${month}`;
    } else {
      return `${day} ${month} ${year}`;
    }
  } catch (error) {
    return dateString;
  }
};

// Format posted date (createdAt) for display
const formatPostedDate = (dateString) => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Get current year for comparison
    const currentYear = new Date().getFullYear();
    
    // If same year, don't show year
    if (year === currentYear) {
      return `${day} ${month}`;
    } else {
      return `${day} ${month} ${year}`;
    }
  } catch (error) {
    return '';
  }
};

// Get tag text based on schedule type and time (convert 24hr to 12hr)
const getTagText = (service) => {
  const { scheduleType, startTime, endTime, serviceDate } = service;

  // Convert times from 24hr to 12hr format
  const startTime12hr = startTime ? convert24hrTo12hr(startTime) : null;
  const endTime12hr = endTime ? convert24hrTo12hr(endTime) : null;
  const timeRange = formatTimeRange12hr(startTime, endTime);

  // Format custom date
  const formattedDate = serviceDate ? formatDateDisplay(serviceDate) : '';

  if (startTime12hr && endTime12hr) {
    // Has time range
    switch (scheduleType) {
      case 'daily':
        return `${timeRange} (On Schedule)`;
      case 'today':
        return `${timeRange} Today`;
      case 'tomorrow':
        return `${timeRange} Tomorrow`;
      case 'this_weekend':
        return `${timeRange} This Weekend`;
      case 'custom_date':
        return formattedDate ? `${timeRange} ${formattedDate}` : timeRange;
      default:
        return timeRange;
    }
  } else {
    // No time range
    switch (scheduleType) {
      case 'daily':
        return 'On Schedule';
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'this_weekend':
        return 'This Weekend';
      case 'custom_date':
        return formattedDate || 'On Schedule';
      default:
        return 'On Schedule';
    }
  }
};

// Get tag color based on schedule type
const getTagColor = (scheduleType) => {
  switch (scheduleType) {
    case 'daily':
      return theme.colors.success; // Green
    case 'today':
      return '#FF9800'; // Orange/Yellow
    case 'tomorrow':
      return theme.colors.info || '#2196F3'; // Blue
    case 'this_weekend':
      return '#9C27B0'; // Purple
    case 'custom_date':
      return '#FF9800'; // Orange/Yellow (same as today)
    default:
      return theme.colors.primary;
  }
};

const getSectionTitle = (tabId, serviceCount) => {
  if (tabId === 'all') {
    return `All Services (${serviceCount})`;
  }
  const titles = {
    garbage: 'Waste Services',
    water: 'Water Services',
    power: 'Power Services',
    health: 'Health Services',
    road: 'Road Services',
    other: 'Other Services',
  };
  const title = titles[tabId] || 'Services';
  return `${title} (${serviceCount})`;
};

export default function ServicesScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [userArea, setUserArea] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [notesModalVisible, setNotesModalVisible] = useState(false);

  useEffect(() => {
    loadUserDataAndServices();
  }, []);

  const loadUserDataAndServices = async () => {
    try {
      // Get user data to fetch services for their city/area
      const userResult = await getCurrentUser();
      if (userResult.success && userResult.user) {
        const { city, area } = userResult.user;
        setUserCity(city || '');
        setUserArea(area || '');
        
        if (city && area) {
          await loadServices(city, area);
        } else {
          setServices([]);
          setLoading(false);
        }
      } else {
        setServices([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setServices([]);
      setLoading(false);
    }
  };

  const loadServices = async (city, area) => {
    try {
      setLoading(true);
      const result = await getServices(city, area);
      if (result.success) {
        const servicesList = result.services || [];
        console.log(`✅ Loaded ${servicesList.length} services for city: ${city}, area: ${area}`);
        
        // Log services by type
        const servicesByType = {};
        servicesList.forEach((s) => {
          servicesByType[s.serviceType] = (servicesByType[s.serviceType] || 0) + 1;
        });
        console.log(`📊 Services by type:`, servicesByType);
        console.log(`🔍 All services:`, servicesList.map(s => ({
          id: s.id,
          type: s.serviceType,
          subtype: s.serviceSubtype,
          schedule: s.scheduleType
        })));
        
        setServices(servicesList);
      } else {
        console.log('❌ Services API returned success: false');
        setServices([]);
      }
    } catch (error) {
      console.error('❌ Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userCity && userArea) {
      await loadServices(userCity, userArea);
    }
    setRefreshing(false);
  };

  // Filter services by active tab
  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter((s) => s.serviceType === activeTab);

  // Debug: Log filtering
  useEffect(() => {
    if (services.length > 0) {
      const serviceTypesCount = {};
      services.forEach((s) => {
        serviceTypesCount[s.serviceType] = (serviceTypesCount[s.serviceType] || 0) + 1;
      });
      console.log(`📊 Services by type:`, serviceTypesCount);
      console.log(`📋 Total services: ${services.length}, Active tab: ${activeTab}, Filtered: ${filteredServices.length}`);
      console.log(`🔍 Filtered services:`, filteredServices.map(s => ({ type: s.serviceType, subtype: s.serviceSubtype })));
    }
  }, [services, activeTab, filteredServices]);

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
        <Text style={styles.headerTitle}>City Services</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
          bounces={false}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabServiceCount = tab.id === 'all' 
              ? services.length 
              : services.filter((s) => s.serviceType === tab.id).length;
            
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                {Icon && (
                  <Icon
                    size={14}
                    color={isActive ? theme.colors.white : theme.colors.textLight}
                  />
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label} {tabServiceCount > 0 ? `(${tabServiceCount})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section Title */}
        <Text style={styles.sectionTitle}>
          {getSectionTitle(activeTab, filteredServices.length)}
        </Text>

        {/* Loading State */}
        {loading && filteredServices.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available</Text>
            <Text style={styles.emptySubtext}>
              {userCity && userArea 
                ? 'No services scheduled for your area. Pull to refresh.'
                : 'Please set your location to see services.'}
            </Text>
          </View>
        )}

        {/* Service Cards */}
        {filteredServices.map((service, index) => {
          const Icon = getServiceIcon(service.serviceType);
          const tagText = getTagText(service);
          const tagColor = getTagColor(service.scheduleType);
          const tagBg = `${tagColor}20`;

          // Ensure unique key
          const uniqueKey = service.id ? `${service.id}-${index}` : `service-${index}`;

          return (
            <TouchableOpacity
              key={uniqueKey}
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => {
                if (service.notes) {
                  setSelectedService(service);
                  setNotesModalVisible(true);
                }
              }}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Icon size={18} color={theme.colors.white} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.serviceTitle}>
                      {getServiceLabel(service.serviceType)}
                    </Text>
                    {/* Show subtype if exists */}
                    {service.serviceSubtype ? (
                      <Text style={styles.serviceDescription}>
                        {service.serviceSubtype}
                      </Text>
                    ) : (
                      /* Fallback if no subtype */
                      !service.notes && (
                        <Text style={styles.serviceDescription}>
                          {getServiceLabel(service.serviceType)}
                        </Text>
                      )
                    )}
                    {/* Show notes indicator if notes exist */}
                    {service.notes && (
                      <Text style={styles.notesIndicator}>
                        📝 Tap to view details
                      </Text>
                    )}
                  </View>
                </View>
                {/* Posted Date on the right */}
                {service.createdAt && (
                  <View style={styles.postedDateContainer}>
                    <Text style={styles.postedDateLabel}>Posted:</Text>
                    <Text style={styles.postedDateText}>
                      {formatPostedDate(service.createdAt)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.scheduleTag, { backgroundColor: tagBg }]}>
                <Text style={[styles.scheduleText, { color: tagColor }]}>
                  {tagText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notes Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notesModalVisible}
        onRequestClose={() => {
          setNotesModalVisible(false);
          setSelectedService(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setNotesModalVisible(false);
              setSelectedService(null);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedService ? getServiceLabel(selectedService.serviceType) : ''}
              </Text>
              {selectedService?.serviceSubtype && (
                <Text style={styles.modalSubtitle}>
                  {selectedService.serviceSubtype}
                </Text>
              )}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setNotesModalVisible(false);
                  setSelectedService(null);
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedService?.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Details</Text>
                  <Text style={styles.notesText}>{selectedService.notes}</Text>
                </View>
              )}

              {selectedService && (selectedService.startTime || selectedService.endTime) && (
                <View style={styles.serviceInfoContainer}>
                  <Text style={styles.serviceInfoLabel}>Schedule</Text>
                  <Text style={styles.serviceInfoText}>
                    {formatTimeRange12hr(selectedService.startTime, selectedService.endTime) || 'On Schedule'}
                  </Text>
                </View>
              )}

              <View style={styles.serviceInfoContainer}>
                <Text style={styles.serviceInfoLabel}>Frequency</Text>
                <Text style={styles.serviceInfoText}>
                  {selectedService && getTagText(selectedService)}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 0,
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
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
  tabsWrapper: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: 40,
  },
  tabsContainer: {
    backgroundColor: 'transparent',
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
    alignItems: 'center',
    height: 40,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'transparent',
    height: 32,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
    lineHeight: 16,
  },
  tabLabelActive: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 0,
    paddingBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: 0,
    paddingTop: 0,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 16,
  },
  notesIndicator: {
    fontSize: 11,
    color: theme.colors.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl || 20,
    borderTopRightRadius: theme.borderRadius.xl || 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    position: 'relative',
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  modalCloseButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 20,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  notesContainer: {
    marginBottom: theme.spacing.lg,
  },
  notesLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  serviceInfoContainer: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  serviceInfoLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  serviceInfoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  scheduleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginTop: 6,
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.medium,
  },
  postedDateContainer: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.sm,
  },
  postedDateLabel: {
    fontSize: 9,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  postedDateText: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
});
