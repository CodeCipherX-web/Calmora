/**
 * Calmora - Theme Toggle
 * Handles light/dark mode switching
 */

(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'calmora-theme';
  const THEME_ATTRIBUTE = 'data-theme';

  /**
   * Get current theme from localStorage or system preference
   */
  function getTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  /**
   * Set theme on document
   */
  function setTheme(theme) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1e293b' : '#6366f1');
    }
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Toggle between light and dark mode
   */
  function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemeToggleButton(newTheme);
    return newTheme;
  }

  /**
   * Create theme toggle button HTML
   */
  function createThemeToggleButton() {
    const currentTheme = getTheme();
    return `
      <button 
        id="themeToggle" 
        class="theme-toggle-btn" 
        aria-label="Toggle theme"
        title="Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode"
      >
        <svg class="theme-icon theme-icon-light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="theme-icon theme-icon-dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    `;
  }

  /**
   * Update theme toggle button appearance
   */
  function updateThemeToggleButton(theme) {
    const button = document.getElementById('themeToggle');
    if (!button) return;
    
    const lightIcon = button.querySelector('.theme-icon-light');
    const darkIcon = button.querySelector('.theme-icon-dark');
    
    if (theme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'block';
      button.setAttribute('title', 'Switch to light mode');
      button.setAttribute('aria-label', 'Switch to light mode');
    } else {
      lightIcon.style.display = 'block';
      darkIcon.style.display = 'none';
      button.setAttribute('title', 'Switch to dark mode');
      button.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  /**
   * Add theme toggle button to navbar
   */
  function addThemeToggleToNavbar() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) {
      // Retry if nav menu not ready
      setTimeout(addThemeToggleToNavbar, 100);
      return;
    }

    // Check if toggle already exists
    if (document.getElementById('themeToggle')) {
      return;
    }

    // Create theme toggle container
    const themeToggleLi = document.createElement('li');
    themeToggleLi.className = 'theme-toggle-container';
    themeToggleLi.innerHTML = createThemeToggleButton();
    
    // Insert before login button or at the end
    const loginBtn = navMenu.querySelector('a[href="login.html"]');
    if (loginBtn && loginBtn.closest('li')) {
      navMenu.insertBefore(themeToggleLi, loginBtn.closest('li'));
    } else {
      navMenu.appendChild(themeToggleLi);
    }

    // Add click handler
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const newTheme = toggleTheme();
        
        // Add animation class
        themeToggle.classList.add('theme-toggle-animate');
        setTimeout(() => {
          themeToggle.classList.remove('theme-toggle-animate');
        }, 300);
      });
    }
  }

  /**
   * Initialize theme system
   */
  function initTheme() {
    const theme = getTheme();
    setTheme(theme);
    
    // Add toggle button to navbar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(addThemeToggleToNavbar, 200);
      });
    } else {
      setTimeout(addThemeToggleToNavbar, 200);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
          updateThemeToggleButton(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Export theme API
   */
  window.Theme = {
    toggle: toggleTheme,
    set: setTheme,
    get: getTheme,
    init: initTheme
  };

  // Initialize on load
  initTheme();

})();

