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
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  MapPin,
  Upload,
  CheckCircle,
  Check,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ChevronDown,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { createRequest } from '../utils/api';

const requestTypes = [
  { label: 'Volunteering', emoji: '🤝' },
  { label: 'Blood Donation', emoji: '🩸' },
  { label: 'Money Help', emoji: '💰' },
  { label: 'Food Help', emoji: '🍲' },
  { label: 'Clothes Donation', emoji: '👕' },
  { label: 'Medical Help', emoji: '🏥' },
  { label: 'Old Age Home Support', emoji: '👵' },
  { label: 'Orphanage Support', emoji: '👶' },
  { label: 'Disaster Relief', emoji: '🌪' },
  { label: 'Education Help', emoji: '🎓' },
  { label: 'Other', emoji: '➕' },
];

const subcategories = {
  'Volunteering': [
    { label: 'Flood Relief', emoji: '🌊' },
    { label: 'Cyclone Relief', emoji: '🌀' },
    { label: 'Fire Accident Help', emoji: '🔥' },
    { label: 'Road Accident Help', emoji: '🚨' },
    { label: 'Hospital Support', emoji: '🏥' },
    { label: 'Event Support', emoji: '🎉' },
    { label: 'Cleaning Drives', emoji: '🧹' },
    { label: 'Tree Plantation', emoji: '🌳' },
    { label: 'Teaching Support', emoji: '📚' },
    { label: 'Elderly Care', emoji: '👵' },
    { label: 'Child Care', emoji: '👶' },
    { label: 'Other', emoji: '➕' },
  ],
  'Blood Donation': [
    { label: 'A+', emoji: '🩸' },
    { label: 'A-', emoji: '🩸' },
    { label: 'B+', emoji: '🩸' },
    { label: 'B-', emoji: '🩸' },
    { label: 'AB+', emoji: '🩸' },
    { label: 'AB-', emoji: '🩸' },
    { label: 'O+', emoji: '🩸' },
    { label: 'O-', emoji: '🩸' },
    { label: 'Platelets', emoji: '🩸' },
    { label: 'Plasma', emoji: '🩸' },
  ],
  'Money Help': [
    { label: 'Medical Treatment', emoji: '💊' },
    { label: 'Surgery', emoji: '⚕️' },
    { label: 'Accident Recovery', emoji: '🏥' },
    { label: 'Education Fees', emoji: '🎓' },
    { label: 'Old Age Home Support', emoji: '👵' },
    { label: 'Orphanage Support', emoji: '👶' },
    { label: 'Disaster Recovery', emoji: '🌪' },
    { label: 'Funeral Support', emoji: '🙏' },
    { label: 'Other', emoji: '➕' },
  ],
  'Food Help': [
    { label: 'Daily Meals', emoji: '🍽️' },
    { label: 'Emergency Food', emoji: '🚨' },
    { label: 'Festival Food', emoji: '🎉' },
    { label: 'Disaster Food', emoji: '🌪' },
    { label: 'Community Kitchen', emoji: '👨‍🍳' },
    { label: 'Other', emoji: '➕' },
  ],
  'Clothes Donation': [
    { label: 'Children Clothes', emoji: '👕' },
    { label: 'Adult Clothes', emoji: '👔' },
    { label: 'Winter Wear', emoji: '🧥' },
    { label: 'Blankets', emoji: '🛏️' },
    { label: 'School Uniform', emoji: '🎓' },
    { label: 'Other', emoji: '➕' },
  ],
  'Medical Help': [
    { label: 'Medicines', emoji: '💊' },
    { label: 'Surgery', emoji: '⚕️' },
    { label: 'Tests and Scans', emoji: '🔬' },
    { label: 'Equipment', emoji: '🩺' },
    { label: 'Ambulance', emoji: '🚑' },
    { label: 'Other', emoji: '➕' },
  ],
  'Old Age Home Support': [
    { label: 'Daily Care', emoji: '👵' },
    { label: 'Medical Support', emoji: '💊' },
    { label: 'Food Supply', emoji: '🍲' },
    { label: 'Entertainment', emoji: '🎭' },
    { label: 'Volunteering', emoji: '🤝' },
    { label: 'Financial Help', emoji: '💰' },
    { label: 'Other', emoji: '➕' },
  ],
  'Orphanage Support': [
    { label: 'Education Support', emoji: '📚' },
    { label: 'Food Supply', emoji: '🍲' },
    { label: 'Clothes', emoji: '👕' },
    { label: 'Toys and Books', emoji: '🧸' },
    { label: 'Medical Support', emoji: '💊' },
    { label: 'Volunteering', emoji: '🤝' },
    { label: 'Financial Help', emoji: '💰' },
    { label: 'Other', emoji: '➕' },
  ],
  'Disaster Relief': [
    { label: 'Flood', emoji: '🌊' },
    { label: 'Cyclone', emoji: '🌀' },
    { label: 'Earthquake', emoji: '🌍' },
    { label: 'Fire', emoji: '🔥' },
    { label: 'Landslide', emoji: '⛰️' },
    { label: 'Drought', emoji: '🌵' },
    { label: 'Other', emoji: '➕' },
  ],
  'Education Help': [
    { label: 'School Fees', emoji: '💰' },
    { label: 'Books and Stationery', emoji: '📚' },
    { label: 'Uniforms', emoji: '👔' },
    { label: 'Scholarship', emoji: '🎓' },
    { label: 'Tuition Support', emoji: '📝' },
    { label: 'Infrastructure', emoji: '🏫' },
    { label: 'Other', emoji: '➕' },
  ],
  'Other': [],
};

