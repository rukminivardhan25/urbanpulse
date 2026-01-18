import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { PrimaryButton } from '../components/PrimaryButton';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to UrbanPulse</Text>
        <Text style={styles.subtitle}>
          Your gateway to smart city services
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Sign In"
            onPress={() => navigation.navigate('Signin')}
            style={styles.button}
          />
          <PrimaryButton
            title="Sign Up"
            onPress={() => navigation.navigate('Signup')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    width: '100%',
  },
});
