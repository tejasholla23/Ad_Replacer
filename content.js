const adSelectors = [
  ".ad",
  ".ads",
  ".ad-unit",
  "[id*='ad']",
  "[class*='ad']"
];

const fact = "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.";

function replaceAds() {
  const adElements = document.querySelectorAll(adSelectors.join(', '));
  let count = 0;

  adElements.forEach(el => {
    // Avoid replacing elements that are already handled
    if (el.getAttribute('data-edu-replaced') === 'true') return;

    el.innerHTML = `
      <div class="edu-box" style="border: 2px solid #4CAF50; padding: 15px; background-color: #f9f9f9; cursor: pointer; border-radius: 8px; font-family: sans-serif; text-align: left;">
        <h3 style="margin-top: 0; color: #2E7D32;">Did You Know?</h3>
        <p style="margin-bottom: 0; color: #333; line-height: 1.5;">${fact}</p>
      </div>
    `;
    el.setAttribute('data-edu-replaced', 'true');
    count++;
  });

  if (count > 0) {
    console.log(`Edu Ad Replacer: Replaced ${count} elements.`);
  }
}

// Initial run
replaceAds();

// Observe for changes to handle dynamically loaded ads
const observer = new MutationObserver(() => {
  replaceAds();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Click handling for educational boxes
document.addEventListener("click", (event) => {
  // Check if the clicked element or its parent is the edu-box
  const eduBox = event.target.closest(".edu-box");
  
  if (eduBox) {
    console.log("Edu box clicked");
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: "EDU_CLICK",
      timestamp: Date.now()
    });
  }
});

console.log("Content script loaded and monitoring for ads...");

