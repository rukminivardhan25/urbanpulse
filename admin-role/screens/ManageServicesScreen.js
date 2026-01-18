import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Trash2, Clock, Calendar } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { createService, getAdminServices, deleteService } from '../utils/api';
import { convert12hrTo24hr, convert24hrTo12hr } from '../utils/timeUtils';

const serviceTypes = [
  { id: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
  { id: 'water', label: 'Water Supply', icon: '💧' },
  { id: 'power', label: 'Power Updates', icon: '⚡' },
  { id: 'health', label: 'Health Services', icon: '🩺' },
  { id: 'road', label: 'Road Work', icon: '🛣️' },
  { id: 'other', label: 'Other Service', icon: '📋' },
];

const scheduleTypes = [
  { id: 'daily', label: 'Daily' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this_weekend', label: 'This Weekend' },
  { id: 'custom_date', label: 'Custom Date' },
];

// Service subtypes by service type
const serviceSubtypes = {
  garbage: [
    'Regular Garbage',
    'Recyclables',
    'E-Waste',
    'Bulk Waste',
    'Door-to-Door',
    'Other',
  ],
  water: [
    'Morning Supply',
    'Evening Supply',
    'Tanker',
    'Emergency',
    'Other',
  ],
  power: [
    'Scheduled Maintenance',
    'Outage',
    'Line Repair',
    'Load Shedding',
    'Other',
  ],
  health: [
    'Health Camp',
    'Vaccination',
    'Medical Checkup',
    'Emergency Services',
    'Other',
  ],
  road: [
    'Road Repair',
    'Pothole Filling',
    'Cable Laying',
    'Drainage Work',
    'Other',
  ],
  other: ['Other'],
};

export default function ManageServicesScreen() {
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceSubtype: '',
    startTime: '', // In 12hr format (e.g., "7:00 AM")
    endTime: '', // In 12hr format (e.g., "9:00 AM")
    scheduleType: 'daily',
    customDate: '',
    notes: '',
  });

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Reset subtype when service type changes
  useEffect(() => {
    if (formData.serviceType) {
      setFormData((prev) => ({ ...prev, serviceSubtype: '' }));
    }
  }, [formData.serviceType]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const result = await getAdminServices();
      if (result.success) {
        // Convert times from 24hr to 12hr for display
        const servicesWith12hrTime = (result.services || []).map((service) => ({
          ...service,
          startTime: service.startTime ? convert24hrTo12hr(service.startTime) : '',
          endTime: service.endTime ? convert24hrTo12hr(service.endTime) : '',
        }));
        setServices(servicesWith12hrTime);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!formData.serviceType || !formData.scheduleType) {
      Alert.alert('Error', 'Please select service type and schedule type');
      return;
    }

    if (formData.scheduleType === 'custom_date' && !formData.customDate) {
      Alert.alert('Error', 'Please select a custom date');
      return;
    }

    // Convert 12hr time to 24hr format for storage
    let startTime24hr = null;
    let endTime24hr = null;

    if (formData.startTime) {
      try {
        startTime24hr = convert12hrTo24hr(formData.startTime);
      } catch (error) {
        Alert.alert('Error', `Invalid start time: ${error.message}`);
        return;
      }
    }

    if (formData.endTime) {
      try {
        endTime24hr = convert12hrTo24hr(formData.endTime);
      } catch (error) {
        Alert.alert('Error', `Invalid end time: ${error.message}`);
        return;
      }
    }

    try {
      setLoading(true);
      const serviceData = {
        serviceType: formData.serviceType,
        serviceSubtype: formData.serviceSubtype || '',
        startTime: startTime24hr,
        endTime: endTime24hr,
        scheduleType: formData.scheduleType,
        customDate: formData.scheduleType === 'custom_date' ? formData.customDate : null,
        notes: formData.notes || '',
      };

      await createService(serviceData);
      
      // Reset form
      setFormData({
        serviceType: '',
        serviceSubtype: '',
        startTime: '',
        endTime: '',
        scheduleType: 'daily',
        customDate: '',
        notes: '',
      });
      setShowForm(false);
      
      // Reload services
      await loadServices();
      
      Alert.alert('Success', 'Service added successfully');
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Error', error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = (id) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteService(id);
              // Reload services
              await loadServices();
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getServiceTypeLabel = (type) => {
    return serviceTypes.find((st) => st.id === type)?.label || type;
  };

  const getServiceTypeIcon = (type) => {
    return serviceTypes.find((st) => st.id === type)?.icon || '📋';
  };

  const getScheduleTypeLabel = (type) => {
    return scheduleTypes.find((st) => st.id === type)?.label || type;
  };

  const formatServiceDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatPostedDate = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      // Get current year for comparison
      const currentYear = new Date().getFullYear();
      
      // If same year, don't show year
      if (year === currentYear) {
        return `${day} ${month}`;
      } else {
        return `${day} ${month} ${year}`;
      }
    } catch (error) {
      return '';
    }
  };

  const availableSubtypes = formData.serviceType
    ? serviceSubtypes[formData.serviceType] || []
    : [];

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
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          <Plus size={24} color={theme.colors.admin} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Service Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Service</Text>

            {/* Service Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Type *</Text>
              <View style={styles.typeGrid}>
                {serviceTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      formData.serviceType === type.id && styles.typeButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, serviceType: type.id, serviceSubtype: '' })}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        formData.serviceType === type.id && styles.typeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Service Subtype */}
            {formData.serviceType && availableSubtypes.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Subtype</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.subtypeScroll}
                  contentContainerStyle={styles.subtypeContainer}
                >
                  {availableSubtypes.map((subtype) => (
                    <TouchableOpacity
                      key={subtype}
                      style={[
                        styles.subtypeButton,
                        formData.serviceSubtype === subtype && styles.subtypeButtonSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, serviceSubtype: subtype })}
                    >
                      <Text
                        style={[
                          styles.subtypeText,
                          formData.serviceSubtype === subtype && styles.subtypeTextSelected,
                        ]}
                      >
                        {subtype}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {/* Allow custom subtype */}
                <TextInput
                  style={styles.subtypeInput}
                  placeholder="Or enter custom subtype..."
                  placeholderTextColor={theme.colors.textLight}
                  value={
                    formData.serviceSubtype &&
                    !availableSubtypes.includes(formData.serviceSubtype)
                      ? formData.serviceSubtype
                      : ''
                  }
                  onChangeText={(text) =>
                    setFormData({ ...formData, serviceSubtype: text })
                  }
                />
              </View>
            )}

            {/* Time Inputs (Optional) with AM/PM */}
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time (IST, Optional)</Text>
                <View style={styles.timeContainer}>
                  <Clock size={20} color={theme.colors.textLight} />
                  <TextInput
                    style={styles.timeInputField}
                    placeholder="7:00 AM"
                    placeholderTextColor={theme.colors.textLight}
                    value={formData.startTime}
                    onChangeText={(text) =>
                      setFormData({ ...formData, startTime: text })
                    }
                  />
                </View>
                <Text style={styles.hintText}>Format: H:MM AM/PM (e.g., 7:00 AM)</Text>
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time (IST, Optional)</Text>
                <View style={styles.timeContainer}>
                  <Clock size={20} color={theme.colors.textLight} />
                  <TextInput
                    style={styles.timeInputField}
                    placeholder="9:00 AM"
                    placeholderTextColor={theme.colors.textLight}
                    value={formData.endTime}
                    onChangeText={(text) =>
                      setFormData({ ...formData, endTime: text })
                    }
                  />
                </View>
                <Text style={styles.hintText}>Format: H:MM AM/PM (e.g., 9:00 PM)</Text>
              </View>
            </View>

            {/* Schedule Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Schedule Type *</Text>
              <View style={styles.repeatRow}>
                {scheduleTypes.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.repeatButton,
                      formData.scheduleType === option.id && styles.repeatButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, scheduleType: option.id, customDate: '' })}
                  >
                    <Text
                      style={[
                        styles.repeatText,
                        formData.scheduleType === option.id && styles.repeatTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Date Picker (only for Custom Date) */}
            {formData.scheduleType === 'custom_date' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Date *</Text>
                <View style={styles.dateContainer}>
                  <Calendar size={20} color={theme.colors.textLight} />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD (e.g., 2024-01-20)"
                    placeholderTextColor={theme.colors.textLight}
                    value={formData.customDate}
                    onChangeText={(text) =>
                      setFormData({ ...formData, customDate: text })
                    }
                  />
                </View>
                <Text style={styles.hintText}>
                  Format: YYYY-MM-DD (IST date)
                </Text>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Additional information..."
                placeholderTextColor={theme.colors.textLight}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <PrimaryButton
              title="Save Service"
              onPress={handleAddService}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        )}

        {/* Services List */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Active Services</Text>
          {loading && services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading services...</Text>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services added yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to add a service
              </Text>
            </View>
          ) : (
            services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceIcon}>
                    <Text style={styles.serviceIconText}>
                      {getServiceTypeIcon(service.serviceType)}
                    </Text>
                  </View>
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceType}>
                      {getServiceTypeLabel(service.serviceType)}
                    </Text>
                    {service.serviceSubtype && (
                      <Text style={styles.serviceSubtype}>
                        {service.serviceSubtype}
                      </Text>
                    )}
                    {(service.startTime || service.endTime) && (
                      <View style={styles.serviceTime}>
                        <Clock size={14} color={theme.colors.textLight} />
                        <Text style={styles.serviceTimeText}>
                          {service.startTime || '--'} - {service.endTime || '--'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.serviceRepeat}>
                      <Calendar size={14} color={theme.colors.textLight} />
                      <Text style={styles.serviceRepeatText}>
                        {getScheduleTypeLabel(service.scheduleType)} • {formatServiceDate(service.serviceDate)}
                      </Text>
                    </View>
                    {service.notes && (
                      <Text style={styles.serviceNotes}>{service.notes}</Text>
                    )}
                  </View>
                  <View style={styles.serviceRightColumn}>
                    {service.createdAt && (
                      <View style={styles.postedDateContainer}>
                        <Text style={styles.postedDateLabel}>Posted:</Text>
                        <Text style={styles.postedDateText}>
                          {formatPostedDate(service.createdAt)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteService(service.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
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
  addButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  typeButtonSelected: {
    borderColor: theme.colors.admin,
    backgroundColor: theme.colors.admin + '10',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  typeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: theme.colors.admin,
    fontWeight: theme.fontWeight.semibold,
  },
  subtypeScroll: {
    maxHeight: 50,
  },
  subtypeContainer: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  subtypeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  subtypeButtonSelected: {
    borderColor: theme.colors.admin,
    backgroundColor: theme.colors.admin + '10',
  },
  subtypeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  subtypeTextSelected: {
    color: theme.colors.admin,
    fontWeight: theme.fontWeight.semibold,
  },
  subtypeInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  timeInput: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    minHeight: 50,
  },
  timeInputField: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  hintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  repeatButton: {
    flex: 1,
    minWidth: '30%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  repeatButtonSelected: {
    borderColor: theme.colors.admin,
    backgroundColor: theme.colors.admin + '10',
  },
  repeatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  repeatTextSelected: {
    color: theme.colors.admin,
    fontWeight: theme.fontWeight.semibold,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    minHeight: 50,
  },
  dateInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.white,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  servicesContainer: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  serviceCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.admin + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  serviceIconText: {
    fontSize: 24,
  },
  serviceContent: {
    flex: 1,
  },
  serviceType: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  serviceSubtype: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs / 2,
  },
  serviceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs / 2,
  },
  serviceTimeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  serviceRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceRepeatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  serviceNotes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  serviceRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  postedDateContainer: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xs,
  },
  postedDateLabel: {
    fontSize: 9,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  postedDateText: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});
