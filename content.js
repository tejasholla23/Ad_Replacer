const adSelectors = [
  ".ad",
  ".ads",
  ".ad-container",
  ".ad-banner",
  ".advertisement",
  "[data-ad]",
  "iframe[src*='ads']",
  "iframe[src*='doubleclick']",
  "iframe[src*='googlesyndication']"
];

const facts = [
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
  "The first computer programmer was Ada Lovelace, who wrote the first algorithm intended to be carried out by a machine in the 1840s.",
  "A 'jiffy' is an actual unit of time. It is defined as the time it takes for light to travel one centimeter in a vacuum.",
  "Octopuses have three hearts: two to pump blood to the gills and one to pump it to the rest of the body.",
  "Sloths can hold their breath longer than dolphins can. They can hold their breath for up to 40 minutes underwater.",
  "The moon has moonquakes. Seismic activity on the moon is caused by tidal stresses from Earth's gravity.",
  "The Eiffel Tower can be 15 cm taller during the summer, as the iron heats up and expands."
];

const DEBUG = true; // Use true to see scoring logs, false for production

// --- SESSION MEMORY & HEURISTICS ---
const ignoredElements = new WeakSet();
const originalNodes = new WeakMap();
let activeIgnorePatterns = [];

// Fetch global ignore patterns from storage
chrome.storage.local.get({ ignorePatterns: [] }, (data) => {
  activeIgnorePatterns = data.ignorePatterns;
});

function isPatternIgnored(element) {
  const classNames = element.className.toString().toLowerCase();
  const idValue = element.id.toString().toLowerCase();

  return activeIgnorePatterns.some(pattern => {
    return (pattern.className && classNames.includes(pattern.className.toLowerCase())) ||
      (pattern.id && idValue.includes(pattern.id.toLowerCase()));
  });
}

// --- AD DETECTION HEURISTICS ---
function isLikelyAd(element) {
  // 1. Hard Rejections
  if (element.getAttribute('data-edu-replaced') === 'true') return false;
  if (element.getAttribute('data-user-ignored') === 'true') return false;
  if (ignoredElements.has(element)) return false;

  // Fuzzy pattern matching (skip elements similar to ones the user restored)
  if (isPatternIgnored(element)) {
    if (DEBUG) console.log("Edu Ad Replacer: Element skipped due to learned ignore pattern.", element);
    return false;
  }

  if (element.closest('header, nav, footer')) return false;

  // High-Confidence Iframe Check (Direct match, skip scoring)
  if (element.tagName === "IFRAME") {
    const src = element.src.toLowerCase();
    if (src.includes("ads") || src.includes("doubleclick") || src.includes("googlesyndication")) {
      if (DEBUG) console.log("Edu Ad Replacer: High-confidence iframe ad detected.", element);
      return true;
    }
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  // Viewport Relevance (Skip elements too far off-screen)
  const rect = element.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight * 1.5) return false;

  // Rich Media Filter (YouTube, Canvas, Video)
  if (element.querySelector("video, canvas, iframe[src*='youtube']")) return false;

  let score = 0;
  const text = element.innerText?.toLowerCase() || "";
  const keywords = ["sponsored", "advertisement", "promo", "ads"];
  const containsKeyword = keywords.some(k => text.includes(k));

  // 2. Refined Size Check
  // Relax size constraints if high-signal keywords are present
  const minSize = containsKeyword ? 20 : 50;
  if (element.offsetHeight < minSize || element.offsetWidth < minSize) return false;

  // 3. Smart Image Handling
  const img = element.querySelector("img");
  if (img) {
    const imgArea = img.offsetWidth * img.offsetHeight;
    const elArea = element.offsetWidth * element.offsetHeight;
    if (elArea > 0 && (imgArea / elArea) > 0.6) {
      score += 2;
    } else {
      return false; // Likely a thumbnail
    }
  }

  // 4. Scoring Signals

  // Keywords
  if (containsKeyword) score += 2;

  // Position
  if (style.position === "fixed" || style.position === "sticky") score += 2;

  // Naming with word boundaries (Prevents matching 'header', 'shadow', etc.)
  const adPattern = /\b(ad|ads|banner|sponsored)\b/i;
  const classNames = element.className.toString();
  const idValue = element.id.toString();
  if (adPattern.test(classNames) || adPattern.test(idValue)) {
    score += 2;
  }

  // Large enough bonus
  if (element.offsetHeight >= 50 && element.offsetWidth >= 50) score += 1;

  if (DEBUG && score > 0) {
    console.log(`Edu Ad Replacer: Element score: ${score}`, element);
  }

  return score >= 3;
}

// --- SAFETY CHECK ---
const sensitiveKeywords = ["bank", "payment", "upi", "paytm"];
const currentUrl = window.location.href.toLowerCase();
const isSensitiveSite = sensitiveKeywords.some(keyword => currentUrl.includes(keyword));

