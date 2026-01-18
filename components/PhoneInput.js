import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export const PhoneInput = ({ value, onChangeText, error, placeholder, editable = true }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Phone Number'}
        placeholderTextColor={theme.colors.textLight}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        editable={editable}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
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
    fontWeight: theme.fontWeight.medium,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});











