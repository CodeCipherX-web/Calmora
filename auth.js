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
    if (response.data && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
        await window.API.auth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      window.Helpers.removeAuthToken();
      localStorage.removeItem('user');
      
      // Redirect to login
      window.Helpers.redirect('login.html');
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