if (isSensitiveSite) {
  if (DEBUG) console.log("Edu Ad Replacer: Extension disabled on sensitive site.");
} else {
  function replaceAds() {
    chrome.storage.local.get({ enabled: true }, (result) => {
      if (!result.enabled) return;

      const adElements = document.querySelectorAll(adSelectors.join(', '));
      let count = 0;

      adElements.forEach(el => {
        if (!isLikelyAd(el)) return;

        let target = el;

        // Parent Displacement Logic for Iframes
        if (el.tagName === "IFRAME") {
          const parent = el.parentElement;
          if (parent && 
              parent.tagName !== "BODY" && 
              parent.tagName !== "HTML" && 
              parent.offsetWidth > 100 && 
              parent.offsetHeight > 50) {
            
            // Check if parent was already replaced
            if (parent.getAttribute('data-edu-replaced') === 'true') return;
            target = parent;
          } else {
            // If parent is not a good candidate, check iframe size itself
            if (el.offsetWidth <= 100 || el.offsetHeight <= 50) return;
          }
        }

        // Store original clone before replacement
        const clone = target.cloneNode(true);
        originalNodes.set(target, clone);

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        target.innerHTML = `
          <div class="edu-box" 
               style="border: 1px solid #e0e0e0; padding: 20px; background-color: #ffffff; cursor: pointer; border-radius: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; position: relative; overflow: hidden; margin: 10px 0;"
               onmouseover="this.style.transform='scale(1.02)'; this.style.backgroundColor='#fafafa'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';"
               onmouseout="this.style.transform='scale(1)'; this.style.backgroundColor='#ffffff'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';"
          >
            <div style="font-size: 9px; color: #bbb; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: bold;">Ad replaced by Edu Extension (Demo)</div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; font-weight: 700;">💡 Quick Fact</h3>
            <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">${randomFact}</p>
            <div style="font-size: 11px; color: #999; margin-top: 15px; font-style: italic; border-top: 1px solid #f0f0f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span>Click to support learning (demo)</span>
              <button class="not-ad-btn" style="font-size: 10px; color: #888; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; font-family: inherit;">Not an Ad?</button>
            </div>
          </div>
        `;
        target.setAttribute('data-edu-replaced', 'true');
        count++;

        // Update persistent counter
        chrome.storage.local.get({ adsReplaced: 0 }, (data) => {
          chrome.storage.local.set({ adsReplaced: data.adsReplaced + 1 });
        });

        if (DEBUG) console.log("Edu Ad Replacer: Replaced element", target);
      });

      if (count > 0 && DEBUG) {
        console.log(`Edu Ad Replacer: Batch update - Replaced ${count} elements.`);
      }
    });
  }

  // --- RESTORATION LOGIC ---
  const MAX_PATTERNS = 50;

  function handleRestore(notAdBtn) {
    const container = notAdBtn.closest("[data-edu-replaced='true']");
    if (!container) return;

    const originalNode = originalNodes.get(container);
    if (!originalNode) return;

    // Visual feedback: Fade out
    container.style.transition = "opacity 0.15s ease";
    container.style.opacity = "0.5";

    setTimeout(() => {
      const parent = container.parentNode;
      if (parent) {
        // Mark as ignored to prevent re-processing
        originalNode.setAttribute('data-user-ignored', 'true');
        ignoredElements.add(originalNode);

        // Perform the swap
        parent.replaceChild(originalNode, container);

        // Learn the pattern (Fuzzy memory)
        const newPattern = {
          className: originalNode.className.toString(),
          id: originalNode.id.toString()
        };

        chrome.storage.local.get({ ignorePatterns: [], falsePositives: 0 }, (data) => {
          let patterns = data.ignorePatterns;

          if (newPattern.className || newPattern.id) {
            patterns.push(newPattern);
            if (patterns.length > MAX_PATTERNS) patterns.shift();
            activeIgnorePatterns = patterns; // update local cache
          }

          chrome.storage.local.set({
            ignorePatterns: patterns,
            falsePositives: data.falsePositives + 1
          });
        });

        if (DEBUG) console.log("Edu Ad Replacer: Element restored and pattern learned.");
      }
    }, 150);
  }

  // Initial run
  replaceAds();

  // Debounced Observation logic
  let observerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      replaceAds();
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Click handling (Delegated)
  document.addEventListener("click", (event) => {
    // 1. Handle restoration button
    const notAdBtn = event.target.closest(".not-ad-btn");
    if (notAdBtn) {
      event.preventDefault();
      event.stopPropagation();
      handleRestore(notAdBtn);
      return;
    }

    // 2. Handle main educational box click
    const eduBox = event.target.closest(".edu-box");
    if (eduBox) {
      if (DEBUG) console.log("Edu box clicked");
      chrome.runtime.sendMessage({
        action: "EDU_CLICK",
        timestamp: Date.now()
      });
    }
  }, true); // Use capture phase to intercept before site listeners if needed

  console.log("Content script loaded and monitoring for ads...");
}


//comment for git commit