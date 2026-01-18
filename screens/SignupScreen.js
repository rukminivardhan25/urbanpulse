import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { PhoneInput } from '../components/PhoneInput';
import { OtpInput } from '../components/OtpInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { sendOTP, verifyOTP, checkUserExists } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!fullName || !phoneNumber) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, check if user already exists
      const userExists = await checkUserExists(phoneNumber);
      
      if (userExists) {
        // User already exists - show error and don't send OTP
        setError('Account already exists. Please use "Already have an account".');
        Alert.alert('Account Exists', 'Account already exists. Please use "Already have an account".');
        setLoading(false);
        return;
      }

      // User does not exist - proceed with sending OTP for new user
      await sendOTP(phoneNumber, fullName);
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
      const result = await verifyOTP(phoneNumber, otp, fullName);
      
      // Check if account already exists error
      if (result.message && result.message.includes('already exists')) {
        setError('Account already exists. Please use "Already have an account".');
        Alert.alert('Account Exists', 'Account already exists. Please use "Already have an account".');
        return;
      }
      
      // Wait a bit for token to be stored
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to LocationSelection for new user to set location
      navigation.reset({
        index: 0,
        routes: [{ name: 'LocationSelection', params: { isNewUser: true } }],
      });
    } catch (err) {
      const errorMessage = err.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Check for account exists error
      if (errorMessage.includes('already exists') || errorMessage.includes('Account already exists')) {
        Alert.alert('Account Exists', 'Account already exists. Please use "Already have an account".');
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
              <Text style={styles.welcomeTitle}>Create your account</Text>
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
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setError('');
                }}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textLight}
              />
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
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
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
