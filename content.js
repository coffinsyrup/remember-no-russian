(async function () {
  const STORAGE_KEYS = {
    block: "blockMode",
    lang: "langMode",
    fun: "funMode"
  };

  // Fetch toggles
  const settings = await new Promise(resolve => {
    chrome.storage.local.get(Object.values(STORAGE_KEYS), resolve);
  });

  // Fetch blocklist from GitHub Pages
  let blocklist = { domains: [], keywords: [] };
  try {
    const res = await fetch("https://coffinsyrup.github.io/remember-no-russian/blocklist.json");
    blocklist = await res.json();
  } catch (e) {
    console.error("Failed to load blocklist:", e);
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
        (settings.lang && /[А-Яа-яЁёЫыЭэЖжЪъ]/.test(text)) ||
        (settings.fun && text.includes("Russia"))
      ) {
        el.remove();
      }
    });
  }

  function rewriteRussia() {
    document.body.innerHTML = document.body.innerHTML
      .replace(/Russia/g, "russia")
      .replace(/RUSSIA/g, "rUSSIA");
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

