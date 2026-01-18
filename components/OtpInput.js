import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export const OtpInput = ({ value, onChangeText, error, length = 6, editable = true }) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleChange = (text, index) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste - fill multiple inputs
      const pastedDigits = numericText.slice(0, length - index);
      const currentValue = value || '';
      const valueArray = currentValue.split('');
      
      // Fill in the pasted digits
      pastedDigits.split('').forEach((digit, i) => {
        if (index + i < length) {
          valueArray[index + i] = digit;
        }
      });
      
      const newValue = valueArray.join('').slice(0, length);
      onChangeText(newValue);
      
      // Focus the last filled input or next empty
      const nextIndex = Math.min(index + pastedDigits.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);
    } else {
      // Single digit input
      const currentValue = value || '';
      const valueArray = currentValue.split('');
      valueArray[index] = numericText;
      const updatedValue = valueArray.join('').slice(0, length);
      onChangeText(updatedValue);
      
      // Auto-focus next input
      if (numericText && index < length - 1) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              focusedIndex === index && styles.inputFocused,
              error && styles.inputError,
            ]}
            value={value[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType="number-pad"
            maxLength={1}
            editable={editable}
            selectTextOnFocus
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 64,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

