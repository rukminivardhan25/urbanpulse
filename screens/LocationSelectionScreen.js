import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Dimensions,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Search, Check, Map, Navigation as NavigationIcon } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { updateUserLocation } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { searchPlaces, reverseGeocode, debounce } from '../utils/placeSearch';

export default function LocationSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const isNewUser = route.params?.isNewUser || false;

  // Flow state: 'search' | 'map' | 'review'
  const [flow, setFlow] = useState('search');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Map state
  const [mapVisible, setMapVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const webViewRef = useRef(null);

  // Location data (from selected place)
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [isEditingMandal, setIsEditingMandal] = useState(false);
  const [isEditingState, setIsEditingState] = useState(false);
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [loading, setLoading] = useState(false);

  // Debounced search function
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

  // Handle place selection
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

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setMapLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use map selection. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        setMapLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setSelectedMapLocation({ latitude, longitude });
      setMapLoading(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
      setMapLoading(false);
    }
  };

  // Handle map selection - open map modal
  const handleMapSelection = async () => {
    setMapVisible(true);
    await getCurrentLocation();
  };

  // Handle location selected from map
  const handleMapLocationSelected = async (lat, lng) => {
    try {
      setMapLoading(true);
      setSelectedMapLocation({ latitude: lat, longitude: lng });

      // Reverse geocode to get address
      const place = await reverseGeocode(lat, lng);
      
      if (place) {
        // Update location fields with reverse geocoded data
        setArea(place.area || '');
        setCity(place.city || '');
        setDistrict(place.district || '');
        setMandal(place.mandal || '');
        setState(place.state || '');
        setPincode(place.pincode || '');
        setLatitude(place.latitude);
        setLongitude(place.longitude);
        setAddress(place.fullAddress || '');
        
        // Create a selected place object
        setSelectedPlace(place);
        
        // Close map and go to review screen
        setMapVisible(false);
        setFlow('review');
      } else {
        Alert.alert('Error', 'Could not get address for selected location. Please try again.');
      }
      
      setMapLoading(false);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      Alert.alert('Error', 'Failed to get address for selected location.');
      setMapLoading(false);
    }
  };

  // Confirm selected location from map
  const handleConfirmMapLocation = async () => {
    if (selectedMapLocation) {
      await handleMapLocationSelected(selectedMapLocation.latitude, selectedMapLocation.longitude);
    }
  };

  // Save location
  const handleSaveLocation = async () => {
    if (!selectedPlace || !state || !city) {
      Alert.alert('Error', 'Please select a valid location');
      return;
    }

    setLoading(true);

    try {
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

      await updateUserLocation(locationData);

      if (isNewUser) {
        await login();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render search screen
  const renderSearchScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Search for your area, city, town...</Text>
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
                Try searching with a different name or use the map option
              </Text>
            </View>
          )}

          {/* Map Option */}
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

  // Render review screen
  const renderReviewScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setFlow('search');
            setSelectedPlace(null);
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Location</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Review your location</Text>
          
          {/* Location Summary Card */}
          {(city || area) && (
            <View style={styles.locationSummaryCard}>
              <MapPin size={24} color={theme.colors.primary} />
              <View style={styles.locationSummaryContent}>
                <Text style={styles.locationSummaryText}>
                  {area ? `${area}, ${city || ''}` : city || 'Location Selected'}
                </Text>
                {state && (
                  <Text style={styles.locationSummarySubtext}>{state}</Text>
                )}
              </View>
            </View>
          )}
          
          <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Area:</Text>
              {isEditingArea ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={area}
                  onChangeText={setArea}
                  placeholder="Enter area"
                  placeholderTextColor={theme.colors.textLight}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingArea(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !area && styles.placeholderText]}>
                    {area || 'Tap to enter area'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>City:</Text>
              {isEditingCity ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  placeholderTextColor={theme.colors.textLight}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingCity(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !city && styles.placeholderText]}>
                    {city || 'Tap to enter city'}
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
              <Text style={styles.reviewLabel}>State:</Text>
              {isEditingState ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={state}
                  onChangeText={setState}
                  placeholder="Enter state"
                  placeholderTextColor={theme.colors.textLight}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingState(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !state && styles.placeholderText]}>
                    {state || 'Tap to enter state'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Pincode:</Text>
              {isEditingPincode ? (
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="Enter pincode"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="numeric"
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingPincode(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !pincode && styles.placeholderText]}>
                    {pincode || 'Tap to enter pincode'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Full Address:</Text>
              {isEditingAddress ? (
                <TextInput
                  style={[styles.input, styles.inlineInput, styles.textAreaInline]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter full address"
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={2}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingAddress(true)}
                  style={styles.editableValue}
                >
                  <Text style={[styles.reviewValue, !address && styles.placeholderText]}>
                    {address || 'Tap to enter full address'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Address Details</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any other address details (optional)"
                placeholderTextColor={theme.colors.textLight}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <PrimaryButton
            title={isNewUser ? 'Continue to Dashboard' : 'Save Location'}
            onPress={handleSaveLocation}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );

  // Generate map HTML for location selection
  const generateMapHTML = () => {
    const initialLat = currentLocation?.latitude || 17.3850; // Default to Hyderabad
    const initialLng = currentLocation?.longitude || 78.4867;
    const primaryColor = theme.colors.primary;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .marker-label {
      background: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${initialLat}, ${initialLng}], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    let marker = L.marker([${initialLat}, ${initialLng}], {
      draggable: true
    }).addTo(map)
      .bindPopup('Selected Location<br>Drag to move')
      .openPopup();
    
    // Update marker position on drag
    marker.on('dragend', function(e) {
      const pos = marker.getLatLng();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationChanged',
        latitude: pos.lat,
        longitude: pos.lng
      }));
    });
    
    // Update marker on map click
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'locationChanged',
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }));
    });
    
    // Initial location update
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'locationChanged',
      latitude: ${initialLat},
      longitude: ${initialLng}
    }));
  </script>
