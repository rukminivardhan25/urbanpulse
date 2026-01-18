import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../constants/theme';

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    if (variant === 'secondary') {
      return [styles.button, styles.buttonSecondary, isDisabled && styles.buttonDisabled, style];
    }
    if (variant === 'outline') {
      return [styles.button, styles.buttonOutline, isDisabled && styles.buttonDisabled, style];
    }
    if (variant === 'hero') {
      return [styles.button, styles.buttonHero, isDisabled && styles.buttonDisabled, style];
    }
    return [styles.button, styles.buttonPrimary, isDisabled && styles.buttonDisabled, style];
  };

  const getTextStyle = () => {
    if (variant === 'secondary') {
      return [styles.text, styles.textSecondary];
    }
    if (variant === 'outline') {
      return [styles.text, styles.textOutline];
    }
    if (variant === 'hero') {
      return [styles.text, styles.textHero];
    }
    return [styles.text, styles.textPrimary];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : theme.colors.white}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonHero: {
    backgroundColor: '#3D6B4F', // Forest Green (gradient-hero)
    shadowColor: '#3D6B4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3D6B4F', // Forest Green
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textHero: {
    color: theme.colors.white,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textOutline: {
    color: '#3D6B4F', // Forest Green
  },
});



