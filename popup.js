document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.option-card');
  const startBtn = document.getElementById('start-btn');
  const statusEl = document.getElementById('status');

  let selectedMode = null;

  // Card selection
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedMode = card.dataset.mode;
      hideStatus();
    });
  });

  // Start button
  startBtn.addEventListener('click', async () => {
    if (!selectedMode) {
      showStatus('Please select a response mode first.', 'error');
      return;
    }

    startBtn.disabled = true;
    showStatus('Filling feedback form...', 'success');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        showStatus('No active tab found.', 'error');
        startBtn.disabled = false;
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runAutomation,
        args: [selectedMode]
      });

      showStatus('✅ Feedback form completed!', 'success');

      // Auto-close popup after 1.5s
      setTimeout(() => {
        window.close();
      }, 1500);

    } catch (err) {
      console.error(err);
      showStatus('Error: ' + err.message, 'error');
      startBtn.disabled = false;
    }
  });

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'status visible ' + type;
  }

  function hideStatus() {
    statusEl.classList.remove('visible');
  }

  // Automation function injected into page
  function runAutomation(mode) {
    const SELECTOR = '.ems-flex-align.margin-10.ng-scope';
    const STRONGLY_AGREE = 'Strongly Agree';
    const STRONGLY_DISAGREE = 'Strongly Disagree';

    function getElements() {
      return Array.from(document.querySelectorAll(SELECTOR));
    }

    function clickElement(el) {
      // Try multiple click strategies for AngularJS compatibility
      el.click();
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      // Trigger AngularJS digest if present
      if (window.angular) {
        const injector = window.angular.element(el).injector();
        if (injector) {
          const $rootScope = injector.get('$rootScope');
          if ($rootScope) {
            $rootScope.$digest();
          }
        }
      }
    }

    function groupByQuestion(elements) {
      // Group elements by their visual/question container
      const groups = [];
      const visited = new Set();

      elements.forEach(el => {
        if (visited.has(el)) return;

        // Find the question container (parent that holds all options for one question)
        let container = el.parentElement;
        while (container && container !== document.body) {
          const siblings = Array.from(container.children);
          const optionCount = siblings.filter(child => 
            child.matches(SELECTOR) || child.querySelector(SELECTOR)
          ).length;

          if (optionCount >= 2) {
            break;
          }
          container = container.parentElement;
        }

        const groupEls = container === document.body 
          ? [el] 
          : Array.from(container.querySelectorAll(SELECTOR));

        const uniqueEls = groupEls.filter(e => !visited.has(e));
        uniqueEls.forEach(e => visited.add(e));

        if (uniqueEls.length > 0) {
          groups.push(uniqueEls);
        }
      });

      // Fallback: if grouping failed, treat each element individually
      if (groups.length === 0) {
        elements.forEach(el => groups.push([el]));
      }

      return groups;
    }

    function execute() {
      const elements = getElements();

      if (elements.length === 0) {
        console.log('[F*CK Feedback] No feedback elements found on this page.');
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

      console.log(`[F*CK Feedback] Clicked ${clickedCount} option(s) in ${mode} mode.`);
      return { success: true, clicked: clickedCount, mode: mode };
    }

    // Handle dynamically loaded content with MutationObserver
    const observer = new MutationObserver((mutations, obs) => {
      const elements = getElements();
      if (elements.length > 0) {
        obs.disconnect();
        execute();
      }
    });

    // First attempt
    const result = execute();

    // If nothing found, watch for dynamic content
    if (!result.success) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout observer after 5 seconds
      setTimeout(() => {
        observer.disconnect();
      }, 5000);
    }

    return result;
  }
});
