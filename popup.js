document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('statusBadge');
  const toggleBtn = document.getElementById('toggleBtn');
  const adsCount = document.getElementById('adsCount');
  const fpCount = document.getElementById('fpCount');
  const resetBtn = document.getElementById('resetBtn');

  // Load current state (Enabled/Disabled)
  chrome.storage.local.get({ enabled: true }, (result) => {
    updateUI(result.enabled);
  });

  // Load replacement stats
  const updateStats = () => {
    chrome.storage.local.get({ adsReplaced: 0, falsePositives: 0 }, (result) => {
      adsCount.textContent = result.adsReplaced;
      fpCount.textContent = result.falsePositives;
    });
  };
  updateStats();

  // Toggle state handle.
  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get({ enabled: true }, (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        updateUI(newState);
      });
    });
  });

  // Reset stats handle
  resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ 
      adsReplaced: 0, 
      falsePositives: 0,
      ignorePatterns: [] 
    }, () => {
      updateStats();
    });
  });

  function updateUI(enabled) {
    if (enabled) {
      statusBadge.textContent = 'Status: ON';
      statusBadge.className = 'status-badge status-on';
      toggleBtn.textContent = 'Disable Extension';
      toggleBtn.style.background = '#2c3e50';
    } else {
      statusBadge.textContent = 'Status: OFF';
      statusBadge.className = 'status-badge status-off';
      toggleBtn.textContent = 'Enable Extension';
      toggleBtn.style.background = '#065f46';
    }
  }
});
