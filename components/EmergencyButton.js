import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

export const EmergencyButton = ({ onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.5)).current;
  const glowRadius = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Reduced pulsing animation - subtle breathing effect (scale)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glowing shadow animation with radius and opacity
    const shadowAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shadowOpacity, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(shadowOpacity, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowRadius, {
            toValue: 24,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowRadius, {
            toValue: 20,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    pulseAnimation.start();
    shadowAnimation.start();

    return () => {
      pulseAnimation.stop();
      shadowAnimation.stop();
    };
  }, []);

  const handlePress = () => {
    // Navigate to Emergency Services screen instead of direct call
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Outer glow layer */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            shadowOpacity,
            shadowRadius: glowRadius,
          },
        ]}
      >
        {/* Inner shadow layer */}
        <Animated.View
          style={[
            styles.shadowContainer,
            {
              shadowOpacity,
              shadowRadius: glowRadius,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.9}
              style={styles.touchable}
            >
              <LinearGradient
                colors={['#EF4444', '#F97316']} // Red to orange gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Phone size={24} color={theme.colors.white} />
                <Text style={styles.buttonText}>Emergency SOS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Container to hold glow layers
  },
  outerGlow: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  shadowContainer: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  buttonContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  touchable: {
    borderRadius: theme.borderRadius.lg,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
