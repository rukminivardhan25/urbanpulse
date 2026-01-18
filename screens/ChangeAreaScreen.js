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
import { ArrowLeft, MapPin, Plus, Check, ChevronRight } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { getCurrentUser, updateUserLocation } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ChangeAreaScreen() {
  const navigation = useNavigation();
  const { checkAuthStatus } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Format location as "Area, City, Mandal, State - Pincode"
  const formatLocation = (location) => {
    if (!location) return 'Location not set';
    const parts = [];
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.district) parts.push(location.district); // district stores mandal
    if (location.state) parts.push(location.state);
    const locationStr = parts.join(', ');
    if (location.pincode) {
      return `${locationStr} - ${location.pincode}`;
    }
    return locationStr || 'Location not set';
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  // Get current location object
  const getCurrentLocation = () => {
    if (!user) return null;
    return {
      state: user.state,
      district: user.district,
      city: user.city,
      area: user.area,
      pincode: user.pincode,
      address: user.address,
      streetNumber: user.streetNumber,
      houseNumber: user.houseNumber,
      landmark: user.landmark,
      latitude: user.latitude,
      longitude: user.longitude,
    };
  };

  // Select a previous location
  const handleSelectLocation = async (location) => {
    if (!location) return;

    setSaving(true);
    try {
      // Save selected location as current
      await updateUserLocation(location);
      
      // Refresh user data
      await fetchUserData();
      
      // Refresh auth status to update other screens
      await checkAuthStatus();
      
      Alert.alert('Success', 'Location updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Fetch on mount and focus
  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const currentLocation = getCurrentLocation();
  const previousLocations = user?.locationHistory || [];

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
        <Text style={styles.headerTitle}>Change Area</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Current Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              {currentLocation ? (
                <View style={styles.locationCard}>
                  <View style={styles.locationContent}>
                    <View style={styles.locationHeader}>
                      <MapPin size={20} color={theme.colors.primary} />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationTextLine1}>
                          {user?.address || 'No address set'}
                        </Text>
                        <Text style={styles.locationTextLine2}>
                          {formatLocation(currentLocation)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.currentBadge}>
                      <Check size={16} color={theme.colors.white} />
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No location set</Text>
                </View>
              )}
            </View>

            {/* Previous Locations Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous Locations</Text>
              {previousLocations.length > 0 ? (
                previousLocations.map((location, index) => {
                  // Skip if it's the same as current location
                  const isCurrent = 
                    location.area === currentLocation?.area &&
                    location.city === currentLocation?.city &&
                    location.district === currentLocation?.district &&
                    location.state === currentLocation?.state;
                  
                  if (isCurrent) return null;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectLocation(location)}
                      style={styles.locationCard}
                      disabled={saving}
                    >
                      <View style={styles.locationContent}>
                        <View style={styles.locationHeader}>
                          <MapPin size={20} color={theme.colors.textLight} />
                          <View style={styles.locationTextContainer}>
                            <Text style={styles.locationTextLine1}>
                              {location.address || 'No address set'}
                            </Text>
                            <Text style={styles.locationTextLine2}>
                              {formatLocation(location)}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color={theme.colors.textLight} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No previous locations</Text>
                </View>
              )}
            </View>

            {/* Add New Area Button */}
            <PrimaryButton
              title="Add New Area"
              onPress={() => navigation.navigate('LocationSelection', { isEditing: true })}
              loading={saving}
              style={styles.addButton}
            />
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
  locationCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    flex: 1,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTextLine1: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs / 2,
  },
  locationTextLine2: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  locationText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.white,
  },
  emptyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
});

