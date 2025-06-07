(async function () {
  const STORAGE_KEYS = {
    block: "blockMode",
    lang: "langMode",
    fun: "funMode"
  };

  // Fetch toggles
  const rawSettings = await new Promise(resolve => {
    chrome.storage.local.get(Object.values(STORAGE_KEYS), resolve);
  });

  const settings = {
    block: rawSettings[STORAGE_KEYS.block] ?? true,
    lang: rawSettings[STORAGE_KEYS.lang] ?? false,
    fun: rawSettings[STORAGE_KEYS.fun] ?? false
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (STORAGE_KEYS.block in changes)
      settings.block = changes[STORAGE_KEYS.block].newValue ?? true;
    if (STORAGE_KEYS.lang in changes)
      settings.lang = changes[STORAGE_KEYS.lang].newValue ?? false;
    if (STORAGE_KEYS.fun in changes)
      settings.fun = changes[STORAGE_KEYS.fun].newValue ?? false;
    scrub();
  });

  // Load local blocklist and merge any remote entries
  let blocklist = { domains: [], keywords: [] };
  try {
    const localRes = await fetch(chrome.runtime.getURL("blocklist.json"));
    blocklist = await localRes.json();
  } catch (e) {
    console.error("Failed to load local blocklist:", e);
  }
  try {
    const res = await fetch("https://coffinsyrup.github.io/remember-no-russian/blocklist.json");
    const remote = await res.json();
    blocklist.domains = Array.from(new Set([...blocklist.domains, ...remote.domains]));
    blocklist.keywords = Array.from(new Set([...blocklist.keywords, ...remote.keywords]));
  } catch (e) {
    console.error("Failed to load remote blocklist:", e);
  }

  function shouldBlockText(text) {
    return blocklist.keywords.some(term => text.toLowerCase().includes(term.toLowerCase()));
  }

  function shouldBlockURL(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return blocklist.domains.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );
    } catch (e) {
      return false;
    }
  }

  function removeMatchingElements(selectors) {
    document.querySelectorAll(selectors).forEach(el => {
      const href = el.querySelector("a[href]")?.href || "";
      const text = el.innerText || "";
      if (
        (settings.block && shouldBlockURL(href)) ||
        (settings.lang && /[АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя]/.test(text)) ||
        (settings.fun && /\bRussia\b/i.test(text))
      ) {
        el.remove();
      }
    });
  }

  function rewriteRussia() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue
        .replace(/\bRUSSIA\b/g, "rUSSIA")
        .replace(/\bRussia\b/g, "russia");
    }
  }

  function scrub() {
    removeMatchingElements("div.g, div.MjjYud, div.tF2Cxc, div.result, div.result-card, div.snippet-card, div.card, .So9e7d, .Ww4FFb, .yYlJEf, .S3nF8e");
    removeMatchingElements("#kp-wp-tab-overview, #rhs, .g-blk, #right-sidebar, .module__sidebar, .sidebar-module");
    if (settings.fun) rewriteRussia();
  }

  scrub();
  const observer = new MutationObserver(scrub);
  observer.observe(document.body, { childList: true, subtree: true });
})();

