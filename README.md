# 🌙 Sakinah - A Calm Beginning

**Sakinah** is a comprehensive browser extension designed to bring tranquility, spiritual reflection, and organized productivity to your daily digital life.

---
<img width="779" height="440" alt="image" src="https://github.com/user-attachments/assets/fd0d64c6-67be-492d-aa08-bd0fe480376e" />

## ✨ Features

### 🕋 Spiritual Dashboard (New Tab)
Transform your new tab into a peaceful sanctuary:
- **Daily Ayah & Rotation**: Beautifully rendered verses with optional random or daily rotation.
- **Prayer Times**: Automatic geo-located or city-based prayer timings with real-time "active" prayer highlighting.
- **Sunnah of the Day**: Rotating prophetic traditions presented in both **Arabic and English**.
- **Daily Deeds**: Track 5 customizable spiritual goals (e.g., Prayers, Charity, Adhkar) with a clean progress UI.
- **Gratitude Journal**: A persistent private journal to record daily blessings, featuring a **History Modal** and **.txt Export** functionality.
- **Bilingual Hijri Calendar**: Seamlessly updated Hijri and Gregorian dates featuring full month names.
- **Quranic Quiz**: Test your knowledge with interactive verse completion challenges.

### 🤖 Sakinah AI Guide
- **Empathetic Chat**: Describe your feelings to receive comforting advice and relevant Quranic verses.
- **Bilingual Explanations**: One-click deep-dives into any Ayah, provided in both **Arabic (العربية الفصحى)** and **English**.
- **Favorites Analysis**: AI-powered insights that analyze your saved verses to identify spiritual patterns and suggest personalized actions.

### 🛠️ Customization & Productivity
- **Personalized Wallpapers**: Set custom backgrounds via URL or direct local upload.
- **Theme Support**: Light, Dark, and "Auto" (sunset-sync) modes.
- **Ecosystem Integration**: Quick-toggle links and apps for **Google, Microsoft, and Apple** ecosystems.
- **Bookmarks & Privacy**: A sleek searchable bookmarks sidebar and "Recent Tabs" manager with privacy-first optional permissions.

---

## 📂 Project Structure
sakinah/
│── manifest.json      # Extension configuration with optional permissions
│── background.js       # Background logic for notifications and state
│── newtab.html/js      # Central dashboard experience
│── popup.html/js       # Quick-access extension popup
│── options.html/js     # Detailed settings and customization
│── ai.js               # Dual-language AI integration (Groq/Llama 3)
│── config.js           # Default settings and proxy endpoints
│── quran.json          # Curated Quranic dataset
│── adhkar.json/ahadith.json # Spiritual content libraries
│── styles.css          # Glassmorphism and responsive design
│── build.bat           # Deployment and key injection script
│── icons/              # Islamic branding assets

---

## ⚙️ Setup

### 1. Installation
1. Clone the repository: `git clone https://github.com/Attafii/Sakinah.git`
2. Open Chrome -> `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load Unpacked** and select the Sakinah folder.

### 2. Configuration
- Get a free API key from [Groq Console](https://console.groq.com/keys).
- Create a `.env` file or use `build.bat` to inject your `GROQ_API_KEY`.
- Use `restore-config.bat` before committing to keep your keys private.

---

## 🧠 AI Favorites Analysis
Go to the **Favorites** tab and click "Analyze Favorites" to see personalized spiritual insights based on what you share with Sakinah.

### Privacy & Security:
- ✅ **No Personal Data**: Only verse identifiers are used for analysis.
- ✅ **Local Storage**: All history and settings reside only in your browser.
- ✅ **Optional Permissions**: Sensitive features (History/Bookmarks) only activate when you choose.

---

## 🛠 Tech Stack
- **Manifest V3** Chrome Extension API.
- **Groq AI (Llama 3.3)** for multilingual NLP.
- **Vanilla JavaScript & Glassmorphism CSS**.
- **Aladhan API** for precise global prayer timings.