const urgencyLevels = [
  { value: 'low', label: 'Low', color: theme.colors.success },
  { value: 'medium', label: 'Medium', color: theme.colors.warning },
  { value: 'high', label: 'High', color: theme.colors.accent },
  { value: 'emergency', label: 'Emergency', color: theme.colors.error || '#DC2626' },
];

const contactPreferences = [
  { value: 'mobile', label: 'Mobile', icon: Phone, inputPlaceholder: 'Enter mobile number', inputType: 'phone' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, inputPlaceholder: 'Enter WhatsApp number', inputType: 'phone' },
  { value: 'mail', label: 'Mail', icon: Mail, inputPlaceholder: 'Enter email address', inputType: 'email' },
  { value: 'other', label: 'Other', icon: MessageCircle, inputPlaceholder: 'Enter contact details', inputType: 'text' },
];

export default function MakeRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [formData, setFormData] = useState({
    requestType: '',
    subcategory: '',
    description: '',
    quantity: '',
    // Location fields - same as ReportIssueScreen
    area: '',
    city: '',
    state: '',
    district: '',
    mandal: '',
    landmark: '',
    pincode: '',
    detailedAddress: '',
    latitude: null,
    longitude: null,
    urgency: 'medium',
    contactPreference: [], // Array to allow multiple selections
    contactDetails: {
      mobile: '',
      whatsapp: '',
      mail: '',
      other: '',
    }, // Store details for each contact method
    customSubcategory: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Listen for location data from ReportIssueLocation screen
  useFocusEffect(
    React.useCallback(() => {
      const locationData = route.params?.location;
      if (locationData) {
        setFormData((prev) => ({
          ...prev,
          area: locationData.area || '',
          city: locationData.city || '',
          state: locationData.state || '',
          district: locationData.district || '',
          mandal: locationData.mandal || '',
          landmark: locationData.landmark || '',
          pincode: locationData.pincode || '',
          detailedAddress: locationData.address || '',
          latitude: locationData.latitude || null,
          longitude: locationData.longitude || null,
        }));
        // Clear params after reading
        navigation.setParams({ location: undefined });
      }
    }, [route.params?.location])
  );

  // Location summary for card
  const getLocationSummary = () => {
    if (!formData.area && !formData.city) return 'Not Set';
    const parts = [];
    if (formData.area) parts.push(formData.area);
    if (formData.city) parts.push(formData.city);
    return parts.join(', ') || 'Not Set';
  };

  // Handle location navigation - navigate to location selection screen
  const handleLocationCardPress = () => {
    // Pass current location data to location screen
    navigation.navigate('MakeRequestLocation', {
      location: {
        state: formData.state,
        district: formData.district,
        mandal: formData.mandal,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        landmark: formData.landmark,
        address: formData.detailedAddress || `${formData.area}, ${formData.city}`,
        streetNumber: '',
        houseNumber: '',
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.requestType || !formData.subcategory || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields (Request Type, Subcategory, Description)');
      return;
    }

    if (!formData.area || !formData.city) {
      Alert.alert('Error', 'Please set location (Area and City are required)');
      return;
    }

    if (formData.subcategory === 'Other' && !formData.customSubcategory) {
      Alert.alert('Error', 'Please specify the custom subcategory');
      return;
    }

    if (!formData.contactPreference || formData.contactPreference.length === 0) {
      Alert.alert('Error', 'Please select at least one contact method');
      return;
    }

    // Validate contact details for selected preferences
    for (const pref of formData.contactPreference) {
      const detail = formData.contactDetails[pref];
      if (!detail || detail.trim() === '') {
        const prefLabel = contactPreferences.find((p) => p.value === pref)?.label || pref;
        Alert.alert('Error', `Please enter ${prefLabel} details`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const requestData = {
        requestType: formData.requestType,
        subcategory: formData.subcategory,
        customSubcategory: formData.customSubcategory || '',
        description: formData.description.trim(),
        quantity: formData.quantity || '',
        urgency: formData.urgency || 'medium',
        location: {
          state: formData.state || '',
          district: formData.district || '',
          mandal: formData.mandal || '',
          city: formData.city,
          area: formData.area,
          pincode: formData.pincode || '',
          landmark: formData.landmark || '',
          detailedAddress: formData.detailedAddress || '',
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
        },
        contactPreference: formData.contactPreference,
        contactDetails: formData.contactDetails,
      };

      const response = await createRequest(requestData);

      if (response.success && response.data) {
        setRequestId(response.data.requestId);
        setSubmitted(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', error.message || 'Failed to submit request. Please try again.');
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
            <CheckCircle size={64} color={theme.colors.success} />
          </View>
          <Text style={styles.successTitle}>Request Submitted!</Text>
          <Text style={styles.successMessage}>
            Your request has been created and is now visible to all users who can offer help.
          </Text>
          {requestId ? (
            <View style={styles.requestIdCard}>
              <Text style={styles.requestIdLabel}>Request ID</Text>
              <Text style={styles.requestId}>{requestId}</Text>
            </View>
          ) : null}
          <View style={styles.statusCard}>
            <CheckCircle size={20} color={theme.colors.success} />
            <Text style={styles.statusText}>Request Created Successfully</Text>
          </View>
          <View style={styles.successButtons}>
            <PrimaryButton
              title="Back to Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.button}
            />
            <TouchableOpacity
              onPress={() => {
                setSubmitted(false);
                setRequestId('');
                setFormData({
                  requestType: '',
                  subcategory: '',
                  description: '',
                  quantity: '',
                  area: '',
                  city: '',
                  state: '',
                  district: '',
                  mandal: '',
                  landmark: '',
                  pincode: '',
                  detailedAddress: '',
                  latitude: null,
                  longitude: null,
                  urgency: 'medium',
                  contactPreference: [],
                  contactDetails: {
                    mobile: '',
                    whatsapp: '',
                    mail: '',
                    other: '',
                  },
                  customSubcategory: '',
                });
              }}
              style={[styles.button, styles.outlineButton]}
            >
              <Text style={styles.outlineButtonText}>Create Another Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentSubcategories = formData.requestType ? (subcategories[formData.requestType] || []).map(item => typeof item === 'string' ? { label: item, emoji: '' } : item) : [];
  const showCustomSubcategoryInput = formData.subcategory === 'Other';
  
  // Get selected request type object
  const selectedRequestType = requestTypes.find(rt => rt.label === formData.requestType);

  const handleRequestTypeSelect = (typeObj) => {
    const typeLabel = typeof typeObj === 'string' ? typeObj : typeObj.label;
    setFormData({
      ...formData,
      requestType: typeLabel,
      subcategory: '', // Reset subcategory when request type changes
      customSubcategory: '',
    });
    setShowRequestTypeModal(false);
  };

  const handleSubcategorySelect = (subcatObj) => {
    const subcatLabel = typeof subcatObj === 'string' ? subcatObj : subcatObj.label;
    setFormData({
      ...formData,
      subcategory: subcatLabel,
      customSubcategory: subcatLabel === 'Other' ? formData.customSubcategory : '',
    });
    setShowSubcategoryModal(false);
  };

  const renderDropdownModal = (visible, onClose, options, onSelect, currentValue) => {
    const getItemLabel = (item) => typeof item === 'string' ? item : item.label;
    const getItemEmoji = (item) => typeof item === 'string' ? '' : (item.emoji || '');
    const isSelected = (item) => currentValue === getItemLabel(item);
    
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Option</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${getItemLabel(item)}-${index}`}
              renderItem={({ item }) => {
                const label = getItemLabel(item);
                const emoji = getItemEmoji(item);
                const selected = isSelected(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                    ]}
                    onPress={() => onSelect(item)}
                  >
                    {emoji ? <Text style={styles.modalOptionEmoji}>{emoji}</Text> : null}
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                    {selected && (
                      <Check size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    );
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
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Help Request</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Request Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Request Type *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowRequestTypeModal(true)}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.requestType && styles.dropdownButtonTextPlaceholder,
                ]}
              >
                {selectedRequestType ? `${selectedRequestType.emoji} ${formData.requestType}` : 'Select Request Type'}
              </Text>
              <ChevronDown size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Subcategory Dropdown */}
          {formData.requestType && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subcategory *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  !currentSubcategories.length && styles.dropdownButtonDisabled,
                ]}
                onPress={() => currentSubcategories.length > 0 && setShowSubcategoryModal(true)}
                disabled={!currentSubcategories.length}
              >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !formData.subcategory && styles.dropdownButtonTextPlaceholder,
                ]}
              >
                {(() => {
                  const selectedSubcat = currentSubcategories.find(sub => sub.label === formData.subcategory);
                  return selectedSubcat ? `${selectedSubcat.emoji} ${formData.subcategory}` : 'Select Subcategory';
                })()}
              </Text>
                <ChevronDown size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
              {showCustomSubcategoryInput && (
                <TextInput
                  style={[styles.input, styles.marginTop]}
                  placeholder="Specify custom subcategory"
                  value={formData.customSubcategory}
                  onChangeText={(text) => setFormData({ ...formData, customSubcategory: text })}
                  placeholderTextColor={theme.colors.textLight}
                />
              )}
            </View>
          )}

          {/* Modals */}
          {renderDropdownModal(
            showRequestTypeModal,
            () => setShowRequestTypeModal(false),
            requestTypes,
            handleRequestTypeSelect,
            formData.requestType
          )}

          {renderDropdownModal(
            showSubcategoryModal,
            () => setShowSubcategoryModal(false),
            currentSubcategories,
            handleSubcategorySelect,
            formData.subcategory
          )}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your request in detail..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={6}
              placeholderTextColor={theme.colors.textLight}
              textAlignVertical="top"
            />
          </View>

          {/* Quantity / Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity / Amount (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5 liters, ₹5000, 10 kg"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholderTextColor={theme.colors.textLight}
              keyboardType="default"
            />
          </View>

          {/* Location Card - Compact (same as ReportIssueScreen) */}
          <View style={styles.inputGroup}>
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
                  {formData.area && formData.city ? 'Change' : 'Set Location'}
                </Text>
                <ChevronDown size={18} color={theme.colors.textLight} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Urgency Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency Level</Text>
            <View style={styles.urgencyRow}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.urgencyButton,
                    formData.urgency === level.value && [
                      styles.urgencyButtonSelected,
                      { borderColor: level.color },
                    ],
                  ]}
                  onPress={() => setFormData({ ...formData, urgency: level.value })}
                >
                  <Text
                    style={[
                      styles.urgencyButtonText,
                      formData.urgency === level.value && { color: level.color },
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Method *</Text>
            <Text style={styles.hintText}>
              Choose how you'd like to be contacted (you can select one or multiple)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.contactScroll}
              contentContainerStyle={styles.contactContainer}
            >
              {contactPreferences.map((pref) => {
                const IconComponent = pref.icon;
                const isSelected = formData.contactPreference.includes(pref.value);
                return (
                  <TouchableOpacity
                    key={pref.value}
                    style={[
                      styles.contactButton,
                      isSelected && styles.contactButtonSelected,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        // Remove if already selected (allow deselection)
                        setFormData({
                          ...formData,
                          contactPreference: formData.contactPreference.filter((v) => v !== pref.value),
                          contactDetails: {
                            ...formData.contactDetails,
                            [pref.value]: '', // Clear the detail when deselected
                          },
                        });
                      } else {
                        // Add to selection
                        setFormData({
                          ...formData,
                          contactPreference: [...formData.contactPreference, pref.value],
                        });
                      }
                    }}
                  >
                    {isSelected && (
                      <View style={styles.contactCheck}>
                        <Check size={10} color={theme.colors.white} />
                      </View>
                    )}
                    <IconComponent
                      size={20}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.textLight
                      }
                    />
                    <Text
                      style={[
                        styles.contactButtonText,
                        isSelected && styles.contactButtonTextSelected,
                      ]}
                    >
                      {pref.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Contact Detail Inputs - Show fields for selected preferences */}
            {formData.contactPreference.map((prefValue) => {
              const pref = contactPreferences.find((p) => p.value === prefValue);
              if (!pref) return null;

              const IconComponent = pref.icon;
              return (
                <View key={prefValue} style={styles.contactDetailInput}>
                  <View style={styles.contactDetailLabelRow}>
                    <IconComponent size={16} color={theme.colors.primary} />
                    <Text style={styles.contactDetailLabel}>{pref.label} *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={pref.inputPlaceholder}
                    value={formData.contactDetails[prefValue]}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        contactDetails: {
                          ...formData.contactDetails,
                          [prefValue]: text,
                        },
                      })
                    }
                    placeholderTextColor={theme.colors.textLight}
                    keyboardType={pref.inputType === 'phone' ? 'phone-pad' : pref.inputType === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={pref.inputType === 'email' ? 'none' : 'sentences'}
                  />
                </View>
              );
            })}
          </View>

          {/* Upload Proof (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Proof (Optional)</Text>
            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
              <Upload size={20} color={theme.colors.primary} />
              <Text style={styles.uploadButtonText}>Tap to upload images</Text>
            </TouchableOpacity>
            <Text style={styles.hintText}>
              You can upload photos, documents, or any relevant proof
            </Text>
          </View>

          <PrimaryButton
            title="Submit Request"
            onPress={handleSubmit}
            disabled={!formData.requestType || !formData.subcategory || !formData.description.trim() || !formData.area.trim() || !formData.city.trim() || submitting}
            loading={submitting}
            style={styles.submitButton}
          />

          {/* My Requests Button */}
          <TouchableOpacity
            style={styles.myRequestsButton}
            onPress={() => navigation.navigate('MyRequests')}
            activeOpacity={0.7}
          >
            <Text style={styles.myRequestsButtonText}>My Requests</Text>
          </TouchableOpacity>
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
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    minHeight: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    minHeight: 120,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryContainer: {
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 120,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  categoryButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  marginTop: {
    marginTop: theme.spacing.sm,
  },
  // Location Card Styles (same as ReportIssueScreen)
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
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  dropdownButtonTextPlaceholder: {
    color: theme.colors.textLight,
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
    gap: theme.spacing.sm,
  },
  modalOptionEmoji: {
    fontSize: 18,
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  modalOptionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  marginTop: {
    marginTop: theme.spacing.sm,
  },
  urgencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    minWidth: '22%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  urgencyButtonSelected: {
    borderWidth: 2,
    backgroundColor: theme.colors.white,
  },
  urgencyButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  contactScroll: {
    maxHeight: 60,
  },
  contactContainer: {
    gap: theme.spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.xs,
    position: 'relative',
    marginRight: theme.spacing.sm,
    minWidth: 100,
  },
  contactCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
  },
  contactButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  contactButtonTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  contactDetailInput: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  contactDetailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs / 2,
  },
  contactDetailLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.primary + '05',
    gap: theme.spacing.sm,
  },
  uploadButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  hintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 40,
  },
  successContent: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  requestIdCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  requestIdLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  requestId: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.warning,
    fontWeight: theme.fontWeight.semibold,
  },
  successButtons: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
  outlineButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlineButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  myRequestsButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRequestsButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});

