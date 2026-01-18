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
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  MapPin,
  Bell,
  Trash2,
  Droplets,
  Zap,
  Stethoscope,
  AlertTriangle,
  Info,
  Hospital,
  Shield,
  Flame,
  FileText,
  Building2,
  AlertCircle,
  HelpCircle,
  Heart,
  Navigation,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { EmergencyButton } from '../components/EmergencyButton';
import { BottomNav } from '../components/BottomNav';
import { getCurrentUser, getServices, getAlerts, getUnreadNotificationCount } from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { convert24hrTo12hr, formatTimeRange12hr } from '../utils/timeUtils';
import { alertCategories } from '../constants/alertCategories';
import { getNearbyEmergencyServices } from '../utils/openStreetMapService';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { t, currentLanguage } = useTranslation(); // Include to trigger re-render
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Format location as "Area, City" for dashboard
  const formatShortLocation = (userData) => {
    if (!userData) return 'Location not set';
    const parts = [];
    if (userData.area) parts.push(userData.area);
    if (userData.city) parts.push(userData.city);
    return parts.join(', ') || userData.city || 'Location not set';
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData.user);
      // Fetch services, alerts, and notifications if user has location
      if (userData.user?.city && userData.user?.area) {
        await Promise.all([
          fetchServices(userData.user.city, userData.user.area),
          fetchAlerts(userData.user.city, userData.user.area),
          fetchUnreadCount(),
        ]);
      } else {
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationCount();
      if (result.success && result.unreadCount !== undefined) {
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Fetch services
  const fetchServices = async (city, area) => {
    try {
      setLoadingServices(true);
      const result = await getServices(city, area);
      if (result.success && result.services) {
        // Filter active services and limit to 4
        const activeServices = result.services
          .filter((service) => service.isActive !== false)
          .slice(0, 4);
        setServices(activeServices);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async (city, area) => {
    try {
      setLoadingAlerts(true);
      const result = await getAlerts(city, area);
      if (result.success && result.alerts) {
        // Sort by priority (emergency first) and limit to 3
        const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
        const sortedAlerts = result.alerts
          .sort((a, b) => {
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
          })
          .slice(0, 3);
        setAlerts(sortedAlerts);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Fetch user data on mount and when screen comes into focus
  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

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

  // Format date to readable format
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        return `${day} ${month}`;
      } else {
        return `${day} ${month} ${year}`;
      }
    } catch (error) {
      return '';
    }
  };

  // Get tag text based on schedule type and time
  const getTagText = (service) => {
    const { scheduleType, startTime, endTime, serviceDate } = service;
    const startTime12hr = startTime ? convert24hrTo12hr(startTime) : null;
    const endTime12hr = endTime ? convert24hrTo12hr(endTime) : null;
    const timeRange = formatTimeRange12hr(startTime, endTime);
    const formattedDate = serviceDate ? formatDateDisplay(serviceDate) : '';

    if (startTime12hr && endTime12hr) {
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
        return '#FF9800'; // Orange/Yellow
      default:
        return theme.colors.success;
    }
  };

  // Get service details text
  const getServiceDetails = (service) => {
    if (service.serviceSubtype) {
      return service.serviceSubtype;
    }
    if (service.startTime && service.endTime) {
      return formatTimeRange12hr(service.startTime, service.endTime);
    }
    return getServiceLabel(service.serviceType);
  };

  // Priority icons mapping
  const getPriorityIcon = (priority) => {
    const icons = {
      emergency: AlertCircle,
      urgent: AlertTriangle,
      normal: Info,
    };
    return icons[priority] || Info;
  };

  // Get priority styles
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'emergency':
        return {
          iconColor: theme.colors.error || '#DC2626',
          bgColor: `${theme.colors.error || '#DC2626'}20`,
        };
      case 'urgent':
        return {
          iconColor: theme.colors.warning || '#F59E0B',
          bgColor: `${theme.colors.warning || '#F59E0B'}20`,
        };
      case 'normal':
      default:
        return {
          iconColor: theme.colors.info || '#3B82F6',
          bgColor: `${theme.colors.info || '#3B82F6'}20`,
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryKey) => {
    return alertCategories[categoryKey]?.icon || '📢';
  };

  // Format time ago
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
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
    } catch (error) {
      return '';
    }
  };

  const [nearbyHelp, setNearbyHelp] = useState([
    {
      icon: Hospital,
      label: 'Hospital',
      distance: '1.2 km',
      contact: '108',
    },
    {
      icon: Shield,
      label: 'Police',
      distance: '0.8 km',
      contact: '100',
    },
    {
      icon: Flame,
      label: 'Fire Station',
      distance: '2.1 km',
      contact: '101',
    },
  ]);

  // Handle location fetch for nearby help
  const handleGetNearbyHelp = async () => {
    try {
      setLoadingLocation(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby emergency services. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        setLoadingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      // Fetch nearby emergency services from OpenStreetMap
      const nearbyServices = await getNearbyEmergencyServices(latitude, longitude);

      // Update nearbyHelp with real data
      const updatedNearbyHelp = [];
      
      if (nearbyServices.hospital) {
        updatedNearbyHelp.push({
          icon: Hospital,
          label: 'Hospital',
          distance: nearbyServices.hospital.distanceFormatted,
          contact: '108',
          location: {
            latitude: nearbyServices.hospital.latitude,
            longitude: nearbyServices.hospital.longitude,
            name: nearbyServices.hospital.name,
            address: nearbyServices.hospital.address,
          },
        });
      }

      if (nearbyServices.police) {
        updatedNearbyHelp.push({
          icon: Shield,
          label: 'Police',
          distance: nearbyServices.police.distanceFormatted,
          contact: '100',
          location: {
            latitude: nearbyServices.police.latitude,
            longitude: nearbyServices.police.longitude,
            name: nearbyServices.police.name,
            address: nearbyServices.police.address,
          },
        });
      }

      if (nearbyServices.fireStation) {
        updatedNearbyHelp.push({
          icon: Flame,
          label: 'Fire Station',
          distance: nearbyServices.fireStation.distanceFormatted,
          contact: '101',
          location: {
            latitude: nearbyServices.fireStation.latitude,
            longitude: nearbyServices.fireStation.longitude,
            name: nearbyServices.fireStation.name,
            address: nearbyServices.fireStation.address,
          },
        });
      }

      // If no services found, keep default or show message
      if (updatedNearbyHelp.length > 0) {
        setNearbyHelp(updatedNearbyHelp);
      } else {
        Alert.alert(
          'No Services Found',
          'No nearby emergency services found in your area. Please try again later or check your location settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting nearby help:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please check your location settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const quickActions = [
    {
      icon: FileText,
      label: t('dashboard.reportIssue'),
      bgColor: `${theme.colors.primary}20`,
      iconColor: theme.colors.primary,
      textColor: theme.colors.primary,
      onPress: () => navigation.navigate('ReportIssue'),
    },
    {
      icon: Trash2,
      label: t('dashboard.myComplaints'),
      bgColor: `${theme.colors.accent}20`,
      iconColor: theme.colors.accent,
      textColor: theme.colors.text,
      onPress: () => navigation.navigate('Complaints'),
    },
    {
      icon: HelpCircle,
      label: 'Make a Request',
      bgColor: `${theme.colors.success}20`,
      iconColor: theme.colors.success,
      textColor: theme.colors.success,
      onPress: () => navigation.navigate('MakeRequest'),
    },
    {
      icon: Heart,
      label: 'Help Requests',
      bgColor: `${theme.colors.error || '#DC2626'}20`,
      iconColor: theme.colors.error || '#DC2626',
      textColor: theme.colors.error || '#DC2626',
      onPress: () => navigation.navigate('HelpRequests'),
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'services') navigation.navigate('Services');
    if (tab === 'report') navigation.navigate('ReportIssue');
    if (tab === 'alerts') navigation.navigate('Alerts');
    if (tab === 'profile') navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationSection}>
            <View style={styles.locationIcon}>
              <MapPin size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.locationLabel}>{t('dashboard.yourArea')}</Text>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.textLight} />
              ) : (
                <Text style={styles.locationText}>{formatShortLocation(user)}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bellContainer}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency SOS Button */}
        <View style={styles.emergencySection}>
          <EmergencyButton onPress={() => navigation.navigate('EmergencyServices')} />
        </View>

        {/* Active Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Services')}>
              <Text style={styles.viewAllText}>{t('dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyServicesContainer}>
              <Text style={styles.emptyServicesText}>No active services</Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service, index) => {
                const Icon = getServiceIcon(service.serviceType);
                const tagText = getTagText(service);
                const tagColor = getTagColor(service.scheduleType);
                const tagBg = `${tagColor}20`;
                const serviceDetails = getServiceDetails(service);

                return (
                  <TouchableOpacity
                    key={service.id || index}
                    style={styles.serviceCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Services')}
                  >
                    <View style={styles.serviceIconContainer}>
                      <Icon size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                      {getServiceLabel(service.serviceType)}
                    </Text>
                    <Text style={styles.serviceDetailsText} numberOfLines={1}>
                      {serviceDetails}
                    </Text>
                    <View
                      style={[
                        styles.statusTag,
                        { backgroundColor: tagBg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: tagColor }]}
                        numberOfLines={1}
                      >
                        {tagText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.recentAlerts')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.viewAllText}>{t('dashboard.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          {loadingAlerts && alerts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyAlertsContainer}>
              <Text style={styles.emptyAlertsText}>No alerts</Text>
            </View>
          ) : (
            alerts.map((alert) => {
              const PriorityIcon = getPriorityIcon(alert.priority);
              const priorityStyles = getPriorityStyles(alert.priority);
              const categoryIcon = getCategoryIcon(alert.category);

              return (
                <TouchableOpacity
                  key={alert.id}
                  style={[styles.alertCard, { backgroundColor: priorityStyles.bgColor }]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Alerts')}
                >
                  <View
                    style={[
                      styles.alertIconContainer,
                      { backgroundColor: `${priorityStyles.iconColor}20` },
                    ]}
                  >
                    <PriorityIcon size={20} color={priorityStyles.iconColor} />
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeaderRow}>
                      <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                      <Text style={styles.alertType}>{alert.alertType}</Text>
                    </View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage} numberOfLines={2}>
                      {alert.message}
                    </Text>
                  </View>
                  <Text style={styles.alertTime}>{formatTimeAgo(alert.createdAt)}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Nearby Help */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Help</Text>
            <TouchableOpacity
              onPress={handleGetNearbyHelp}
              style={styles.locationIconButton}
              disabled={loadingLocation}
              activeOpacity={0.7}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Navigation size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.nearbyHelpGrid}>
            {nearbyHelp.map((help, index) => (
              <TouchableOpacity
                key={index}
                style={styles.nearbyHelpCard}
                activeOpacity={0.8}
                onPress={() => {
                  if (help.location && currentLocation) {
                    navigation.navigate('MapScreen', {
                      destination: help.location,
                      origin: currentLocation,
                      title: help.label,
                      contact: help.contact,
                    });
                  }
                }}
              >
                <View style={styles.nearbyHelpIconContainer}>
                  <help.icon size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.nearbyHelpLabel}>{help.label}</Text>
                <Text style={styles.nearbyHelpDistance}>{help.distance}</Text>
                <Text style={styles.nearbyHelpContact}>{help.contact}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickActionCard,
                  { backgroundColor: action.bgColor },
                ]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.quickActionIconContainer,
                    { backgroundColor: `${action.iconColor}20` },
                  ]}
                >
                  <action.icon size={24} color={action.iconColor} />
                </View>
                <Text
                  style={[styles.quickActionLabel, { color: action.textColor }]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for bottom nav */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
  },
  locationLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  locationText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  bellContainer: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  emergencySection: {
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  locationIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  serviceDetailsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyServicesContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyServicesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs / 2,
  },
  categoryIcon: {
    fontSize: 14,
  },
  alertType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  alertTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  alertMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    flexShrink: 0,
    marginTop: 2,
  },
  emptyAlertsContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAlertsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  nearbyHelpGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nearbyHelpCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nearbyHelpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  nearbyHelpLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  nearbyHelpDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  nearbyHelpContact: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
});
