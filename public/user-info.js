/**
 * Calmora - User Info Display
 * Shows logged-in user information and stats in the navbar
 */

(function() {
  'use strict';

  let userInfoElement = null;
  let userStats = {
    moods: 0,
    messages: 0,
    joinDate: null
  };

  /**
   * Check authentication status from server
   */
  async function checkAuthStatus() {
    try {
      if (!window.API || !window.API.auth) {
        return null;
      }

      const result = await window.API.auth.getStatus();
      if (result && result.authenticated && result.user) {
        // Update localStorage with server data
        localStorage.setItem('user', JSON.stringify(result.user));
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Fall back to localStorage
      return window.Auth ? window.Auth.getCurrentUser() : null;
    }
  }

  /**
   * Get user stats from API
   */
  async function getUserStats(userId) {
    const stats = {
      moods: 0,
      messages: 0,
      joinDate: null
    };

    try {
      if (!window.API) return stats;

      // Get moods count
      try {
        const moodsResult = await window.API.moods.getAll();
        if (moodsResult && moodsResult.success && moodsResult.moods) {
          stats.moods = moodsResult.moods.length || 0;
        } else if (moodsResult && Array.isArray(moodsResult.moods)) {
          stats.moods = moodsResult.moods.length || 0;
        }
      } catch (e) {
        console.error('Error fetching moods:', e);
        // User might not be logged in, that's ok
      }

      // Get messages count
      try {
        const messagesResult = await window.API.messages.getAll();
        if (messagesResult && messagesResult.success && messagesResult.messages) {
          stats.messages = messagesResult.messages.length || 0;
        } else if (messagesResult && Array.isArray(messagesResult.messages)) {
          stats.messages = messagesResult.messages.length || 0;
        }
      } catch (e) {
        console.error('Error fetching messages:', e);
        // User might not be logged in, that's ok
      }

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return stats;
    }
  }

  /**
   * Get user's initials for avatar
   */
  function getUserInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Format date for display
   */
  function formatJoinDate(dateString) {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  }

  /**
   * Create user info dropdown HTML
   */
  function createUserDropdownHTML(user, stats) {
    const initials = getUserInitials(user.name);
    const joinDate = formatJoinDate(stats.joinDate || user.created_at);

    return `
      <div class="user-info-dropdown" id="userInfoDropdown">
        <div class="user-info-header">
          <div class="user-avatar">${initials}</div>
          <div class="user-details">
            <div class="user-name">${user.name}</div>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="user-stat">
            <span class="stat-label">Mood Entries</span>
            <span class="stat-value">${stats.moods}</span>
          </div>
          <div class="user-stat">
            <span class="stat-label">Chat Messages</span>
            <span class="stat-value">${stats.messages}</span>
          </div>
          <div class="user-stat">
            <span class="stat-label">Member Since</span>
            <span class="stat-value">${joinDate}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="user-action-btn" id="logoutBtn" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Create user info button HTML
   */
  function createUserInfoButtonHTML(user) {
    const initials = getUserInitials(user.name);
    return `
        <button class="user-info-btn" id="userInfoBtn" aria-label="User menu" aria-expanded="false">
          <div class="user-avatar-small">${initials}</div>
          <span class="user-name-small">${user.name}</span>
          <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="user-info-dropdown-wrapper" id="userInfoDropdownWrapper"></div>
    `;
  }

  /**
   * Update navbar with user info
   */
  async function updateNavbar() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) {
      // Retry after a short delay if nav menu not ready
      setTimeout(updateNavbar, 100);
      return;
    }

    // Check if user is authenticated
    const user = await checkAuthStatus();
    
    // Find login/signup buttons and their parent li elements
    const loginBtn = navMenu.querySelector('a[href="login.html"]');
    const loginLi = loginBtn ? loginBtn.closest('li') : null;
    const signupBtn = navMenu.querySelector('a[href="signup.html"]');
    const signupLi = signupBtn ? signupBtn.closest('li') : null;

    // Remove existing user info if present
    const existingUserInfo = navMenu.querySelector('.user-info-container');
    if (existingUserInfo) {
      existingUserInfo.remove();
    }

    if (user) {
      // User is logged in - remove login/signup buttons, add user info and logout menu item
      if (loginLi) {
        loginLi.remove();
      }
      if (signupLi) {
        signupLi.remove();
      }

      // Remove existing logout menu item if present
      const existingLogoutMenu = navMenu.querySelector('a[data-logout-menu]');
      if (existingLogoutMenu && existingLogoutMenu.closest('li')) {
        existingLogoutMenu.closest('li').remove();
      }

      // Add logout link to menu
      const logoutMenuLi = document.createElement('li');
      logoutMenuLi.innerHTML = `
        <a href="#" data-logout-menu class="logout-menu-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </a>
      `;
      
      // Insert logout before user info (or at the end if no user info yet)
      const userInfoContainer = navMenu.querySelector('.user-info-container');
      if (userInfoContainer) {
        navMenu.insertBefore(logoutMenuLi, userInfoContainer);
      } else {
        navMenu.appendChild(logoutMenuLi);
      }

      // Setup logout menu link click handler
      const logoutMenuLink = logoutMenuLi.querySelector('a[data-logout-menu]');
      if (logoutMenuLink) {
        logoutMenuLink.addEventListener('click', async function(e) {
          e.preventDefault();
          
          // Show loading state
          logoutMenuLink.style.opacity = '0.6';
          logoutMenuLink.style.pointerEvents = 'none';
          const originalHTML = logoutMenuLink.innerHTML;
          logoutMenuLink.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logging out...
          `;
          
          try {
            await window.Auth.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Still proceed with logout even if API call fails
            window.Helpers.removeAuthToken();
            localStorage.removeItem('user');
            if (window.UserInfo && window.UserInfo.update) {
              window.UserInfo.update();
            }
            window.Helpers.redirect('login.html');
          }
        });
      }

      // Get user stats
      const stats = await getUserStats(user.id);
      stats.joinDate = user.created_at || new Date().toISOString();

      // Create user info button
      const userInfoContainer = document.createElement('li');
      userInfoContainer.className = 'user-info-container';
      userInfoContainer.style.marginLeft = 'auto';
      userInfoContainer.style.order = '999';
      userInfoContainer.innerHTML = createUserInfoButtonHTML(user);
      navMenu.appendChild(userInfoContainer);

      // Add dropdown content
      const dropdownWrapper = userInfoContainer.querySelector('.user-info-dropdown-wrapper');
      dropdownWrapper.innerHTML = createUserDropdownHTML(user, stats);

      // Setup dropdown toggle
      const userInfoBtn = userInfoContainer.querySelector('#userInfoBtn');
      const dropdown = userInfoContainer.querySelector('#userInfoDropdown');
      
      // Setup logout button in dropdown
      const logoutBtn = userInfoContainer.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Show loading state
          logoutBtn.disabled = true;
          logoutBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logging out...
          `;
          
          try {
            await window.Auth.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Still proceed with logout even if API call fails
            window.Helpers.removeAuthToken();
            localStorage.removeItem('user');
            if (window.UserInfo && window.UserInfo.update) {
              window.UserInfo.update();
            }
            window.Helpers.redirect('login.html');
          }
        });
      }
      
      // Add standalone logout button for easy access in navbar
      const logoutLi = document.createElement('li');
      logoutLi.className = 'logout-btn-container';
      logoutLi.innerHTML = `
        <button class="btn btn-secondary logout-btn-nav" id="navLogoutBtn" type="button" title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="logout-text">Logout</span>
        </button>
      `;
      navMenu.appendChild(logoutLi);
      
      // Setup navbar logout button
      const navLogoutBtn = logoutLi.querySelector('#navLogoutBtn');
      if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', async function(e) {
          e.preventDefault();
          
          // Show loading state
          navLogoutBtn.disabled = true;
          const originalHTML = navLogoutBtn.innerHTML;
          navLogoutBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="logout-text">Logging out...</span>
          `;
          
          try {
            await window.Auth.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Still proceed with logout even if API call fails
            window.Helpers.removeAuthToken();
            localStorage.removeItem('user');
            if (window.UserInfo && window.UserInfo.update) {
              window.UserInfo.update();
            }
            window.Helpers.redirect('login.html');
          }
        });
      }

      if (userInfoBtn && dropdown && dropdownWrapper) {
        userInfoBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          const isOpen = dropdown.classList.contains('active');
          
          // Close all other dropdowns
          document.querySelectorAll('.user-info-dropdown').forEach(d => {
            d.classList.remove('active');
          });
          document.querySelectorAll('.user-info-dropdown-wrapper').forEach(w => {
            w.classList.remove('active');
          });
          document.querySelectorAll('#userInfoBtn').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
          });

          // Toggle current dropdown
          if (!isOpen) {
            dropdown.classList.add('active');
            dropdownWrapper.classList.add('active');
            userInfoBtn.setAttribute('aria-expanded', 'true');
          } else {
            dropdown.classList.remove('active');
            dropdownWrapper.classList.remove('active');
            userInfoBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Close dropdown when clicking outside
        const closeDropdownHandler = function(e) {
          if (!userInfoContainer.contains(e.target)) {
            dropdown.classList.remove('active');
            dropdownWrapper.classList.remove('active');
            userInfoBtn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', closeDropdownHandler);
          }
        };

        // Close dropdown when clicking on backdrop (mobile)
        dropdownWrapper.addEventListener('click', function(e) {
          if (e.target === dropdownWrapper || e.target.classList.contains('user-info-dropdown-wrapper')) {
            dropdown.classList.remove('active');
            dropdownWrapper.classList.remove('active');
            userInfoBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Add click listener when dropdown opens
        userInfoBtn.addEventListener('click', function() {
          if (dropdown.classList.contains('active')) {
            setTimeout(() => {
              document.addEventListener('click', closeDropdownHandler);
            }, 100);
          }
        });
      }
    } else {
      // User is not logged in - remove logout button and logout menu item, show login button if not present
      const logoutBtnContainer = navMenu.querySelector('.logout-btn-container');
      if (logoutBtnContainer) {
        logoutBtnContainer.remove();
      }
      
      // Remove logout menu item
      const logoutMenuLink = navMenu.querySelector('a[data-logout-menu]');
      if (logoutMenuLink && logoutMenuLink.closest('li')) {
        logoutMenuLink.closest('li').remove();
      }
      
      const existingLogin = Array.from(navMenu.querySelectorAll('a')).find(a => 
        a.getAttribute('href') === 'login.html' || 
        (a.textContent && a.textContent.toLowerCase().includes('login'))
      );
      
      if (!existingLogin && !loginLi) {
        const newLoginLi = document.createElement('li');
        newLoginLi.innerHTML = '<a href="login.html" class="btn btn-secondary">Login</a>';
        navMenu.appendChild(newLoginLi);
      }
    }
  }

  /**
   * Refresh user stats
   */
  async function refreshUserStats() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (user) {
      const stats = await getUserStats(user.id);
      const statsElements = document.querySelectorAll('.user-stat .stat-value');
      if (statsElements.length >= 2) {
        statsElements[0].textContent = stats.moods;
        statsElements[1].textContent = stats.messages;
      }
    }
  }

  /**
   * Initialize user info display
   */
  async function initUserInfo() {
    // Wait for API and Auth to be available
    if (!window.API || !window.Auth) {
      setTimeout(initUserInfo, 100);
      return;
    }

    // Update navbar
    await updateNavbar();

    // Refresh stats periodically (every 30 seconds)
    setInterval(refreshUserStats, 30000);
  }

  /**
   * Add CSS styles for user info
   */
  function addUserInfoStyles() {
    const styleId = 'userInfoStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* User Info Container */
      .user-info-container {
        position: relative;
        margin-left: auto;
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* User Info Button */
      .user-info-btn {
        display: flex !important;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--bg-white);
        border: 1px solid var(--primary-color);
        border-radius: 8px;
        color: var(--text-dark);
        cursor: pointer;
        transition: var(--transition);
        font-size: 0.9rem;
        font-weight: 500;
        visibility: visible !important;
        opacity: 1 !important;
        box-shadow: var(--shadow-sm);
      }

      .user-info-btn:hover {
        background: var(--bg-gray);
        border-color: var(--primary-color);
      }

      /* User Avatar */
      .user-avatar-small {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--primary-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .user-name-small {
        font-weight: 600;
        color: var(--text-dark);
        font-size: 0.95rem;
        white-space: nowrap;
        display: inline-block;
        margin-right: 0.25rem;
      }

      .dropdown-arrow {
        transition: transform 0.2s ease;
        color: var(--text-light);
      }

      .user-info-btn[aria-expanded="true"] .dropdown-arrow {
        transform: rotate(180deg);
      }

      /* User Info Dropdown */
      .user-info-dropdown-wrapper {
        position: relative;
      }

      /* Backdrop overlay for mobile */
      .user-info-dropdown-wrapper::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        pointer-events: none;
      }

      .user-info-dropdown-wrapper.active::before {
        opacity: 1;
        visibility: visible;
        pointer-events: all;
      }

      .user-info-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        width: 280px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1001;
        overflow: hidden;
      }

      .user-info-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      /* User Info Header */
      .user-info-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
      }

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.125rem;
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .user-details {
        flex: 1;
        min-width: 0;
      }

      .user-name {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-email {
        font-size: 0.875rem;
        opacity: 0.9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* User Stats */
      .user-stats {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--border-color);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .user-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .stat-label {
        font-size: 0.75rem;
        color: var(--text-light);
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary-color);
      }

      /* User Actions */
      .user-actions {
        padding: 0.75rem;
      }

      .user-action-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--error-color);
        cursor: pointer;
        transition: var(--transition);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .user-action-btn:hover {
        background: var(--error-color);
        color: white;
        border-color: var(--error-color);
      }

      /* Tablet adjustments */
      @media (max-width: 1024px) and (min-width: 769px) {
        .user-info-dropdown {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.35);
        }
      }

      /* Mobile adjustments */
      @media (max-width: 768px) {
        .user-info-btn {
          padding: 0.5rem;
          gap: 0.5rem;
        }

        .user-name-small {
          display: inline-block;
          font-size: 0.85rem;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-info-dropdown {
          width: calc(100vw - 2rem);
          right: -1rem;
          left: auto;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .user-stats {
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.7rem;
        }

        .stat-value {
          font-size: 1rem;
        }
      }

      /* Navbar adjustments for user info */
      .nav-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .nav-menu > li:last-child {
        margin-left: auto;
      }

      /* Ensure user info appears on the right */
      .nav-menu .user-info-container {
        margin-left: auto !important;
        order: 999;
      }

      /* Logout button in navbar */
      .logout-btn-container {
        margin-left: 0.5rem;
      }

      .logout-btn-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        transition: var(--transition);
      }

      .logout-btn-nav:hover {
        background: var(--error-color);
        color: white;
        border-color: var(--error-color);
      }

      .logout-btn-nav:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .logout-text {
        display: inline;
      }

      /* Spinning animation for logout */
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .spinning {
        animation: spin 1s linear infinite;
        display: inline-block;
      }

      /* Mobile adjustments for logout button */
      @media (max-width: 768px) {
        .logout-text {
          display: none;
        }

        .logout-btn-nav {
          padding: 0.5rem;
          min-width: auto;
        }

        .logout-btn-nav svg {
          margin: 0;
        }
      }

      /* Logout menu link styling */
      .logout-menu-link {
        display: flex;
        align-items: center;
        color: var(--text-dark);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        transition: var(--transition);
        font-weight: 500;
      }

      .logout-menu-link:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--error-color);
      }

      .logout-menu-link svg {
        flex-shrink: 0;
      }

      .logout-menu-link:active {
        transform: scale(0.98);
      }

      /* Dark mode styles for user info */
      [data-theme="dark"] .user-info-dropdown {
        background: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(59, 130, 246, 0.3);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }

      [data-theme="dark"] .user-info-dropdown-wrapper::before {
        background: rgba(0, 0, 0, 0.5);
      }

      [data-theme="dark"] .user-stats {
        border-bottom-color: var(--border-color);
      }

      [data-theme="dark"] .user-action-btn {
        border-color: var(--border-color);
        color: var(--error-color);
      }

      [data-theme="dark"] .user-action-btn:hover {
        background: var(--error-color);
        color: white;
      }

      [data-theme="dark"] .logout-menu-link:hover {
        background: rgba(248, 113, 113, 0.15);
        color: var(--error-color);
      }

      @media (max-width: 1024px) and (min-width: 769px) {
        [data-theme="dark"] .user-info-dropdown {
          background: rgba(30, 41, 59, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.35);
        }
      }

      @media (max-width: 768px) {
        [data-theme="dark"] .user-info-dropdown {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addUserInfoStyles();
      // Wait a bit for other scripts to load
      setTimeout(initUserInfo, 200);
    });
  } else {
    addUserInfoStyles();
    setTimeout(initUserInfo, 200);
  }

  // Update user info when auth state changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'user') {
      updateNavbar();
    }
  });

  // Export API
  window.UserInfo = {
    update: updateNavbar,
    refreshStats: refreshUserStats,
    checkStatus: checkAuthStatus
  };

})();
