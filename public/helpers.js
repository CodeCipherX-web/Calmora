/**
 * Calmora - Helper Functions
 * Utility functions for common operations
 */

(function() {
  'use strict';

  /**
   * Show loading state on button
   * @param {HTMLElement} button - Button element
   */
  function showButtonLoading(button) {
    button.disabled = true;
    button.classList.add('btn-loading');
  }

  /**
   * Hide loading state on button
   * @param {HTMLElement} button - Button element
   */
  function hideButtonLoading(button) {
    button.disabled = false;
    button.classList.remove('btn-loading');
  }

  /**
   * Show error message
   * @param {HTMLElement} element - Element to show error in
   * @param {string} message - Error message
   */
  function showError(element, message) {
    if (!element) return;
    
    element.textContent = message;
    element.classList.add('show');
    element.classList.remove('success-message');
    element.classList.add('error-message');
  }

  /**
   * Show success message
   * @param {HTMLElement} element - Element to show success in
   * @param {string} message - Success message
   */
  function showSuccess(element, message) {
    if (!element) return;
    
    element.textContent = message;
    element.classList.add('show');
    element.classList.remove('error-message');
    element.classList.add('success-message');
  }

  /**
   * Hide message
   * @param {HTMLElement} element - Element to hide message in
   */
  function hideMessage(element) {
    if (!element) return;
    element.classList.remove('show');
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {boolean} - True if valid
   */
  function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_.\-]+$/;
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 50;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Format date
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} - Formatted date
   */
  function formatDate(date, format = 'YYYY-MM-DD') {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Get URL parameter
   * @param {string} name - Parameter name
   * @returns {string|null} - Parameter value
   */
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Set form field validation state
   * @param {HTMLElement} input - Input element
   * @param {boolean} isValid - Whether input is valid
   * @param {string} message - Error message if invalid
   */
  function setFieldValidation(input, isValid, message = '') {
    const errorElement = input.parentElement.querySelector('.error-message');
    
    if (isValid) {
      input.classList.remove('error');
      input.classList.add('success');
      if (errorElement) {
        hideMessage(errorElement);
      }
    } else {
      input.classList.remove('success');
      input.classList.add('error');
      if (errorElement) {
        showError(errorElement, message);
      }
    }
  }

  /**
   * Redirect to URL
   * @param {string} url - URL to redirect to
   * @param {number} delay - Delay in milliseconds
   */
  function redirect(url, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        window.location.href = url;
      }, delay);
    } else {
      window.location.href = url;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  function isAuthenticated() {
    return localStorage.getItem('user') !== null;
  }

  /**
   * Get authentication token (kept for compatibility, but not used with session auth)
   * @returns {string|null} - Always null for session-based auth
   */
  function getAuthToken() {
    return null; // Session-based auth, no token needed
  }

  /**
   * Set authentication token (kept for compatibility, but not used with session auth)
   * @param {string} token - Not used
   */
  function setAuthToken(token) {
    // Session-based auth, no token storage needed
  }

  /**
   * Remove authentication token
   */
  function removeAuthToken() {
    // Session-based auth, just clear user data
    localStorage.removeItem('user');
  }

  /**
   * Export helper functions
   */
  window.Helpers = {
    showButtonLoading,
    hideButtonLoading,
    showError,
    showSuccess,
    hideMessage,
    isValidEmail,
    isValidUsername,
    debounce,
    formatDate,
    getUrlParameter,
    setFieldValidation,
    redirect,
    isAuthenticated,
    getAuthToken,
    setAuthToken,
    removeAuthToken,
  };
})();

