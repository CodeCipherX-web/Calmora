/**
 * Calmora - Main Application Logic
 * Handles navigation, UI interactions, and general app functionality
 */

(function() {
  'use strict';

  // Initialize app when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initForms();
    checkAuthentication();
  });

  /**
   * Initialize navigation menu
   */
  function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking on a link
      const navLinks = navMenu.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', function() {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }
  }

  /**
   * Initialize forms
   */
  function initForms() {
    // Add real-time validation to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
          validateField(input);
        });

        // Clear error state on input
        input.addEventListener('input', function() {
          if (input.classList.contains('error')) {
            input.classList.remove('error');
            const errorElement = input.parentElement.querySelector('.error-message');
            if (errorElement) {
              window.Helpers.hideMessage(errorElement);
            }
          }
        });
      });
    });
  }

  /**
   * Validate form field
   * @param {HTMLElement} input - Input element to validate
   * @returns {boolean} - True if valid
   */
  function validateField(input) {
    const type = input.type;
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Required field check
    if (input.hasAttribute('required') && !value) {
      isValid = false;
      message = 'This field is required';
    }

    // Email validation
    if (type === 'email' && value && !window.Helpers.isValidEmail(value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    }

    // Username validation
    if (input.name === 'username' && value && !window.Helpers.isValidUsername(value)) {
      isValid = false;
      message = 'Username must be 3-50 characters and contain only letters, numbers, underscores, hyphens, and dots';
    }

    // Password validation
    if (type === 'password' && value && value.length < 6) {
      isValid = false;
      message = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (input.name === 'confirmPassword' || input.id === 'confirmPassword') {
      const passwordInput = input.form.querySelector('input[type="password"]:not([name="confirmPassword"]):not([id="confirmPassword"])');
      if (passwordInput && value !== passwordInput.value) {
        isValid = false;
        message = 'Passwords do not match';
      }
    }

    // Set validation state
    if (value || input.hasAttribute('required')) {
      window.Helpers.setFieldValidation(input, isValid, message);
    }

    return isValid;
  }

  /**
   * Check if user is authenticated and update UI
   */
  function checkAuthentication() {
    if (window.Helpers && window.Helpers.isAuthenticated()) {
      // Update navigation to show user-specific items
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu) {
        // You can add logic here to show/hide menu items based on auth status
      }
    }
  }

  /**
   * Handle form submission
   * @param {HTMLElement} form - Form element
   * @param {Function} submitHandler - Function to handle submission
   */
  function handleFormSubmit(form, submitHandler) {
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validate all fields
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      let isFormValid = true;

      inputs.forEach(input => {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        return;
      }

      // Call submit handler
      if (submitHandler) {
        await submitHandler(form);
      }
    });
  }

  /**
   * Export functions
   */
  window.Main = {
    handleFormSubmit,
    validateField,
  };
})();

