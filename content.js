const adSelectors = [
  ".ad",
  ".ads",
  ".ad-unit",
  "[id*='ad']",
  "[class*='ad']"
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

function replaceAds() {
  const adElements = document.querySelectorAll(adSelectors.join(', '));
  let count = 0;

  adElements.forEach(el => {
    // Avoid replacing elements that are already handled
    if (el.getAttribute('data-edu-replaced') === 'true') return;

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

