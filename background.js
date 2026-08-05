// Background service worker for F*CK FEEDBACK FORM extension
// Manifest V3 compatible

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[F*CK Feedback] Extension installed. Ready to automate feedback forms.');
  } else if (details.reason === 'update') {
    console.log('[F*CK Feedback] Extension updated.');
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({
          id: tabs[0].id,
          url: tabs[0].url,
          title: tabs[0].title
        });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true; // Keep channel open for async
  }

  return false;
});

// Log when service worker starts
console.log('[F*CK Feedback] Background service worker started.');
