document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('statusBadge');
  const toggleBtn = document.getElementById('toggleBtn');

  // Load current state
  chrome.storage.local.get({ enabled: true }, (result) => {
    updateUI(result.enabled);
  });

  // Toggle state handle
  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get({ enabled: true }, (result) => {
      const newState = !result.enabled;
      chrome.storage.local.set({ enabled: newState }, () => {
        updateUI(newState);
        
        // Optional: Notify the user that they might need to reload or just wait for the next ad check
        console.log(`Extension ${newState ? 'enabled' : 'disabled'}`);
      });
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
