/**
 * Vercel Speed Insights initialization
 * This script initializes Speed Insights tracking for the static HTML site
 */

// Initialize the Speed Insights queue
window.si = window.si || function () {
  (window.siq = window.siq || []).push(arguments);
};

// The script will be loaded from Vercel's CDN when deployed
// During development, you can use the debug version
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  script.setAttribute('data-sdkn', '@vercel/speed-insights');
  script.setAttribute('data-sdkv', '1.3.1');
  
  // Only inject if not already present
  if (!document.head.querySelector('script[src*="speed-insights"]')) {
    document.head.appendChild(script);
  }
})();
