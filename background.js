// ─── FINGERPRINT CLEANER — BACKGROUND ───

console.log('🛡️ Fingerprint Cleaner background loaded');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    autoClean: true,
    spoofUserAgent: true,
    blockTrackers: true
  });
  console.log('🛡️ Fingerprint Cleaner installed');
});

// ─── INJECT CONTENT SCRIPT ───
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {});
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.startsWith('http')) {
      chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['content.js']
      }).catch(() => {});
    }
  });
});

// ─── CLEAN DATA ON NAVIGATION ───
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url && details.url.includes('sheerid')) {
    chrome.cookies.getAll({ domain: '.sheerid.com' }, (cookies) => {
      cookies.forEach(cookie => {
        chrome.cookies.remove({
          url: 'https://' + cookie.domain + cookie.path,
          name: cookie.name
        });
      });
    });
  }
});

console.log('🛡️ Fingerprint Cleaner background ready');
