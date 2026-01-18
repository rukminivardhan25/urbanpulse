import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Heart,
  Phone,
  MessageCircle,
  Mail,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function RequestDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params || {};
  const [hasHelped, setHasHelped] = useState(false);

  if (!request) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Request not found</Text>
        </View>
      </View>
    );
  }

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return {
          bgColor: `${theme.colors.error || '#DC2626'}20`,
          textColor: theme.colors.error || '#DC2626',
        };
      case 'high':
        return {
          bgColor: `${theme.colors.accent}20`,
          textColor: theme.colors.accent,
        };
      case 'medium':
        return {
          bgColor: `${theme.colors.warning}20`,
          textColor: theme.colors.warning,
        };
      case 'low':
      default:
        return {
          bgColor: `${theme.colors.success}20`,
          textColor: theme.colors.success,
        };
    }
  };

  const urgencyStyles = getUrgencyStyles(request.urgency);

  const handleContact = (method) => {
    switch (method) {
      case 'call':
        Alert.alert('Contact', 'Call feature will be available soon');
        break;
      case 'whatsapp':
        Alert.alert('Contact', 'WhatsApp feature will be available soon');
        break;
      case 'inapp':
        // Navigate to helper chat screen
        navigation.navigate('HelperChat', {
          request: request,
        });
        break;
      default:
        break;
    }
  };

  // Check if user has already helped this request
  const checkIfHelped = async () => {
    if (!request) return;
    try {
      const requestId = request.id || request._id || request.requestId;
      const helpedRequests = await AsyncStorage.getItem('helpedRequests');
      if (helpedRequests) {
        const helpedArray = JSON.parse(helpedRequests);
        setHasHelped(helpedArray.includes(requestId));
      }
    } catch (error) {
      console.error('Error checking if helped:', error);
    }
  };

  // Check on mount and when screen is focused
  useEffect(() => {
    checkIfHelped();
  }, [request]);

  useFocusEffect(
    useCallback(() => {
      checkIfHelped();
    }, [request])
  );

  const handleWantToHelp = () => {
    // Navigate to HelpOfferScreen
    navigation.navigate('HelpOffer', {
      request: request,
      onSuccess: async () => {
        // Mark this request as helped in AsyncStorage
        try {
          const requestId = request.id || request._id || request.requestId;
          const helpedRequests = await AsyncStorage.getItem('helpedRequests');
          let helpedArray = helpedRequests ? JSON.parse(helpedRequests) : [];
          if (!helpedArray.includes(requestId)) {
            helpedArray.push(requestId);
            await AsyncStorage.setItem('helpedRequests', JSON.stringify(helpedArray));
            setHasHelped(true);
          }
        } catch (error) {
          console.error('Error saving helped status:', error);
        }
      },
    });
  };

  // Only show In-App Chat button (as per requirements)
  const contactPreferences = [
    {
      value: 'inapp',
      label: 'In-App Chat',
      icon: MessageCircle,
      color: theme.colors.primary,
      onPress: () => handleContact('inapp'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Request ID */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Request ID</Text>
          <Text style={styles.idValue}>{request.requestId || request.id}</Text>
        </View>

        {/* Title and Urgency */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{request.requestType || request.title}</Text>
          <View
            style={[
              styles.urgencyBadge,
              { backgroundColor: urgencyStyles.bgColor },
            ]}
          >
            <AlertCircle size={16} color={urgencyStyles.textColor} />
            <Text
              style={[styles.urgencyBadgeText, { color: urgencyStyles.textColor }]}
            >
              {request.urgency?.charAt(0).toUpperCase() + request.urgency?.slice(1) || 'Medium'} Priority
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{request.subcategory || request.category}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <MapPin size={20} color={theme.colors.textLight} />
          <View style={styles.locationInfoContainer}>
            <Text style={styles.infoText}>
              {request.location ? (() => {
                const locationParts = [
                  request.location.detailedAddress?.houseFlat && `House/Flat: ${request.location.detailedAddress.houseFlat}`,
                  request.location.detailedAddress?.street && `Street: ${request.location.detailedAddress.street}`,
                  request.location.detailedAddress?.landmark && `Landmark: ${request.location.detailedAddress.landmark}`,
                  request.location.area && `Area: ${request.location.area}`,
                  request.location.city && `City: ${request.location.city}`,
                  request.location.mandal && `Mandal: ${request.location.mandal}`,
                  request.location.district && `District: ${request.location.district}`,
                  request.location.state && `State: ${request.location.state}`,
                  request.location.pincode && `Pincode: ${request.location.pincode}`,
                ].filter(Boolean);
                return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
              })() : 'Location not specified'}
            </Text>
          </View>
        </View>

        {/* Time */}
        <View style={styles.infoRow}>
          <Clock size={20} color={theme.colors.textLight} />
          <Text style={styles.infoText}>
            Posted {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{request.description}</Text>
        </View>

        {/* Needed Help */}
        {request.quantity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is Needed</Text>
            <View style={styles.neededCard}>
              <Heart size={20} color={theme.colors.primary} />
              <Text style={styles.neededText}>{request.quantity}</Text>
            </View>
          </View>
        )}

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.contactHint}>
            Requester prefers to be contacted via:{' '}
            {request.contactPreference === 'call' || (Array.isArray(request.contactPreference) && request.contactPreference.includes('call'))
              ? 'Call'
              : request.contactPreference === 'whatsapp' || (Array.isArray(request.contactPreference) && request.contactPreference.includes('whatsapp'))
              ? 'WhatsApp'
              : request.contactPreference === 'mail' || (Array.isArray(request.contactPreference) && request.contactPreference.includes('mail'))
              ? 'Mail'
              : request.contactPreference === 'mobile' || (Array.isArray(request.contactPreference) && request.contactPreference.includes('mobile'))
              ? 'Mobile'
              : 'In-App Chat'}
          </Text>
          <View style={styles.contactButtons}>
            {contactPreferences.map((pref) => {
              const IconComponent = pref.icon;
              return (
                <TouchableOpacity
                  key={pref.value}
                  style={[
                    styles.contactButton,
                    { borderColor: pref.color, backgroundColor: pref.color + '10' },
                  ]}
                  onPress={pref.onPress}
                  activeOpacity={0.7}
                >
                  <IconComponent size={20} color={pref.color} />
                  <Text style={[styles.contactButtonText, { color: pref.color }]}>
                    {pref.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* I Want to Help Button / Reacted Button */}
        {hasHelped ? (
          <View style={[styles.helpButton, styles.reactedButton]}>
            <CheckCircle size={20} color={theme.colors.success} />
            <Text style={styles.reactedText}>Reacted</Text>
          </View>
        ) : (
          <PrimaryButton
            title="I Want to Help"
            onPress={handleWantToHelp}
            icon={Heart}
            style={styles.helpButton}
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  idCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  idLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  idValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  titleSection: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  urgencyBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  categoryText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
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
  descriptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  neededCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  neededText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
  contactHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    minWidth: 100,
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  locationInfoContainer: {
    flex: 1,
  },
  helpButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  reactedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
    gap: theme.spacing.sm,
  },
  reactedText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
});

