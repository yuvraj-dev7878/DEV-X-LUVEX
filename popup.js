document.addEventListener('DOMContentLoaded', function() {
  console.log('🛡️ Fingerprint Cleaner loaded');

  const siteName = document.getElementById('siteName');
  const siteStatus = document.getElementById('siteStatus');
  const deviceId = document.getElementById('deviceId');
  const canvasFp = document.getElementById('canvasFp');
  const webglFp = document.getElementById('webglFp');
  const fontFp = document.getElementById('fontFp');
  const userAgent = document.getElementById('userAgent');
  const notification = document.getElementById('notification');
  const bypassBtn = document.getElementById('bypassSheerID');
  const bypassStatus = document.getElementById('bypassStatus');

  let currentTabId = null;

  function showNotification(message, type = '') {
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(() => {
      notification.className = 'notification';
    }, 2000);
  }

  function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0] || null);
      });
    });
  }

  function sendToTab(action, data = {}) {
    if (!currentTabId) return;
    chrome.tabs.sendMessage(currentTabId, { action, ...data }).catch(() => {});
  }

  // Update site info and fingerprint
  async function updateSiteInfo() {
    const tab = await getCurrentTab();
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        siteName.textContent = url.hostname || 'Unknown';
        currentTabId = tab.id;
        if (url.hostname.includes('sheerid') || url.hostname.includes('figma')) {
          siteStatus.textContent = '🎯 Sheer ID Detected';
          siteStatus.style.borderColor = 'rgba(239,68,68,0.3)';
          siteStatus.style.color = '#ef4444';
        } else {
          siteStatus.textContent = '✅ Clean';
          siteStatus.style.borderColor = 'rgba(76,175,80,0.3)';
          siteStatus.style.color = '#4CAF50';
        }
      } catch { siteName.textContent = 'Unknown'; }
    } else {
      siteName.textContent = 'No site detected';
    }
  }

  // Get fingerprint data
  async function updateFingerprint() {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) return;
    
    try {
      chrome.tabs.sendMessage(tab.id, { action: 'getFingerprint' }, (response) => {
        if (response) {
          deviceId.textContent = response.deviceId || '—';
          canvasFp.textContent = response.canvasFp || '—';
          webglFp.textContent = response.webglFp || '—';
          fontFp.textContent = response.fontFp || '—';
          userAgent.textContent = response.userAgent || '—';
        }
      });
    } catch(e) {}
  }

  // Quick actions
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.dataset.action;
      switch(action) {
        case 'cleanAll':
          sendToTab('cleanAll');
          showNotification('🧹 Cleaned all data!', 'success');
          setTimeout(updateFingerprint, 1000);
          break;
        case 'cleanCookies':
          sendToTab('cleanCookies');
          showNotification('🍪 Cookies cleaned!', 'success');
          break;
        case 'cleanStorage':
          sendToTab('cleanStorage');
          showNotification('💾 Storage cleaned!', 'success');
          break;
        case 'changeFingerprint':
          sendToTab('changeFingerprint');
          showNotification('🔄 Fingerprint changed!', 'success');
          setTimeout(updateFingerprint, 1500);
          break;
      }
    });
  });

  // Sheer ID Bypass
  bypassBtn.addEventListener('click', function() {
    bypassBtn.textContent = '⏳ Processing...';
    bypassBtn.disabled = true;
    bypassStatus.textContent = '🔄 Cleaning all traces...';
    bypassStatus.style.color = '#fbbf24';

    sendToTab('cleanAll');
    sendToTab('changeFingerprint');
    
    setTimeout(() => {
      sendToTab('bypassSheerID');
      bypassStatus.textContent = '✅ Ready! Refresh page and verify.';
      bypassStatus.style.color = '#4CAF50';
      bypassBtn.textContent = '🚀 Bypass Sheer ID Limit';
      bypassBtn.disabled = false;
      bypassBtn.classList.add('success');
      showNotification('✅ Sheer ID bypass ready! Refresh the page.', 'success');
    }, 2000);
  });

  // Settings
  document.getElementById('autoClean').addEventListener('change', function() {
    chrome.storage.local.set({ autoClean: this.checked });
  });
  document.getElementById('spoofUserAgent').addEventListener('change', function() {
    chrome.storage.local.set({ spoofUserAgent: this.checked });
    sendToTab('setSpoof', { enabled: this.checked });
  });
  document.getElementById('blockTrackers').addEventListener('change', function() {
    chrome.storage.local.set({ blockTrackers: this.checked });
    sendToTab('setBlockTrackers', { enabled: this.checked });
  });

  // Load settings
  chrome.storage.local.get(['autoClean', 'spoofUserAgent', 'blockTrackers'], function(data) {
    if (data.autoClean !== undefined) document.getElementById('autoClean').checked = data.autoClean;
    if (data.spoofUserAgent !== undefined) document.getElementById('spoofUserAgent').checked = data.spoofUserAgent;
    if (data.blockTrackers !== undefined) document.getElementById('blockTrackers').checked = data.blockTrackers;
  });

  // Init
  updateSiteInfo();
  setTimeout(updateFingerprint, 500);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.action === 'fingerprintUpdated') {
      updateFingerprint();
    }
  });

  console.log('🛡️ Fingerprint Cleaner ready');
});
