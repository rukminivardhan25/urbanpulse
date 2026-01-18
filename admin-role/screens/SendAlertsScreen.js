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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Send, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { alertCategories } from '../constants/alertCategories';
import { createAlert, getAdminAlerts, deleteAlert } from '../utils/api';

const priorityOptions = [
  { id: 'normal', label: 'Normal', icon: Info, color: theme.colors.info },
  { id: 'urgent', label: 'Urgent', icon: AlertTriangle, color: theme.colors.warning },
  { id: 'emergency', label: 'Emergency', icon: AlertCircle, color: theme.colors.error },
];

export default function SendAlertsScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    category: '',
    alertType: '',
    priority: 'normal',
    title: '',
    message: '',
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load alerts on mount and when screen comes into focus
  useEffect(() => {
    loadAlerts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAlerts();
    }, [])
  );

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const result = await getAdminAlerts();
      if (result.success) {
        setAlerts(result.alerts || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!formData.category || !formData.alertType || !formData.title || !formData.message) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setSending(true);
      const result = await createAlert({
        category: formData.category,
        alertType: formData.alertType,
        priority: formData.priority,
        title: formData.title,
        message: formData.message,
      });

      if (result.success) {
        Alert.alert('Success', 'Alert sent successfully to all users in your area');
        setFormData({
          category: '',
          alertType: '',
          priority: 'normal',
          title: '',
          message: '',
        });
        await loadAlerts();
      } else {
        Alert.alert('Error', result.message || 'Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      Alert.alert('Error', 'Failed to send alert. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAlert = (alertId) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAlert(alertId);
              await loadAlerts();
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Error', 'Failed to delete alert');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getPriorityIcon = (priority) => {
    return priorityOptions.find((p) => p.id === priority)?.icon || Info;
  };

  const getPriorityColor = (priority) => {
    return priorityOptions.find((p) => p.id === priority)?.color || theme.colors.info;
  };

  const getCategoryLabel = (categoryKey) => {
    return alertCategories[categoryKey]?.label || categoryKey;
  };

  const availableTypes = formData.category
    ? alertCategories[formData.category]?.types || []
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <Text style={styles.headerTitle}>Send Alerts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Alert</Text>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alert Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {Object.entries(alertCategories).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryButton,
                    formData.category === key && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category: key, alertType: '' })}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      formData.category === key && styles.categoryLabelSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {category.label.replace(/[🌦🔥🚑🚦🌊🛡🏥⚡📢]/g, '').trim()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Alert Type Selection */}
          {formData.category && availableTypes.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alert Type *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
                contentContainerStyle={styles.typeContainer}
              >
                {availableTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.alertType === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, alertType: type })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.alertType === type && styles.typeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Priority Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {priorityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.priorityButton,
                      formData.priority === option.id && [
                        styles.priorityButtonSelected,
                        { borderColor: option.color },
                      ],
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, priority: option.id })
                    }
                  >
                    <IconComponent
                      size={20}
                      color={
                        formData.priority === option.id
                          ? option.color
                          : theme.colors.textLight
                      }
                    />
                    <Text
                      style={[
                        styles.priorityLabel,
                        formData.priority === option.id && {
                          color: option.color,
                          fontWeight: theme.fontWeight.semibold,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alert Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter alert title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholderTextColor={theme.colors.textLight}
            />
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alert Message *</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Enter alert message..."
              value={formData.message}
              onChangeText={(text) =>
                setFormData({ ...formData, message: text })
              }
              multiline
              numberOfLines={5}
              placeholderTextColor={theme.colors.textLight}
              textAlignVertical="top"
            />
          </View>

          <PrimaryButton
            title="Send Alert"
            onPress={handleSendAlert}
            icon={Send}
            style={styles.sendButton}
            loading={sending}
            disabled={sending}
          />
        </View>

        {/* Recent Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {loading && alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts sent yet</Text>
            </View>
          ) : (
            alerts.map((alert) => {
              const PriorityIcon = getPriorityIcon(alert.priority);
              const priorityColor = getPriorityColor(alert.priority);
              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View
                      style={[
                        styles.alertIconContainer,
                        { backgroundColor: priorityColor + '20' },
                      ]}
                    >
                      <PriorityIcon size={20} color={priorityColor} />
                    </View>
                    <View style={styles.alertContent}>
                      <View style={styles.alertTitleRow}>
                        <View style={styles.alertTitleContainer}>
                          <Text style={styles.alertCategory}>
                            {getCategoryLabel(alert.category)}
                          </Text>
                          <Text style={styles.alertTitle}>{alert.title}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeleteAlert(alert.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.alertType}>{alert.alertType}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <View style={styles.alertFooter}>
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: priorityColor + '20' },
                          ]}
                        >
                          <Text
                            style={[styles.priorityBadgeText, { color: priorityColor }]}
                          >
                            {priorityOptions.find((p) => p.id === alert.priority)?.label}
                          </Text>
                        </View>
                        <Text style={styles.alertDate}>
                          {formatDate(alert.createdAt)} at {formatTime(alert.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
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
  categoryScroll: {
    maxHeight: 120,
  },
  categoryContainer: {
    gap: theme.spacing.sm,
  },
  categoryButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    minWidth: 100,
    marginRight: theme.spacing.sm,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  categoryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  typeScroll: {
    maxHeight: 50,
  },
  typeContainer: {
    gap: theme.spacing.sm,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
  },
  typeButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
  },
  typeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  typeTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.xs,
  },
  priorityButtonSelected: {
    borderWidth: 2,
    backgroundColor: theme.colors.white,
  },
  priorityLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
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
  messageInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    minHeight: 120,
  },
  sendButton: {
    marginTop: theme.spacing.md,
  },
  alertsContainer: {
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
  },
  alertCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertCategory: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  alertType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  alertMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  alertDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
});
