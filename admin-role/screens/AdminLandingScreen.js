import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, ArrowRight } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function AdminLandingScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={64} color={theme.colors.admin} />
          </View>
          <Text style={styles.title}>UrbanPulse Admin</Text>
          <Text style={styles.subtitle}>
            Manage city services, alerts, and user reports
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚙️</Text>
            <Text style={styles.featureTitle}>Manage Services</Text>
            <Text style={styles.featureDescription}>
              Update water, power, and garbage collection timings
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureTitle}>Send Alerts</Text>
            <Text style={styles.featureDescription}>
              Post important alerts and notifications to citizens
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureTitle}>View Reports</Text>
            <Text style={styles.featureDescription}>
              Monitor and respond to citizen complaints
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Get Started"
            onPress={() => navigation.navigate('AdminSignup')}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            style={styles.signinButton}
            onPress={() => navigation.navigate('AdminSignin')}
            activeOpacity={0.7}
          >
            <Text style={styles.signinText}>
              Already have an admin account? Sign In
            </Text>
            <ArrowRight size={20} color={theme.colors.admin} />
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.admin + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xxl,
  },
  featureCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  signinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  signinText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.admin,
    fontWeight: theme.fontWeight.semibold,
  },
});




