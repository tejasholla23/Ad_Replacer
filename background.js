console.log("Background service worker running");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "EDU_CLICK") {
    console.log("Click received from content script");
    console.log("Timestamp:", message.timestamp);
  }
});

