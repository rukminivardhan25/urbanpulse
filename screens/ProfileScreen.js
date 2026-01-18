import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Bell,
  Eye,
  Volume2,
  LogOut,
  ChevronRight,
  Moon,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { removeAuthToken, getCurrentUser } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getLanguageByCode } from '../constants/languages';
import { useTranslation } from '../hooks/useTranslation';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const { t, currentLanguage: lang } = useTranslation(); // Include to trigger re-render
  const [notifications, setNotifications] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentLanguageName = getLanguageByCode(currentLanguage)?.nativeName || 'English';

  // Format detailed address as a single complete address
  const formatDetailedAddress = (userData) => {
    if (!userData) return 'Address not set';
    
    const parts = [];
    
    // Build complete address from most specific to least specific
    if (userData.address) {
      parts.push(userData.address);
    }
    if (userData.area) {
      parts.push(userData.area);
    }
    if (userData.city) {
      parts.push(userData.city);
    }
    if (userData.mandal) {
      parts.push(userData.mandal);
    }
    if (userData.district) {
      parts.push(userData.district);
    }
    if (userData.state) {
      parts.push(userData.state);
    }
    if (userData.pincode) {
      parts.push(userData.pincode);
    }
    
    if (parts.length === 0) {
      return 'Address not set';
    }
    
    return parts.join(', ');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

  const menuItems = [
    {
      icon: MapPin,
      label: t('profile.changeArea'),
      subtitle: formatDetailedAddress(user),
      action: () => navigation.navigate('ChangeArea'),
    },
    {
      icon: Globe,
      label: t('profile.language'),
      subtitle: currentLanguageName,
      action: () => navigation.navigate('LanguageSelection'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      t('profile.logOut'),
      t('profile.logOutConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logOut'),
          style: 'destructive',
          onPress: async () => {
            await removeAuthToken();
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Landing' }],
            });
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
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.avatarText}>{getUserInitials(user?.name)}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.action}
              style={styles.menuItem}
            >
              <View style={styles.menuIcon}>
                <item.icon size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.notifications')}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.menuIcon}>
                <Bell size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{t('profile.pushNotifications')}</Text>
                <Text style={styles.settingSubtitle}>{t('profile.alertsAndUpdates')}</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.accessibility')}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.menuIcon}>
                <Eye size={20} color={theme.colors.textLight} />
              </View>
              <Text style={styles.settingLabel}>{t('profile.largeText')}</Text>
            </View>
            <Switch
              value={largeText}
              onValueChange={setLargeText}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.menuIcon}>
                <Moon size={20} color={theme.colors.textLight} />
              </View>
              <Text style={styles.settingLabel}>{t('profile.highContrast')}</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={styles.menuIcon}>
                <Volume2 size={20} color={theme.colors.textLight} />
              </View>
              <Text style={styles.settingLabel}>{t('profile.voiceMode')}</Text>
            </View>
            <Switch
              value={voiceMode}
              onValueChange={setVoiceMode}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <View style={styles.logoutIcon}>
            <LogOut size={20} color={theme.colors.emergency} />
          </View>
          <Text style={styles.logoutText}>{t('profile.logOut')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>UrbanPulse v1.0.0</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  profileEmail: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.xs / 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.textLight}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  menuSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs / 2,
  },
  menuSubtitle2: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs / 2,
    fontWeight: theme.fontWeight.medium,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  settingSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs / 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.emergency}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.emergency,
  },
  versionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});

