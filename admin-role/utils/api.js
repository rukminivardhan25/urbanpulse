import AsyncStorage from '@react-native-async-storage/async-storage';

// Admin Backend API URL
// For physical device testing, use your computer's local IP
// Make sure your phone and computer are on the same WiFi network
// Admin Backend API URL
// For physical device testing, use your computer's local IP
// Make sure your phone and computer are on the same WiFi network
// IMPORTANT: This is port 3001 (admin backend), different from user backend (3000)
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.8:3001' // Admin backend port (3001, different from user backend 3000)
  : 'https://your-admin-api.com';

const TOKEN_KEY = '@urbanpulse_admin_token';

/**
 * Get stored admin auth token
 */
const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
};

/**
 * Store admin auth token
 */
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting admin token:', error);
    return false;
  }
};

/**
 * Remove admin auth token
 */
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing admin token:', error);
    return false;
  }
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.response = errorData;
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error.response || error.status) {
      throw error;
    }
    // Handle network errors or other fetch failures
    const networkError = new Error(error.message || 'Network request failed');
    networkError.originalError = error;
    throw networkError;
  }
};

/**
 * Check if admin exists by phone number
 */
export const checkAdminExists = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/check-exists?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check admin existence');
  }

  const result = await response.json();
  return result.exists;
};

/**
 * Send OTP to admin phone number
 */
export const sendOTP = async (phone, name = null) => {
  const body = { phone };
  if (name) {
    body.name = name;
  }
  
  return apiRequest('/admin/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Verify OTP and get token
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @param {string} name - Name (for new admin signup)
 * @param {object} location - Location data (city, area, state, pincode) for new admin
 */
export const verifyOTP = async (phone, otp, name = null, location = null) => {
  const body = { phone, otp };
  
  if (name) {
    body.name = name;
  }
  
  if (location) {
    body.city = location.city;
    body.area = location.area;
    body.mandal = location.mandal || '';
    body.district = location.district || '';
    body.state = location.state;
    body.pincode = location.pincode;
  }

  const result = await apiRequest('/admin/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Store token if received
  if (result.token) {
    await setAuthToken(result.token);
  }

  return result;
};

/**
 * Update admin location
 * @param {object} location - Location data with city, area, state, pincode
 */
export const updateAdminLocation = async (location) => {
  return apiRequest('/admin/update-location', {
    method: 'PUT',
    body: JSON.stringify(location),
  });
};

/**
 * Get current admin profile
 */
export const getCurrentAdmin = async () => {
  return apiRequest('/admin/me');
};

/**
 * Create a service
 * @param {object} serviceData - Service data with serviceType, startTime, endTime, scheduleType, customDate, notes
 */
export const createService = async (serviceData) => {
  return apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
};

/**
 * Get admin's services
 */
export const getAdminServices = async () => {
  return apiRequest('/services/admin');
};

/**
 * Delete a service
 * @param {string} serviceId - Service ID
 */
export const deleteService = async (serviceId) => {
  return apiRequest(`/services/${serviceId}`, {
    method: 'DELETE',
  });
};

/**
 * Create a new alert
 * @param {object} alertData - Alert data (category, alertType, priority, title, message)
 */
export const createAlert = async (alertData) => {
  return apiRequest('/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData),
  });
};

/**
 * Get all alerts for admin
 */
export const getAdminAlerts = async () => {
  return apiRequest('/alerts/admin');
};

/**
 * Delete an alert
 * @param {string} alertId - Alert ID
 */
export const deleteAlert = async (alertId) => {
  return apiRequest(`/alerts/${alertId}`, {
    method: 'DELETE',
  });
};

/**
 * Get all issues assigned to the logged-in admin
 * @param {string} status - Optional status filter
 */
export const getAdminIssues = async (status = null) => {
  const endpoint = status ? `/issues?status=${encodeURIComponent(status)}` : '/issues';
  return apiRequest(endpoint);
};

/**
 * Get a single issue by ID
 * @param {string} issueId - Issue ID
 */
export const getIssueById = async (issueId) => {
  return apiRequest(`/issues/${issueId}`);
};

/**
 * Update issue status
 * @param {string} issueId - Issue ID
 * @param {string} status - New status (Assigned, In Progress, Resolved)
 */
export const updateIssueStatus = async (issueId, status) => {
  return apiRequest(`/issues/${issueId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Add internal note to issue
 * @param {string} issueId - Issue ID
 * @param {string} note - Note text
 */
export const addIssueNote = async (issueId, note) => {
  return apiRequest(`/issues/${issueId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
};

// Message/Chat API functions
/**
 * Send a message for a complaint (Admin side)
 * @param {string} complaintId - Complaint ID
 * @param {string} message - Message text
 */
export const sendMessage = async (complaintId, message) => {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({
      complaintId,
      message,
    }),
  });
};

/**
 * Get all messages for a complaint (Admin side)
 * @param {string} complaintId - Complaint ID
 */
export const getMessages = async (complaintId) => {
  return apiRequest(`/messages/${complaintId}`);
};

/**
 * Get unread message counts for all admin's complaints
 */
export const getUnreadMessageCounts = async () => {
  return apiRequest('/messages/unread/count');
};

