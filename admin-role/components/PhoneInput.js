import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Phone } from 'lucide-react-native';
import { theme } from '../constants/theme';

export const PhoneInput = ({ value, onChangeText, placeholder, error, editable = true }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        <Phone size={20} color={theme.colors.textLight} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Enter phone number'}
          placeholderTextColor={theme.colors.textLight}
          keyboardType="phone-pad"
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});




