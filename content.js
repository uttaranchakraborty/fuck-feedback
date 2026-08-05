// Content script for F*CK FEEDBACK FORM extension
// Handles page-level integration and dynamic content detection

(function() {
  'use strict';

  const SELECTOR = '.ems-flex-align.margin-10.ng-scope';

  // Log when content script loads
  console.log('[F*CK Feedback] Content script loaded.');

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ status: 'ready', url: window.location.href });
      return true;
    }

    if (request.action === 'getElementCount') {
      const count = document.querySelectorAll(SELECTOR).length;
      sendResponse({ count: count });
      return true;
    }

    if (request.action === 'execute') {
      const result = executeAutomation(request.mode);
      sendResponse(result);
      return true;
    }

    return false;
  });

  function executeAutomation(mode) {
    const STRONGLY_AGREE = 'Strongly Agree';
    const STRONGLY_DISAGREE = 'Strongly Disagree';

    function getElements() {
      return Array.from(document.querySelectorAll(SELECTOR));
    }

    function clickElement(el) {
      el.click();
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      if (window.angular) {
        try {
          const injector = window.angular.element(el).injector();
          if (injector) {
            const $rootScope = injector.get('$rootScope');
            if ($rootScope) $rootScope.$digest();
          }
        } catch (e) {
          // Angular not available or element not bound
        }
      }
    }

    function groupByQuestion(elements) {
      const groups = [];
      const visited = new Set();

      elements.forEach(el => {
        if (visited.has(el)) return;

        let container = el.parentElement;
        while (container && container !== document.body) {
          const siblings = Array.from(container.children);
          const optionCount = siblings.filter(child => 
            child.matches(SELECTOR) || child.querySelector(SELECTOR)
          ).length;

          if (optionCount >= 2) break;
          container = container.parentElement;
        }

        const groupEls = container === document.body 
          ? [el] 
          : Array.from(container.querySelectorAll(SELECTOR));

        const uniqueEls = groupEls.filter(e => !visited.has(e));
        uniqueEls.forEach(e => visited.add(e));

        if (uniqueEls.length > 0) groups.push(uniqueEls);
      });

      if (groups.length === 0) {
        elements.forEach(el => groups.push([el]));
      }

      return groups;
    }

    const elements = getElements();

    if (elements.length === 0) {
      return { success: false, message: 'No feedback elements found.' };
    }

    let clickedCount = 0;

    if (mode === 'agree') {
      elements.forEach(el => {
        if (el.innerText.trim() === STRONGLY_AGREE) {
          clickElement(el);
          clickedCount++;
        }
      });
    } else if (mode === 'disagree') {
      elements.forEach(el => {
        if (el.innerText.trim() === STRONGLY_DISAGREE) {
          clickElement(el);
          clickedCount++;
        }
      });
    } else if (mode === 'random') {
      const groups = groupByQuestion(elements);
      groups.forEach(group => {
        const randomEl = group[Math.floor(Math.random() * group.length)];
        if (randomEl) {
          clickElement(randomEl);
          clickedCount++;
        }
      });
    }

    return { success: true, clicked: clickedCount, mode: mode };
  }

  // Auto-detect dynamic content with MutationObserver
  let observerActive = false;
  let dynamicObserver = null;

  function startDynamicObserver() {
    if (observerActive) return;
    observerActive = true;

    dynamicObserver = new MutationObserver((mutations) => {
      const elements = document.querySelectorAll(SELECTOR);
      if (elements.length > 0) {
        console.log(`[F*CK Feedback] Detected ${elements.length} feedback element(s) dynamically loaded.`);
      }
    });

    dynamicObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start observing once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startDynamicObserver);
  } else {
    startDynamicObserver();
  }
})();
