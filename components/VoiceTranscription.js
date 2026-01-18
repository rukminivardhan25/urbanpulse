import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mic, MicOff, Square, X } from 'lucide-react-native';
import { useSpeechTranscription } from '../hooks/useSpeechTranscription';
import { theme } from '../constants/theme';

/**
 * Voice Transcription Component
 * Allows users to record voice and convert it to text
 * 
 * Usage:
 * <VoiceTranscription
 *   onTranscribed={(text) => console.log('Transcribed:', text)}
 *   maxDuration={60} // seconds
 * />
 */
export const VoiceTranscription = ({
  onTranscribed,
  maxDuration = 60, // Maximum recording duration in seconds
  style,
  showText = true,
}) => {
  const {
    startTranscription,
    stopTranscription,
    cancelTranscription,
    transcribedText,
    isRecording,
    isTranscribing,
    error,
    recordingDuration,
    hasPermission,
    checkPermissions,
  } = useSpeechTranscription();

  const [localText, setLocalText] = useState('');

  useEffect(() => {
    if (transcribedText) {
      setLocalText(transcribedText);
      if (onTranscribed) {
        onTranscribed(transcribedText);
      }
    }
  }, [transcribedText, onTranscribed]);

  // Auto-stop at max duration
  useEffect(() => {
    if (isRecording && recordingDuration >= maxDuration) {
      handleStop();
    }
  }, [isRecording, recordingDuration, maxDuration]);

  const handleStart = async () => {
    try {
      if (hasPermission === false) {
        const granted = await checkPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please grant microphone permission to use voice transcription.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      await startTranscription();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to start recording');
    }
  };

  const handleStop = async () => {
    try {
      await stopTranscription();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to stop recording');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelTranscription();
      setLocalText('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to cancel recording');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Recording Status */}
      {isRecording && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording... {formatDuration(recordingDuration)}
            </Text>
          </View>
          {maxDuration > 0 && (
            <Text style={styles.durationText}>
              Max: {formatDuration(maxDuration)}
            </Text>
          )}
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isRecording && !isTranscribing ? (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={handleStart}
          >
            <Mic size={24} color={theme.colors.white} />
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : isRecording ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStop}
            >
              <Square size={24} color={theme.colors.white} />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <X size={24} color={theme.colors.white} />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.button, styles.processingButton]}>
            <ActivityIndicator color={theme.colors.white} />
            <Text style={styles.buttonText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Transcribed Text */}
      {showText && localText ? (
        <View style={styles.textContainer}>
          <View style={styles.textHeader}>
            <Text style={styles.textLabel}>Transcribed Text:</Text>
            <TouchableOpacity
              onPress={() => setLocalText('')}
              style={styles.clearButton}
            >
              <X size={16} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
          <View style={styles.textBox}>
            <Text style={styles.text}>{localText}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  recordingStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.error + '20',
    borderRadius: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: theme.colors.error + '20',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
  },
  cancelButton: {
    backgroundColor: theme.colors.textLight,
  },
  processingButton: {
    backgroundColor: theme.colors.primary,
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  textContainer: {
    marginTop: 16,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearButton: {
    padding: 4,
  },
  textBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: theme.colors.background,
    minHeight: 100,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
});




