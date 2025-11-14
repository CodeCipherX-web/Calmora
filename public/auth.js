/**
 * Calmora - Authentication Helpers
 * Client-side authentication utilities
 */

(function() {
  'use strict';

  /**
   * Handle successful authentication
   * @param {object} response - API response
   */
  function handleAuthSuccess(response) {
    // Store user data (session-based auth, no token needed)
    // Handle different response formats
    let user = null;
    
    // Check various response formats
    if (response && response.user) {
      // Direct user object: { user: {...} }
      user = response.user;
    } else if (response && response.data && response.data.user) {
      // Nested in data: { data: { user: {...} } }
      user = response.data.user;
    } else if (response && response.data && !response.data.user) {
      // Data is the user object: { data: {...} }
      user = response.data;
    } else if (response && !response.user && !response.data) {
      // Response itself is the user object
      user = response;
    }
    
    // Validate user object has required fields
    if (user && (user.id || user.email || user.name)) {
      localStorage.setItem('user', JSON.stringify(user));
      // Update user info display
      if (window.UserInfo && window.UserInfo.update) {
        setTimeout(() => window.UserInfo.update(), 100);
      }
      return true;
    } else {
      console.warn('handleAuthSuccess: Invalid user data received', response);
      return false;
    }
  }

  /**
   * Handle authentication error
   * @param {Error} error - Error object
   * @param {HTMLElement} errorElement - Element to display error
   */
  function handleAuthError(error, errorElement) {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.message) {
      errorMessage = error.message;
    }

    if (errorElement) {
      errorElement.classList.add('error');
      errorElement.classList.remove('success');
      window.Helpers.showError(errorElement, errorMessage);
    }

    console.error('Authentication error:', error);
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      // Call logout API if available
      if (window.API && window.API.auth) {
        try {
          await window.API.auth.logout();
        } catch (apiError) {
          // If API call fails, still proceed with logout
          console.warn('Logout API call failed, proceeding with local logout:', apiError);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      window.Helpers.removeAuthToken();
      localStorage.removeItem('user');
      
      // Clear any session data
      sessionStorage.clear();
      
      // Update user info display
      if (window.UserInfo && window.UserInfo.update) {
        window.UserInfo.update();
      }
      
      // Show logout success message (optional)
      if (window.Helpers && window.Helpers.showSuccess) {
        // Could show a toast notification here if implemented
      }
      
      // Redirect to login with a small delay to allow UI updates
      setTimeout(() => {
        window.Helpers.redirect('login.html');
      }, 100);
    }
  }

  /**
   * Get current user from localStorage
   * @returns {object|null} - User object or null
   */
  function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user needs to be authenticated for current page
   * @param {string[]} publicPages - Array of public page paths
   */
  function requireAuth(publicPages = ['login.html', 'signup.html', 'index.html']) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (publicPages.includes(currentPage)) {
      return; // Public page, no auth required
    }

    if (!window.Helpers.isAuthenticated()) {
      window.Helpers.redirect('login.html');
    }
  }

  /**
   * Redirect authenticated users away from auth pages
   * @param {string[]} authPages - Array of authentication page paths
   */
  function redirectIfAuthenticated(authPages = ['login.html', 'signup.html']) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (authPages.includes(currentPage) && window.Helpers.isAuthenticated()) {
      window.Helpers.redirect('index.html');
    }
  }

  /**
   * Export auth functions
   */
  window.Auth = {
    handleAuthSuccess,
    handleAuthError,
    logout,
    getCurrentUser,
    requireAuth,
    redirectIfAuthenticated,
  };
})();

