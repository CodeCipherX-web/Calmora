/**
 * Calmora - Background Slideshow System
 * Creates beautiful background image slideshows for pages
 */

(function() {
  'use strict';

  // Image sets for different pages
  const imageSets = {
    home: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1920&h=1080&fit=crop&q=80'
    ],
    chatbot: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1920&h=1080&fit=crop&q=80'
    ],
    mood: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1920&h=1080&fit=crop&q=80'
    ],
    resources: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80'
    ],
    journal: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80'
    ],
    default: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=1080&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop&q=80'
    ]
  };

  // Configuration
  const config = {
    transitionDuration: 3000, // 3 seconds fade
    displayDuration: 6000, // 6 seconds per image
    overlayOpacity: 0.4, // Dark overlay for readability
    blur: false, // Optional blur effect
    fadeIn: true
  };

  /**
   * Detect current page type
   */
  function getPageType() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    if (page === 'index.html' || page === '' || page === '/') {
      return 'home';
    } else if (page.includes('chatbot')) {
      return 'chatbot';
    } else if (page.includes('mood')) {
      return 'mood';
    } else if (page.includes('resources')) {
      return 'resources';
    } else if (page.includes('journal')) {
      return 'journal';
    }
    return 'default';
  }

  /**
   * Create background slideshow element
   */
  function createSlideshow() {
    // Remove existing slideshow if any
    const existing = document.getElementById('backgroundSlideshow');
    if (existing) {
      existing.remove();
    }

    // Create slideshow container
    const slideshow = document.createElement('div');
    slideshow.id = 'backgroundSlideshow';
    slideshow.className = 'background-slideshow';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'background-slideshow-overlay';

    // Get images for current page
    const pageType = getPageType();
    const images = imageSets[pageType] || imageSets.default;

    // Create image elements
    images.forEach((url, index) => {
      const img = document.createElement('div');
      img.className = `background-slideshow-image ${index === 0 ? 'active' : ''}`;
      img.style.backgroundImage = `url(${url})`;
      img.setAttribute('data-index', index);
      slideshow.appendChild(img);
    });

    // Add overlay
    slideshow.appendChild(overlay);

    // Insert into body
    document.body.insertBefore(slideshow, document.body.firstChild);

    return { slideshow, images };
  }

  /**
   * Start slideshow animation
   */
  function startSlideshow() {
    const slideshow = document.getElementById('backgroundSlideshow');
    if (!slideshow) return;

    const images = slideshow.querySelectorAll('.background-slideshow-image');
    if (images.length === 0) return;

    let currentIndex = 0;

    function showNextImage() {
      // Remove active class from current image
      images[currentIndex].classList.remove('active');
      
      // Move to next image
      currentIndex = (currentIndex + 1) % images.length;
      
      // Add active class to next image
      images[currentIndex].classList.add('active');
    }

    // Change image every displayDuration
    setInterval(showNextImage, config.displayDuration);
  }

  /**
   * Preload images for smoother transitions
   */
  function preloadImages(images) {
    images.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  /**
   * Initialize slideshow
   */
  function initSlideshow(options = {}) {
    // Merge custom config
    Object.assign(config, options);

    // Get page type and images
    const pageType = getPageType();
    const images = imageSets[pageType] || imageSets.default;

    // Preload images
    preloadImages(images);

    // Create slideshow
    const { slideshow } = createSlideshow();

    // Start slideshow after a short delay
    setTimeout(() => {
      startSlideshow();
    }, 500);

    return slideshow;
  }

  /**
   * Add CSS styles for slideshow
   */
  function addSlideshowStyles() {
    const styleId = 'backgroundSlideshowStyles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Background Slideshow */
      .background-slideshow {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;
      }

      .background-slideshow-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0;
        transition: opacity ${config.transitionDuration}ms ease-in-out;
        transform: scale(1.05);
        will-change: opacity, transform;
      }

      .background-slideshow-image.active {
        opacity: 1;
        z-index: 1;
        animation: subtleZoom 15s ease-in-out infinite;
      }

      .background-slideshow-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(15, 23, 42, ${config.overlayOpacity}) 0%,
          rgba(30, 64, 175, ${config.overlayOpacity * 0.6}) 50%,
          rgba(15, 23, 42, ${config.overlayOpacity}) 100%
        );
        z-index: 2;
        pointer-events: none;
      }

      /* Optional blur effect */
      .background-slideshow.blur .background-slideshow-image {
        filter: blur(2px);
      }

      /* Subtle zoom animation for depth effect */
      @keyframes subtleZoom {
        0%, 100% {
          transform: scale(1.05);
        }
        50% {
          transform: scale(1);
        }
      }

      /* Ensure content is above slideshow */
      body {
        position: relative;
        z-index: 1;
      }

      /* Adjust sections to work with background */
      .section {
        position: relative;
        z-index: 1;
      }

      /* Make sure navbar is above background */
      .navbar {
        position: relative;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      }

      /* Footer styling with background */
      .footer {
        position: relative;
        z-index: 1;
        background: rgba(15, 23, 42, 0.98) !important;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
      }

      /* Card styling with transparency and glass effect */
      .card {
        background: rgba(255, 255, 255, 0.96) !important;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      /* Section backgrounds with glass effect */
      .section {
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }

      /* Hero section with better contrast */
      .hero {
        position: relative;
        z-index: 1;
        padding: 4rem 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .background-slideshow-image.active {
          animation: none;
        }
        
        .background-slideshow-image {
          transform: scale(1);
        }

        .background-slideshow-overlay {
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, ${config.overlayOpacity + 0.15}) 0%,
            rgba(30, 64, 175, ${config.overlayOpacity * 0.8 + 0.15}) 50%,
            rgba(15, 23, 42, ${config.overlayOpacity + 0.15}) 100%
          );
        }

        .card {
          background: rgba(255, 255, 255, 0.98) !important;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .background-slideshow-image.active {
          animation: none;
        }
        .background-slideshow-image {
          transition: opacity 1s ease-in-out;
        }
      }

      /* Enhanced text readability */
      .section-title,
      h1, h2, h3 {
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      /* Better contrast for text on slideshow */
      body.has-slideshow p {
        text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addSlideshowStyles();
      initSlideshow();
    });
  } else {
    addSlideshowStyles();
    initSlideshow();
  }

  // Export API
  window.BackgroundSlideshow = {
    init: initSlideshow,
    getPageType: getPageType,
    config: config
  };

})();
