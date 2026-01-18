import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your backend URL
// For physical device testing, use your computer's local IP
// Make sure your phone and computer are on the same WiFi network
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.8:3000' // Your computer's IP address
  : 'https://your-production-api.com';

const TOKEN_KEY = '@urbanpulse_token';

/**
 * Get stored auth token
 */
const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Store auth token
 */
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

/**
 * Remove auth token
 */
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Make API request with authentication
 */
const apiRequest = async (endpoint, options = {}) => {
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
    throw error;
  }

  return response.json();
};

/**
 * Check if user exists by phone number
 */
export const checkUserExists = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/users/exists?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check user existence');
  }

  const result = await response.json();
  return result.exists;
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phone, name = null) => {
  const body = { phone };
  if (name) {
    body.name = name;
  }
  
  return apiRequest('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Verify OTP and get token
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @param {string} name - Name (for new user signup)
 * @param {object} location - Location data (city, area, pincode, state) for new user
 */
export const verifyOTP = async (phone, otp, name = null, location = null) => {
  const body = { phone, otp };
  
  if (name) {
    body.name = name;
  }
  
  if (location) {
    body.city = location.city;
    body.area = location.area;
    body.pincode = location.pincode;
    body.state = location.state;
  }

  const result = await apiRequest('/auth/verify-otp', {
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
 * Update user location
 * @param {object} location - Location data with state, district, city, area, pincode, address, latitude, longitude
 */
export const updateUserLocation = async (location) => {
  return apiRequest('/users/update-location', {
    method: 'PUT',
    body: JSON.stringify(location),
  });
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return apiRequest('/users/me');
};

/**
 * Get services for user's city and area
 * @param {string} city - User's city
 * @param {string} area - User's area
 */
export const getServices = async (city, area) => {
  return fetch(`${API_BASE_URL}/services?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get services');
    }
    return response.json();
  });
};

/**
 * Get alerts for users
 * @param {string} city - User's city
 * @param {string} area - User's area
 */
export const getAlerts = async (city, area) => {
  return fetch(`${API_BASE_URL}/alerts?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get alerts');
    }
    return response.json();
  });
};

/**
 * Submit a new issue/complaint
 * @param {object} issueData - Issue data with issueType, description, priority, location
 */
export const submitIssue = async (issueData) => {
  return apiRequest('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData),
  });
};

/**
 * Get all issues for the logged-in user
 */
export const getUserIssues = async () => {
  return apiRequest('/issues');
};

/**
 * Get a single issue by ID
 * @param {string} issueId - Issue ID
 */
export const getIssueById = async (issueId) => {
  return apiRequest(`/issues/${issueId}`);
};

/**
 * Delete an issue by ID
 * @param {string} issueId - Issue ID
 */
export const deleteIssue = async (issueId) => {
  return apiRequest(`/issues/${issueId}`, {
    method: 'DELETE',
  });
};

// Request API functions
/**
 * Create a new help request
 * @param {object} requestData - Request data with requestType, subcategory, description, etc.
 */
export const createRequest = async (requestData) => {
  return apiRequest('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
};

/**
 * Get all requests created by the logged-in user
 */
export const getUserRequests = async () => {
  return apiRequest('/requests/my-requests');
};

/**
 * Get all approved requests (visible in Help Requests)
 */
export const getApprovedRequests = async () => {
  return apiRequest('/requests/approved');
};

/**
 * Get a single request by ID
 * @param {string} requestId - Request ID
 */
export const getRequestById = async (requestId) => {
  return apiRequest(`/requests/${requestId}`);
};

/**
 * Delete a request by ID
 * @param {string} requestId - Request ID
 */
export const deleteRequest = async (requestId) => {
  return apiRequest(`/requests/${requestId}`, {
    method: 'DELETE',
  });
};

// Helper API functions
/**
 * Create a help offer for a request
 * @param {string} requestId - Request ID
 * @param {string} name - Helper name
 * @param {string} phone - Helper phone
 * @param {string} message - Optional message
 */
export const createHelper = async (requestId, name, phone, message = '') => {
  return apiRequest('/helpers', {
    method: 'POST',
    body: JSON.stringify({
      requestId,
      name,
      phone,
      message,
    }),
  });
};

/**
 * Get all helpers for a request (only request creator can view)
 * @param {string} requestId - Request ID
 */
export const getHelpersByRequest = async (requestId) => {
  return apiRequest(`/helpers/request/${requestId}`);
};

/**
 * Get helper count for a request (only request creator can view)
 * @param {string} requestId - Request ID
 */
export const getHelperCount = async (requestId) => {
  return apiRequest(`/helpers/count/${requestId}`);
};

// Message/Chat API functions
/**
 * Send a message for a complaint
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
 * Get all messages for a complaint
 */
export const getMessages = async (complaintId) => {
  return apiRequest(`/messages/${complaintId}`);
};

/**
 * Get unread message counts for all user's complaints
 */
export const getUnreadMessageCounts = async () => {
  return apiRequest('/messages/unread/count');
};

/**
 * Send a helper-requester message
 * @param {string} requestId - Request MongoDB ID
 * @param {string} helperId - Helper MongoDB ID
 * @param {string} message - Message text
 */
export const sendHelperMessage = async (requestId, helperId, message) => {
  return apiRequest('/messages/helper', {
    method: 'POST',
    body: JSON.stringify({
      requestId,
      helperId,
      message,
    }),
  });
};

/**
 * Get all messages for a helper-requester chat
 * @param {string} requestId - Request MongoDB ID
 * @param {string} helperId - Helper MongoDB ID
 */
export const getHelperMessages = async (requestId, helperId) => {
  return apiRequest(`/messages/helper/${requestId}/${helperId}`);
};

/**
 * Get helper record for current user and request (for helper to chat)
 * @param {string} requestId - Request ID (MongoDB _id or requestId string)
 */
export const getUserHelper = async (requestId) => {
  return apiRequest(`/helpers/user/${requestId}`);
};

// Notification API functions
/**
 * Get all notifications for the logged-in user
 * @param {object} params - Query parameters (category, isRead, limit, offset)
 */
export const getNotifications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const queryString = queryParams.toString();
  return apiRequest(`/notifications${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async () => {
  return apiRequest('/notifications/unread-count');
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 */
export const markNotificationAsRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  return apiRequest('/notifications/mark-all-read', {
    method: 'PATCH',
  });
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 */
export const deleteNotification = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
};
