import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building2, ShieldAlert, Users, Leaf } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { CityIllustration } from '../components/CityIllustration';
import { useTranslation } from '../hooks/useTranslation';

export default function LandingScreen() {
  const navigation = useNavigation();
  const { t, currentLanguage } = useTranslation(); // Include currentLanguage to trigger re-render
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const serviceButtons = [
    {
      icon: Building2,
      label: 'Services',
      color: theme.colors.primary,
    },
    {
      icon: ShieldAlert,
      label: 'Alerts',
      color: theme.colors.primary,
      accentColor: theme.colors.accent,
    },
    {
      icon: Users,
      label: 'Volunteer',
      color: theme.colors.primary,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.topSpacer} />
      {/* Logo and Heading Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Leaf size={24} color={theme.colors.white} strokeWidth={2.5} />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTextBold}>Urban</Text>
            <Text style={styles.logoTextRegular}>Pulse</Text>
          </View>
        </View>
      </View>

      {/* City Illustration Section - Floating */}
      <Animated.View
        style={[
          styles.illustrationSection,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <CityIllustration />
      </Animated.View>

      {/* Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.mainHeading}>Your city, simplified.</Text>
        <Text style={styles.description}>
          Access city services, report issues, and stay informed – all in one place.
        </Text>
      </View>

      {/* Service Buttons Section */}
      <View style={styles.buttonsSection}>
        {serviceButtons.map((service, index) => {
          const Icon = service.icon;
          
          return (
            <View
              key={index}
              style={styles.serviceButton}
            >
              <View style={styles.iconContainer}>
                <Icon size={32} color={service.color} strokeWidth={2} />
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <PrimaryButton
          title={t('landing.getStarted')}
          onPress={() => navigation.navigate('Signup')}
          style={styles.actionButton}
        />
        <PrimaryButton
          title={t('landing.haveAccount')}
          onPress={() => navigation.navigate('Signin')}
          variant="outline"
          style={styles.actionButton}
        />
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  headerSection: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTextBold: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  logoTextRegular: {
    fontSize: 32,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.primary,
  },
  illustrationSection: {
    width: '100%',
    height: 250,
    backgroundColor: '#E8F5E9', // Light greenish-grey background
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  textSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  buttonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  serviceButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertsIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightRays: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightRay: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: theme.colors.accent,
    top: -6,
  },
  serviceLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
});
