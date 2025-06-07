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
    return blocklist.domains.some(domain => url.includes(domain));
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
    document.body.innerHTML = document.body.innerHTML
      .replace(/\bRUSSIA\b/g, "rUSSIA")
      .replace(/\bRussia\b/g, "russia");
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

