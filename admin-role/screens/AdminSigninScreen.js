import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, Shield } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PhoneInput } from '../components/PhoneInput';
import { OtpInput } from '../components/OtpInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { sendOTP, verifyOTP, checkAdminExists } from '../utils/api';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminSigninScreen() {
  const navigation = useNavigation();
  const { login } = useAdminAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if admin exists BEFORE sending OTP
      const adminExists = await checkAdminExists(phoneNumber);
      
      if (!adminExists) {
        setError('No admin account found. Please sign up first.');
        Alert.alert(
          'Account Not Found',
          'No admin account found with this phone number. Please sign up first.',
          [
            {
              text: 'Sign Up',
              onPress: () => {
                navigation.navigate('AdminSignup');
              },
            },
            { text: 'OK' },
          ]
        );
        setLoading(false);
        return;
      }

      // Admin exists - send OTP
      await sendOTP(phoneNumber);
      setShowOtp(true);
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.includes('not found') || errorMessage.includes('No account found')) {
        Alert.alert(
          'Account Not Found',
          'No admin account found. Please sign up first.',
          [
            {
              text: 'Sign Up',
              onPress: () => {
                navigation.navigate('AdminSignup');
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter valid OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(phoneNumber, otp);
      
      // Verify that admin exists in the response
      if (!result.admin) {
        setError('Admin account not found. Please sign up first.');
        Alert.alert('Account Not Found', 'Admin account not found. Please sign up first.');
        setLoading(false);
        return;
      }

      // Check if account was deactivated
      if (result.message && result.message.includes('deactivated')) {
        setError('Admin account is deactivated. Please contact support.');
        Alert.alert('Account Deactivated', 'Admin account is deactivated. Please contact support.');
        setLoading(false);
        return;
      }
      
      // Wait a bit for token to be stored
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update auth state
      await login();
      
      // Navigate directly to dashboard (location already set for existing admin)
      navigation.reset({
        index: 0,
        routes: [{
          name: 'AdminDashboard',
          params: {
            city: result.admin.city,
            area: result.admin.area,
          },
        }],
      });
    } catch (err) {
      const errorMessage = err.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Check for specific error cases
      if (errorMessage.includes('not found') || errorMessage.includes('No account found')) {
        Alert.alert('Account Not Found', 'No admin account found. Please sign up first.');
      } else if (errorMessage.includes('deactivated')) {
        Alert.alert('Account Deactivated', 'Admin account is deactivated. Please contact support.');
      } else if (errorMessage.includes('expired') || errorMessage.includes('not found')) {
        Alert.alert('OTP Expired', 'OTP has expired. Please request a new OTP.');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Shield size={48} color={theme.colors.admin} />
          </View>
          <Text style={styles.title}>Admin Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to access admin dashboard
          </Text>
        </View>

        {!showOtp ? (
          <View style={styles.form}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your phone number to continue
              </Text>
            </View>

            {/* Phone Method Button */}
            <View style={styles.methodContainer}>
              <View style={[styles.methodButton, styles.methodButtonActive]}>
                <Phone size={16} color={theme.colors.white} />
                <Text style={styles.methodButtonTextActive}>Phone</Text>
              </View>
            </View>

            {/* Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <PhoneInput
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setError('');
                }}
                placeholder="Enter your phone number"
                error={error ? error : null}
              />
            </View>

            <PrimaryButton
              title="Continue"
              onPress={handleSendOtp}
              loading={loading}
              disabled={!phoneNumber}
              style={styles.button}
            />

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an admin account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminSignup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <TouchableOpacity
              onPress={() => setShowOtp(false)}
              style={styles.backToInput}
            >
              <Text style={styles.backToInputText}>← Change phone number</Text>
            </TouchableOpacity>

            <View style={styles.otpSection}>
              <Text style={styles.label}>Enter OTP</Text>
              <Text style={styles.otpHint}>
                We've sent a 6-digit OTP to {phoneNumber}
              </Text>
              <OtpInput
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setError('');
                }}
                error={error ? error : null}
              />
              {/* Note about any OTP */}
              <View style={styles.otpNoteContainer}>
                <Text style={styles.otpNoteText}>
                  Note: You can enter any 6-digit OTP
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Verify OTP"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={!otp || otp.length !== 6}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={handleSendOtp}
              style={styles.resendButton}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  form: {
    width: '100%',
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  methodContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  methodButtonActive: {
    backgroundColor: theme.colors.admin,
  },
  methodButtonTextActive: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
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
  button: {
    marginTop: theme.spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signupText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  signupLink: {
    fontSize: theme.fontSize.md,
    color: theme.colors.admin,
    fontWeight: theme.fontWeight.semibold,
  },
  backToInput: {
    marginBottom: theme.spacing.lg,
  },
  backToInputText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  otpSection: {
    marginBottom: theme.spacing.lg,
  },
  otpHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  otpNoteContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    alignItems: 'center',
  },
  otpNoteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

