import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary', // 'primary', 'secondary', 'danger'
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.buttonSecondary];
      case 'danger':
        return [styles.button, styles.buttonDanger];
      default:
        return [styles.button, styles.buttonPrimary];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.text, styles.textSecondary];
      case 'danger':
        return [styles.text, styles.textDanger];
      default:
        return [styles.text, styles.textPrimary];
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textSecondary: {
    color: theme.colors.text,
  },
  textDanger: {
    color: theme.colors.white,
  },
});




