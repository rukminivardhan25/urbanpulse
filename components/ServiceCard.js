import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

export const ServiceCard = ({
  icon: Icon,
  title,
  status,
  time,
  variant = 'default',
  onPress,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return {
          container: styles.containerHighlight,
          iconContainer: styles.iconContainerHighlight,
          iconColor: theme.colors.secondary,
        };
      case 'warning':
        return {
          container: styles.containerWarning,
          iconContainer: styles.iconContainerWarning,
          iconColor: theme.colors.accent,
        };
      default:
        return {
          container: styles.containerDefault,
          iconContainer: styles.iconContainerDefault,
          iconColor: theme.colors.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[styles.card, variantStyles.container]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, variantStyles.iconContainer]}>
          <Icon size={24} color={variantStyles.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {status && <Text style={styles.status}>{status}</Text>}
          {time && <Text style={styles.time}>{time}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerDefault: {
    borderColor: theme.colors.border,
  },
  containerHighlight: {
    borderColor: theme.colors.secondary,
    backgroundColor: `${theme.colors.secondary}10`,
  },
  containerWarning: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}10`,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDefault: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  iconContainerHighlight: {
    backgroundColor: theme.colors.secondary,
  },
  iconContainerWarning: {
    backgroundColor: theme.colors.accent,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  status: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
});







