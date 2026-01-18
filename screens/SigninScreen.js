import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PhoneInput } from '../components/PhoneInput';
import { OtpInput } from '../components/OtpInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { sendOTP, verifyOTP, checkUserExists } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function SigninScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
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
      // First, check if user exists
      const userExists = await checkUserExists(phoneNumber);
      
      if (!userExists) {
        // User does not exist - show error and don't send OTP
        setError('No account found. Please use Get Started.');
        Alert.alert('Account Not Found', 'No account found. Please use Get Started.');
        setLoading(false);
        return;
      }

      // User exists - proceed with sending OTP
      await sendOTP(phoneNumber);
      setShowOtp(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(phoneNumber, otp);
      
      // Check if account not found error
      if (result.message && (result.message.includes('No account found') || result.message.includes('not found'))) {
        setError('No account found. Please use "Get Started".');
        Alert.alert('Account Not Found', 'No account found. Please use "Get Started".');
        return;
      }
      
      // Wait a bit for token to be stored
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update auth state
      await login();
      
      // Navigate directly to Dashboard for returning user
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (err) {
      const errorMessage = err.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Check for account not found error
      if (errorMessage.includes('No account found') || errorMessage.includes('not found')) {
        Alert.alert('Account Not Found', 'No account found. Please use "Get Started".');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setOtp('');
    await handleSendOtp();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topSpacer} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          </View>
        ) : (
          <View style={styles.form}>
            <TouchableOpacity
              onPress={() => setShowOtp(false)}
              style={styles.backToInput}
            >
              <Text style={styles.backToInputText}>← Change phone number</Text>
            </TouchableOpacity>
            
            <Text style={styles.otpInfoText}>
              Enter the 6-digit code sent to
            </Text>
            <Text style={styles.otpPhoneText}>{phoneNumber}</Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OtpInput
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setError('');
                }}
                error={error ? error : null}
              />
            </View>

            {/* Note about any OTP */}
            <View style={styles.otpNoteContainer}>
              <Text style={styles.otpNoteText}>
                Note: You can enter any 6-digit OTP
              </Text>
            </View>

            <PrimaryButton
              title="Verify & Continue"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={otp.length !== 6}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={handleResendCode}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Resend Code</Text>
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
  topSpacer: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl + theme.spacing.lg, // Extra space at top
    paddingBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
  },
  methodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  methodButtonTextActive: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.white,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  button: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  otpInfoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  otpPhoneText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  otpContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  resendButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  resendText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  backToInput: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  backToInputText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  otpNoteContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  otpNoteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
