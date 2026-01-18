import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Search, Check } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { updateUserLocation } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const cities = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Chandigarh',
];

const areas = {
  Chandigarh: ['Sector 15', 'Sector 17', 'Sector 22', 'Sector 35', 'Sector 43'],
  Delhi: ['Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj'],
  Mumbai: ['Andheri', 'Bandra', 'Colaba', 'Juhu', 'Powai'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Chennai: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore'],
  Kolkata: ['Salt Lake', 'Park Street', 'New Town', 'Howrah', 'Ballygunge'],
  Hyderabad: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'HITEC City', 'Madhapur'],
  Pune: ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Kothrud', 'Aundh'],
};

export default function AreaSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const isNewUser = route.params?.isNewUser || false;
  const [step, setStep] = useState('city');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAreas = selectedCity
    ? areas[selectedCity]?.filter((area) =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : [];

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchQuery('');
    setStep('area');
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
  };

  const handleContinue = async () => {
    if (!selectedArea || !selectedCity) {
      Alert.alert('Error', 'Please select both city and area');
      return;
    }

    setLoading(true);

    try {
      // Map city to state (simplified mapping)
      const cityToState = {
        'Delhi': 'Delhi',
        'Mumbai': 'Maharashtra',
        'Bangalore': 'Karnataka',
        'Chennai': 'Tamil Nadu',
        'Kolkata': 'West Bengal',
        'Hyderabad': 'Telangana',
        'Pune': 'Maharashtra',
        'Chandigarh': 'Chandigarh',
      };

      const state = cityToState[selectedCity] || selectedCity;
      // Use a default pincode or you can add a pincode input field
      const pincode = '000000'; // Default pincode - you may want to add an input for this

      const locationData = {
        city: selectedCity,
        area: selectedArea,
        state: state,
        pincode: pincode,
      };

      // Save location to backend (for new users, this might already be saved during signup)
      if (isNewUser) {
        // Location should already be saved during signup, but update if needed
        try {
          await updateUserLocation(locationData);
        } catch (err) {
          console.log('Location update error (may already be saved):', err);
          // Continue anyway as location might already be saved during signup
        }
      } else {
        // Update location for existing user
        await updateUserLocation(locationData);
      }

      // Update auth state (token should already be set from signup)
      await login();
      
      // Navigate to Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step === 'area' ? setStep('city') : navigation.goBack())}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'city' ? 'Select Your City' : 'Select Your Area'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={step === 'city' ? 'Search city...' : 'Search area...'}
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Selection List */}
        <View style={styles.listContainer}>
          {step === 'city' ? (
            filteredCities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => handleCitySelect(city)}
                style={[
                  styles.listItem,
                  selectedCity === city && styles.listItemSelected,
                ]}
              >
                <MapPin size={20} color={selectedCity === city ? theme.colors.white : theme.colors.primary} />
                <Text
                  style={[
                    styles.listItemText,
                    selectedCity === city && styles.listItemTextSelected,
                  ]}
                >
                  {city}
                </Text>
                {selectedCity === city && (
                  <Check size={20} color={theme.colors.white} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <>
              <View style={styles.cityIndicator}>
                <MapPin size={16} color={theme.colors.textLight} />
                <Text style={styles.cityIndicatorText}>{selectedCity}</Text>
              </View>
              {filteredAreas.map((area) => (
                <TouchableOpacity
                  key={area}
                  onPress={() => handleAreaSelect(area)}
                  style={[
                    styles.listItem,
                    selectedArea === area && styles.listItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.listItemText,
                      selectedArea === area && styles.listItemTextSelected,
                    ]}
                  >
                    {area}
                  </Text>
                  {selectedArea === area && (
                    <Check size={20} color={theme.colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Map Preview Placeholder */}
        {step === 'area' && selectedArea && (
          <View style={styles.mapPreview}>
            <MapPin size={32} color={theme.colors.primary} />
            <Text style={styles.mapPreviewText}>
              {selectedArea}, {selectedCity}
            </Text>
          </View>
        )}

        {/* Continue Button */}
        {step === 'area' && (
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedArea || loading}
            loading={loading}
            style={styles.continueButton}
          />
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  listContainer: {
    marginBottom: theme.spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  listItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  listItemText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  listItemTextSelected: {
    color: theme.colors.white,
  },
  cityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  cityIndicatorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  mapPreview: {
    height: 120,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.secondary}30`,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mapPreviewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  continueButton: {
    marginTop: theme.spacing.md,
  },
});
