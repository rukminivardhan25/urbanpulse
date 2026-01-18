import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export const OtpInput = ({ value, onChangeText, error, length = 6, editable = true }) => {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleChange = (text, index) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      const pastedDigits = numericText.slice(0, length - index);
      const currentValue = value || '';
      const valueArray = currentValue.split('');
      
      pastedDigits.split('').forEach((digit, i) => {
        if (index + i < length) {
          valueArray[index + i] = digit;
        }
      });
      
      const newValue = valueArray.join('').slice(0, length);
      onChangeText(newValue);
      
      const nextIndex = Math.min(index + pastedDigits.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);
    } else {
      const currentValue = value || '';
      const valueArray = currentValue.split('');
      valueArray[index] = numericText;
      const updatedValue = valueArray.join('').slice(0, length);
      onChangeText(updatedValue);
      
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

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
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
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            editable={editable}
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
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});




