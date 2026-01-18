import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@urbanpulse_admin_token';

/**
 * Get the stored admin JWT token
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
};

/**
 * Store the admin JWT token
 */
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting admin token:', error);
    return false;
  }
};

/**
 * Remove the admin JWT token
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing admin token:', error);
    return false;
  }
};

/**
 * Check if admin token exists and is valid (basic check)
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
    console.error('Error checking admin token validity:', error);
    return false;
  }
};




