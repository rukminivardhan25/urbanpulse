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

export default function AdminLoginScreen() {
  const navigation = useNavigation();
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

    // TODO: Call backend API to send OTP
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);
      Alert.alert('OTP Sent', 'Please check your phone for OTP');
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter valid OTP');
      return;
    }

    // TODO: Call backend API to verify OTP
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to location selection after successful login
      navigation.navigate('AdminLocationSelection');
    }, 1500);
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
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to access admin dashboard
          </Text>
        </View>

        {!showOtp ? (
          <View style={styles.form}>
            {/* Phone Input */}
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
              title="Send OTP"
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
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Change phone number</Text>
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
  backButton: {
    marginBottom: theme.spacing.lg,
  },
  backButtonText: {
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
});




