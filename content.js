// ─── FINGERPRINT CLEANER — CONTENT SCRIPT ───

(function() {
  console.log('🛡️ Fingerprint Cleaner content script loaded');

  let deviceId = generateDeviceId();
  let originalFingerprint = null;

  function generateDeviceId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ─── SPOOF CANVAS FINGERPRINT ───
  function spoofCanvas() {
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(x, y, w, h) {
      const imageData = originalGetImageData.call(this, x, y, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] ^ 0x0A;
        data[i+1] = data[i+1] ^ 0x0B;
        data[i+2] = data[i+2] ^ 0x0C;
      }
      return imageData;
    };
    console.log('✅ Canvas fingerprint spoofed');
  }

  // ─── SPOOF WEBGL FINGERPRINT ───
  function spoofWebGL() {
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 0x821B) { // RENDERER
        return 'Spoofed WebGL Renderer';
      }
      if (parameter === 0x821A) { // VENDOR
        return 'Spoofed WebGL Vendor';
      }
      return originalGetParameter.call(this, parameter);
    };
    console.log('✅ WebGL fingerprint spoofed');
  }

  // ─── SPOOF USER AGENT ───
  function spoofUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ];
    const spoofed = userAgents[Math.floor(Math.random() * userAgents.length)];
    Object.defineProperty(navigator, 'userAgent', { get: () => spoofed, configurable: true });
    console.log('✅ User Agent spoofed:', spoofed);
  }

  // ─── SPOOF DEVICE ID ───
  function spoofDeviceId() {
    deviceId = generateDeviceId();
    Object.defineProperty(navigator, 'deviceId', { get: () => deviceId, configurable: true });
    console.log('✅ Device ID changed:', deviceId);
  }

  // ─── CLEAN COOKIES ───
  function cleanCookies() {
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    console.log('🍪 Cookies cleaned');
  }

  // ─── CLEAN STORAGE ───
  function cleanStorage() {
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    console.log('💾 Storage cleaned');
  }

  // ─── BLOCK TRACKERS ───
  function blockTrackers() {
    const trackerPatterns = [
      'google-analytics', 'googletag', 'doubleclick', 'facebook', 'twitter', 'linkedin',
      'pixel', 'track', 'analytics', 'beacon', 'segment', 'amplitude', 'mixpanel'
    ];
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (trackerPatterns.some(p => url.toString().toLowerCase().includes(p))) {
        return Promise.reject(new Error('Tracker blocked'));
      }
      return originalFetch.call(this, url, options);
    };
    console.log('🚫 Trackers blocked');
  }

  // ─── BYPASS SHEER ID ───
  function bypassSheerID() {
    // Remove Sheer ID cookies
    document.cookie.split(';').forEach(c => {
      if (c.includes('sheerid') || c.includes('sheer') || c.includes('figma')) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      }
    });

    // Remove Sheer ID local storage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.toLowerCase().includes('sheer') || k.toLowerCase().includes('figma')) {
          localStorage.removeItem(k);
        }
      });
    } catch(e) {}

    // Remove Sheer ID session storage
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(k => {
        if (k.toLowerCase().includes('sheer') || k.toLowerCase().includes('figma')) {
          sessionStorage.removeItem(k);
        }
      });
    } catch(e) {}

    // Block Sheer ID network requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (url.toString().toLowerCase().includes('sheerid')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'success',
          verified: false,
          limit: false
        }), { status: 200 }));
      }
      return originalFetch.call(this, url, options);
    };

    console.log('🎯 Sheer ID bypassed');
  }

  // ─── GET FINGERPRINT ───
  function getFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas', 4, 17);
    const canvasHash = canvas.toDataURL().slice(0, 50);

    return {
      deviceId: deviceId,
      canvasFp: canvasHash,
      webglFp: 'Spoofed',
      fontFp: 'Spoofed',
      userAgent: navigator.userAgent
    };
  }

  // ─── MESSAGE HANDLER ───
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
      switch(request.action) {
        case 'cleanAll':
          cleanCookies();
          cleanStorage();
          spoofDeviceId();
          spoofUserAgent();
          spoofCanvas();
          spoofWebGL();
          sendResponse({ success: true });
          break;
        case 'cleanCookies':
          cleanCookies();
          sendResponse({ success: true });
          break;
        case 'cleanStorage':
          cleanStorage();
          sendResponse({ success: true });
          break;
        case 'changeFingerprint':
          spoofDeviceId();
          spoofUserAgent();
          spoofCanvas();
          spoofWebGL();
          sendResponse({ success: true });
          break;
        case 'bypassSheerID':
          bypassSheerID();
          sendResponse({ success: true });
          break;
        case 'getFingerprint':
          sendResponse(getFingerprint());
          break;
        case 'setSpoof':
          if (request.enabled) {
            spoofUserAgent();
            spoofCanvas();
            spoofWebGL();
          }
          sendResponse({ success: true });
          break;
        case 'setBlockTrackers':
          if (request.enabled) {
            blockTrackers();
          }
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false });
      }
    } catch(e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  });

  // ─── INIT ───
  function init() {
    console.log('🛡️ Fingerprint Cleaner active');

    // Apply spoofs immediately
    spoofDeviceId();
    spoofUserAgent();
    spoofCanvas();
    spoofWebGL();
    blockTrackers();

    // Load settings
    chrome.storage.local.get(['autoClean', 'spoofUserAgent', 'blockTrackers'], function(data) {
      if (data.autoClean) {
        setTimeout(() => {
          cleanCookies();
          cleanStorage();
        }, 500);
      }
      if (data.spoofUserAgent) spoofUserAgent();
      if (data.blockTrackers) blockTrackers();
    });

    // Auto-bypass Sheer ID if detected
    if (window.location.href.toLowerCase().includes('sheerid') || 
        window.location.href.toLowerCase().includes('figma')) {
      setTimeout(bypassSheerID, 2000);
    }

    console.log('🛡️ Fingerprint Cleaner ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('🛡️ Fingerprint Cleaner content script ready');
})();
