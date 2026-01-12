# Sakinah v1.0.3 - Fix & Feature Summary

This update focuses on Dark Mode visibility improvements, security auditing, and expanding AI capabilities.

## 🌟 New Features
- **AI Hadith Explanation**: Added an "Explain Hadith" button to the Hadith section on the dashboard. It provides spiritual insights in both Arabic and English, similar to the Ayah explanation feature.
- **Enhanced Dashboard UI**: The dashboard profile button now uses a standard Lucide user icon for a cleaner, more intuitive look.- **Duaa of the Day**: Integrated a new "Duaa of the Day" feature directly into the Gratitude Journal component. It displays curated Duas from the Quran and Sunnah with a refresh option.
## 🎨 UI/UX Improvements (Dark Mode)
- **Branded Toggles**: Added `accent-color: var(--primary)` to the dark mode theme, ensuring checkboxes and toggles remain Sakinah's brand green.
- **Improved Visibility**: Fixed "invisible" text in dropdown menus by explicitly styling `select` and `option` elements with a dark background (#252525) and light text.
- **Button Styling**: Ensured AI action buttons and tafsir (explanation) containers have appropriate contrast and coloring in Dark Mode.

## 🛠️ Bug Fixes
- **Test Notification**: Fixed the "Test Notification" button in the options page which was failing due to a message name mismatch in the background script.
- **Initialization Defaults**: Added safer default values for notification settings in `background.js` to prevent errors during first-time setup.

## 🔒 Security & Privacy
- **Permission Mapping**: Successfully mapped extension permissions (`history`, `identity`, `geolocation`) to the Chrome Web Store privacy disclosure.
- **Privacy Policy**: Updated `docs/privacy-policy.md` to clearly disclose AI data usage (proxied, no PII) and local history processing.
- **Security Audit**: 
    - Verified **Content Security Policy (CSP)** is strictly locked to local scripts and authorized media/API endpoints.
    - Confirmed no API keys are hardcoded; all AI traffic goes through a secure Cloudflare Worker proxy.
    - Verified all user data (browsing history/email) is processed **locally** and never stored on external servers.

## 📦 Distribution
- Updated `manifest.json` to version `1.0.3`.
- Generated `Sakinah-Extension-v1.0.3.zip` ready for Chrome Web Store upload.
