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
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  Settings,
  Bell,
  FileText,
  MapPin,
  User,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getAdminServices, getAdminAlerts, getAdminIssues, getCurrentAdmin } from '../utils/api';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [activeServicesCount, setActiveServicesCount] = useState(0);
  const [loadingServices, setLoadingServices] = useState(true);
  const [totalAlertsCount, setTotalAlertsCount] = useState(0);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [activeReportsCount, setActiveReportsCount] = useState(0);
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch admin location from profile
  const fetchAdminLocation = async () => {
    try {
      setLoadingLocation(true);
      const result = await getCurrentAdmin();
      console.log('Admin profile API response:', result);
      if (result && result.success && result.admin) {
        const adminData = result.admin;
        // Use location from admin profile (set during signup)
        setCity(adminData.city || '');
        setArea(adminData.area || '');
      } else {
        console.warn('Admin profile response format unexpected:', result);
        // Fallback to route params if available
        const { city: routeCity, area: routeArea } = route.params || {};
        if (routeCity && routeArea) {
          setCity(routeCity);
          setArea(routeArea);
        }
      }
    } catch (error) {
      console.error('Error fetching admin location:', error);
      // Fallback to route params if available
      const { city: routeCity, area: routeArea } = route.params || {};
      if (routeCity && routeArea) {
        setCity(routeCity);
        setArea(routeArea);
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch active services count
  const fetchActiveServicesCount = async () => {
    try {
      setLoadingServices(true);
      const result = await getAdminServices();
      console.log('Services API response:', result);
      if (result && result.success && Array.isArray(result.services)) {
        // Backend already filters for isActive: true, so count all returned services
        setActiveServicesCount(result.services.length);
      } else {
        console.warn('Services response format unexpected:', result);
        setActiveServicesCount(0);
      }
    } catch (error) {
      console.error('Error fetching services count:', error);
      setActiveServicesCount(0);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch total alerts count
  const fetchTotalAlertsCount = async () => {
    try {
      setLoadingAlerts(true);
      const result = await getAdminAlerts();
      console.log('Alerts API response:', result);
      if (result && result.success && Array.isArray(result.alerts)) {
        // Count all alerts (active and inactive)
        setTotalAlertsCount(result.alerts.length);
      } else {
        console.warn('Alerts response format unexpected:', result);
        setTotalAlertsCount(0);
      }
    } catch (error) {
      console.error('Error fetching alerts count:', error);
      setTotalAlertsCount(0);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Fetch active (unresolved) reports count
  const fetchActiveReportsCount = async () => {
    try {
      setLoadingReports(true);
      const result = await getAdminIssues();
      console.log('Issues API response:', result);
      if (result && result.success && Array.isArray(result.data)) {
        // Filter out resolved reports - count only unresolved ones
        const unresolvedReports = result.data.filter(
          (issue) => issue.status !== 'Resolved'
        );
        setActiveReportsCount(unresolvedReports.length);
      } else {
        console.warn('Issues response format unexpected:', result);
        setActiveReportsCount(0);
      }
    } catch (error) {
      console.error('Error fetching active reports count:', error);
      setActiveReportsCount(0);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch on mount and when screen comes into focus
  useEffect(() => {
    fetchAdminLocation();
    fetchActiveServicesCount();
    fetchTotalAlertsCount();
    fetchActiveReportsCount();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAdminLocation();
      fetchActiveServicesCount();
      fetchTotalAlertsCount();
      fetchActiveReportsCount();
    }, [])
  );

  const menuItems = [
    {
      id: 'services',
      title: 'Manage Services',
      description: 'Update water, power, garbage timings',
      icon: Settings,
      color: theme.colors.primary,
      screen: 'ManageServices',
    },
    {
      id: 'alerts',
      title: 'Send Alerts',
      description: 'Post alerts and notifications',
      icon: Bell,
      color: theme.colors.warning,
      screen: 'SendAlerts',
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'See user reports and complaints',
      icon: FileText,
      color: theme.colors.info,
      screen: 'ViewReports',
    },
  ];

  const stats = [
    { 
      label: 'Active Reports', 
      value: loadingReports ? '...' : String(activeReportsCount), 
      color: theme.colors.info 
    },
    { 
      label: 'Total Alerts', 
      value: loadingAlerts ? '...' : String(totalAlertsCount), 
      color: theme.colors.warning 
    },
    { 
      label: 'Active Services', 
      value: loadingServices ? '...' : String(activeServicesCount), 
      color: theme.colors.success 
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.admin} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <MapPin size={20} color={theme.colors.white} />
            <View style={styles.locationText}>
              {loadingLocation ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.city}>{city || 'Location not set'}</Text>
                  <Text style={styles.area}>{area || ''}</Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminProfile')}
            style={styles.profileButton}
          >
            <User size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>
            Manage services and alerts for {area}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Main Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                  <IconComponent size={24} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    backgroundColor: theme.colors.admin,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: theme.spacing.sm,
  },
  city: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  area: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white + 'CC',
    marginTop: 2,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  menuContainer: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  menuDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
});

