import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { theme } from '../constants/theme';

export const CityIllustration = ({ style }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Svg width="100%" height="200" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Building Gradient - Forest Green */}
          <LinearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#14532D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1a6b3a" stopOpacity="1" />
          </LinearGradient>
          
          {/* Window Light Gradient */}
          <LinearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="hsl(45, 90%, 70%)" stopOpacity="1" />
            <Stop offset="100%" stopColor="hsl(45, 90%, 60%)" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Sky Background - Light greenish-grey */}
        <Rect x="0" y="0" width="400" height="200" fill="#E8F5E9" />

        {/* Sun - Bright Orange */}
        <Circle cx="350" cy="40" r="30" fill="#FF8C00" opacity="0.9" />
        
        {/* Small orange dots scattered */}
        <Circle cx="200" cy="30" r="3" fill="#FF8C00" opacity="0.6" />
        <Circle cx="220" cy="25" r="2.5" fill="#FF8C00" opacity="0.5" />
        <Circle cx="180" cy="35" r="2" fill="#FF8C00" opacity="0.4" />

        {/* Clouds */}
        <G opacity="0.6">
          <Circle cx="80" cy="30" r="15" fill="white" />
          <Circle cx="95" cy="30" r="18" fill="white" />
          <Circle cx="110" cy="30" r="15" fill="white" />
          
          <Circle cx="250" cy="25" r="12" fill="white" />
          <Circle cx="262" cy="25" r="15" fill="white" />
          <Circle cx="274" cy="25" r="12" fill="white" />
        </G>

        {/* Back Row Buildings */}
        <G opacity="0.7">
          {/* Building 1 - Back */}
          <Rect x="20" y="120" width="60" height="80" fill="url(#buildingGradient)" />
          <Rect x="30" y="130" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="45" y="130" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="60" y="130" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="30" y="145" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="45" y="145" width="8" height="8" fill="url(#windowGradient)" />

          {/* Building 2 - Back */}
          <Rect x="100" y="110" width="50" height="90" fill="url(#buildingGradient)" />
          <Rect x="110" y="120" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="125" y="120" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="140" y="120" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="110" y="135" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="125" y="135" width="8" height="8" fill="url(#windowGradient)" />

          {/* Building 3 - Back */}
          <Rect x="170" y="115" width="45" height="85" fill="url(#buildingGradient)" />
          <Rect x="180" y="125" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="195" y="125" width="8" height="8" fill="url(#windowGradient)" />
          <Rect x="180" y="140" width="8" height="8" fill="url(#windowGradient)" />
        </G>

        {/* Middle Row Buildings */}
        <G opacity="0.85">
          {/* Building 1 - Middle */}
          <Rect x="40" y="140" width="70" height="60" fill="url(#buildingGradient)" />
          <Rect x="50" y="150" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="65" y="150" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="80" y="150" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="95" y="150" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="50" y="165" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="65" y="165" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="80" y="165" width="10" height="10" fill="url(#windowGradient)" />

          {/* Building 2 - Middle */}
          <Rect x="130" y="130" width="65" height="70" fill="url(#buildingGradient)" />
          <Rect x="140" y="140" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="155" y="140" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="170" y="140" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="185" y="140" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="140" y="155" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="155" y="155" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="170" y="155" width="10" height="10" fill="url(#windowGradient)" />

          {/* Building 3 - Middle */}
          <Rect x="220" y="135" width="60" height="65" fill="url(#buildingGradient)" />
          <Rect x="230" y="145" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="245" y="145" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="260" y="145" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="230" y="160" width="10" height="10" fill="url(#windowGradient)" />
          <Rect x="245" y="160" width="10" height="10" fill="url(#windowGradient)" />
        </G>

        {/* Front Row Buildings */}
        <G>
          {/* Building 1 - Front */}
          <Rect x="10" y="160" width="80" height="40" fill="url(#buildingGradient)" />
          <Rect x="20" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="38" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="56" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="74" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="20" y="185" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="38" y="185" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="56" y="185" width="12" height="12" fill="url(#windowGradient)" />

          {/* Building 2 - Front */}
          <Rect x="110" y="150" width="90" height="50" fill="url(#buildingGradient)" />
          <Rect x="120" y="160" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="138" y="160" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="156" y="160" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="174" y="160" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="192" y="160" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="120" y="175" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="138" y="175" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="156" y="175" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="174" y="175" width="12" height="12" fill="url(#windowGradient)" />

          {/* Building 3 - Front */}
          <Rect x="220" y="155" width="75" height="45" fill="url(#buildingGradient)" />
          <Rect x="230" y="165" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="248" y="165" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="266" y="165" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="284" y="165" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="230" y="180" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="248" y="180" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="266" y="180" width="12" height="12" fill="url(#windowGradient)" />

          {/* Building 4 - Front */}
          <Rect x="310" y="160" width="70" height="40" fill="url(#buildingGradient)" />
          <Rect x="320" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="338" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="356" y="170" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="320" y="185" width="12" height="12" fill="url(#windowGradient)" />
          <Rect x="338" y="185" width="12" height="12" fill="url(#windowGradient)" />
        </G>

        {/* Trees (simplified) */}
        <G opacity="0.6">
          {/* Tree 1 */}
          <Rect x="280" y="175" width="8" height="25" fill="#8B4513" />
          <Circle cx="284" cy="175" r="12" fill="#228B22" />
          
          {/* Tree 2 */}
          <Rect x="300" y="180" width="6" height="20" fill="#8B4513" />
          <Circle cx="303" cy="180" r="10" fill="#228B22" />
        </G>

        {/* People Silhouettes */}
        <G opacity="0.5">
          {/* Person 1 */}
          <Circle cx="50" cy="195" r="4" fill="#2C3E50" />
          <Path
            d="M 50 199 L 45 205 L 55 205 Z"
            fill="#2C3E50"
          />
          
          {/* Person 2 */}
          <Circle cx="180" cy="195" r="4" fill="#2C3E50" />
          <Path
            d="M 180 199 L 175 205 L 185 205 Z"
            fill="#2C3E50"
          />
          
          {/* Person 3 */}
          <Circle cx="260" cy="195" r="4" fill="#2C3E50" />
          <Path
            d="M 260 199 L 255 205 L 265 205 Z"
            fill="#2C3E50"
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