</body>
</html>`;
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationChanged') {
        setSelectedMapLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Render map modal
  const renderMapModal = () => (
    <Modal
      visible={mapVisible}
      animationType="slide"
      onRequestClose={() => setMapVisible(false)}
    >
      <View style={styles.mapModalContainer}>
        {/* Map Header */}
        <View style={styles.mapHeader}>
          <TouchableOpacity
            onPress={() => setMapVisible(false)}
            style={styles.mapBackButton}
          >
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.mapHeaderTitle}>Choose on Map</Text>
          <View style={styles.mapBackButton} />
        </View>

        {/* Map using WebView */}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateMapHTML() }}
          style={styles.mapView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          renderLoading={() => (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.mapLoadingText}>Loading map...</Text>
            </View>
          )}
        />

        {/* Map Instructions */}
        <View style={styles.mapInstructions}>
          <Text style={styles.mapInstructionsText}>
            Tap on the map or drag the marker to select your location
          </Text>
        </View>

        {/* Map Actions */}
        <View style={styles.mapActions}>
          <TouchableOpacity
            onPress={getCurrentLocation}
            style={styles.mapCurrentLocationButton}
            disabled={mapLoading}
          >
            {mapLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <NavigationIcon size={20} color={theme.colors.primary} />
            )}
            <Text style={styles.mapCurrentLocationText}>Use Current Location</Text>
          </TouchableOpacity>
          
          <PrimaryButton
            title="Confirm Location"
            onPress={handleConfirmMapLocation}
            loading={mapLoading}
            style={styles.mapConfirmButton}
          />
        </View>
      </View>
    </Modal>
  );

  // Main render
  return (
    <View style={styles.container}>
      {renderMapModal()}
      {flow === 'review' ? renderReviewScreen() : renderSearchScreen()}
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
  mapOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mapOptionText: {
    fontSize: theme.fontSize.md,
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
  locationSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  locationSummaryContent: {
    flex: 1,
  },
  locationSummaryText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  locationSummarySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  reviewCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  reviewRow: {
    flexDirection: 'row',
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
  textAreaInline: {
    height: 60,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
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
  mapModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  mapBackButton: {
    padding: theme.spacing.xs,
    width: 40,
  },
  mapHeaderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
  },
  mapView: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  mapLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  mapInstructions: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  mapInstructionsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  mapActions: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  mapCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mapCurrentLocationText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  mapConfirmButton: {
    marginTop: 0,
  },
});
