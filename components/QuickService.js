import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

export const QuickService = ({ icon: Icon, label, color = 'primary', onPress }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emergency':
        return {
          backgroundColor: `${theme.colors.error}15`,
          iconColor: theme.colors.error,
        };
      case 'secondary':
        return {
          backgroundColor: `${theme.colors.secondary}15`,
          iconColor: theme.colors.secondary,
        };
      case 'accent':
        return {
          backgroundColor: `${theme.colors.accent}15`,
          iconColor: theme.colors.accent,
        };
      default:
        return {
          backgroundColor: `${theme.colors.primary}15`,
          iconColor: theme.colors.primary,
        };
    }
  };

  const colorStyles = getColorStyles();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colorStyles.backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: colorStyles.iconColor }]}>
        <Icon size={20} color={theme.colors.white} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
});







