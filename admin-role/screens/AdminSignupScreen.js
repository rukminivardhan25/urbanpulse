import React, { useState } from 'react';
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
import { Phone, Shield, User } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PhoneInput } from '../components/PhoneInput';
import { OtpInput } from '../components/OtpInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { sendOTP, verifyOTP, checkAdminExists } from '../utils/api';

export default function AdminSignupScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!fullName) {
      setError('Please enter your full name');
      return;
    }

    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if admin already exists BEFORE sending OTP
      const adminExists = await checkAdminExists(phoneNumber);
      
      if (adminExists) {
        setError('Admin account already exists. Please sign in instead.');
        Alert.alert(
          'Account Exists',
          'Admin account already exists with this phone number. Please sign in instead.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                navigation.navigate('AdminSignin');
              },
            },
            { text: 'OK' },
          ]
        );
        setLoading(false);
        return;
      }

      // Admin does not exist - send OTP for new admin
      await sendOTP(phoneNumber, fullName);
      setShowOtp(true);
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('Account already exists')) {
        Alert.alert(
          'Account Exists',
          'Admin account already exists. Please sign in instead.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                navigation.navigate('AdminSignin');
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
      // Double-check if admin exists before proceeding (in case account was created between OTP send and verify)
      const adminExists = await checkAdminExists(phoneNumber);
      
      if (adminExists) {
        setError('Admin account already exists. Please sign in instead.');
        Alert.alert(
          'Account Exists',
          'Admin account already exists with this phone number. Please sign in instead.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'AdminSignin' }],
                });
              },
            },
            { text: 'OK' },
          ]
        );
        setLoading(false);
        return;
      }

      // Admin does not exist - navigate to location selection
      // OTP will be verified in location screen with location data to create admin
      navigation.navigate('AdminLocationSelection', {
        name: fullName,
        phone: phoneNumber,
        otp: otp, // Pass OTP to location screen for final verification with location
      });
    } catch (err) {
      const errorMessage = err.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('Account already exists')) {
        Alert.alert(
          'Account Exists',
          'Admin account already exists. Please sign in instead.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'AdminSignin' }],
                });
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
          <Text style={styles.title}>Admin Sign Up</Text>
          <Text style={styles.subtitle}>
            Create a new admin account to manage city services
          </Text>
        </View>

        {!showOtp ? (
          <View style={styles.form}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Create Admin Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your details to get started
              </Text>
            </View>

            {/* Phone Method Button */}
            <View style={styles.methodContainer}>
              <View style={[styles.methodButton, styles.methodButtonActive]}>
                <Phone size={16} color={theme.colors.white} />
                <Text style={styles.methodButtonTextActive}>Phone</Text>
              </View>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError('');
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>
            </View>

            {/* Phone Number Input */}
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
              disabled={!fullName || !phoneNumber}
              style={styles.button}
            />

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an admin account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminSignin')}>
                <Text style={styles.signinLink}>Sign In</Text>
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
              title="Verify OTP & Create Account"
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  signinText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  signinLink: {
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

