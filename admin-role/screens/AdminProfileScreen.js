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
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  LogOut,
  Settings,
  Shield,
  Edit,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { removeAuthToken, getCurrentAdmin } from '../utils/api';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { removeToken } from '../utils/auth';

export default function AdminProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout } = useAdminAuth();
  
  const [adminData, setAdminData] = useState({
    name: '',
    phone: '',
    city: '',
    area: '',
    mandal: '',
    district: '',
    state: '',
    pincode: '',
    role: 'Area Admin',
    joinedDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentAdmin();
      
      if (response.success && response.admin) {
        const admin = response.admin;
        setAdminData({
          name: admin.name || '',
          phone: admin.phone || '',
          city: admin.city || '',
          area: admin.area || '',
          mandal: admin.mandal || '',
          district: admin.district || '',
          state: admin.state || '',
          pincode: admin.pincode || '',
          role: 'Area Admin',
          joinedDate: admin.createdAt ? new Date(admin.createdAt) : new Date(),
        });
      } else {
        setError('Failed to fetch admin data');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAdminData();
    }, [])
  );

  // Format phone number display
  const formatPhone = (phone) => {
    if (!phone) return '';
    // If phone already has +, return as is, otherwise add +91
    return phone.startsWith('+') ? phone : `+91${phone}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not available';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Not available';
    }
  };

  // Format detailed address from location components
  const formatDetailedAddress = () => {
    const parts = [];
    if (adminData.area) parts.push(adminData.area);
    if (adminData.city) parts.push(adminData.city);
    if (adminData.mandal) parts.push(adminData.mandal);
    if (adminData.district) parts.push(adminData.district);
    if (adminData.state) parts.push(adminData.state);
    if (adminData.pincode) parts.push(adminData.pincode);
    
    if (parts.length === 0) {
      return 'Location not set';
    }
    
    return parts.join(', ');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear admin session/token
            await removeAuthToken();
            await removeToken();
            await logout();
            // Navigate to landing screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'AdminLanding' }],
            });
          },
        },
      ]
    );
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      'Switch Account',
      'You will be logged out and can login with a different phone number.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Switch',
          style: 'default',
          onPress: async () => {
            try {
              // Clear admin session/token first
              await removeAuthToken();
              await removeToken();
              
              // Logout to update auth state
              await logout();
              
              // Navigate to signin screen
              // Using setTimeout to ensure state update completes first
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'AdminSignin' }],
                });
              }, 100);
            } catch (error) {
              console.error('Error switching account:', error);
              Alert.alert('Error', 'Failed to switch account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignupNewAccount = () => {
    Alert.alert(
      'Create New Account',
      'You will be logged out and can create a new admin account with a different phone number.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'default',
          onPress: async () => {
            try {
              // Clear admin session/token first
              await removeAuthToken();
              await removeToken();
              
              // Logout to update auth state
              await logout();
              
              // Navigate to landing screen (which has signup option)
              // Using setTimeout to ensure state update completes first
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'AdminLanding' }],
                });
              }, 100);
            } catch (error) {
              console.error('Error creating new account:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.editButton} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.editButton} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchAdminData}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Edit size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Shield size={48} color={theme.colors.admin} />
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{adminData.role}</Text>
            </View>
          </View>
          <Text style={styles.adminName}>{adminData.name || 'Admin User'}</Text>
          <Text style={styles.adminPhone}>{formatPhone(adminData.phone) || 'Not available'}</Text>
        </View>

        {/* Location Details */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={20} color={theme.colors.admin} />
            <Text style={styles.locationTitle}>Assigned Location</Text>
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.locationAddress}>
              {formatDetailedAddress()}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <User size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{adminData.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Phone size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{formatPhone(adminData.phone) || 'Not available'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Settings size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Joined Date</Text>
                <Text style={styles.infoValue}>
                  {formatDate(adminData.joinedDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSwitchAccount}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                <User size={20} color={theme.colors.info} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Switch Account</Text>
                <Text style={styles.actionDescription}>
                  Login with a different phone number
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSignupNewAccount}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Shield size={20} color={theme.colors.success} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Create New Account</Text>
                <Text style={styles.actionDescription}>
                  Sign up as admin for another area
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
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
  editButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.admin + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.admin,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: theme.colors.admin,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  roleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  adminName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  adminPhone: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  locationCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  locationTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
  },
  locationContent: {
    marginTop: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md + 40 + theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  actionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  logoutSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  addressValue: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});

