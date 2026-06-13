// Vercel Speed Insights Integration
// This file injects the Vercel Speed Insights tracking script
(function() {
  // Queue function for Speed Insights
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };

  // Inject the Speed Insights script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '1.3.1';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if any content blockers are enabled and try again.');
  };
  
  document.head.appendChild(script);
})();
