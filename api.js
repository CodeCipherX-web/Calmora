/**
 * Calmora - API Client
 * Handles all API calls to the backend
 */

(function() {
  'use strict';

  // Detect API base URL based on environment
  function getApiBaseUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // If accessing via file:// protocol, default to localhost:3000
    if (protocol === 'file:') {
      return 'http://localhost:3000';
    }

    // If using Live Server (usually port 5500), use localhost:3000 for API
    if (port === '5500' || port === '5501' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    // For production or other environments, use same origin
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }

  const API_BASE_URL = getApiBaseUrl();

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise} - Response promise
   */
  async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      credentials: 'include', // Include cookies for session-based auth
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // Merge options
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if response is successful
      if (!response.ok) {
        // Create error object with full details
        const error = new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Backend may return data directly or wrapped
      // If backend already has success field, return as-is, otherwise wrap
      if (data.success !== undefined || data.reply !== undefined) {
        return data; // Backend response (e.g., { success: true, reply: "..." })
      }
      return { success: true, data };
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to server. Please check your connection.');
        networkError.type = 'network';
        throw networkError;
      }
      
      // If error already has status/data, it's an HTTP error from backend
      if (error.status || error.data) {
        throw error;
      }
      
      // Re-throw other errors with context
      const contextError = new Error(error.message || 'An unexpected error occurred');
      contextError.originalError = error;
      throw contextError;
    }
  }

  /**
   * Authentication API
   */
  const auth = {
    /**
     * Sign up a new user
     * @param {object} userData - User registration data
     * @returns {Promise} - Response promise
     */
    async signup(userData) {
      return apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    /**
     * Login user
     * @param {object} credentials - Login credentials
     * @returns {Promise} - Response promise
     */
    async login(credentials) {
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    /**
     * Logout user
     * @returns {Promise} - Response promise
     */
    async logout() {
      return apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },

    /**
     * Get authentication status
     * @returns {Promise} - Response promise
     */
    async getStatus() {
      return apiRequest('/api/auth/status');
    },
  };

  /**
   * Moods API
   */
  const moods = {
    /**
     * Save a mood entry
     * @param {object} moodData - Mood data (mood_level, notes)
     * @returns {Promise} - Response promise
     */
    async save(moodData) {
      return apiRequest('/api/moods', {
        method: 'POST',
        body: JSON.stringify(moodData),
      });
    },

    /**
     * Get user's mood entries
     * @returns {Promise} - Response promise
     */
    async getAll() {
      return apiRequest('/api/moods');
    },
  };

  /**
   * Messages/Chat API
   */
  const messages = {
    /**
     * Save a chat message
     * @param {object} messageData - Message data (message, response)
     * @returns {Promise} - Response promise
     */
    async save(messageData) {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },

    /**
     * Get user's chat history
     * @returns {Promise} - Response promise
     */
    async getAll() {
      return apiRequest('/api/messages');
    },
  };

  /**
   * AI Chat API
   */
  const chat = {
    /**
     * Send message to AI and get response
     * @param {string} message - User message
     * @returns {Promise} - Response promise with AI reply
     */
    async send(message) {
      return apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
  };

  /**
   * Resources API
   */
  const resources = {
    /**
     * Get all resources
     * @returns {Promise} - Response promise
     */
    async getAll() {
      return apiRequest('/api/resources');
    },

    /**
     * Get resources by category
     * @param {string} category - Resource category
     * @returns {Promise} - Response promise
     */
    async getByCategory(category) {
      return apiRequest(`/api/resources?category=${encodeURIComponent(category)}`);
    },
  };

  /**
   * Contact API
   */
  const contact = {
    /**
     * Send contact form message
     * @param {object} contactData - Contact form data (name, email, subject, message)
     * @returns {Promise} - Response promise
     */
    async send(contactData) {
      return apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });
    },
  };

  /**
   * Export API functions
   */
  window.API = {
    auth,
    moods,
    messages,
    resources,
    contact,
    chat,
    request: apiRequest,
    baseUrl: API_BASE_URL,
  };
})();

