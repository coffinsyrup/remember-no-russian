const blocked = ["yandex", "ya.ru"];

function shouldBlockText(text) {
  return blocked.some(term => text.toLowerCase().includes(term));
}

function removeGoogleResults() {
  document.querySelectorAll("div.g, div.MjjYud, div.tF2Cxc").forEach(result => {
    const link = result.querySelector("a[href]");
    if (link && shouldBlockText(link.href)) {
      result.remove();
    }
  });

  // Remove Google Knowledge Panel (side panel)
  document.querySelectorAll("#kp-wp-tab-overview, #rhs, .g-blk").forEach(panel => {
    if (panel.innerText && shouldBlockText(panel.innerText)) {
      panel.remove();
    }
  });
}

function removeDuckDuckGoResults() {
  document.querySelectorAll("div.result, article[data-testid='result']").forEach(result => {
    if (shouldBlockText(result.innerText)) {
      result.remove();
    }
  });

  // Remove DuckDuckGo side panels
  document.querySelectorAll("#right-sidebar, .module__sidebar, .sidebar-module").forEach(panel => {
    if (panel.innerText && shouldBlockText(panel.innerText)) {
      panel.remove();
    }
  });
}

function removeBraveResults() {
  document.querySelectorAll("div.result, div.result-card, div.snippet-card").forEach(result => {
    const link = result.querySelector("a[href]");
    if ((link && shouldBlockText(link.href)) || shouldBlockText(result.innerText)) {
      result.remove();
    }
  });
}

function scrub() {
  const url = window.location.href;
  if (url.includes("google.")) removeGoogleResults();
  else if (url.includes("duckduckgo.com")) removeDuckDuckGoResults();
  else if (url.includes("search.brave.com")) removeBraveResults();
}

scrub();
const observer = new MutationObserver(scrub);
observer.observe(document.body, { childList: true, subtree: true });
