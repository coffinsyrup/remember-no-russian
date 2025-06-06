const toggle = document.getElementById("toggle");

chrome.storage.sync.get("enabled", (data) => {
  toggle.checked = data.enabled !== false;
});

toggle.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "toggle", enabled: toggle.checked });
});