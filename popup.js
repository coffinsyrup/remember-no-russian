
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const langEl = document.getElementById('langMode');
  const funEl = document.getElementById('funMode');

  chrome.storage.local.get(['blockMode', 'langMode', 'funMode'], data => {
    const on = data.blockMode ?? true;
    updateButton(on);
    langEl.checked = data.langMode ?? false;
    funEl.checked = data.funMode ?? false;
  });

  toggleBtn.addEventListener('click', () => {
    const on = toggleBtn.dataset.on !== 'true';
    updateButton(on);
    chrome.storage.local.set({ blockMode: on });
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: on ? ['block-russian-sites'] : [],
      disableRulesetIds: on ? [] : ['block-russian-sites']
    });
  });

  langEl.addEventListener('change', () => {
    chrome.storage.local.set({ langMode: langEl.checked });
  });

  funEl.addEventListener('change', () => {
    chrome.storage.local.set({ funMode: funEl.checked });
  });

  function updateButton(on) {
    toggleBtn.dataset.on = on;
    toggleBtn.textContent = on ? 'ON' : 'OFF';
    toggleBtn.style.backgroundColor = on ? '#CC0000' : '#333';
    toggleBtn.style.color = '#ffffff';
  }
});
