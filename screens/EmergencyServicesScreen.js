import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Phone,
  Ambulance,
  Shield,
  Flame,
  Users,
  AlertTriangle,
  Heart,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import { useTranslation } from '../hooks/useTranslation';

// Emergency services data
const emergencyServicesData = [
  {
    id: 'ambulance',
    number: '108',
    icon: Ambulance,
    color: theme.colors.emergency || '#E53E3E',
    description: 'Medical emergency',
  },
  {
    id: 'police',
    number: '100',
    icon: Shield,
    color: '#2563EB',
    description: 'Police emergency',
  },
  {
    id: 'fire',
    number: '101',
    icon: Flame,
    color: '#F59E0B',
    description: 'Fire emergency',
  },
  {
    id: 'womenSafety',
    number: '1091',
    icon: Users,
    color: '#9333EA',
    description: 'Women helpline',
  },
  {
    id: 'disaster',
    number: '1070',
    icon: AlertTriangle,
    color: '#DC2626',
    description: 'Disaster management',
  },
  {
    id: 'childHelpline',
    number: '1098',
    icon: Heart,
    color: '#059669',
    description: 'Child helpline',
  },
];

/**
 * Get emergency services with translated names
 * @param {Function} t - Translation function
 * @returns {Array} Array of emergency services with translated names
 */
const getEmergencyServices = (t) => {
  return emergencyServicesData.map((service) => ({
    ...service,
    name: t(`emergency.${service.id}`),
  }));
};

export default function EmergencyServicesScreen() {
  const navigation = useNavigation();
  const { t, currentLanguage } = useTranslation(); // Include to trigger re-render

  const handleServicePress = (service) => {
    const serviceName = service.name || t(`emergency.${service.id}`);
    Alert.alert(
      t('emergency.callConfirm').replace('{service}', serviceName),
      t('emergency.callMessage').replace('{number}', service.number),
      [
        {
          text: t('emergency.cancel'),
          style: 'cancel',
        },
        {
          text: t('emergency.call'),
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${service.number}`);
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        <Text style={styles.headerTitle}>{t('emergency.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          {t('emergency.selectService')}
        </Text>

        {getEmergencyServices(t).map((service) => {
          const IconComponent = service.icon;
          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => handleServicePress(service)}
              style={styles.serviceCard}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${service.color}20` }]}>
                <IconComponent size={24} color={service.color} />
              </View>
              <View style={styles.serviceContent}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <View style={styles.phoneSection}>
                <Phone size={20} color={service.color} />
                <Text style={[styles.phoneNumber, { color: service.color }]}>
                  {service.number}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('emergency.footer')}
          </Text>
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
    backgroundColor: theme.colors.emergency,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  serviceDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  phoneNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  footer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.emergency}10`,
    borderRadius: theme.borderRadius.md,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});

