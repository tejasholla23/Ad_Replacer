console.log("Background service worker running");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "EDU_CLICK") {
    console.log("Click received from content script");
    
    // --- START SIMULATION: Paytm payment flow ---
    console.log("Simulating Paytm payment flow...");

    const mockTransaction = {
      amount: 1,
      currency: "INR",
      purpose: "Educational micro-donation",
      timestamp: new Date(message.timestamp).toLocaleString()
    };

    console.log("Mock Transaction Details (SIMULATION):", mockTransaction);

    // Simulate redirect by opening Paytm in a new tab
    chrome.tabs.create({ url: "https://paytm.com" });
    // --- END SIMULATION ---
  }
});

