import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { theme } from '../constants/theme';

export const AlertBanner = ({ type = 'warning', title, message }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: `${theme.colors.error}15`,
          borderColor: theme.colors.error,
          iconColor: theme.colors.error,
        };
      case 'success':
        return {
          backgroundColor: `${theme.colors.success}15`,
          borderColor: theme.colors.success,
          iconColor: theme.colors.success,
        };
      default:
        return {
          backgroundColor: `${theme.colors.accent}15`,
          borderColor: theme.colors.accent,
          iconColor: theme.colors.accent,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View style={[styles.container, typeStyles]}>
      <AlertTriangle size={20} color={typeStyles.iconColor} />
      <View style={styles.textContainer}>
        {title && <Text style={[styles.title, { color: typeStyles.iconColor }]}>{title}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
});







