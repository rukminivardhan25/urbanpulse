import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Transcription Service
 * Provides speech-to-text functionality
 * 
 * Note: For full speech recognition, you'll need to use:
 * - expo-speech for text-to-speech
 * - A backend service or API for speech-to-text (Google Speech-to-Text, AWS Transcribe, etc.)
 * 
 * This service provides a foundation that can be extended with actual STT APIs
 */

let recording = null;
let recordingUri = null;

/**
 * Request audio recording permissions
 */
export const requestAudioPermissions = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
};

/**
 * Start audio recording
 * @returns {Promise<boolean>} Success status
 */
export const startRecording = async () => {
  try {
    // Request permissions
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      throw new Error('Audio recording permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    return true;
  } catch (error) {
    console.error('Error starting recording:', error);
    return false;
  }
};

/**
 * Stop audio recording
 * @returns {Promise<string|null>} URI of recorded audio file or null
 */
export const stopRecording = async () => {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingUri = uri;
    recording = null;

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return uri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return null;
  }
};

/**
 * Cancel current recording
 */
export const cancelRecording = async () => {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  } catch (error) {
    console.error('Error canceling recording:', error);
  }
};

/**
 * Get recording status
 * @returns {object|null} Recording status or null
 */
export const getRecordingStatus = async () => {
  try {
    if (!recording) {
      return null;
    }

    const status = await recording.getStatusAsync();
    return {
      isRecording: status.isRecording,
      durationMillis: status.durationMillis,
      canRecord: status.canRecord,
    };
  } catch (error) {
    console.error('Error getting recording status:', error);
    return null;
  }
};

/**
 * Transcribe audio file using backend API
 * This requires a backend endpoint that processes audio and returns transcription
 * 
 * @param {string} audioUri - URI of the audio file
 * @param {string} language - Language code (e.g., 'en', 'hi', 'te')
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (audioUri, language = 'en') => {
  try {
    if (!audioUri) {
      throw new Error('Audio URI is required');
    }

    // Read audio file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Send to backend for transcription
    // You'll need to implement a backend endpoint that uses:
    // - Google Cloud Speech-to-Text API
    // - AWS Transcribe
    // - Azure Speech Services
    // - Or another STT service
    
    const API_BASE_URL = __DEV__
      ? 'http://192.168.1.8:3000' // Your backend URL
      : 'https://your-production-api.com';

    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: base64Audio,
        language: language,
        encoding: 'base64',
      }),
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.transcription || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Transcribe using device's built-in speech recognition (iOS/Android)
 * This is a placeholder - actual implementation depends on native modules
 * 
 * For React Native, you might need:
 * - @react-native-voice/voice (for Android/iOS native speech recognition)
 * - Or use a cloud-based solution
 */
export const transcribeWithDevice = async (language = 'en') => {
  // This would require native modules
  // For now, return a placeholder
  throw new Error('Device-based transcription requires native modules. Use transcribeAudio() with a backend service instead.');
};

/**
 * Clean up recording resources
 */
export const cleanupRecording = async () => {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }

    if (recordingUri) {
      // Optionally delete the file
      // await FileSystem.deleteAsync(recordingUri, { idempotent: true });
      recordingUri = null;
    }
  } catch (error) {
    console.error('Error cleaning up recording:', error);
  }
};

/**
 * Check if recording is in progress
 */
export const isRecording = () => {
  return recording !== null;
};




