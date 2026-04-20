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

// --- AD DETECTION HEURISTICS ---
function isLikelyAd(element) {
  // 1. Hard Rejections
  if (element.getAttribute('data-edu-replaced') === 'true') return false;
  if (element.closest('header, nav, footer')) return false;

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

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        el.innerHTML = `
          <div class="edu-box" 
               style="border: 1px solid #e0e0e0; padding: 20px; background-color: #ffffff; cursor: pointer; border-radius: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.2s ease; position: relative; overflow: hidden; margin: 10px 0;"
               onmouseover="this.style.transform='scale(1.02)'; this.style.backgroundColor='#fafafa'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.15)';"
               onmouseout="this.style.transform='scale(1)'; this.style.backgroundColor='#ffffff'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)';"
          >
            <div style="font-size: 9px; color: #bbb; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: bold;">Ad replaced by Edu Extension (Demo)</div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; font-weight: 700;">💡 Quick Fact</h3>
            <p style="margin: 0; color: #555; line-height: 1.5; font-size: 14px;">${randomFact}</p>
            <div style="font-size: 11px; color: #999; margin-top: 15px; font-style: italic; border-top: 1px solid #f0f0f0; padding-top: 10px;">Click to support learning (demo)</div>
          </div>
        `;
        el.setAttribute('data-edu-replaced', 'true');
        count++;
        if (DEBUG) console.log("Edu Ad Replacer: Replaced ad element");
      });

      if (count > 0 && DEBUG) {
        console.log(`Edu Ad Replacer: Batch update - Replaced ${count} elements.`);
      }
    });
  }

  // Initial run
  replaceAds();

  // Observe for changes
  const observer = new MutationObserver(() => {
    replaceAds();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Click handling
  document.addEventListener("click", (event) => {
    const eduBox = event.target.closest(".edu-box");
    if (eduBox) {
      console.log("Edu box clicked");
      chrome.runtime.sendMessage({
        action: "EDU_CLICK",
        timestamp: Date.now()
      });
    }
  });

  console.log("Content script loaded and monitoring for ads...");
}

