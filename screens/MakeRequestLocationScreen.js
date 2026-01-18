import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Search, Check, Map } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { searchPlaces, reverseGeocode, debounce } from '../utils/placeSearch';

export default function MakeRequestLocationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get existing location from route params (if editing)
  const existingLocation = route.params?.location || {};

  // Tab state: 'map' | 'manual'
  const [activeTab, setActiveTab] = useState('manual');
  
  // Flow state: 'search' | 'review' (for manual tab: search -> review)
  // For map tab: always show map button only
  // If existing location has data, start with review screen
  const hasExistingLocation = !!(existingLocation.city && existingLocation.area);
  const [flow, setFlow] = useState(hasExistingLocation ? 'review' : 'search');
  
  // Search state (for map tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Location data (for report, separate from user's address)
  const [state, setState] = useState(existingLocation.state || '');
  const [district, setDistrict] = useState(existingLocation.district || '');
  const [city, setCity] = useState(existingLocation.city || '');
  const [mandal, setMandal] = useState(existingLocation.mandal || '');
  const [area, setArea] = useState(existingLocation.area || '');
  const [pincode, setPincode] = useState(existingLocation.pincode || '');
  const [address, setAddress] = useState(existingLocation.address || '');
  const [streetNumber, setStreetNumber] = useState(existingLocation.streetNumber || '');
  const [houseNumber, setHouseNumber] = useState(existingLocation.houseNumber || '');
  const [landmark, setLandmark] = useState(existingLocation.landmark || '');
  const [latitude, setLatitude] = useState(existingLocation.latitude || null);
  const [longitude, setLongitude] = useState(existingLocation.longitude || null);
  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [isEditingMandal, setIsEditingMandal] = useState(false);

  // Initialize selectedPlace if existing location data exists
  useEffect(() => {
    if (hasExistingLocation && !selectedPlace) {
      setSelectedPlace({
        area: existingLocation.area,
        city: existingLocation.city,
        district: existingLocation.district,
        mandal: existingLocation.mandal,
        state: existingLocation.state,
        pincode: existingLocation.pincode,
        fullAddress: existingLocation.address,
        latitude: existingLocation.latitude,
        longitude: existingLocation.longitude,
        name: existingLocation.area || existingLocation.city,
      });
    }
  }, []);

  const [loading, setLoading] = useState(false);

  // Debounced search function (for map/search tab)
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchPlaces(query, { limit: 10 });
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  // Handle search input
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      debouncedSearch(query);
    } else {
      setSuggestions([]);
    }
  };

  // Handle place selection (from map/search)
  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setArea(place.area || place.city || '');
    setCity(place.city || '');
    setDistrict(place.district || '');
    setMandal(place.mandal || '');
    setState(place.state || '');
    setPincode(place.pincode || '');
    setLatitude(place.latitude);
    setLongitude(place.longitude);
    setAddress(place.fullAddress || '');
    setSearchQuery(place.name);
    setSuggestions([]);
    setFlow('review');
  };

  // Handle map selection (placeholder)
  const handleMapSelection = () => {
    Alert.alert(
      'Map Selection',
      'Map-based selection will be implemented with react-native-maps. For now, please use search.',
      [{ text: 'OK' }]
    );
    // TODO: Implement map with react-native-maps
    // When pin is dropped, call reverseGeocode(lat, lng) to get address
  };

  // Save location and return to ReportIssueScreen
  const handleSaveLocation = () => {
    if (!state || !city || !area) {
      Alert.alert('Error', 'Please fill required fields: State, City, and Area');
      return;
    }

    // Build full address from components
    const addressParts = [];
    if (houseNumber) addressParts.push(houseNumber);
    if (streetNumber) addressParts.push(streetNumber);
    if (landmark) addressParts.push(`Near ${landmark}`);
    if (area) addressParts.push(area);
    if (city) addressParts.push(city);
    if (mandal) addressParts.push(mandal);
    if (district) addressParts.push(district);
    if (state) addressParts.push(state);
    if (pincode) addressParts.push(pincode);
    
    const fullAddress = addressParts.length > 0 
      ? addressParts.join(', ')
      : address || `${area || city}, ${city}, ${mandal || ''}, ${district || ''}, ${state}, ${pincode || ''}`;

    const locationData = {
      state,
      district: district || '',
      mandal: mandal || '',
      city,
      area: area || city,
      pincode: pincode || '',
      address: fullAddress,
      streetNumber: streetNumber || '',
      houseNumber: houseNumber || '',
      landmark: landmark || '',
      latitude,
      longitude,
    };

    // Return location data to MakeRequestScreen
    navigation.navigate('MakeRequest', { location: locationData });
  };

  // Render search screen (for Manual tab only)
  const renderSearchScreen = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Search for location...</Text>
          <Text style={styles.searchSubtitle}>
            Type any location name and we'll find it for you
          </Text>

          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for area, city, town..."
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchLoader} />
            )}
          </View>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <ScrollView style={styles.suggestionsList} keyboardShouldPersistTaps="handled">
              {suggestions.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePlaceSelect(place)}
                  style={styles.suggestionItem}
                >
                  <MapPin size={20} color={theme.colors.primary} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {place.area || place.city || place.name}
                    </Text>
                    <Text style={styles.suggestionAddress} numberOfLines={2}>
                      {place.fullAddress}
                    </Text>
                    {place.city && place.state && (
                      <Text style={styles.suggestionLocation}>
                        {place.city}, {place.state}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {searchQuery.length >= 2 && suggestions.length === 0 && !isSearching && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                No results found for "{searchQuery}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Try searching with a different name or use manual entry
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Render map selection screen (for Map tab - only button, no search)
  const renderMapScreen = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>Choose location on map</Text>
          <Text style={styles.mapSubtitle}>
            Tap the button below to open the map and select your location
          </Text>

          <TouchableOpacity
            style={styles.mapOptionButton}
            onPress={handleMapSelection}
            activeOpacity={0.7}
          >
            <Map size={24} color={theme.colors.primary} />
            <Text style={styles.mapOptionText}>Choose on Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render review screen (with location card first, then detailed fields)
  const renderReviewScreen = () => (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Enter Location Details</Text>
          
          {/* Location Card - Shows selected location */}
          {selectedPlace && (
            <View style={styles.locationCard}>
              <View style={styles.locationCardHeader}>
                <MapPin size={20} color={theme.colors.primary} />
                <Text style={styles.locationCardTitle}>Selected Location</Text>
              </View>
              <View style={styles.locationCardContent}>
                <Text style={styles.locationCardMainText}>
                  {area || city || 'Location selected'}
                </Text>
                {city && (
                  <Text style={styles.locationCardSubText}>
                    {city}{state ? `, ${state}` : ''}
                  </Text>
                )}
                {address && (
                  <Text style={styles.locationCardAddress} numberOfLines={2}>
                    {address}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.changeLocationButton}
                onPress={() => {
                  setFlow('search');
                  setSelectedPlace(null);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.changeLocationButtonText}>Change Location</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>State:</Text>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>District:</Text>
              {isEditingDistrict ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Enter district (e.g., Ranga Reddy)"
                  placeholderTextColor={theme.colors.textLight}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingDistrict(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !district && styles.placeholderText]}>
                    {district || 'Tap to enter district'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Mandal:</Text>
              {isEditingMandal ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={mandal}
                  onChangeText={setMandal}
                  placeholder="Enter mandal"
                  placeholderTextColor={theme.colors.textLight}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingMandal(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !mandal && styles.placeholderText]}>
                    {mandal || 'Tap to enter mandal'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>City:</Text>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Area:</Text>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                value={area}
                onChangeText={setArea}
                placeholder="Enter area/locality"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Pincode:</Text>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                value={pincode}
                onChangeText={(text) => setPincode(text.replace(/[^0-9]/g, ''))}
                placeholder="Enter pincode"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            {address && (
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Full Address:</Text>
                <Text style={styles.reviewValue}>{address}</Text>
              </View>
            )}
          </View>

          {/* Detailed Address Fields */}
          <View style={styles.detailedAddressSection}>
            <Text style={styles.sectionTitle}>Detailed Address (Optional)</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>House / Flat Number / Other</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 123, Flat 4A / Other"
                placeholderTextColor={theme.colors.textLight}
                value={houseNumber}
                onChangeText={setHouseNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Number / Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MG Road, Street 5"
                placeholderTextColor={theme.colors.textLight}
                value={streetNumber}
                onChangeText={setStreetNumber}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Near Metro Station, Behind Mall"
                placeholderTextColor={theme.colors.textLight}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
          </View>

          <PrimaryButton
            title="Save Location"
            onPress={handleSaveLocation}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Request Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => {
            setActiveTab('map');
          }}
        >
          <Map size={20} color={activeTab === 'map' ? theme.colors.primary : theme.colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>
            Select from Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manual' && styles.tabActive]}
          onPress={() => {
            setActiveTab('manual');
            // If no location selected yet, show search; otherwise show review
            if (!selectedPlace) {
              setFlow('search');
            } else {
              setFlow('review');
            }
          }}
        >
          <MapPin size={20} color={activeTab === 'manual' ? theme.colors.primary : theme.colors.textLight} />
          <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
            Enter Manually
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab and flow */}
      {activeTab === 'map' && renderMapScreen()}
      {activeTab === 'manual' && flow === 'search' && renderSearchScreen()}
      {activeTab === 'manual' && flow === 'review' && renderReviewScreen()}
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textLight,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  searchSection: {
    flex: 1,
  },
  searchTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  searchSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 56,
    marginBottom: theme.spacing.lg,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  searchLoader: {
    marginLeft: theme.spacing.sm,
  },
  suggestionsList: {
    maxHeight: 400,
    marginBottom: theme.spacing.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  suggestionName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  suggestionAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  suggestionLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  noResults: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  mapSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  mapTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  mapOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    minWidth: 200,
  },
  mapOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  locationCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  locationCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  locationCardContent: {
    marginBottom: theme.spacing.md,
  },
  locationCardMainText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationCardSubText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  locationCardAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  changeLocationButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    alignSelf: 'flex-start',
  },
  changeLocationButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  reviewSection: {
    paddingTop: theme.spacing.lg,
  },
  reviewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reviewLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textLight,
    width: 100,
  },
  reviewValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  inlineInput: {
    flex: 1,
    height: 40,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
  },
  editableValue: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  detailedAddressSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});

