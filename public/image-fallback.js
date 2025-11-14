/**
 * Image Fallback Handler
 * Handles missing images and shows placeholders
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Handle all images
    const images = document.querySelectorAll('img');
    
    images.forEach(function(img) {
      // Check if image failed to load
      img.addEventListener('error', function() {
        // Hide broken image
        this.style.display = 'none';
        
        // Create placeholder div
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        
        // Set placeholder content based on image type
        if (this.classList.contains('therapist-image')) {
          placeholder.innerHTML = '<div style="font-size: 3rem; margin-bottom: 0.5rem;">👤</div><div style="font-size: 0.75rem; color: var(--text-light);">Photo</div>';
          placeholder.style.width = '150px';
          placeholder.style.height = '150px';
          placeholder.style.borderRadius = '50%';
          placeholder.style.border = '4px solid var(--primary-color)';
        } else if (this.classList.contains('card-image') || this.classList.contains('resource-image')) {
          placeholder.innerHTML = '<div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div><div style="font-size: 0.875rem; color: var(--text-light);">Image</div>';
          placeholder.style.width = '100%';
          placeholder.style.height = this.classList.contains('resource-image') ? '180px' : '200px';
          placeholder.style.borderRadius = 'var(--border-radius-sm)';
        } else {
          // Hero or other images
          placeholder.innerHTML = '<div style="font-size: 3rem; margin-bottom: 0.5rem;">📷</div><div style="font-size: 1rem; color: var(--text-light);">Image Placeholder</div>';
          
          // Copy styles from original image
          if (this.style.width) placeholder.style.width = this.style.width;
          if (this.style.maxWidth) placeholder.style.maxWidth = this.style.maxWidth;
          if (this.style.height) placeholder.style.height = this.style.height;
          if (this.style.borderRadius) placeholder.style.borderRadius = this.style.borderRadius;
          if (this.style.marginBottom) placeholder.style.marginBottom = this.style.marginBottom;
          if (this.style.boxShadow) placeholder.style.boxShadow = this.style.boxShadow;
          
          // Defaults if no inline styles
          if (!placeholder.style.width) placeholder.style.width = '100%';
          if (!placeholder.style.height) placeholder.style.height = '300px';
          if (!placeholder.style.borderRadius) placeholder.style.borderRadius = '20px';
        }
        
        // Apply placeholder styles
        placeholder.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
        placeholder.style.display = 'flex';
        placeholder.style.flexDirection = 'column';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.marginBottom = this.style.marginBottom || 'var(--spacing-md)';
        placeholder.style.boxShadow = 'var(--shadow-sm)';
        placeholder.style.color = 'var(--text-light)';
        
        // Insert placeholder after the image
        this.parentNode.insertBefore(placeholder, this.nextSibling);
      });
      
      // Also check if image src is empty or invalid
      if (!img.src || img.src.includes('undefined') || img.src === window.location.href) {
        img.dispatchEvent(new Event('error'));
      }
    });
  });
})();

