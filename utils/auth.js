import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@urbanpulse_token';

/**
 * Get the stored JWT token
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Store the JWT token
 */
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

/**
 * Remove the JWT token
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Check if token exists and is valid (basic check)
 * For full validation, we'd need to decode and check expiry
 */
export const isTokenValid = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return false;
    }
    
    // Basic check - token exists
    // In production, you might want to decode JWT and check expiry
    // For now, we'll just check if token exists
    return token.length > 0;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};





