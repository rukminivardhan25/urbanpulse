import { useState, useCallback, useEffect, useRef } from 'react';
import {
  startRecording,
  stopRecording,
  cancelRecording,
  getRecordingStatus,
  transcribeAudio,
  cleanupRecording,
  isRecording as checkIsRecording,
  requestAudioPermissions,
} from '../utils/transcriptionService';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook for speech transcription (speech-to-text)
 * 
 * Usage:
 * const {
 *   startTranscription,
 *   stopTranscription,
 *   cancelTranscription,
 *   transcribedText,
 *   isRecording,
 *   isTranscribing,
 *   error,
 *   recordingDuration
 * } = useSpeechTranscription();
 * 
 * await startTranscription();
 * // ... user speaks ...
 * await stopTranscription(); // Automatically transcribes
 */
export const useSpeechTranscription = () => {
  const { currentLanguage } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);

  const statusIntervalRef = useRef(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
    return () => {
      // Cleanup on unmount
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      cleanupRecording();
    };
  }, []);

  // Update recording duration while recording
  useEffect(() => {
    if (isRecording) {
      statusIntervalRef.current = setInterval(async () => {
        const status = await getRecordingStatus();
        if (status) {
          setRecordingDuration(Math.floor(status.durationMillis / 1000));
        }
      }, 1000);
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [isRecording]);

  /**
   * Check audio recording permissions
   */
  const checkPermissions = useCallback(async () => {
    const hasPerm = await requestAudioPermissions();
    setHasPermission(hasPerm);
    return hasPerm;
  }, []);

  /**
   * Start recording audio
   * @param {string} language - Language code for transcription (defaults to current app language)
   */
  const startTranscription = useCallback(async (language = null) => {
    setError(null);
    setTranscribedText('');

    // Check permissions
    const hasPerm = await checkPermissions();
    if (!hasPerm) {
      const err = new Error('Audio recording permission not granted');
      setError(err.message);
      throw err;
    }

    try {
      const success = await startRecording();
      if (success) {
        setIsRecording(true);
      } else {
        throw new Error('Failed to start recording');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error starting transcription:', err);
      throw err;
    }
  }, [checkPermissions]);

  /**
   * Stop recording and transcribe
   * @param {string} language - Language code for transcription
   */
  const stopTranscription = useCallback(async (language = null) => {
    if (!checkIsRecording()) {
      return;
    }

    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);

    try {
      // Stop recording and get audio URI
      const audioUri = await stopRecording();
      
      if (!audioUri) {
        throw new Error('No audio recorded');
      }

      // Transcribe audio
      const targetLanguage = language || currentLanguage;
      const transcription = await transcribeAudio(audioUri, targetLanguage);
      
      setTranscribedText(transcription);
      return transcription;
    } catch (err) {
      setError(err.message);
      console.error('Error stopping/transcribing:', err);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, [currentLanguage]);

  /**
   * Cancel current recording without transcribing
   */
  const cancelTranscription = useCallback(async () => {
    try {
      await cancelRecording();
      setIsRecording(false);
      setIsTranscribing(false);
      setTranscribedText('');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error canceling transcription:', err);
    }
  }, []);

  /**
   * Clear transcribed text
   */
  const clearTranscription = useCallback(() => {
    setTranscribedText('');
    setError(null);
  }, []);

  return {
    startTranscription,
    stopTranscription,
    cancelTranscription,
    clearTranscription,
    checkPermissions,
    transcribedText,
    isRecording,
    isTranscribing,
    error,
    recordingDuration,
    hasPermission,
  };
};




