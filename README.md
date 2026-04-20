# Edu Ad Replacer 🚫

**Edu Ad Replacer** is a sophisticated Chrome Extension (Manifest V3) that transforms the web experience by intelligently replacing intrusive advertisements with interesting educational facts. 

Instead of just blocking ads, it turns wasted attention into a learning opportunity.

## 🚀 Key Features

### 🧠 Intelligent Ad Detection
- **Heuristic Scoring Engine**: Evaluates elements based on dimensions, image-to-container ratios, and specific naming patterns (`ad`, `banner`, `sponsored`).
- **Pro Iframe Traversal**: Specifically engineered to catch stubborn sidebar and deeply nested Google AdSense banners by traversing the DOM and identifying the most "meaningful" container for replacement.
- **Fuzzy Pattern Matching**: Automatically ignores elements that match the signatures of previously reverted false positives.

### 🧩 Adaptive Feedback System
- **"Not an Ad?" Interaction**: Every replaced block features a subtle restoration button.
- **High-Fidelity Restoration**: Uses `cloneNode(true)` and `WeakMap` lifecycle management to perfectly restore the original site element if the user marks it as a false positive.
- **Persistent Memory**: Reverted patterns are saved to `chrome.storage.local` to improve the extension's accuracy over time.

### 📊 Clean Dashboard (Glassmorphism UI)
- **Live Analytics**: Track "Ads Replaced" and "False Positives" directly in a premium, responsive popup.
- **Master Toggle**: Instantly enable or disable the extension globally.
- **Reset Stats**: Easily clear your learning history and counters.

### 🛡️ Safety & Performance
- **Financial Security**: Automatically disables itself on sensitive domains related to banking, payments, and UPI (e.g., Paytm, NetBanking).
- **Infinite Scrolling Support**: Uses a debounced `MutationObserver` (100ms) to ensure late-loaded ads are replaced without draining system resources.
- **Viewport Aware**: Prioritizes scanning and replacing ads within or near the visible viewport.

## 📂 Project Structure

- `manifest.json`: Configuration and permissions for Manifest V3.
- `content.js`: The "brain" of the extension—handles detection, replacement, and DOM restoration.
- `background.js`: Manages extension events and handles mock "support" click redirections.
- `popup.html` & `popup.js`: The sleek user interface for control and analytics.
- `index.css`: Modern styling including glassmorphism cards and smooth transitions.

## 🛠️ How to Install (Load Unpacked)

1. **Clone/Download** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle at top-right).
4. Click **Load unpacked** and select the folder containing these files.
5. Pin the extension to your toolbar to see the analytics dashboard!

## 🧪 Developer Information

- **Scoring Logic**: You can view the heuristic score for any element by setting `const DEBUG = true;` in `content.js`.
- **Custom Facts**: You can expand the educational database by adding strings to the `facts` array in `content.js`.

## ⚠️ Limitations

- Ads rendered inside **shadow DOM** or highly sandboxed environments may not be fully accessible.
- Some advanced anti-adblock implementations may bypass detection.
- This extension is designed for educational purposes and not intended for real ad monetization replacement.

---

*Built with ❤️ for a smarter web.*
