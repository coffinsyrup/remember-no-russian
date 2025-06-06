
document.addEventListener('DOMContentLoaded', () => {
  ['blockMode', 'langMode', 'funMode'].forEach(id => {
    const el = document.getElementById(id);
    chrome.storage.local.get(id, data => {
      el.checked = data[id] ?? (id === 'blockMode');
    });
    el.addEventListener('change', () => {
      chrome.storage.local.set({ [id]: el.checked });
    });
  });
});
