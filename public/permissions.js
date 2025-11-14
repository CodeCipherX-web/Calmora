/**
 * Calmora - Permissions Manager
 * Handles permission requests for network access and other features
 */

(function() {
  'use strict';

  // Permission status
  const permissions = {
    network: false,
    storage: false,
    notifications: false,
    serviceWorker: false
  };

  /**
   * Check if service worker is supported
   */
  function isServiceWorkerSupported() {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if notifications are supported
   */
  function isNotificationSupported() {
    return 'Notification' in window;
  }

  /**
   * Check if storage is available
   */
  function isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Register service worker
   */
  async function registerServiceWorker() {
    if (!isServiceWorkerSupported()) {
      console.warn('Service Worker is not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', registration);
      permissions.serviceWorker = true;
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      permissions.serviceWorker = false;
      return false;
    }
  }

  /**
   * Request network access permission
   */
  async function requestNetworkAccess() {
    try {
      // Get API base URL (same logic as api.js)
      const getApiBaseUrl = () => {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;

        if (protocol === 'file:') {
          return 'http://localhost:3001';
        }

        if (port === '5500' || port === '5501' || hostname === '127.0.0.1') {
          return 'http://localhost:3001';
        }

        return `${protocol}//${hostname}${port ? ':' + port : ''}`;
      };

      const apiBaseUrl = getApiBaseUrl();
      
      // Test network access by making a simple request
      const response = await fetch(`${apiBaseUrl}/api/health`, {
        method: 'GET',
        cache: 'no-cache',
        credentials: 'include'
      });
      
      if (response.ok) {
        permissions.network = true;
        return true;
      }
      permissions.network = false;
      return false;
    } catch (error) {
      console.error('Network access check failed:', error);
      permissions.network = false;
      return false;
    }
  }

  /**
   * Request storage permission
   */
  function requestStorageAccess() {
    if (!isStorageAvailable()) {
      console.warn('Storage is not available');
      permissions.storage = false;
      return false;
    }

    try {
      // Test storage access
      const testKey = '__calmora_storage_test__';
      const testValue = Date.now().toString();
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        permissions.storage = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Storage access check failed:', error);
      permissions.storage = false;
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
      console.warn('Notifications are not supported');
      permissions.notifications = false;
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        permissions.notifications = true;
        return true;
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          permissions.notifications = true;
          return true;
        }
      }

      permissions.notifications = false;
      return false;
    } catch (error) {
      console.error('Notification permission request failed:', error);
      permissions.notifications = false;
      return false;
    }
  }

  /**
   * Request all permissions
   */
  async function requestAllPermissions() {
    const results = {
      serviceWorker: await registerServiceWorker(),
      network: await requestNetworkAccess(),
      storage: requestStorageAccess(),
      notifications: await requestNotificationPermission()
    };

    return results;
  }

  /**
   * Check current permission status
   */
  function checkPermissions() {
    return {
      serviceWorker: isServiceWorkerSupported() && permissions.serviceWorker,
      network: permissions.network,
      storage: isStorageAvailable() && permissions.storage,
      notifications: isNotificationSupported() && Notification.permission === 'granted'
    };
  }

  /**
   * Show permission request dialog
   */
  function showPermissionDialog() {
    // Check if dialog already shown
    if (localStorage.getItem('calmora_permissions_asked') === 'true') {
      return;
    }

    // Create dialog element
    const dialog = document.createElement('div');
    dialog.id = 'permissionDialog';
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;

    content.innerHTML = `
      <h2 style="margin-top: 0; color: #6366f1;">Permissions Required</h2>
      <p>Calmora needs the following permissions to function properly:</p>
      <ul style="margin: 1rem 0; padding-left: 1.5rem;">
        <li><strong>Network Access:</strong> To connect to the AI chatbot and API</li>
        <li><strong>Storage:</strong> To save your mood entries and preferences</li>
        <li><strong>Notifications:</strong> To send you helpful reminders (optional)</li>
      </ul>
      <p style="color: #666; font-size: 0.9rem;">
        These permissions are required for the chatbot and other features to work correctly.
      </p>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
        <button id="permissionDeny" style="
          padding: 0.75rem 1.5rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        ">Deny</button>
        <button id="permissionAllow" style="
          padding: 0.75rem 1.5rem;
          border: none;
          background: #6366f1;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        ">Allow</button>
      </div>
    `;

    dialog.appendChild(content);
    document.body.appendChild(dialog);

    // Handle button clicks
    document.getElementById('permissionAllow').addEventListener('click', async () => {
      const results = await requestAllPermissions();
      localStorage.setItem('calmora_permissions_asked', 'true');
      localStorage.setItem('calmora_permissions', JSON.stringify(results));
      dialog.remove();
      
      // Show success message
      if (results.network) {
        showPermissionStatus('Permissions granted! The chatbot is now ready to use.', 'success');
      } else {
        showPermissionStatus('Some permissions were denied. The chatbot may not work correctly.', 'warning');
      }
    });

    document.getElementById('permissionDeny').addEventListener('click', () => {
      localStorage.setItem('calmora_permissions_asked', 'true');
      dialog.remove();
      showPermissionStatus('Permissions denied. Some features may not work correctly.', 'error');
    });
  }

  /**
   * Show permission status message
   */
  function showPermissionStatus(message, type = 'info') {
    const status = document.createElement('div');
    status.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    `;
    status.textContent = message;
    document.body.appendChild(status);

    setTimeout(() => {
      status.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => status.remove(), 300);
    }, 5000);
  }

  /**
   * Initialize permissions on page load
   */
  async function initPermissions() {
    // Register service worker first (always)
    await registerServiceWorker();

    // Check if permissions were already requested
    const permissionsAsked = localStorage.getItem('calmora_permissions_asked') === 'true';
    
    if (!permissionsAsked) {
      // Show dialog after a short delay (only on first visit)
      setTimeout(() => {
        showPermissionDialog();
      }, 1500);
    } else {
      // Request permissions automatically in background (silently)
      const savedPermissions = localStorage.getItem('calmora_permissions');
      if (savedPermissions) {
        try {
          const parsed = JSON.parse(savedPermissions);
          permissions.network = parsed.network || false;
          permissions.storage = parsed.storage || false;
          permissions.notifications = parsed.notifications || false;
          permissions.serviceWorker = parsed.serviceWorker || false;
        } catch (e) {
          console.error('Error parsing saved permissions:', e);
        }
      }
      
      // Still request permissions in background to update status
      await requestAllPermissions();
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPermissions);
  } else {
    initPermissions();
  }

  // Export permissions API
  window.Permissions = {
    request: requestAllPermissions,
    check: checkPermissions,
    requestNetwork: requestNetworkAccess,
    requestStorage: requestStorageAccess,
    requestNotifications: requestNotificationPermission,
    showDialog: showPermissionDialog,
    status: permissions
  };

})();
