import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Mic,
  Upload,
  CheckCircle,
  ChevronDown,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { submitIssue } from '../utils/api';

const issueTypes = [
  { value: 'garbage', label: 'Garbage / Waste' },
  { value: 'water', label: 'Water Supply' },
  { value: 'power', label: 'Power / Electricity' },
  { value: 'road', label: 'Road Damage' },
  { value: 'drainage', label: 'Drainage / Sewage' },
  { value: 'streetlight', label: 'Street Light' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low', color: theme.colors.secondary },
  { value: 'medium', label: 'Medium', color: theme.colors.accent },
  { value: 'high', label: 'High', color: theme.colors.emergency },
];

export default function ReportIssueScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [issueType, setIssueType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Listen for location data from ReportIssueLocation screen
  useFocusEffect(
    React.useCallback(() => {
      const locationData = route.params?.location;
      if (locationData) {
        setArea(locationData.area || '');
        setCity(locationData.city || '');
        setState(locationData.state || '');
        setDistrict(locationData.district || '');
        setMandal(locationData.mandal || '');
        setLandmark(locationData.landmark || '');
        setPincode(locationData.pincode || '');
        setDetailedAddress(locationData.address || '');
        setLatitude(locationData.latitude || null);
        setLongitude(locationData.longitude || null);
        // Clear params after reading
        navigation.setParams({ location: undefined });
      }
    }, [route.params?.location])
  );

  // Location summary for card
  const getLocationSummary = () => {
    if (!area && !city) return 'Not Set';
    const parts = [];
    if (area) parts.push(area);
    if (city) parts.push(city);
    return parts.join(', ') || 'Not Set';
  };

  // Handle location navigation - navigate to location selection screen
  const handleLocationCardPress = () => {
    // Pass current location data to location screen
    navigation.navigate('ReportIssueLocation', {
      location: {
        state,
        district,
        mandal,
        city,
        area,
        pincode,
        landmark,
        address: detailedAddress || `${area}, ${city}`,
        streetNumber: '',
        houseNumber: '',
        latitude,
        longitude,
      },
    });
  };


  const handleSubmit = async () => {
    if (!issueType || !description.trim() || !area.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill all required fields (Issue Type, Description, City, and Area)');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const issueData = {
        issueType,
        description: description.trim(),
        priority,
        location: {
          state,
          district,
          mandal,
          city,
          area,
          pincode,
          address: detailedAddress || `${area}, ${city}`,
          houseNumber: '',
          streetNumber: '',
          landmark,
          latitude,
          longitude,
        },
      };

      const response = await submitIssue(issueData);
      
      if (response.success && response.data) {
        // Use server-generated complaint ID
        setComplaintId(response.data.complaintId);
        setSubmitted(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      Alert.alert('Error', error.message || 'Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topSpacer} />
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <CheckCircle size={40} color={theme.colors.success} />
          </View>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successMessage}>
            Your complaint has been registered successfully
          </Text>
          {complaintId ? (
            <View style={styles.complaintIdCard}>
              <Text style={styles.complaintIdLabel}>Complaint ID</Text>
              <Text style={styles.complaintId}>{complaintId}</Text>
            </View>
          ) : null}
          <View style={styles.successButtons}>
            <PrimaryButton
              title="Go Back to Home"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.button}
            />
            <TouchableOpacity
              onPress={() => {
                setSubmitted(false);
                setComplaintId('');
                setIssueType('');
                setDescription('');
                setPriority('medium');
                setArea('');
                setCity('');
                setState('');
                setDistrict('');
                setMandal('');
                setLandmark('');
                setPincode('');
                setDetailedAddress('');
                setLatitude(null);
                setLongitude(null);
              }}
              style={[styles.button, styles.outlineButton]}
            >
              <Text style={styles.outlineButtonText}>Report Another Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Report an Issue</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Add Photo / Video</Text>
          <View style={styles.photoGrid}>
            <TouchableOpacity style={styles.photoButton}>
              <Camera size={32} color={theme.colors.textLight} />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton}>
              <Upload size={32} color={theme.colors.textLight} />
              <Text style={styles.photoButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Card - Compact */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TouchableOpacity
            style={styles.locationCard}
            onPress={handleLocationCardPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationCardIcon}>
              <MapPin size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.locationCardInfo}>
              <Text style={styles.locationCardText}>
                {getLocationSummary()}
              </Text>
            </View>
            <View style={styles.locationCardAction}>
              <Text style={styles.locationCardActionText}>
                {area && city ? 'Change' : 'Set Location'}
              </Text>
              <ChevronDown size={18} color={theme.colors.textLight} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Issue Type</Text>
          <View style={styles.selectContainer}>
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setIssueType(type.value)}
                style={[
                  styles.selectOption,
                  issueType === type.value && styles.selectOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    issueType === type.value && styles.selectOptionTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <TouchableOpacity style={styles.voiceButton}>
              <Mic size={16} color={theme.colors.primary} />
              <Text style={styles.voiceButtonText}>Voice Input</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={theme.colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                onPress={() => setPriority(p.value)}
                style={[
                  styles.priorityButton,
                  priority === p.value && {
                    backgroundColor: p.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === p.value && styles.priorityTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <PrimaryButton
          title="Submit Report"
          onPress={handleSubmit}
          disabled={!issueType || !description.trim() || !area.trim() || !city.trim() || submitting}
          loading={submitting}
          style={styles.submitButton}
        />
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  voiceButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  photoButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: `${theme.colors.textLight}10`,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  photoButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
  },
  mapButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  locationField: {
    marginBottom: theme.spacing.md,
  },
  locationFieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    minHeight: 50,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    minHeight: 50,
  },
  dropdownButtonDisabled: {
    backgroundColor: theme.colors.background,
    opacity: 0.6,
  },
  dropdownButtonText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownButtonTextPlaceholder: {
    color: theme.colors.textLight,
  },
  manualEntryHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs / 2,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalSearchInput: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalList: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalOptionCustom: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  modalOptionText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  modalEmptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    padding: theme.spacing.md,
    fontStyle: 'italic',
  },
  selectContainer: {
    gap: theme.spacing.xs,
  },
  selectOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectOptionText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  selectOptionTextActive: {
    color: theme.colors.white,
  },
  textArea: {
    minHeight: 120,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.textLight}20`,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  priorityTextActive: {
    color: theme.colors.white,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.success}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  successMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  complaintIdCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  complaintIdLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  complaintId: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  successButtons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  outlineButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
  // Location Card Styles
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  locationCardIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCardInfo: {
    flex: 1,
  },
  locationCardText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  locationCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  locationCardActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  // Location Modal Styles
  locationModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  locationModalHeader: {
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
  modalBackButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  locationModalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  modalPlaceholder: {
    width: 40,
  },
  locationModalContent: {
    flex: 1,
  },
  locationModalScrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  mapPickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${theme.colors.primary}05`,
    marginTop: theme.spacing.md,
  },
  mapPickButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  locationModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  locationModalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  saveLocationButton: {
    flex: 1,
  },
});

