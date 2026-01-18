import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Navigation as NavigationIcon, Phone, MapPin } from 'lucide-react-native';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const mapRef = useRef(null);
  
  const { destination, origin, title, contact } = route.params || {};
  
  const [region, setRegion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (destination && origin) {
      // Calculate initial region to show both origin and destination
      const latDelta = Math.abs(destination.latitude - origin.latitude) * 2;
      const lonDelta = Math.abs(destination.longitude - origin.longitude) * 2;
      
      const initialRegion = {
        latitude: (origin.latitude + destination.latitude) / 2,
        longitude: (origin.longitude + destination.longitude) / 2,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lonDelta, 0.01),
      };
      
      setRegion(initialRegion);
      
      // Calculate distance
      const calculatedDistance = calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistance(calculatedDistance);
      setLoading(false);
    } else {
      Alert.alert('Error', 'Location data not available');
      navigation.goBack();
    }
  }, [destination, origin]);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  // Format distance for display
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Open GPS navigation
  const handleOpenGPS = () => {
    if (!destination) return;

    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}&dirflg=d`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            // Fallback to Google Maps web or alternative
            const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
            return Linking.openURL(fallbackUrl);
          }
        })
        .catch((err) => {
          console.error('Error opening GPS:', err);
          // Fallback to Google Maps web
          const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
          Linking.openURL(fallbackUrl);
        });
    } else {
      // Fallback to Google Maps web
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
      Linking.openURL(fallbackUrl);
    }
  };

  // Call emergency contact
  const handleCall = () => {
    if (contact) {
      const phoneUrl = `tel:${contact}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error('Error calling:', err);
        Alert.alert('Error', 'Unable to make phone call');
      });
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Map...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  // Generate HTML for Leaflet map with OpenStreetMap
  const generateMapHTML = () => {
    if (!origin || !destination || !region) return '';

    const primaryColor = theme.colors.primary || '#14532D';
    const emergencyColor = theme.colors.emergency || '#E53E3E';
    const destName = (destination.name || title || 'Destination').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize map
    const map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Custom icons
    const originIcon = L.divIcon({
      html: '<div style="width: 32px; height: 32px; border-radius: 50%; background: ${primaryColor}; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: ''
    });
    
    const destinationIcon = L.divIcon({
      html: '<div style="width: 32px; height: 32px; border-radius: 50%; background: ${emergencyColor}; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: ''
    });
    
    // Add markers
    const originMarker = L.marker([${origin.latitude}, ${origin.longitude}], { icon: originIcon })
      .addTo(map)
      .bindPopup('Your Location');
    
    const destMarker = L.marker([${destination.latitude}, ${destination.longitude}], { icon: destinationIcon })
      .addTo(map)
      .bindPopup('${destName}');
    
    // Fit bounds to show both markers
    const group = new L.featureGroup([originMarker, destMarker]);
    map.fitBounds(group.getBounds().pad(0.1));
    
    // Add polyline between origin and destination
    const polyline = L.polyline([
      [${origin.latitude}, ${origin.longitude}],
      [${destination.latitude}, ${destination.longitude}]
    ], {
      color: '${primaryColor}',
      weight: 3,
      opacity: 0.7
    }).addTo(map);
  </script>
</body>
</html>`;
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
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title || 'Destination'}</Text>
          {distance && (
            <Text style={styles.headerSubtitle}>
              {formatDistance(distance)} away
            </Text>
          )}
        </View>
      </View>

      {/* Map using WebView with Leaflet/OpenStreetMap */}
      <WebView
        originWhitelist={['*']}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.gpsButton]}
          onPress={handleOpenGPS}
          activeOpacity={0.8}
        >
          <NavigationIcon size={24} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Start GPS</Text>
        </TouchableOpacity>

        {contact && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Phone size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Call {contact}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Destination Info Card */}
      {destination && (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <MapPin size={20} color={theme.colors.primary} />
            <Text style={styles.infoCardTitle}>
              {destination.name || title}
            </Text>
          </View>
          {destination.address && (
            <Text style={styles.infoCardAddress} numberOfLines={2}>
              {destination.address}
            </Text>
          )}
          {distance && (
            <Text style={styles.infoCardDistance}>
              Distance: {formatDistance(distance)}
            </Text>
          )}
        </View>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  map: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gpsButton: {
    backgroundColor: theme.colors.primary,
  },
  callButton: {
    backgroundColor: theme.colors.emergency || '#E53E3E',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  infoCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : StatusBar.currentHeight + 80,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  infoCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  infoCardAddress: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  infoCardDistance: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
});

