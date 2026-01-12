# Privacy Policy – Sakinah Chrome Extension

Last updated: January 2026

Sakinah is a privacy-conscious Chrome extension designed to provide Qur'anic reflection, prayer time tracking, and AI-assisted spiritual guidance.

## 1. Data Types Collected & Used

### Personally Identifiable Information (PII)
Sakinah accesses your **email address** via the `chrome.identity` API solely to display the currently active profile account within the extension dashboard. We do not store this email on external servers, nor do we use it for marketing.

### Location Data
To provide accurate **Prayer Times** and **Qibla direction**, Sakinah requests access to your geographic location. This data is:
- Processed locally to calculate times.
- Sent to the [Aladhan API](https://aladhan.com) to retrieve prayer schedules for your specific coordinates.

### Web History & Browsing Data
Sakinah uses the `history`, `topSites`, and `sessions` permissions to provide a productivity-oriented dashboard experience:
- **History & TopSites:** To display your most-visited websites and recently closed tabs for quick access on your home dashboard. 
- **Sessions:** To detect real-time changes in browser windows and tabs to keep your "Recently Closed" widget accurate.
This data is **processed entirely on your local machine** and is never uploaded, transmitted, or shared.

### Display & System Information
The `system.display` permission is used to identify the user's screen resolution and taskbar position. This allows the extension to precisely position the "Ayah of the Moment" notification window in the corner of the screen without obscuring active workspace areas.

### Personal Communications (AI Guide)
When you interact with the **AI Guide**, the text messages you enter are sent to our secure backend proxy (Cloudflare Workers) and the Groq API to generate a response. These messages are processed in real-time and are not saved by the extension once the session ends.

## 2. Chrome Web Store Justifications
The following justifications are provided for the specific permissions requested by Sakinah:

| Permission | Purpose & Implementation |
| :--- | :--- |
| **Host Permissions** | Required to fetch dynamic data including AI Hadith explanations, live prayer time updates from AlAdhan, and Qur'anic audio assets. |
| **Bookmarks** | Enables a built-in bookmark navigator on the dashboard, allowing users to quickly access their resources without leaving their spiritual environment. |
| **Geolocation** | Crucial for calculating precise prayer timings (Fajr, Dhuhr, etc.) and Qibla direction based on the user's exact coordinates. |
| **History** | Powers the "Recently Closed Tabs" widget on the new-tab page, serving as a productivity hub for the user. |
| **Identity** | Used to display the user's active Google profile inside the extension UI for personalized greeting and sync status. |
| **Sessions** | Analyzes recent browser sessions to allow the dashboard to provide restore shortcuts for closed windows. |
| **System.Display** | Detects screen dimensions to ensure that the unique Sakinah notification "mini-window" is positioned correctly for the user's specific monitor setup. |
| **topSites** | Populates the "Quick Access" dashboard icons with the user's most frequently visited websites. |

## 3. Local Storage
Sakinah stores the following data locally on your device using `chrome.storage`:
- User preferences (theme, font, notification settings).
- Favorites, bookmarks, and custom collections.
- Qur'an memorization (hifdh) progress.
- Prayer time settings and calculation methods.

## 3. Data Sharing & Third Parties
Sakinah **does not sell, rent, or trade** your personal data to third parties. We only share data with service providers necessary for functionality:
- **Cloudflare/Groq:** To provide AI responses.
- **Aladhan.com:** To provide prayer time calculations.
- **Islamic Network:** To provide Qur'anic audio streams.

## 4. Security
- **No Remote Code:** All application logic is bundled locally.
- **Secure Proxy:** AI requests are routed through a secure proxy to protect user privacy and prevent direct API key exposure.
- **Permissions:** We only request permissions necessary for the features you use.

## 5. User Control & Deletion
You have full control over your data:
- You can clear your "Favorites" or "Hifdh" progress in the settings.
- You can disable AI features or notifications at any time.
- Uninstalling the extension automatically removes all locally stored data.

## 6. Contact
For questions regarding this policy, please contact us via the support link on the Chrome Web Store listing.